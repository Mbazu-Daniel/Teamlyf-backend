import { FRONTEND_URL } from "../config/env.js";

const generateShareableLink = (sharedLinkId) => {
  // Construct the shareable link URL using the sharedLinkId and your application's base URL
  const shareableLink = `${FRONTEND_URL}/shared/${sharedLinkId}`;
  return shareableLink;
};

export default generateShareableLink;
