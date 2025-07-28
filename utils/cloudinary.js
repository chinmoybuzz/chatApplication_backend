const cloudinary=require("cloudinary").v2;
const streamifier=requrie("streamifier")


cloudinary.config({
    cloud_name:process.env.CloudName,
    api_key:process.env.apiKey,
    api_secret:process.env.cloudinarySecrectKey
})


const uploadCloudinary=async (req)=>{
    return Promise((resolve,reject)=>{
        let cld_upload_stream=cloudinary.uploader.upload_stream({
            folder:req.folder,
        },(error,result)=>{
            if(result){
                resolve(result)
            }else{
                reject(error)
            }
        })
        streamifier.createReadStream(req.file.buffor).pipe(cld_upload_stream)
    })
}

module.exports={
    uploadCloudinary
}