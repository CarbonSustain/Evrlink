import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client with credentials from environment variables
const initializeS3Client = () => {
  // Check if environment variables are available
  const region = import.meta.env.VITE_AWS_REGION;
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  
  if (!region || !accessKeyId || !secretAccessKey) {
    console.error("Missing required AWS credentials in environment variables");
    throw new Error("AWS configuration incomplete");
  }
  
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Create the client with error handling
let s3Client: S3Client;
try {
  s3Client = initializeS3Client();
  console.log("S3 client initialized successfully");
} catch (error) {
  console.error("Failed to initialize S3 client:", error);
  // Create a disabled client that will throw appropriate errors when used
  s3Client = new S3Client({
    region: "us-west-2",
    credentials: { accessKeyId: "DISABLED", secretAccessKey: "DISABLED" },
  });
}

/**
 * Generates a signed URL for an S3 object
 * @param key - The key (path) of the object in the S3 bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise with signed URL
 */
export const getSignedS3Url = async (key: string, expiresIn = 3600): Promise<string> => {
  try {
    if (!key) {
      throw new Error("Object key is required");
    }

    // Clean the key - remove any leading slashes
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    const command = new GetObjectCommand({
      Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
      Key: cleanKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

/**
 * Extracts the filename from a full URL or path
 * @param url - The URL or path containing the filename
 * @returns The extracted filename or empty string if not found
 */
export const extractFilenameFromUrl = (url: string): string => {
  if (!url) return '';
  
  // Extract just the filename (timestamp.ext) from the URL
  const match = url.match(/([0-9]+\.[a-zA-Z]+)$/);
  if (match) {
    return match[1];
  }
  
  // For relative paths, just get the filename
  return url.split('/').pop() || '';
};
