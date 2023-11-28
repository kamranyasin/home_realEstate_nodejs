const app = require("./app");
require('dotenv').config()
const cors = require("cors");


app.use(cors({
  origin: 'http://localhost:4000'
}));

// handling uncought Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});


// database
// require('./Models/User');
// require('./Models/Properties');



// config
if(process.env.NODE_ENV !== "PRODUCTION"){
  require("dotenv").config({path:"server/.env"})
};

// assigning port to server
const server = app.listen(process.env.PORT, ()=>{
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});


// unhandled promise rejaection
process.on("unhandledRejection", err =>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() =>{
      process.exit(1);
  })

})