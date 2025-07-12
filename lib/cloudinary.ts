// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Use environment variables
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,       // Use environment variables
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET, // Use environment variables
  secure: true, // Recommended
});

// Remove console.logs for production; keep them during development if needed.
// console.log("process.env.NEXT_PUBLIC_API_URL: ", process.env.NEXT_PUBLIC_API_URL);
// console.log("process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY: ", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
// console.log("process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET: ", process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET);

export default cloudinary;