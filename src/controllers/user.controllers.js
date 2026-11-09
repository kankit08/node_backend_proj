import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
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

const generateAccessAndRefreshToken = async(userId) => {
    try {
        // find the user
        const user = await User.findOne(userId)

        // Access and Refresh Token generation for a user
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // adding refresh token to db
        user.refreshToken = refreshToken

        // saving token in db
        await user.save({validateBeforeSave: false})

        // return access and refresh token
        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access or Refresh Token")
    }
}

const registerUser = asynchandler(async(req, res) => {

    // getting data from UI/frontend
    const {fullname, email, password, username} = req.body
    

    // validations of fields
    if([fullname, email, password, username].some((fields) => fields?.trim() === ""))
    {
        throw new ApiError(400, "All fields are required")
    }



    // check if user alreday exists: username, email
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with this username or email already exist")
    }


    // check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar2 is required")
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


const loginUser = asynchandler(async(req, res, ) => {
    
    // steps to login a user
    // get data from req.body
    // login using username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies


    // getting data from req.body
    const {email, password, username} = req.body

    // login using email or username
    if(!(email || username)){
        throw new ApiError(400, "username or email is required")
    }

    // find the username
    const user = User.findOne({
        $or: [{username}, {email}]
    })

    // if user not found
    if(!user){
        throw new ApiError(404, "user not found or doesn't exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password is invalid")
    }

    // getting access or refresh token for a user
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // security steps for cookies, only modified by server 
    const options = {
        httpOnly: true,
        secure: true
    }

    // return response and cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in Successfully"
        )
      );
})


const logoutUser = asynchandler(async(req,res) => {
    // logic
    // to logout clear the token(refresh, access & cookies)

    await User.findByIdAndUpdate(req.user._id,
        {$set: {refreshToken: undefined}},
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})
export {registerUser}
