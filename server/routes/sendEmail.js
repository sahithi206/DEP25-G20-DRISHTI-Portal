/*
 * This file contains the routes for sending emails.
 * It includes endpoints for sending notifications, alerts, and other email communications.
 * It uses the nodemailer package to handle email sending.
 * We have used this endpoint to send emails to the users for various purposes in different files.
 */

const nodemailer = require("nodemailer");

async function sendEmail(from, to, subject, text) {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log(` Email successfully sent to ${to}`);
  } catch (error) {
    console.error(" Email sending error:", error);
  }
}
module.exports = sendEmail;

