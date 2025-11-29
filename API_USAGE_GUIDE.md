# API服务使用指南

## 问题分析

当你在浏览器控制台中直接调用 `apiService.getData('exams')` 时，会看到返回一个 `Promise {<pending>}` 对象，这是因为 `getData` 是一个异步函数，它会立即返回一个 Promise 对象，而不是等待请求完成后返回结果。

## 解决方案

要正确获取 `apiService.getData('exams')` 的结果，你需要使用 `await` 关键字或者 `.then()` 方法来处理异步 Promise。

### 方法1：使用 async/await（推荐）

在浏览器控制台中，你需要将调用包裹在一个 async 函数中：

```javascript
async function fetchExams() {
  try {
    const result = await apiService.getData('exams');
    console.log('获取到的数据:', result);
    return result;
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}

fetchExams();
```

### 方法2：使用 .then()

```javascript
apiService.getData('exams')
  .then(result => {
    console.log('获取到的数据:', result);
  })
  .catch(error => {
    console.error('获取数据失败:', error);
  });
```

## 测试页面

我已经创建了一个测试页面 `test-api.html`，你可以通过以下步骤使用：

1. 确保开发服务器正在运行（`npm run dev`）
2. 在浏览器中打开 `http://localhost:8888/test-api.html`
3. 点击"测试API调用"按钮
4. 查看结果显示

## 已修复的问题

1. **语法错误修复**：将 `handleUnauthorized` 方法从 ApiService 类外部移到内部
2. **401错误处理**：添加了完整的401未授权错误处理逻辑
3. **开发服务器配置**：确保 JWT_SECRET 环境变量正确加载

## API服务状态

- ✅ 开发服务器正在运行：`http://localhost:8888`
- ✅ API端点：`http://localhost:8888/.netlify/functions/get-data`
- ✅ 401错误处理：已实现自动跳转到登录页面
- ✅ 数据库连接：正常

## 常见问题排查

1. **API请求返回401错误**
   - 检查令牌是否过期
   - 确保 `localStorage.getItem('token')` 存在且有效
   - 系统会自动跳转到登录页面重新登录

2. **API请求返回500错误**
   - 检查服务器日志
   - 确保数据库表存在
   - 检查环境变量配置

3. **Promise一直处于pending状态**
   - 确保使用了 `await` 或 `.then()` 来处理Promise
   - 检查网络连接
   - 查看浏览器控制台是否有错误信息

## 开发服务器日志

从服务器日志可以看到，API请求已经成功处理：
```
Request from ::1: GET /.netlify/functions/get-data?table=exams
Response with status 200 in 4193 ms.
```

这表明API服务正在正常工作，你只需要正确处理返回的Promise即可获取数据。