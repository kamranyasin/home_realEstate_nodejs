const errorHandler = require('../utils/errorHandler.js');
const catchAsyncError = require('../middleware/catchAsyncError.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const sharp = require('sharp')




const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();





const createBlog = catchAsyncError(async (req, res, next) => {

    try {

        const {
            category,
            title,
            content,
            } = req.body;


        const userid = parseInt(req.params.id, 10);


       
        //ENDS
        const sanitizedTitle = title.replace(/\s/g, '');
        const sanitizedCategoryName = category.replace(/\s/g, '');
        const timestamp = new Date().toISOString();
        const slugs = `${slugify(sanitizedTitle)}-${slugify(sanitizedCategoryName)}-${timestamp}`;
        // ENDS

        const image = req.files.image;
        const imageName = image.map((i)=> i.filename)
        const images = req.files.images;
        const imagesName = [] 
        if (images && images.length > 0) {
            imagesName = images.map((i) => i.filename);
        }

        const newBlog = await prisma.blogs.create({
            data: {
              userid,
              category,
              title,
              content,
              image: imageName,
              images: imagesName,
              slug: slugs,
            },
          });
          


        console.log("Blog Created Successfully");


        res.status(201).json({
            success: true,
            message: 'Blog is created',
        })


    } catch (err) {
        console.error('Error Creating Project: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }
})


const updateBlog = catchAsyncError(async (req, res, next) => {

    try {

        const {
            category,
            title,
            content,
            } = req.body;


        const slug = req.params.slug
        console.log(slug);

        // get media
        const medias = req.files && req.files.images ? req.files.images : null;
        let filenames;
        if(!medias){
            const media = await prisma.blogs.findFirst({
                where:{
                    slug: slug
                }
            })
            const medias = media.images
            const cleanedNames = medias.map((name) => {
            const cleanedName = name.replace(/[\[\]]/g, '');
            return cleanedName;
            })
            filenames = medias
        }else{
            filenames = medias.map(media => media.filename)
        }
        console.log(filenames);


        const images = req.files && req.files.image ? req.files.image : null;
        let filename;
        if(!images){
            const media = await prisma.blogs.findFirst({
                where:{
                    slug: slug
                }
            })
            const medias = media.images
            const cleanedNames = medias.map((name) => {
            const cleanedName = name.replace(/[\[\]]/g, '');
            return cleanedName;
            })
            filenames = cleanedNames
        }else{
            filename = images.map(image => image.filename)
        }
        

        const newProject = await prisma.blogs.update({
            where:{
                slug: slug,
            },
            data: {
                category,
                title,
                content,
                image: filename,
                images: filenames,
                slug: slug
            },
          });
          
          //previous images delete function
        // if(medias && medias.length>0){
        //     medias.forEach((images) => {
        //         const filename = images.filename;
        //         const filePath = path.join(__dirname, '../storage/blog/', filename);
            
        //         fs.unlink(filePath, (error) => {
        //           if (error) {
        //             console.error('Error deleting file:', error);
        //           } else {
        //             console.log('File deleted successfully');
        //           }
        //         });
        //     });
        // }
        // if(images && images.length>0){
        //     images.forEach((image) => {
        //         const filename = image.filename;
        //         const filePath = path.join(__dirname, '../storage/blog/', filename);
            
        //         fs.unlink(filePath, (error) => {
        //           if (error) {
        //             console.error('Error deleting file:', error);
        //           } else {
        //             console.log('File deleted successfully');
        //           }
        //         });
        //     });
        // }

        console.log("Blog Updated Successfully");


        res.status(201).json({
            success: true,
            message: 'Blog is updated',
        })


    } catch (err) {
        console.error('Error Updating blog: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }
})


// get all project --Admin panel
const getBlogs = catchAsyncError(async (req, res, next)=>{


    try {

        const userid = parseInt(req.params.id, 10);

        const blogs = await prisma.blogs.findMany({
            where:{
                userid: userid,
            },
        })

        const AllBlogs = new Map();

        for (const blog of blogs) {
          const blogid = blog.blogid;
          let projects = AllBlogs.get(blogid);
        
          if (!projects) {
            projects = {
              id: blogid,
              userid: blog.userid,
              title: blog.title,
              image: [],
              images: [],
              content: blog.content,
              category: blog.category,
              slug: blog.slug,
              createdAt: blog.createdAt,
            };
            AllBlogs.set(blogid, projects);
        
            let filenames = [];
        
            if (blog.images) {
              try {
                filenames = JSON.parse(blog.images);
                console.log(filenames);
              } catch (error) {
                filenames = blog.images;
              }
            }
            const mediasData = [];
            filenames.forEach((filename) => {
              const imageUrl = `/blog/${filename}`;
              mediasData.push({ filename, imageUrl });
            });
        
            projects.images = mediasData;

            // 
            let filename = [];
        
            if (blog.image) {
              try {
                filename = JSON.parse(blog.image);
                console.log(filename);
              } catch (error) {
                filename = blog.image;
              }
            }
            const mediaData = [];
            filename.forEach((file) => {
              const imageUrl = `/blog/${file}`;
              mediaData.push({ file, imageUrl });
            });
        
            projects.image = mediaData;

          }
        }

        console.log("All blogs retrived");

        res.status(201).json({
            success: true,
            message: 'All blogs retrived',
            blogs: Array.from(AllBlogs.values())
        })
        
    } catch (error) {
        console.error('Error Updating Project: ', error);
        return next(new errorHandler('Internal Server Error', 500));
    }

})



// get singleProject --Admin panel
const getBlog = catchAsyncError(async (req, res, next)=>{

    try {

        const slug = req.params.slug;

        const blogs = await prisma.blogs.findMany({
            where: {
              slug: slug,
            },
        });
        


        const AllBlogs = new Map();

        for (const blog of blogs) {
          const blogid = blog.blogid;
          let projects = AllBlogs.get(blogid);
        
          if (!projects) {
            projects = {
              id: blogid,
              userid: blog.userid,
              title: blog.title,
              image: [],
              images: [],
              content: blog.content,
              category: blog.category,
              slug: blog.slug,
              createdAt: blog.createdAt,
            };
            AllBlogs.set(blogid, projects);
        
            let filenames = [];
        
            if (blog.images) {
              try {
                filenames = JSON.parse(blog.images);
                console.log(filenames);
              } catch (error) {
                filenames = blog.images;
              }
            }
            const mediasData = [];
            filenames.forEach((filename) => {
              const imageUrl = `/blog/${filename}`;
              mediasData.push({ filename, imageUrl });
            });
        
            projects.images = mediasData;

            // 
            let filename = [];
        
            if (blog.image) {
              try {
                filename = JSON.parse(blog.image);
                console.log(filename);
              } catch (error) {
                filename = blog.image;
              }
            }
            const mediaData = [];
            filename.forEach((file) => {
              const imageUrl = `/blog/${file}`;
              mediaData.push({ file, imageUrl });
            });
        
            projects.image = mediaData;

          }
        }

        res.status(201).json({
            success: true,
            message: 'Blog is reterived',
            project: Array.from(AllBlogs.values())
        })

    }catch (err){
        console.error('Error getting blog: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})



const getUserBlogs = catchAsyncError(async (req, res, next)=>{


  try {


      const blogs = await prisma.blogs.findMany()

      const AllBlogs = new Map();

      for (const blog of blogs) {
        const blogid = blog.blogid;
        let projects = AllBlogs.get(blogid);
      
        if (!projects) {
          projects = {
            id: blogid,
            userid: blog.userid,
            title: blog.title,
            image: [],
            images: [],
            content: blog.content,
            category: blog.category,
            slug: blog.slug,
            createdAt: blog.createdAt,
          };
          AllBlogs.set(blogid, projects);
      
          let filenames = [];
      
          if (blog.images) {
            try {
              filenames = JSON.parse(blog.images);
              console.log(filenames);
            } catch (error) {
              filenames = blog.images;
            }
          }
          const mediasData = [];
          filenames.forEach((filename) => {
            const imageUrl = `/blog/${filename}`;
            mediasData.push({ filename, imageUrl });
          });
      
          projects.images = mediasData;

          // 
          let filename = [];
      
          if (blog.image) {
            try {
              filename = JSON.parse(blog.image);
              console.log(filename);
            } catch (error) {
              filename = blog.image;
            }
          }
          const mediaData = [];
          filename.forEach((file) => {
            const imageUrl = `/blog/${file}`;
            mediaData.push({ file, imageUrl });
          });
      
          projects.image = mediaData;

        }
      }

      console.log("All blogs retrived");

      res.status(201).json({
          success: true,
          message: 'All blogs retrived',
          blogs: Array.from(AllBlogs.values())
      })
      
  } catch (error) {
      console.error('Error Updating Project: ', error);
      return next(new errorHandler('Internal Server Error', 500));
  }

})


const getUserBlog = catchAsyncError(async (req, res, next)=>{

  try {

      const slug = req.params.slug;

      const blogs = await prisma.blogs.findMany({
          where: {
            slug: slug,
          },
      });
      


      const AllBlogs = new Map();

      for (const blog of blogs) {
        const blogid = blog.blogid;
        let projects = AllBlogs.get(blogid);
      
        if (!projects) {
          projects = {
            id: blogid,
            userid: blog.userid,
            title: blog.title,
            image: [],
            images: [],
            content: blog.content,
            category: blog.category,
            slug: blog.slug,
            createdAt: blog.createdAt,
          };
          AllBlogs.set(blogid, projects);
      
          let filenames = [];
      
          if (blog.images) {
            try {
              filenames = JSON.parse(blog.images);
              console.log(filenames);
            } catch (error) {
              filenames = blog.images;
            }
          }
          const mediasData = [];
          filenames.forEach((filename) => {
            const imageUrl = `/blog/${filename}`;
            mediasData.push({ filename, imageUrl });
          });
      
          projects.images = mediasData;

          // 
          let filename = [];
      
          if (blog.image) {
            try {
              filename = JSON.parse(blog.image);
              console.log(filename);
            } catch (error) {
              filename = blog.image;
            }
          }
          const mediaData = [];
          filename.forEach((file) => {
            const imageUrl = `/blog/${file}`;
            mediaData.push({ file, imageUrl });
          });
      
          projects.image = mediaData;

        }
      }

      res.status(201).json({
          success: true,
          message: 'Blog is reterived',
          project: Array.from(AllBlogs.values())
      })

  }catch (err){
      console.error('Error getting blog: ', err);
      return next(new errorHandler('Internal Server Error', 500));
  }

})



module.exports = {
    createBlog,
    getBlogs,
    getBlog,
    updateBlog,
    getUserBlogs,
    getUserBlog
}