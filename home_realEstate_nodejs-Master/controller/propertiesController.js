const errorHandler = require('../utils/errorHandler.js');
const catchAsyncError = require('../middleware/catchAsyncError.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const sharp = require('sharp')



const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();




const createProperty = catchAsyncError(async (req, res, next) => {

    try {

        const {
            property_type,
            property_status,
            property_price,
            max_rooms,
            beds,
            baths,
            area,
            price,
            agencies,
            description,
            address,
            zipCode,
            country,
            city,
            land_mark,
            video_url,
            additional_features,
            } = req.body;

        const userid = parseInt(req.params.id, 10);

        // get media
        const filename = req.files;
        const dnImageStringify = filename.map((i)=>i.filename);
       
        //ENDS

        // CREATE SLUG
        const timestamp = new Date().toISOString();
        const slug = `${slugify(agencies)}-${slugify(property_type)}-${slugify(property_status)}-${userid}-${timestamp}`;
        // ENDS


        // ! remember to add media or JSON.Stringify(filenames)
        const property_price_int = parseInt(property_price);
        const property_rooms = parseInt(max_rooms);
        const property_bed = parseInt(beds)
        const property_baths = parseInt(baths)
        const property__pricetwo = parseInt(price);

        const property = await prisma.properties.create({
            data: {
              userid,
              property_type,
              property_status,
              property_price: property_price_int,
              max_rooms: property_rooms,
              beds: property_bed,
              baths: property_baths,
              area,
              price: property__pricetwo,
              agencies,
              description,
              address,
              zipCode,
              country,
              city,
              land_mark,
              media: dnImageStringify,
              video_url,
              additional_features: JSON.stringify(additional_features),
              slug,
            },
          });
          


        console.log("properties Created Successfully");


        res.status(201).json({
            success: true,
            message: 'property is created',
        })


    } catch (err) {
        console.error('Error Creating Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }
})


// update properties
const updateProperty = catchAsyncError(async (req, res, next) => {

    try {

        const {
            property_type,
            property_status,
            property_price,
            max_rooms,
            beds,
            baths,
            area,
            price,
            agencies,
            description,
            address,
            zipCode,
            country,
            city,
            land_mark,
            video_url,
            additional_features,
        } = req.body;

        const slug  = req.params.slug;

      
        let filenames;

        if(req.files.media>0){
            
          const filename = req.files;
          filenames = filename.map((i)=>i.filename);
          

        }else{
          const media = await prisma.properties.findFirst({
            where:{
              slug: slug
            }
          })

          const medias = media.media
          const cleanedNames = medias.map((name) => {
            const cleanedName = name.replace(/[\[\]]/g, '');
            return cleanedName;
          });
          filenames = cleanedNames
        }
        //ENDS


        // ! remember to add media or JSON.Stringify(filenames)
        
        const property_price_int = parseInt(property_price);
        const property_rooms = parseInt(max_rooms);
        const property_bed = parseInt(beds)
        const property_baths = parseInt(baths)
        const property__pricetwo = parseInt(price);

        const updatedProperty = await prisma.properties.update({
            where: {
                slug,
            },
            data: {
              property_type: property_type,
              property_status: property_status,
              property_price: property_price_int,
              max_rooms: property_rooms,
              beds: property_bed,
              baths: property_baths,
              area: area,
              price: property__pricetwo,
              agencies: agencies,
              description: description,
              address: address,
              zipCode: zipCode,
              country: country,
              city: city,
              land_mark: land_mark,
              media: filenames,
              video_url: video_url,
              additional_features: JSON.stringify(additional_features),
            },
          });

        //previous images delete function
        // if(medias && medias.length>0){
        //     picture.forEach((media) => {
        //         const filename = media.filename;
        //         const filePath = path.join(__dirname, '../storage/properties/', filename);
            
        //         fs.unlink(filePath, (error) => {
        //           if (error) {
        //             console.error('Error deleting file:', error);
        //           } else {
        //             console.log('File deleted successfully');
        //           }
        //         });
        //     });
        // }


        if (!updatedProperty) {
            return next(new errorHandler('Property not found', 404));
        }


        console.log("properties Updated Successfully");


        res.status(201).json({
            success: true,
            message: 'property Updated',
        })


    } catch (err) {
        console.error('Error Updating Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }
})



// get all properties --Admin panel
const getProperties = catchAsyncError(async (req, res, next)=>{

    try {

        const userid = parseInt(req.params.id, 10);

        const properties = await prisma.properties.findMany({
            where: {
              userid: userid,
            },
        });
        


        const AllProperties = new Map();

        for (const property of properties) {
          const propertyId = property.propertiesid;
          let project = AllProperties.get(propertyId);
        
          if (!project) {
            project = {
              id: propertyId, // Convert BigInt to string
              userid: property.userid,
              property_type: property.property_type,
              property_status: property.property_status,
              property_price: property.property_price.toString(), // Convert BigInt to string
              max_rooms: property.max_rooms.toString(),
              beds: property.beds.toString(),
              baths: property.baths.toString(),
              area: property.area,
              price: property.price.toString(),
              agencies: property.agencies,
              description: property.description,
              address: property.address,
              zipCode: property.zipCode,
              country: property.country,
              city: property.city,
              video_url: property.video_url,
              land_mark: property.land_mark,
              additional_features: property.additional_features,
              views: property.views ? property.views.toString() : null, // Convert BigInt to string
              slug: property.slug,
              media: [],
              date: property.updatedAt,
            };
        
            AllProperties.set(propertyId, project);
          }
        
          let filenames = [];

          if (property.media) {
            try {
              console.log("sdds", property.media);
              filenames = JSON.parse(property.media);
              //console.log("filenames", filenames);
            } catch (error) {
              filenames = property.media;
            }
          }
          const mediaData = [];
          filenames.forEach((filename) => {
            const imageUrl = `/properties/${filename}`;
            mediaData.push({ filename, imageUrl });
          });
        
          project.media = mediaData;
        }
        
        console.log('Properties retrived successfully');          
        
        res.status(201).json({
            success: true,
            message: 'properties is reterived',
            properties: Array.from(AllProperties.values())
        })

    }catch (err){
        console.error('Error Fetching Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})


// get all properties --User side
const getUserProperties = catchAsyncError(async (req, res, next)=>{

    try {


        const properties = await prisma.properties.findMany();

        console.log(properties);

        const AllProperties = new Map();

        for (const property of properties) {
            const propertyId = property.propertiesid;
            let project = AllProperties.get(propertyId);

            if (!project) {
                project = {
                  id: propertyId, // Convert BigInt to string
                  userid: property.userid,
                  property_type: property.property_type,
                  property_status: property.property_status,
                  property_price: property.property_price.toString(), // Convert BigInt to string
                  max_rooms: property.max_rooms.toString(),
                  beds: property.beds.toString(),
                  baths: property.baths.toString(),
                  area: property.area,
                  price: property.price.toString(),
                  agencies: property.agencies,
                  description: property.description,
                  address: property.address,
                  zipCode: property.zipCode,
                  city: property.city,
                  country: property.country,
                  video_url: property.video_url,
                  additional_features: property.additional_features,
                  views: property.views ? property.views.toString() : null, // Convert BigInt to string
                  slug: property.slug,
                  media: [],
                  date: property.updatedAt,
                };
            
                AllProperties.set(propertyId, project);
              }
              
              let filenames = [];

              if (property.media) {
                try {
                  filenames = JSON.parse(property.media);
                } catch (error) {
                  filenames = property.media;
                }
              }

            const mediaData = [];
            filenames.forEach(filename => {
                const imageUrl = `/properties/${filename}`;
                mediaData.push({ filename, imageUrl });
            });
            
            project.media = mediaData;
        }

        res.status(201).json({
            success: true,
            message: 'properties is reterived',
            properties: Array.from(AllProperties.values())
        })

    }catch (err){
        console.error('Error Creating Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})



// get singleProperty --Admin panel
const getProperty = catchAsyncError(async (req, res, next)=>{

    try {

        const slug = req.params.slug;

        const properties = await prisma.properties.findMany({
            where: {
              slug: slug,
            },
        });
        



        const AllProperties = new Map();

        for (const property of properties) {
            const propertyId = property.propertiesid;
            let project = AllProperties.get(propertyId);

            if (!project) {
                project = {
                  id: propertyId, // Convert BigInt to string
                  userid: property.userid,
                  property_type: property.property_type,
                  property_status: property.property_status,
                  property_price: property.property_price.toString(), // Convert BigInt to string
                  max_rooms: property.max_rooms.toString(),
                  beds: property.beds.toString(),
                  baths: property.baths.toString(),
                  area: property.area,
                  price: property.price.toString(),
                  agencies: property.agencies,
                  description: property.description,
                  address: property.address,
                  zipCode: property.zipCode,
                  country: property.country,
                  city: property.city,
                  land_mark: property.land_mark,
                  video_url: property.video_url,
                  additional_features: property.additional_features,
                  views: property.views ? property.views.toString() : null, // Convert BigInt to string
                  slug: property.slug,
                  media: [],
                  date: property.updatedAt,
                };
            
                AllProperties.set(propertyId, project);
              }
            const filenames = property.media;

            const mediaData = [];
            if (Array.isArray(filenames)) {
              filenames.forEach(filename => {
                const imageUrl = `/properties/${filename}`;
                mediaData.push({ filename, imageUrl });
              });
            }
            
            project.media = mediaData;
        }

        res.status(201).json({
            success: true,
            message: 'properties is reterived',
            properties: Array.from(AllProperties.values())
        })

    }catch (err){
        console.error('Error Creating Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})


// get singleProperty --user Side
const getUserProperty = catchAsyncError(async (req, res, next)=>{

    try {

        const slug = req.params.slug

        const properties = await prisma.properties.findMany({
            where: {
              slug: slug,
            },
        });
        


        const AllProperties = new Map();

        for (const property of properties) {
            const propertyId = property.propertiesid;
            let project = AllProperties.get(propertyId);

            if (!project) {
                project = {
                  id: propertyId, // Convert BigInt to string
                  userid: property.userid,
                  property_type: property.property_type,
                  property_status: property.property_status,
                  property_price: property.property_price.toString(), // Convert BigInt to string
                  max_rooms: property.max_rooms.toString(),
                  beds: property.beds.toString(),
                  baths: property.baths.toString(),
                  area: property.area,
                  price: property.price.toString(),
                  agencies: property.agencies,
                  description: property.description,
                  address: property.address,
                  zipCode: property.zipCode,
                  country: property.country,
                  city: property.city,
                  video_url: property.video_url,
                  additional_features: JSON.parse(property.additional_features),
                  views: property.views ? property.views.toString() : null, // Convert BigInt to string
                  slug: property.slug,
                  media: [],
                  date: property.updatedAt,
                };
            
                AllProperties.set(propertyId, project);
              }
            const filenames = property.media;

            const mediaData = [];
            if (Array.isArray(filenames)) {
              filenames.forEach(filename => {
                const imageUrl = `/properties/${filename}`;
                mediaData.push({ filename, imageUrl });
              });
            }
            
            project.media = mediaData;
        }

        res.status(201).json({
            success: true,
            message: 'properties is reterived',
            properties: Array.from(AllProperties.values())
        })

    }catch (err){
        console.error('Error Creating Property: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})


const deleteProperty = catchAsyncError(async(req, res, next) => {

    try {
  
      const slug = req.params.slug

      const deletedProperty = await prisma.properties.deleteMany({
        where: {
          slug: slug,
        },
      });
    
      if (deletedProperty.count === 0) {
        return next(new errorHandler('properties not Found', 404));
      }
      
      res.status(202).json({
        success: true,
        message: 'properties is deleted',
      })
  
    } catch (err) {
      console.error('Error deleteing properties: ', err);
      return next(new errorHandler('Internal Server Error', 500));
    }
  })



module.exports = {
    createProperty,
    getProperties,
    getUserProperties,
    updateProperty,
    getProperty,
    getUserProperty,
    deleteProperty
}