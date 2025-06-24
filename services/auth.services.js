const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../modal/User.model");

const login = () => {
  try {
    return {
      status: 200,
      data: {
        user: "chinmoy",
        role: "Admin",
        accessToken: "asdjfhaiwuefhpaiwh1239hW938R30",
        refreshToken: "asdjfhaiwuefhpaiwh1239hW938R30",
      },
      message: `logged In`,
    };
  } catch (error) {
    return {
      status: 500,
      message: `Server Error: ${error.message}`,
    };
  }
};

const signUp = async (params) => {
  try {
    const { email, password, role } = params;
    if (!email || !password) {
      return {
        status: 400,
        message: "Email and Password are required",
      };
    }
    const existingUser = await userModel.findOne({ email, deletedAt: null });
    if (existingUser) {
      return {
        status: 400,
        message: "User already exists.",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ email, password: hashedPassword, role }).save();
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET || "chinmoy", { expiresIn: "1h" });
    return {
      status: 200,
      message: `Signed Up successfully`,
      token,
    };
  } catch (error) {
    return {
      status: 500,
      message: `Server Error: ${error.message}`,
    };
  }
};

module.exports = { login, signUp };
