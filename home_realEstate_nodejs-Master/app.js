const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const path = require("path");
const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:4000'
}));
  

app.use('/storage/properties', createProxyMiddleware({
    target: 'http://localhost:4100',
    changeOrigin: true,
}));

app.use('/test-image', express.static(path.join(__dirname, 'storage', 'properties', 'e433262a-0eab-41f9-a0f0-3ff71094f0c81687348146490_ralph-ravi-kayden-JDBVXignFdA-unsplash.jpg')));

app.use(express.json());
app.use('/properties', express.static(path.join(__dirname, 'storage/properties')));
app.use('/agent', express.static(path.join(__dirname, 'storage/agent')));
app.use('/blog', express.static(path.join(__dirname, 'storage/blog')));
app.use('/project', express.static(path.join(__dirname, 'storage/project')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(fileUpload());


// Route Imports
const user = require("./routes/userRoute");
const property = require('./routes/properties')
const project = require('./routes/projectRoutes')
const blog = require('./routes/blogRoute')

// use route
app.use("/api/v1", user);
app.use("/api/v1", property);
app.use("/api/v1", project);
app.use("/api/v1", blog);


// Middleware for erroe
app.use(errorMiddleware);

module.exports = app;
