import multer, { diskStorage } from 'multer';

// Define storage and file naming
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the directory where files will be stored
  },
  filename: (req, file, cb) => {
    // Rename the file to avoid conflicts, e.g., using a timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split('/')[1]}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
