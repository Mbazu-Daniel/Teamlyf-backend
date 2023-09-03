import nodemailer from "nodemailer";

const MAIL_CONFIG = {
  host: process.env.HOST || "smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.USER || "31d9906e33ea9a",
    pass: process.env.PASSWORD || "6a6ea8618f94c6",
  },
};

const transporter = nodemailer.createTransport(MAIL_CONFIG);

const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default sendMail;
