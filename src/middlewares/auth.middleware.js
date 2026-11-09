import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asynchandler } from "../utils/asynchandler";
import jwt from "jsonwebtoken";


export const verifyJWT = asynchandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        // If no token available
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        // If Token is available
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password  -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Inavlid Access Token")
        }
    
        // if user is there
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})