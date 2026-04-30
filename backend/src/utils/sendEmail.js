import nodemailer from "nodemailer";

const sendRegistrationEmail = async (toEmail, userName, event, qrCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");

  await transporter.sendMail({
    from: `"CampusBuzz" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Registration Confirmed – ${event.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #6366F1;">You're registered! 🎉</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your registration for <strong>${event.title}</strong> is confirmed.</p>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</li>
          <li><strong>Venue:</strong> ${event.venue}</li>
        </ul>
        <p>Show the QR code below at the entrance:</p>
        <img src="cid:qrcode" alt="QR Code" style="width:200px;height:200px;" />
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">CampusBuzz · NMIT</p>
      </div>
    `,
    attachments: [
      {
        filename: "qr.png",
        content: base64Data,
        encoding: "base64",
        cid: "qrcode",
      },
    ],
  });
};

const sendCancellationEmail = async (toEmail, userName, event) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"CampusBuzz" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Event Cancelled – ${event.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #ef4444;">Event Cancelled 😔</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>We're sorry to inform you that <strong>${event.title}</strong> has been cancelled.</p>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</li>
          <li><strong>Venue:</strong> ${event.venue}</li>
        </ul>
        <p>We apologise for the inconvenience. Keep an eye out for future events on CampusBuzz.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">CampusBuzz · NMIT</p>
      </div>
    `,
  });
};

const sendOTPEmail = async (toEmail, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"CampusBuzz" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "CampusBuzz — Verify Your Email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #6366F1;">Verify your email</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Use the code below to complete your CampusBuzz registration. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #6366F1; margin: 24px 0;">${otp}</div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email. · CampusBuzz · NMIT</p>
      </div>
    `,
  });
};

export { sendRegistrationEmail, sendCancellationEmail, sendOTPEmail };