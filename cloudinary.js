import { config, uploader } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

// Configuring Cloudinary
config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: uploader,
  params: {
    folder: 'YourFolderName', // The name of the folder in Cloudinary
    format: async (req, file) => 'png', // forces files to be saved as PNG
    public_id: (req, file) => {
      // Optional: use the file's original name (without extension)
      const name = file.originalname.split('.')[0]
      return `${name}-${Date.now()}`
    }
  }
})

const upload = multer({ storage: storage })
