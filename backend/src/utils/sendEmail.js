import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sendRegistrationEmail = async (toEmail, userName, event, qrCode) => {
  const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
  await transporter.sendMail({
    from: '"CampusBuzz" <noreply@campusbuzz.in>',
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
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">CampusBuzz · NMIT</p>
      </div>
    `,
  });
};

const sendCancellationEmail = async (toEmail, userName, event) => {
  await transporter.sendMail({
    from: '"CampusBuzz" <noreply@campusbuzz.in>',
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
        <p>We apologise for the inconvenience.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">CampusBuzz · NMIT</p>
      </div>
    `,
  });
};

const sendOTPEmail = async (toEmail, name, otp) => {
  await transporter.sendMail({
    from: '"CampusBuzz" <noreply@campusbuzz.in>',
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