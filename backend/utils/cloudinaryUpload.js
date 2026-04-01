import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (file, folder, resourceType = "auto") => {
  if (!file) {
    return null;
  }

  const hasCloudinaryConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinaryConfig) {
    return {
      url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      publicId: null,
      originalName: file.originalname
    };
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname
  };
};

export default uploadToCloudinary;
