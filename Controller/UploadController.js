// const multer = require('multer')
// const fs = require('fs')
// const path = require('path')

// // Ensure the media directory exists
// const mediaDir = path.join(__dirname, '..', 'media')
// fs.existsSync(mediaDir) || fs.mkdirSync(mediaDir)

// // Set up storage configuration for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, mediaDir) // Save files in the media directory
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique file name using the current timestamp and a random number
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//     const newFileName =
//       file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
//     cb(null, newFileName) // Use the generated name for the file
//   }
// })

// const upload = multer({ storage: storage })

// // Upload file handler
// const uploadFile = (req, res) => {
//   upload.single('media')(req, res, function (err) {
//     if (err) {
//       // Handle multer error
//       return res.status(500).json({ error: err.message })
//     }
//     if (!req.file) {
//       return res.status(400).send({ error: 'No File Uploaded!' })
//     }
//     // Respond with the message and the new file name
//     res.json({
//       message: 'File uploaded successfully',
//       name: req.file.filename
//     })
//   })
// }

// const getImageURL = (req, res) => {
//   const filename = req.params.file // Extract filename from route parameter
//   const filePath = path.join(mediaDir, filename)

//   // Check if the file exists
//   if (fs.existsSync(filePath)) {
//     // Construct the URL based on your server configuration
//     const imageURL = `http://${req.headers.host}/media/${filename}`
//     res.json({ imageURL })
//   } else {
//     res.status(404).json({ error: 'Image not found' })
//   }
// }

// module.exports = { uploadFile, getImageURL }

// Import required modules
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure storage to manage file uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media', // Folder on Cloudinary to store files
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'mp4'], // Specify allowed formats
    resource_type: 'auto' // Automatically detect resource type (image or video)
  }
})

const upload = multer({ storage: storage })

// Upload file handler
const uploadFile = (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      // Handle multer error
      console.log(err)
      return res.status(500).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).send({ error: 'No File Uploaded!' })
    }
    // Respond with the message and the URL of the uploaded file on Cloudinary
    res.json({
      message: 'File uploaded successfully',
      url: req.file.path
    })
  })
}

module.exports = { uploadFile }
