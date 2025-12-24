const express = require('express');
const multer = require('multer');
const pool = require('../db.js');
const { authenticate, authorizeRole } = require('../MiddleWare/authMiddleware.js');
const { sendEmail } = require("../Services/notificationService");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ---------- Student: submit assignment ----------
router.post(
  '/',
  authenticate,
  authorizeRole('student'),
  upload.single('file'),
  async (req, res) => {
    const { assignment_id } = req.body;
    const filePath = req.file ? req.file.path : null;

    try {
      //  Save submission
      const result = await pool.query(
        `INSERT INTO submissions (assignment_id, student_id, file_path)
         VALUES ($1, $2, $3) RETURNING *`,
        [assignment_id, req.user.id, filePath]
      );

      // Fetch teachers
      const teacherMail = await pool.query(
        `SELECT email FROM users WHERE LOWER(role) = 'teacher'`
      );

      console.log("Teachers fetched:", teacherMail.rows);

      // 3️⃣ Send emails (IMPORTANT: await)
      for (const t of teacherMail.rows) {
        console.log("Sending submission mail to:", t.email);

        try {
  await sendEmail(
    t.email,
    "New Assignment Submission",
    `<h3>Student submitted assignment</h3>
     <p><b>Assignment ID:</b> ${assignment_id}</p>
     <p><b>Student ID:</b> ${req.user.id}</p>
     <p>Please login to review and grade.</p>`
  );
} catch (mailErr) {
  console.error("Teacher mail failed for:", t.email, mailErr);
}

      }

      // 4️⃣ Response
      res.status(201).json({
        message: "Submission successful",
        submission: result.rows[0]
      });

    } catch (err) {
      console.error("Submission error:", err);
      res.status(500).json({ error: 'Submission failed' });
    }
  }
);





// ---------- Teacher: view all assignments + submissions ----------
router.get('/teacher/all', authenticate, authorizeRole('teacher'), async (req, res) => {
  try {
    const assignmentsResult = await pool.query('SELECT * FROM assignments ORDER BY due_date DESC');
    const submissionsResult = await pool.query('SELECT * FROM submissions ORDER BY id DESC');

    const data = assignmentsResult.rows.map(a => ({
      ...a,
      submissions: submissionsResult.rows.filter(s => s.assignment_id === a.id)
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});




// ---------- Teacher: view submissions per assignment ----------
router.get('/:assignmentId', authenticate, authorizeRole('teacher'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 ORDER BY id DESC',
      [req.params.assignmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});



// ---------- Teacher: grade submission ----------
router.put('/:submissionId/grade', authenticate, authorizeRole('teacher'), async (req, res) => {
  const { grade } = req.body;
  try {
    await pool.query('UPDATE submissions SET grade=$1 WHERE id=$2', [grade, req.params.submissionId]);
    res.json({ message: 'Graded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});






// ---------- Teacher: delete a submission ----------
// router.delete('/:submissionId', authenticate, authorizeRole('student'), async (req, res) => {
//   try {
//     const result = await pool.query(
//       'DELETE FROM submissions WHERE id=$1 RETURNING *',
//       [req.params.submissionId]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Submission not found' });
//     }

//     res.json({ message: 'Submission deleted successfully', deletedSubmission: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to delete submission' });
//   }
// });


// ---------- Student: delete own submission ----------
router.delete(
  '/student/:submissionId',
  authenticate,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const studentId = req.user.id;

      // Check submission exists
      const subCheck = await pool.query(
        'SELECT * FROM submissions WHERE id = $1',
        [submissionId]
      );

      if (subCheck.rowCount === 0) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      const submission = subCheck.rows[0];

      // Ownership check
      if (submission.student_id !== studentId) {
        return res.status(403).json({ message: 'Not your submission' });
      }

      // Prevent delete after grading
      if (submission.grade !== null) {
        return res.status(403).json({
          message: 'Cannot delete submission after grading'
        });
      }

      // Delete submission
      await pool.query(
        'DELETE FROM submissions WHERE id = $1',
        [submissionId]
      );

      res.json({ message: 'Submission deleted successfully' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete submission' });
    }
  }
);

// submissions.js

// TEACHER DELETE: Can delete ANY submission by ID
// TEACHER DELETE: Can delete ANY submission by ID
router.delete('/teacher/:submissionId', authenticate, authorizeRole('teacher'), async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Use RETURNING * to verify the row actually existed and was deleted
        const result = await pool.query(
            'DELETE FROM submissions WHERE id = $1 RETURNING *', 
            [submissionId]
        );

        // If no rows were affected, the submissionId was likely wrong
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Submission not found in database." });
        }

        res.json({ message: "Teacher successfully removed student submission" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
module.exports = router;


