const jwt  = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler.js")
const catchAsyncError = require("./catchAsyncError");
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();


const isAuthenticatedUser = catchAsyncError(async(req, res, next) =>{

    const token = req.cookies.token;
    console.log(token);

    if(!token){
        return next(new errorHandler("Please login to access this resource", 401))
    }

    try {

      const decodedData = jwt.verify(token, process.env.JWT_SECRET);

      const connection = await pool.getConnection();

      // Find the user in the database using Prisma Client
      const user = await prisma.user.findUnique({
        where: { userid: decodedData.userid },
        select: { userid: true, email: true, type: true },
      });


      if (!user) {
        return next(new errorHandler("User Not Found", 401))
      }

      const userData = {
        userid: user.userid,
        userEmail: user.email,
        userType: user.type,
      };
      console.log(userData.userEmail);
      
      req.user = userData;
      next();

    } catch (error) {
      console.error('Error while executing database query:', error.message);
      return next(new errorHandler("Unable to login", 403))
    }

    

});


module.exports = {
  isAuthenticatedUser
}