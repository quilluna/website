const { Client } = require('pg');
require('dotenv').config(); // 加载环境变量
const { verifyToken, getTokenFromHeaders, allowedTables } = require('./jwt-utils');

const handler = async (event) => {
  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Options request successful' }),
    };
  }

  // 检查请求方法
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 验证JWT令牌
  const token = getTokenFromHeaders(event.headers);
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Missing authorization token' }),
    };
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    const { table, data } = requestBody;
    
    // 验证必要的参数
    if (!table || !data) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Missing required parameters: table or data' }),
      };
    }
    
    // 验证表名是否在白名单中
    if (!allowedTables.includes(table)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: `Invalid table name: ${table}` }),
      };
    }
    
    // 构建INSERT查询，使用参数化查询防止SQL注入
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    
    // 执行查询
    const res = await client.query(query, values);
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: 'Data inserted successfully', data: res.rows[0] }),
    };
  } catch (err) {
    console.error('Error executing query:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};

exports.handler = handler;