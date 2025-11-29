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
  if (event.httpMethod !== 'PUT') {
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
    
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    const { table, id, data } = requestBody;
    
    // 验证必要的参数
    if (!table || !id || !data) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Missing required parameters: table, id or data' }),
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
    
    // 构建UPDATE查询，使用参数化查询防止SQL注入
    // 过滤掉不可修改的字段（如创建日期）
    const immutableFields = ['created_at', 'createdAt', 'create_date', 'createDate'];
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !immutableFields.includes(key))
    );
    
    // 处理密码加密（如果有密码字段）
    if (filteredData.password) {
      const bcrypt = require('bcrypt');
      filteredData.password = await bcrypt.hash(filteredData.password, 10);
    }
    
    const keys = Object.keys(filteredData);
    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(filteredData);
    // 在values数组末尾添加id
    values.push(id);
    const query = `UPDATE ${table} SET ${setClauses} WHERE id = $${keys.length + 1} RETURNING *`;
    
    // 执行查询
    const res = await client.query(query, values);
    
    // 检查是否有行被更新
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
      headers,
      body: JSON.stringify({ message: 'Data updated successfully', data: res.rows[0] }),
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