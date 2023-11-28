const errorHandler = require('../utils/errorHandler.js');
const catchAsyncError = require('../middleware/catchAsyncError.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const sharp = require('sharp')

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const createProject = async (req, res, next) => {
    try {
      const {
        title,
        tags,
        project_type,
        country,
        city,
        location_area,
        life_style,
        map_pin,
        starting_price,
        yt_video,
        developer_name,
        first_installment,
        construction_status,
        handover_status,
        blue_prints,
        features,
        description,
        listing,
      } = req.body;
  
      const images = req.files;
  
      const ParsedBluePrints = Array.isArray(blue_prints)
        ? blue_prints.map((i) => JSON.parse(i))
        : [JSON.parse(blue_prints)].map((i) => i);
  
      const new_blue_print = ParsedBluePrints.map((item, index) => {
        return {
          ...item, // Spread the properties of the existing object
          image: req.files.blue_print_images[index].filename, // Update the image property
        };
      });
  
      const userid = parseInt(req.params.id, 10);
      console.log(country);
  
  
      const filenames = req.files.images.map((file) => file.filename);
     
  
      const sanitizedTitle = title.replace(/\s/g, "");
      const sanitizedDeveloperName = developer_name.replace(/\s/g, "");
      const timestamp = new Date().toISOString();
      const slugs = `${slugify(sanitizedTitle)}-${slugify(
        sanitizedDeveloperName
      )}-${slugify(developer_name)}-${timestamp}`;
      // ENDS
  
      const starting_price_int = parseInt(starting_price);
      const first_installment_int = parseInt(first_installment);
      const construction_status_int = parseInt(construction_status);
      const handover_status_int = parseInt(handover_status);
  
      const newProject = await prisma.project.create({
        data: {
          userid,
          title,
          tags: JSON.stringify(tags),
          project_type,
          country,
          city,
          location_area,
          life_style,
          map_pin,
          starting_price: starting_price_int,
          images: JSON.stringify(filenames),
          yt_video,
          developer_name,
          first_installment: first_installment_int,
          construction_status: construction_status_int,
          handover_status: handover_status_int,
          blue_prints: JSON.stringify(new_blue_print),
          features: JSON.stringify(features),
          description: JSON.stringify(description),
          listing: listing,
          slug: slugs,
        },
      });
  
      console.log("Project Created Successfully");
  
      res.status(201).json({
        success: true,
        message: "Project Created Successfully",
      });
    } catch (err) {
      console.error("Error Creating Project: ", err);
      return next(new errorHandler(err, 500));
    }
  };




const updateProject = catchAsyncError(async (req, res, next) => {
  try {
    const projectId = req.params.slug;

    const {
      title,
      tags,
      project_type,
      country,
      city,
      location_area,
      life_style,
      map_pin,
      starting_price,
      yt_video,
      developer_name,
      first_installment,
      construction_status,
      handover_status,
      blue_prints,
      features,
      description,
      listing,
    } = req.body;

    const blue_print_images = req.files?.blue_print_images || [];
    const images = req.files?.images || [];

    // Process blue_prints data
    let new_blue_print = [];
    if (blue_prints) {
      if (Array.isArray(blue_prints)) {
        new_blue_print = blue_prints.map((item, index) => {
          const blueprint = typeof item === "string" ? JSON.parse(item) : item;
          return {
            ...blueprint,
            image: blue_print_images[index]?.filename || null,
          };
        });
      } else {
        const blueprint =
          typeof blue_prints === "string"
            ? JSON.parse(blue_prints)
            : blue_prints;
        new_blue_print = [
          {
            ...blueprint,
            image: blue_print_images[0]?.filename || null,
          },
        ];
      }
    }

    // Update the project in the database
    const updatedProject = await prisma.project.update({
      where: {
        slug: projectId,
      },
      data: {
        title,
        ...(tags && { tags: { set: tags } }),
        project_type,
        country,
        city,
        location_area,
        life_style,
        map_pin,
        ...(starting_price && { starting_price: parseInt(starting_price) }),
        ...(images && {
          images: { set: images.map((file) => file?.filename || null) },
        }),
        yt_video,
        developer_name,
        ...(first_installment && {
          first_installment: parseInt(first_installment),
        }),
        ...(construction_status && {
          construction_status: parseInt(construction_status),
        }),
        ...(handover_status && { handover_status: parseInt(handover_status) }),
        ...(new_blue_print.length > 0 && {
          blue_prints: { set: new_blue_print },
        }),
        ...(features && { features: { set: features } }),
        description,
        listing,
      },
    });

    console.log("Project Updated Successfully");

    res.status(200).json({
      success: true,
      message: "Project Updated Successfully",
    });
  } catch (err) {
    console.error("Error Updating Project: ", err);
    return next(new errorHandler(err, 500));
  }
});





// get all project --Admin panel
const getProjects = catchAsyncError(async (req, res, next)=>{


    try {

        const userid = parseInt(req.params.id, 10);

        const projects = await prisma.project.findMany({
            where:{
                userid: userid,
            },
        })

        const AllProjects = new Map();

        for(const project of projects){
            const projectId = project.projectid;
            let projects = AllProjects.get(projectId);

            if(!projects){
                projects = {
                    id: projectId,
                    userid: project.userid,
                    title: project.title,
                    tags: JSON.parse(project.tags),
                    project_type: project.project_type,
                    country: project.country,
                    city: project.city,
                    location_area: project.location_area,
                    life_style: project.life_style,
                    map_pin: project.map_pin,
                    starting_price: project.starting_price,
                    media: [],
                    yt_video: project.yt_video,
                    developer_name: project.developer_name,
                    first_installment: project.first_installment,
                    construction_status: project.first_installment,
                    handover_status: project.handover_status,
                    blue_prints: [],
                    features: JSON.parse(project.features),
                    description: JSON.parse(project.description),
                    listing: JSON.parse(project.listing),
                    slug: project.slug
                }
                AllProjects.set(projectId, projects)
                
                let filenames = [];

                if(project.images){
                    try {
                        filenames = JSON.parse(project.images)
                    } catch (error) {
                        filenames = project.images
                    }
                }
                const mediaData = [];
                filenames.forEach((filename) => {
                    const imageUrl = `/project/${filename}`;
                    mediaData.push({ filename, imageUrl });
                });
                projects.media = mediaData;

                
                let bluePrintsData = [];
                if (typeof project.blue_prints === 'string') {
                  try {
                    bluePrintsData = JSON.parse(project.blue_prints);
                  } catch (error) {
                    console.error('Failed to parse blue_prints JSON:', error);
                  }
                }
                bluePrintsData = bluePrintsData.map((bluePrint) => {
                    if (bluePrint.image) {
                      const imageUrl = `/project/${bluePrint.image}`;
                      return { ...bluePrint, imageUrl };
                    }
                    return bluePrint;
                });
              
                projects.blue_prints = bluePrintsData
                
            }
        }

        console.log("All projects retrived");

        res.status(201).json({
            success: true,
            message: 'All project retrived',
            projects: Array.from(AllProjects.values())
        })
        
    } catch (error) {
        console.error('Error Updating Project: ', error);
        return next(new errorHandler('Internal Server Error', 500));
    }

})





// get singleProject --Admin panel
const getProject = catchAsyncError(async (req, res, next)=>{

    try {

        const slug = req.params.slug;

        const projects = await prisma.project.findMany({
            where: {
              slug: slug,
            },
        });
        

        const AllProjects = new Map();

        for(const project of projects){
            const projectId = project.projectid;
            let projects = AllProjects.get(projectId);

            if(!projects){
                projects = {
                    id: projectId,
                    userid: project.userid,
                    title: project.title,
                    tags: JSON.parse(project.tags),
                    project_type: project.project_type,
                    country: project.country,
                    city: project.city,
                    location_area: project.location_area,
                    life_style: project.life_style,
                    map_pin: project.map_pin,
                    starting_price: project.starting_price,
                    media: [],
                    yt_video: project.yt_video,
                    developer_name: project.developer_name,
                    first_installment: project.first_installment,
                    construction_status: project.first_installment,
                    handover_status: project.handover_status,
                    blue_prints: [],
                    features: JSON.parse(project.features),
                    description: JSON.parse(project.description),
                    listing: JSON.parse(project.listing),
                    slug: project.slug
                }
                AllProjects.set(projectId, projects)
                
                let filenames = [];

                if(project.images){
                    try {
                        filenames = JSON.parse(project.images)
                    } catch (error) {
                        filenames = project.images
                    }
                }
                const mediaData = [];
                filenames.forEach((filename) => {
                    const imageUrl = `/project/${filename}`;
                    mediaData.push({ filename, imageUrl });
                });
                projects.media = mediaData;

                
                let bluePrintsData = [];
                if (typeof project.blue_prints === 'string') {
                  try {
                    bluePrintsData = JSON.parse(project.blue_prints);
                  } catch (error) {
                    console.error('Failed to parse blue_prints JSON:', error);
                  }
                }
                bluePrintsData = bluePrintsData.map((bluePrint) => {
                    if (bluePrint.image) {
                      const imageUrl = `/project/${bluePrint.image}`;
                      return { ...bluePrint, imageUrl };
                    }
                    return bluePrint;
                });
              
                projects.blue_prints = bluePrintsData
                
            }
        }

        res.status(201).json({
            success: true,
            message: 'Project is reterived',
            project: Array.from(AllProjects.values())
        })

    }catch (err){
        console.error('Error Creating Project: ', err);
        return next(new errorHandler('Internal Server Error', 500));
    }

})


// userside
const getAllProjects = catchAsyncError(async (req, res, next)=>{


  try {

      const projects = await prisma.project.findMany()

      const AllProjects = new Map();

      for(const project of projects){
          const projectId = project.projectid;
          let projects = AllProjects.get(projectId);

          if(!projects){
              projects = {
                  id: projectId,
                  userid: project.userid,
                  title: project.title,
                  tags: JSON.parse(project.tags),
                  project_type: project.project_type,
                  country: project.country,
                  city: project.city,
                  location_area: project.location_area,
                  life_style: project.life_style,
                  map_pin: project.map_pin,
                  starting_price: project.starting_price,
                  media: [],
                  yt_video: project.yt_video,
                  developer_name: project.developer_name,
                  first_installment: project.first_installment,
                  construction_status: project.first_installment,
                  handover_status: project.handover_status,
                  blue_prints: [],
                  features: JSON.parse(project.features),
                  description: JSON.parse(project.description),
                  listing: JSON.parse(project.listing),
                  slug: project.slug
              }
              AllProjects.set(projectId, projects)
              
              let filenames = [];

              if(project.images){
                  try {
                      filenames = JSON.parse(project.images)
                  } catch (error) {
                      filenames = project.images
                  }
              }
              const mediaData = [];
              filenames.forEach((filename) => {
                  const imageUrl = `/project/${filename}`;
                  mediaData.push({ filename, imageUrl });
              });
              projects.media = mediaData;

              
              let bluePrintsData = [];
              if (typeof project.blue_prints === 'string') {
                try {
                  bluePrintsData = JSON.parse(project.blue_prints);
                } catch (error) {
                  console.error('Failed to parse blue_prints JSON:', error);
                }
              }
              bluePrintsData = bluePrintsData.map((bluePrint) => {
                  if (bluePrint.image) {
                    const imageUrl = `/project/${bluePrint.image}`;
                    return { ...bluePrint, imageUrl };
                  }
                  return bluePrint;
              });
            
              projects.blue_prints = bluePrintsData
              
          }
      }

      console.log("All projects retrived");

      res.status(201).json({
          success: true,
          message: 'All project retrived',
          projects: Array.from(AllProjects.values())
      })
      
  } catch (error) {
      console.error('Error Updating Project: ', error);
      return next(new errorHandler('Internal Server Error', 500));
  }

})



const getOneProject = catchAsyncError(async (req, res, next)=>{

  try {

      const slug = req.params.slug;

      const projects = await prisma.project.findMany({
          where: {
            slug: slug,
          },
      });
      

      const AllProjects = new Map();

      for(const project of projects){
          const projectId = project.projectid;
          let projects = AllProjects.get(projectId);

          if(!projects){
              projects = {
                  id: projectId,
                  userid: project.userid,
                  title: project.title,
                  tags: JSON.parse(project.tags),
                  project_type: project.project_type,
                  country: project.country,
                  city: project.city,
                  location_area: project.location_area,
                  life_style: project.life_style,
                  map_pin: project.map_pin,
                  starting_price: project.starting_price,
                  media: [],
                  yt_video: project.yt_video,
                  developer_name: project.developer_name,
                  first_installment: project.first_installment,
                  construction_status: project.first_installment,
                  handover_status: project.handover_status,
                  blue_prints: [],
                  features: JSON.parse(project.features),
                  description: JSON.parse(project.description),
                  listing: JSON.parse(project.listing),
                  slug: project.slug
              }
              AllProjects.set(projectId, projects)
              
              let filenames = [];

              if(project.images){
                  try {
                      filenames = JSON.parse(project.images)
                  } catch (error) {
                      filenames = project.images
                  }
              }
              const mediaData = [];
              filenames.forEach((filename) => {
                  const imageUrl = `/project/${filename}`;
                  mediaData.push({ filename, imageUrl });
              });
              projects.media = mediaData;

              
              let bluePrintsData = [];
              if (typeof project.blue_prints === 'string') {
                try {
                  bluePrintsData = JSON.parse(project.blue_prints);
                } catch (error) {
                  console.error('Failed to parse blue_prints JSON:', error);
                }
              }
              bluePrintsData = bluePrintsData.map((bluePrint) => {
                  if (bluePrint.image) {
                    const imageUrl = `/project/${bluePrint.image}`;
                    return { ...bluePrint, imageUrl };
                  }
                  return bluePrint;
              });
            
              projects.blue_prints = bluePrintsData
              
          }
      }

      res.status(201).json({
          success: true,
          message: 'Project is reterived',
          project: Array.from(AllProjects.values())
      })

  }catch (err){
      console.error('Error Creating Project: ', err);
      return next(new errorHandler('Internal Server Error', 500));
  }

})


module.exports = {

    createProject,
    updateProject,
    getProjects,
    getProject,
    getAllProjects,
    getOneProject
}