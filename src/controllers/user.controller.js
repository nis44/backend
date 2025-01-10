import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apiError.js";
import { User } from "../models/user.Model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apierror(
            500,
            "something went wrong while generating access and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if (
        [fullname, email, username, password].some(
            (feild) => feild?.trim() === ""
        )
    ) {
        throw new apierror(400, "All feilds are required");
    }

    const existeduser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existeduser) {
        throw new apierror(400, "User already exists");
    }

    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log(avatarLocalPath, coverImageLocalPath);

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new apierror(400, "Both avatar and coverImage are required");
    }

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatarUrl);

    if (!avatarUrl) {
        throw new apierror(500, "Failed to upload images");
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl.url || "",
    });

    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new apierror(500, "Failed to create user");
    }

    return res
        .status(201)
        .json(
            new apiResponse(
                201,
                { user: createdUser },
                "User created successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username) {
        throw new apierror(400, "Email and username are required");
    }

    const user = User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new apierror(404, "User not found");
    }

    const ispasswordvalid = await user.ispasswordcorrect(password);

    if (!ispasswordvalid) {
        throw new apierror(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user loggedIn SuccessFully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );

    options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

export { registerUser, loginUser, logoutUser };
