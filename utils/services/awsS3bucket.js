import multerS3 from "multer-s3";
import multer from "multer";
import { randomBytes } from "crypto";
import { extname as _extname } from "path";
import { AUTO_CONTENT_TYPE } from "multer-s3";
import { Upload } from "@aws-sdk/lib-storage";
import stream from "stream";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_S3_REGION;
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    secretAccessKey,
    accessKeyId,
  },
});

const storage = multer.memoryStorage();
const fileUpload = multer({ storage: storage });

async function uploadFileToS3(fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
  };

  return s3.send(new PutObjectCommand(uploadParams));
}

async function deleteFileFromS3Bucket(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };
  return s3.send(new DeleteObjectCommand(deleteParams));
}

async function getObjectSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key,
    ACL: acl,
  };

  // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  const command = new GetObjectCommand(params);
  // const seconds = 60;
  return getSignedUrl(s3, command);
}

async function downloadFileFromS3(fileName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Expiring in 1 hour

    return signedUrl;
  } catch (error) {
    console.error("Error downloading file from S3:", error);
    throw error;
  }
}

// async function createFolderOnS3(folderPath) {
// try {
//   const params = {
//     Bucket : bucketName,
//     Key: folderPath,
//     Body: '',
//     ACL:acl,
//   }
//     await s3.send(new PutObjectCommand(params));
//     console.log(`Folder created successfully: ${folderPath}`);

//   } catch(error) {
//     console.error(`Error creating folder on S3: ${error.message}`);
//     throw error;
//   }
// }

export {
  fileUpload,
  uploadFileToS3,
  deleteFileFromS3Bucket,
  getObjectSignedUrl,
  downloadFileFromS3,
};
