import crypto from "crypto";

export default function generateFileName(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
