const UserService = require("../services/user.services");
const {reqToFile}=require("../utils/upload")


// Login Controller
const UserAdd = async (req, res) => {
  try {
    const image= reqToFile(req,"image");
    console.log("auth user",req.authUser)
    const result = await UserService.userAdd({ ...req.authUser,...req.body,image });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// Signup Controller
const UserList = async (req, res) => {
  try {
    const result = await UserService.userList({ ...req.query, ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

//refresh-token
const refreshAccessToken=async(req,res)=>{
  try {
    const token=req.headers['x-refresh-token']
    const result=await UserService.refreshAccessToken({
      ...req.body,token
    })
    return res.status(result.status).json(result)
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" })
  }
}

module.exports = { UserAdd, UserList,refreshAccessToken };
