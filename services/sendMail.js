import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const resend = new Resend(process.env.RESEND);

let transporter;
// let sendMail;

// if (process.env.NODE_ENV === "production") {
//   const resend = new Resend(process.env.RESEND);

//   const sendMail = async (mailOptions) => {
//     try {
//       const data = await resend.emails.send(mailOptions);
//       console.log("Message sent: %s", data.messageId);
//       return data;
//     } catch (error) {
//       console.error(error);
//       return false;
//     }
//   };
// } else {
//   // If not in production, use mailtrap for development
//   const MAIL_CONFIG = {
//     host: process.env.HOST || "smtp.mailtrap.io",
//     port: process.env.MAIL_PORT || 2525,
//     secure: false,
//     requireTLS: true,
//     auth: {
//       user: process.env.USER || "2ea71ebdd71092",
//       pass: process.env.PASSWORD || "a6d4be3320df41",
//     },
//   };

//   transporter = nodemailer.createTransport(MAIL_CONFIG);

//   const sendMail = async (mailOptions) => {
//     try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log("Message sent: %s", info.messageId);
//       return info;
//     } catch (error) {
//       console.error(error);
//       return false;
//     }
//   };
// }

const sendMail = async (mailOptions) => {
  try {
    const data = await resend.emails.send(mailOptions);
    console.log("Message sent: %s", data.messageId);
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
export default sendMail;
