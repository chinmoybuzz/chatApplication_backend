module.exports = function socketAuthMiddleware(socket, next) {
  // For example, you can verify token from query
 const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Access token required"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET );
      socket.user = decoded; // attach user to socket
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
};
