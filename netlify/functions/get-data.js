const { Client } = require('pg');
require('dotenv').config(); // 加载环境变量
const { verifyToken, getTokenFromHeaders } = require('./jwt-utils');

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
  if (event.httpMethod !== 'GET') {
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

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // 检查是否有指定表名
    const { table } = event.queryStringParameters || {};
    
    if (table) {
      // 查询指定表的数据
      const res = await client.query(`SELECT * FROM ${table}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ table: table, data: res.rows }),
      };
    } else {
      // 没有指定表名，返回所有表的信息
      const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ tables: res.rows.map(row => row.table_name) }),
      };
    }
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};

exports.handler = handler;