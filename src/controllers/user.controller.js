import { asyncHandler } from "../utils/asyncHandler.js";
import {apierror} from '../utils/apiError.js'
import { User } from "../models/user.Model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    const {fullname, email, username, password} = req.body
    

    if(
        [fullname, email, username, password].some((feild) => 
            feild?.trim() === "")
    ) {
        throw new apierror(400, "All feilds are required")
    }

    const existeduser = await User.findOne({
        $or: [{email}, {username}]
    })

    if (existeduser) {
        throw new apierror(400, "User already exists")                                              
    }

    // console.log(req.files);
    
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
    

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log(avatarLocalPath, coverImageLocalPath);
    

    if(!avatarLocalPath || !coverImageLocalPath) {
        throw new apierror(400, "Both avatar and coverImage are required")
    }

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatarUrl);

    if(!avatarUrl) {
        throw new apierror(500, "Failed to upload images")
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl.url || "",
    });

    const createdUser =  User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new apierror(500, "Failed to create user");
    }

    return res.status(201).json(
        new apiResponse(201, {user: createdUser}, "User created successfully")
    )



    
});

export { registerUser };
