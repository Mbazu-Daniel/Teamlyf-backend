import crypto from 'crypto';

function generateResetToken() {
  // Generate a random token of a specific length (e.g., 32 characters)
  const tokenLength = 32;
  const token = crypto.randomBytes(tokenLength).toString('hex');
  return token;
}

export default generateResetToken;
