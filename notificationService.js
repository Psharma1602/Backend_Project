require('dotenv').config(); // MUST be first line
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// verification ke liye use krenge taaki pta chlta rahe ki smtp server free hai 
transporter.verify((error) => {
  if (error) {
    console.error(" SMTP error:", error);
  } else {
    console.log("Email server ready");
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"SubmitHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
  console.log("Email sent to:", to);
}


module.exports = { sendEmail };
