import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 12 });

// Function to generate a shared link
const generateUniqueId = () => {
  const linkId = uid.randomUUID();



  return linkId;
};

export default generateUniqueId;
