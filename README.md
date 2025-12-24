->SubmitHub is a role-based school management system designed to simplify assignment handling in educational institutions. Teachers can create assignments, review student submissions, and assign grades, while students can view assignments and submit their work online. The system ensures secure access through JWT-based authentication and role-based authorization.

->Key functionalities include:
Student and teacher registration and login
Role-based dashboards and access control
Assignment creation and grading by teachers
Assignment submission with file upload by students
Email notifications for assignment creation and submission
The backend is developed using Node.js, Express.js, and PostgreSQL, following RESTful API design principles. Multer is used to handle file uploads, storing assignment files on the server, while Nodemailer is used to send email notifications to students and teachers. The frontend is built using HTML, CSS, and JavaScript, and middleware is used for authentication, authorization, and request processing to ensure a secure and maintainable system.

->Technical highlights:
JWT authentication with token-based access
Role-based authorization using middleware
Secure file handling with Multer
Automated email alerts using Nodemailer
Relational database design with PostgreSQL
