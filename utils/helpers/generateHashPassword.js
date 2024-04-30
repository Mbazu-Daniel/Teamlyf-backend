import bcrypt from "bcryptjs";

async function generateHashedPassword(password, saltRounds) {
  try {
    // Generate a salt dynamically
    const salt = await bcrypt.genSalt(saltRounds);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
}

export default generateHashedPassword;
