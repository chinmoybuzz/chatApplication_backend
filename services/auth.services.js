const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../modal/User.model");
const { uploadBinaryFile } = require("../utils/upload");
const login = async (params) => {
  console.log(params);
  try {
    const { email, password } = params;

    // Validate inputs
    if (!email || !password) {
      return {
        status: 400,
        message: "Email and Password are required",
      };
    }

    // Find user
    const user = await userModel.findOne({ email, deletedAt: null });
    console.log(user);
    if (!user) {
      return {
        status: 401,
        message: "Invalid email or password",
      };
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Input password:", password);
    console.log("Stored hash:", user.password);

    if (!isMatch) {
      return {
        status: 401,
        message: "Invalid email or password",
      };
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "chinmoy", { expiresIn: "15m" });

    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "chinmoy", { expiresIn: "7d" });

    // Optional: save refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save();

    return {
      status: 200,
      message: "Logged In",
      data: {
        user: {
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: `Server Error: ${error.message}`,
    };
  }
};

const signUp = async (params) => {
  // console.log(params);
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
    if (params.image.length > 0) {
      const up = await uploadBinaryFile({ file: params.image[0], folder: "user" });
      params.image = up;
    } else delete params.image;
    // const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("signup", hashedPassword);
    const newUser = await new userModel({ email, password, image: params.image }).save();
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET || "chinmoy", { expiresIn: "1h" });
    return {
      status: 200,
      message: `Signed Up successfully`,
      token,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: `Server Error: ${error.message}`,
    };
  }
};

module.exports = { login, signUp };
