const DashboardService = require("../services/dashboard.services");

// Dashboard Controller
const Dashboard = async (req, res) => {
  try {
    const result = await DashboardService.dashboard({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

module.exports = { Dashboard,  };
