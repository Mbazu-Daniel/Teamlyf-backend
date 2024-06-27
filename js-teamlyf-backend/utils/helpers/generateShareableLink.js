import dotenv from "dotenv";
dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const generateShareableLink = (sharedLinkId) => {
  // Construct the shareable link URL using the sharedLinkId and your application's base URL
  const shareableLink = `${FRONTEND_URL}/shared/${sharedLinkId}`;
  return shareableLink;
};

export default generateShareableLink;
