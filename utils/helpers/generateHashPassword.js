import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
const SALT = process.env.SALT;
async function generateHashedPassword(password) {
  try {
    // Generate a salt dynamically
    const saltRounds = parseInt(SALT);
    const salt = await bcrypt.genSalt(saltRounds);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
}

export default generateHashedPassword;
