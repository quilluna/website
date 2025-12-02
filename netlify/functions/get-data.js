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
    const { table } = event.queryStringParameters || {};
    
    // 如果没有提供表名，返回错误
    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing table parameter' }),
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
    
    // 执行查询
    const res = await client.query(`SELECT * FROM ${table}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Data retrieved successfully', data: res.rows }),
    };
  } catch (err) {
    console.error('Error executing query:', err);
    // 如果是表不存在错误，返回空数组而不是500错误
    if (err.code === '42P01') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: `Table ${event.queryStringParameters.table} not found, returning empty data`, data: [] }),
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }),
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};

exports.handler = handler;