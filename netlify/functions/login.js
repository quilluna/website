const { Client } = require('pg');
require('dotenv').config(); // 加载环境变量
const { generateToken } = require('./jwt-utils');
const bcrypt = require('bcrypt');

// 创建数据库客户端，使用环境变量中的NETLIFY_DATABASE_URL
const client = new Client({  
  connectionString: process.env.NETLIFY_DATABASE_URL
});

// 处理登录请求
exports.handler = async (event) => {
  // 支持 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  try {
    // 解析请求体
    const { username, password } = JSON.parse(event.body);
    
    // 验证必填字段
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: '用户名和密码不能为空' })
      };
    }

    // 连接数据库
    await client.connect();
    
    // 查询用户
    const result = await client.query(
      'SELECT id, username, password, email FROM users WHERE username = $1',
      [username]
    );
    
    // 关闭数据库连接
    await client.end();
    
    if (result.rows.length === 1) {
      // 验证密码
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        // 关闭数据库连接
        await client.end();
        // 登录失败
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, message: '用户名或密码错误' })
        };
      }
      
      // 登录成功
      // 获取环境变量中的管理员用户名列表
      const adminUsernames = process.env.ADMIN_USERNAMES ? process.env.ADMIN_USERNAMES.split(',') : ['admin'];
      // 检查当前用户是否为管理员
      const isAdmin = adminUsernames.includes(user.username);
      
      // 生成JWT令牌
      const token = generateToken({
        id: user.id,
        username: user.username,
        isAdmin: isAdmin
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: '登录成功',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: isAdmin // 添加管理员标识
          },
          token: token // 返回JWT令牌
        })
      };
    } else {
      // 登录失败
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: '用户名或密码错误' })
      };
    }
  } catch (error) {
    console.error('登录错误:', error);
    
    // 确保关闭数据库连接
    if (client._connected) {
      await client.end();
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: '登录失败，请稍后重试' })
    };
  }
};