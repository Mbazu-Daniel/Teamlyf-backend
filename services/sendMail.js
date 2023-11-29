import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const resend = new Resend(process.env.RESEND);

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
