const { Client } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function registerUser() {
  console.log('=== 一键注册用户脚本 ===\n');

  // 检查是否已经有环境变量
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误：未找到 DATABASE_URL 环境变量，请确保 .env 文件已正确配置。');
    process.exit(1);
  }

  // 用户信息配置
  const userConfig = {
    username: 'admin', // 默认用户名
    password: 'admin123', // 默认密码
    email: 'admin@example.com' // 默认邮箱
  };

  console.log('注册信息：');
  console.log(`- 用户名：${userConfig.username}`);
  console.log(`- 密码：${userConfig.password}`);
  console.log(`- 邮箱：${userConfig.email}\n`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // 连接数据库
    await client.connect();
    console.log('✅ 成功连接到数据库');

    // 检查用户是否已存在
    const checkResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [userConfig.username]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  警告：用户已存在，跳过注册');
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userConfig.password, 10);
    console.log('✅ 密码加密成功');

    // 生成用户ID
    const userId = Date.now().toString();

    // 插入用户数据
    const insertResult = await client.query(
      'INSERT INTO users (id, username, password, email) VALUES ($1, $2, $3, $4) RETURNING id, username',
      [userId, userConfig.username, hashedPassword, userConfig.email]
    );

    console.log('✅ 用户注册成功！');
    console.log(`- 用户ID：${insertResult.rows[0].id}`);
    console.log(`- 用户名：${insertResult.rows[0].username}`);
    console.log(`\n🎉 注册完成！您可以使用以下信息登录：`);
    console.log(`   用户名：${userConfig.username}`);
    console.log(`   密码：${userConfig.password}`);
    console.log(`\n💡 提示：您可以修改 register-user.js 文件中的 userConfig 对象来自定义注册信息。`);

  } catch (error) {
    console.error('❌ 注册失败：', error.message);
    if (error.code === '42P01') {
      console.error('   可能原因：users 表不存在，请先运行数据库初始化脚本。');
    }
    process.exit(1);
  } finally {
    if (client._connected) {
      await client.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行注册函数
registerUser();
