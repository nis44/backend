import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: 'dgkhrnvli',
    api_key: '344555844332632',
    api_secret: 'sUfglC2WkyfLimwBJJy-PZ4ZAf4',
});


// CLOUDINARY_CLOUD_NAME = dgkhrnvli
// CLOUDINARY_API_KEY = 344555844332632
// CLOUDINARY_API_SECRET = sUfglC2WkyfLimwBJJy-PZ4ZAf4

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            console.error("No local file path provided");
            return null;
        }
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        })
        console.log(response.url, "file uploaded successfully");
        return response;
        
    } catch (error) {
        fs.unlinkSync(localfilepath);
        // console.error(localfilepath);
        return null;
    }
}

export {uploadOnCloudinary}