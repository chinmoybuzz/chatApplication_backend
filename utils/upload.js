const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const generateRandomString = async (length) => {
  return crypto.randomBytes(length).toString("hex");
};

const getExtension = (filePath) => {
  const arr = filePath?.split(".");
  return arr[arr.length - 1];
};

const uploadBinaryFile = async (params) => {
  const fileName = params.file.name || new Date().getTime();
  const extension = getExtension(params.file.originalname);
  const randomString = await generateRandomString(12);
  const uniqueFileName = `${fileName}${randomString}.${extension}`;

  const folderPath = path.join(__dirname, `../public/storage/${params.folder}`);

  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // create nested dirs if needed
  }

  const filePath = path.join(folderPath, uniqueFileName);

  fs.writeFileSync(filePath, params.file.buffer);

  return {
    size: params.file.size,
    url: `storage/${params.folder}/${uniqueFileName}`,
    filename: params.file.originalname,
    extension,
  };
};

const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, `../public/${filePath}`);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const reqToFile=(req,pathName)=>{
  try{
    if(!req.files|| !Array.isArray(req.files)){
      throw new Error("No files found in request")
    }
  const Image = req.files.filter((img) => img.fieldname.startsWith(pathName));
  return Image;
  }catch(error){
    console.log("request to file Error:",error)
  return []
  }
}

module.exports = { uploadBinaryFile, deleteFile ,reqToFile};
