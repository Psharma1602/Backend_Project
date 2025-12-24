require('dotenv').config();   // ✅ FIRST LINE

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
//const { sendEmail } = require("./Services/notificationService");

// sendEmail(
//   process.env.EMAIL_USER,
//   "🔥 Test Email",
//   "<h2>If you received this, email is working!</h2>"
// );

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

app.use(express.static(path.join(__dirname, '../Frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
