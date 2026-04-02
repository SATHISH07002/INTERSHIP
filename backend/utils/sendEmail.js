import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    transporter = nodemailer.createTransport({
      ...(smtpHost
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: false
          }
        : {
            service: "gmail"
          }),
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP is not configured. Skipping email send.");
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to,
    subject,
    html
  });
};
