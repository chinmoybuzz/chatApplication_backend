const AuthService = require("../services/auth.services");

const login = (req, res) => {
  const login = AuthService.login(...req.body);
  return res.status(login.status).send(login);
};
const signup = (req, res) => {
  const login = AuthService.signUp(...req.body);
  return res.status(login.status).send(login);
};

module.exports = { login, signup };
