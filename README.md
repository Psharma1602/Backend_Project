📘 SubmitHub – School Management System

SubmitHub is a role-based school management system that allows teachers to create and grade assignments and students to submit assignments online.
The system includes authentication, file uploads, role-based access control, and email notifications.

🚀 Features
👩‍🎓 Student
Register & Login

View all assignments

Submit assignments with file upload

View submission status & grades

Delete own submission (only if not graded)

👨‍🏫 Teacher
Register & Login

Create assignments

View all student submissions

Grade submissions

Delete assignments and submissions

🔐 Security
JWT-based authentication

Role-based authorization (Student / Teacher)

Password hashing using bcrypt

Protected API routes

📎 Other Features
File uploads using Multer

Email notifications using Nodemailer

PostgreSQL relational database

RESTful API design

🛠️ Tech Stack
**Backend**
Node.js

Express.js

PostgreSQL

JWT (JSON Web Tokens)

bcrypt

Multer

Nodemailer

**Frontend**
HTML

CSS

JavaScript (Vanilla JS)

CSS

📧 Email Notifications
Emails are sent using Nodemailer when:

A teacher creates a new assignment (students are notified)

A student submits an assignment (teachers are notified)

SMTP credentials are securely stored in the .env file.
