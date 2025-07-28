
function createResponse({ status = 200, success = true, message = "", data = null }) {
  return {
    status,
    success,
    message,
    data,
  };
}

module.exports = { createResponse };
