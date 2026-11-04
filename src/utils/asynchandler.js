// create a utlity function to handle async await

// 2 ways -- 1) through promises.  --2) try catch

// you can use any one of them

// promises
const asynchandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export {asynchandler}



// try catch
// const asynchandlerr = (fn) => async(req, res, next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }