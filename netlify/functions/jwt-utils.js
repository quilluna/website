const jwt = require('jsonwebtoken');
require('dotenv').config();

// 获取JWT密钥，建议从环境变量中获取
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// 生成JWT令牌
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

// 验证JWT令牌
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 从请求头中获取令牌
exports.getTokenFromHeaders = (headers) => {
  const authHeader = headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// 允许操作的表名白名单
exports.allowedTables = ['users', 'exams', 'scores', 'profile', 'goals', 'full_marks'];
