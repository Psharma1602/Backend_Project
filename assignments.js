const express = require('express');
const { sendEmail } = require("../Services/notificationService");
const pool = require('../db');
const { authenticate, authorizeRole } = require('../MiddleWare/authMiddleware');

const router = express.Router();
router.get('/', authenticate, authorizeRole('student'), async (req, res) => {
  const studentId = req.user.id; //Student id using jwt

  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        s.id AS submission_id,
        s.file_path,
        s.grade,
        CASE 
          WHEN s.id IS NOT NULL THEN true
          ELSE false
        END AS submitted
      FROM assignments a
      LEFT JOIN submissions s
        ON a.id = s.assignment_id AND s.student_id = $1
      ORDER BY a.due_date ASC
    `, [studentId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error loading assignments:", err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/* -------------------------------------------
   TEACHER: Get all assignments
--------------------------------------------*/
router.get('/all', authenticate, authorizeRole('teacher'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error loading teacher assignments:", err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/* -------------------------------------------
   TEACHER: Create new assignment
--------------------------------------------*/
router.post('/', authenticate, authorizeRole('teacher'), async (req, res) => {
  const { title, description, due_date } = req.body;

  try {
    // 1️⃣ Save assignment
    const result = await pool.query(
      'INSERT INTO assignments (title, description, due_date) VALUES ($1,$2,$3) RETURNING *',
      [title, description, due_date]
    );

    // 2️⃣ Fetch students
    const students = await pool.query(
      "SELECT email FROM users WHERE role = 'student'"
    );

    console.log("📩 Students found:", students.rows);

    // 3️⃣ Send emails
    for (const stud of students.rows) {
      console.log("📧 Sending assignment email to:", stud.email);
      sendEmail(
        stud.email,
        "📘 New Assignment Posted",
        `<h3>New Assignment Added!</h3>
         <p><b>${title}</b></p>
         <p>${description}</p>
         <p>Due Date: ${due_date}</p>`
      );
    }

    res.status(201).json({
      message: "Assignment created & emails sent",
      assignment: result.rows[0]
    });

  } catch (err) {
    console.error("Assignment creation error:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});


/* -------------------------------------------
   TEACHER: Delete assignment
--------------------------------------------*/
router.delete('/:id', authenticate, authorizeRole('teacher'), async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});



//student deletes the assignment 
// router.delete('/:id', authenticate, async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {
//     // Get submission details
//     const submission = await pool.query(
//       'SELECT * FROM submissions WHERE id = $1',
//       [id]
//     );

//     if (submission.rows.length === 0) {
//       return res.status(404).json({ error: 'Submission not found' });
//     }

//     // Only the student who submitted OR teacher can delete
//     const sub = submission.rows[0];

//     if (req.user.role === "student" && sub.student_id !== userId) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     // Perform delete
//     await pool.query('DELETE FROM submissions WHERE id = $1', [id]);

//     res.json({ message: 'Submission deleted successfully' });

//   } catch (err) {
//     console.error("Error deleting submission:", err);
//     res.status(500).json({ error: 'Failed to delete submission' });
//   }
// });



// const { sendEmail } = require("../Services/notificationService");

// // After assignment created successfully
// router.post("/add-assignment", authenticate, authorizeRole("teacher"), async (req, res) => {
//   try {
//     const { title, description, due_date } = req.body;

//     // ✅ Save assignment to DB
//     const result = await pool.query(
//       "INSERT INTO assignments (title, description, due_date) VALUES ($1,$2,$3) RETURNING *",
//       [title, description, due_date]
//     );

//     // ✅ Fetch students
//     const students = await pool.query(
//       "SELECT email FROM users WHERE role = 'student'"
//     );

//     // ✅ Send emails
//     for (const stud of students.rows) {
//       sendEmail(
//         stud.email,
//         "📘 New Assignment Posted",
//         `<h3>New Assignment Added!</h3>
//          <p><b>${title}</b></p>
//          <p>${description}</p>
//          <p>Due Date: ${due_date}</p>`
//       );
//     }

//     res.status(201).json({
//       message: "Assignment added & emails sent",
//       assignment: result.rows[0]
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server Error" });
//   }
// });


module.exports = router;
