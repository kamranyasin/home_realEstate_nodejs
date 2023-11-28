const bcrypt = require('bcryptjs');
const errorHandler = require('../utils/errorHandler.js');
const catchAsyncError = require('../middleware/catchAsyncError.js');
const generatedToken = require('../utils/jwtToken.js');
const setTokenCookie = require('../utils/sendToken.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { PrismaClient } = require('@prisma/client');
const { stringify } = require('querystring');

const prisma = new PrismaClient();




// login user
const loginUser = catchAsyncError(async (req, res, next) => {

    const {email, password} = req.body;
    

    try{
  
      // Find the user in the database using Prisma Client
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      // Check if the user exists in the database
      if (!user) {
        return next(new errorHandler('Invalid email', 400));
      }
  
  
      // Compare the stored password hash with the provided password
      const passwordMatches = await bcrypt.compare(password, user.password);
  
      if (!passwordMatches) {
        return next(new errorHandler('Invalid Password', 401));
      }
  
  
      console.log(`User loggedin successfully`);
      
    
       // Create JWT token and with user ID
       const token = generatedToken(user.userid, user.email, user.type);
  
        // set cookie
        setTokenCookie(res, token);
  
        // const decodedtoken = jwt.decode(data)
  
        res.status(201).json({
          success: true,
          message: `Hi ${user.email} iam logged In`,
          token,
        });
  
    }catch(err){
      console.error('Error logging User: ', err);
      return next(new errorHandler('Internal Server Error', 500));
    }
  
  });



// get user
const userDetail = catchAsyncError(async(req, res, next) => {

  try {

    const userid = parseInt(req.params.id, 10);

    const users = await prisma.user.findUnique({
      where: {
        userid: userid,
      },
    });

    if (!users) {
      return next(new errorHandler('User not found', 404));
    }

    const mediaData = []
    const uncleanedFile = users.media;
    const filename = uncleanedFile.replace(/[\[\]"]/g, '', '');
    console.log(filename);
    const imageUrl = `/agent/${filename}`
    mediaData.push({filename, imageUrl})
    const dataURI = mediaData;



    const user = {
      firstname: users.firstname,
      lastname: users.lastname,
      gender: users.gender,
      email: users.email,
      phoneno: users.phoneno.toString(),
      dateOfBith: users.dataOfBirth,
      description: users.description,
      address: users.address,
      zipCode: users.zipCode,
      JoinAt: users.createdAt,
      LastUpdate: users.updatedAt,
      type: users.type,
      avatar: dataURI,
    }

    res.status(200).json({
      success: true,
      message: "Profile is retrived",
      user
    })


  } catch (err) {
    console.error('Error get User detail: ', err);
    return next(new errorHandler('Internal Server Error', 500));
  }
}) 



// get all agents 
const getAllAgents = catchAsyncError(async( req, res, next) => {


  try {
    

    const agents = await prisma.user.findMany({
      where: {
        type: 'agent',
      },
    });

    const formattedAgents = agents.map(agent => ({
      ...agent,
      phoneno: agent.phoneno.toString(),
      media: `/agent/${JSON.parse(agent.media)}`
    }));

    res.status(200).json({
      success: true,
      message: "All agents retrived",
      agents: formattedAgents
    })
  } catch (error) {
    console.error('Error getting all agents: ', err);
    return next(new errorHandler('Internal Server Error', 500));
  }

})


// get single agent 
const getSingleAgent = catchAsyncError(async(req, res, next) => {

  const userid =  parseInt(req.params.id, 10); 

  try {
    

    const user = await prisma.user.findUnique({
      where: {
        userid: userid,
      },
    });
  
    if (!user) {
      return next(new errorHandler('User not Found', 404));
    }
  
    user.phoneno = user.phoneno.toString();


    const uncleanedFile = user.media;
    const filename = uncleanedFile.replace(/[\[\]"]/g, '', '');
    // read the file from the filepath system and send it as a response
    const filePath = path.join(__dirname, '../storage/agent/', filename);
    const readStream = fs.readFileSync(filePath);
    const base64Image = Buffer.from(readStream).toString('base64');
    // extract image format from filename
    const format = filename.split('.').pop();
   
    // create a data URI for the image
    const dataURI = `data:image/${format};base64,${base64Image}`;

    const data ={
      dataURI,
      user    
    }

    res.status(200).json({
      success: true,
      message: "Agent is retrived",
      data
    })

    
  } catch (err) {
    console.error('Error getting User: ', err);
    return next(new errorHandler('Internal Server Error', 500));
  }

})


// create agent
const createAgent = catchAsyncError(async (req, res, next) => {

    try {

      const {firstname, lastname, gender, email, phoneno, dataOfBirth, password, confirmpw, description, address, zipCode} = req.body;


      // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const ChashedPassword = await bcrypt.hash(confirmpw, 10);
          
        const filename = req.files;
        const dnImageStringify = JSON.stringify(filename.map((i)=>i.filename));
        

          
        // ENDS

        const phoneno_pasrse = parseInt(phoneno);
        const dob = new Date(dataOfBirth)
  
        const agent = await prisma.user.create({
          data: {
            firstname,
            lastname,
            gender,
            email,
            phoneno: phoneno_pasrse,
            dataOfBirth: dob,
            password: hashedPassword,
            description,
            address,
            zipCode,
            media: dnImageStringify,
            confirmpw: ChashedPassword,
          },
        });
          

        console.log("Agent Created Successfully");

        res.status(201).json({
            success: true,
            message: 'Agent is created',
        })
      
    } catch (err) {
        console.error('Error Creating agent: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }
})



// update agent
const updateAgent = catchAsyncError(async (req, res, next) => {

  const {firstname, lastname, gender, email, phoneno, dataOfBirth, description, address, zipCode} = req.body;  
  const userid = parseInt(req.params.id);
  console.log(userid);


  try {

    let filename;

    if(req.files){

      const filenames = req.files;
      filename = JSON.stringify(filenames.map((i)=>i.filename));

    }else{

      const user = await prisma.user.findUnique({
        where: {
          userid: userid,
        },
      });
      
      filename = user.media;
    }

    const phoneno_pasrse = parseInt(phoneno);
    const dob = new Date(dataOfBirth)

    const updatedUser = await prisma.user.update({
      where: {
        userid: userid,
      },
      data: {
        firstname: firstname,
        lastname: lastname,
        gender: gender,
        email: email,
        phoneno: phoneno_pasrse,
        dataOfBirth: dob,
        description: description,
        address: address,
        zipCode: zipCode,
        media: filename,
      },
    });  


    if (!updatedUser) {
      return next(new errorHandler("User not Found", 404));
    }

    // Delete the file from the local drive
    // if (avatar && avatar.length > 0) {
    //   const filename = avatar[0].media;
    //   const filePath = path.join(__dirname, '../storage/agent/', filename);

    //   fs.unlink(filePath, (error) => {
    //       if (error) {
    //           console.error('Error deleting file:', error);
    //       } else {
    //           console.log('File deleted successfully');
    //       }
    //   });
    // }



    res.status(200).json({
      success: true,
      message: "Agent Updated Successfully",
    })
    
  } catch (err) {
    console.error('Error Updating Agent: ', err);
    return next(new errorHandler('Internal Server Error', 500));
  }

})



// delete agent
const deleteAgent = catchAsyncError(async(req, res, next) => {

  try {

    const userid = parseInt(req.params.id);


    const result = await prisma.user.delete({
      where: {
        userid: userid,
      },
    });

    if (result === null) {
      return next(new errorHandler("User not Found", 404));
    }
    
    res.status(202).json({
      success: true,
      message: 'User is deleted',
    })

  } catch (err) {
    console.error('Error deleteing User: ', err);
    return next(new errorHandler('Internal Server Error', 500));
  }
})


// logout
const logOut = async (req, res) => {

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out"
    });
  
  }


module.exports = {
    loginUser,
    logOut,
    createAgent,
    userDetail,
    getAllAgents,
    updateAgent,
    getSingleAgent,
    deleteAgent,
    
}