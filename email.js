const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,       // your gmail
    pass: process.env.EMAIL_PASSWORD  // app password
  }
});

async function sendMail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to,
      subject,
      html: `<p>${message}</p>`
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}

module.exports = sendMail;
