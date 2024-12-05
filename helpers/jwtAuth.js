const { expressjwt } = require('express-jwt');

async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }
  return false;
}

function authJwt() {
  const secret = process.env.JWT_SECRET;
  const api = process.env.API_V;
  return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      `${api}/users/login`,
      `${api}/users/register`,
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/category(.*)/, methods: ['GET', 'OPTIONS'] },
    ],
  });
}

module.exports = authJwt;
