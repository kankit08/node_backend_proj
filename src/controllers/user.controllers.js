import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

// Steps to register a user
// get user details from fronetend
// validations of fields
// check if user alreday exists: username, email
// check for images, avatar
// uplaod them to cloudinary, avatar
// create a user obj -- create a user entry in db
// remove pass & refresh token field from response
// check user is created or not
// retrun response

const registerUser = asynchandler(async(req, res) => {

    // getting data from UI/frontend
    const {fullname, email, password, username} = req.body
    console.log("email:", email);


    // validations of fields
    if([fullname, email, password, username].some((fields) => fields?.trim() === ""))
    {
        throw new ApiError(400, "All fields are required")
    }



    // check if user alreday exists: username, email
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with this username or email already exist")
    }


    // check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    // create a user obj -- create a user entry in db

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    
    // check user is created or not
    // remove pass & refresh token field from response (start after select statement)
    const createdUser = await User.findById(user._id).select("-password  -refreshToken", )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user")
    }

    // retrun response
    return res.status(201).json(new ApiResponse(200, "User registered Successfully"))
}) 

export {registerUser}