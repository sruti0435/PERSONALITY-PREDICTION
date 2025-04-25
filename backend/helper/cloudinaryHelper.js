import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} folder - Destination folder in Cloudinary
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = async (buffer, folder = 'media', options = {}) => {
  return new Promise((resolve, reject) => {
    // Comprehensive PDF detection
    const isPdf = 
      (options.filename?.toLowerCase().endsWith('.pdf')) || 
      (options.resource_type === 'pdf') ||
      (options.content_type?.includes('application/pdf'));
                 
    const uploadOptions = {
      // Folder configuration
      folder: folder || 'documents',
      
      // Resource type handling
      resource_type: isPdf ? 'raw' : (options.resource_type || 'auto'),
      type: 'upload',
      
      // Access and visibility
      access_mode: 'public',
      
      // File-specific settings
      format: isPdf ? 'pdf' : options.format,
      transformation: isPdf ? [] : options.transformation,
      
      // Unique file handling
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      
      // Upload preset (ensure this is configured in Cloudinary)
      upload_preset: 'assessments',
      
      // Ensure a unique public ID
      public_id: options.public_id || `doc_${Date.now()}`,
      
      // Spread additional options
      ...options
    };
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        // Comprehensive error handling
        if (error) {
          console.error('Cloudinary Upload Error:', {
            errorCode: error.http_code,
            message: error.message,
            error: error,
            details: error.error,
            uploadOptions: uploadOptions
          });
          return reject(new Error(`Cloudinary Upload Failed: ${error.message}`));
        }

        // Detailed success logging
        console.log('Cloudinary Upload Success:', {
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          secure_url: result.secure_url
        });
        
        // PDF-specific URL handling
        if (isPdf && result) {
          result.secure_url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/v${result.version}/${result.public_id}.pdf`;
          result.download_url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/v${result.version}/${result.public_id}.pdf`;
        }
        
        resolve(result);
      }
    );
    
    // Robust buffer streaming
    try {
      Readable.from(buffer).pipe(uploadStream);
    } catch (streamError) {
      console.error('Stream Creation Error:', streamError);
      reject(streamError);
    }
  });
};

// Additional utility functions
export const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    console.log(`Deleting from Cloudinary: ${publicId} (${resourceType})`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: options.resource_type || 'raw',
    sign_url: true,
    type: 'upload',
    ...options
  });
};

export default {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl
};