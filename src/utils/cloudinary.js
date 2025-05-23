import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

function configCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

setTimeout(() => {
    configCloudinary();
    // console.log('Cloudinary configured successfully');
    console.log('CLOUDINARY_CLOUD_API:', process.env.CLOUDINARY_API_KEY);
}, 0);

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log(`!!Error while uploading file on cloudinary: ${error.message}`)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (Url) => {
    try {
        console.log(`Deleting file from cloudinary: "${Url}"`)
        if (!Url) return null;

        const publicId = Url.split('/').pop().split('.')[0];
        const result = await cloudinary.uploader.destroy(publicId);
        // console.log('Delete result:', result);
        return result.result === 'ok';
    } catch (error) {
        console.log(`Error while deleting file from cloudinary: ${error.message}`)
        return null;

    }
}

export { uploadOnCloudinary, deleteFromCloudinary };