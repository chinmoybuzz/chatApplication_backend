const AuthService = require("../services/auth.services");

const login = async (req, res) => {
  const login = await AuthService.login({ ...req.body });
  return res.status(login.status).send(login);
};
const signup = async (req, res) => {
  const image = req.files.filter((img) => img.fieldname.startsWith("image"));
  const signup = await AuthService.signUp({ ...req.body, image });
  console.log("signup controller", signup);
  return res.status(signup.status).send(signup);
};

module.exports = { login, signup };
