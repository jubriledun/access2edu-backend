import cloudinary from "./cloudinary.config.js";

const uploadResult = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "auto" },
    (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }
  );
  stream.end(req.file.buffer);
});

export default uploadResult;
