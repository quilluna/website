const { Client } = require('pg');
require('dotenv').config(); // 加载环境变量
const { verifyToken, getTokenFromHeaders, allowedTables } = require('./jwt-utils');

const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Options request successful' }),
    };
  }

  // 检查请求方法
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 验证JWT令牌
  const token = getTokenFromHeaders(event.headers);
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Missing authorization token' }),
    };
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  // 检查是否为管理员
  if (!decodedToken.isAdmin) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Permission denied. Only admins can delete data.' }),
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    const { table, id } = requestBody;
    
    // 验证必要的参数
    if (!table || !id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: table or id' }),
      };
    }

    // 验证表名是否在白名单中
    if (!allowedTables.includes(table)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid table name: ${table}` }),
      };
    }
    
    // 构建动态DELETE查询，使用白名单验证过的表名
    // 注意：表名不能作为参数传递，必须直接拼接，但我们已经通过allowedTables验证了表名的安全性
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    
    // 执行查询，只将id作为参数传递
    const res = await client.query(query, [id]);
    
    // 检查是否有行被删除
    if (res.rowCount === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: `No record found with id ${id} in table ${table}` }),
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Data deleted successfully', data: res.rows[0] }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};

exports.handler = handler;