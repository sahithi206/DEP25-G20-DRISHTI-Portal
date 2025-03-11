const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",  // You can use other services like "Outlook", "Yahoo"
      auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS,  // Your email password or app password
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email successfully sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending error:", error);
  }
}
