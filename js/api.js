// API服务类，用于封装对Netlify Functions的调用
if (typeof ApiService === 'undefined') {
  class ApiService {
    constructor() {
      // 基础URL，在开发环境和生产环境下会自动适应
      this.baseUrl = '/.netlify/functions';
    }

    // 检查是否为访客模式
    isGuestMode() {
      // 检查本地存储中的登录状态
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const user = localStorage.getItem('user');
      return !isLoggedIn || !user;
    }

    async executeSql(sql, params = []) {
      if (this.isGuestMode()) {
        return null;
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch('/.netlify/functions/execute-sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ sql, params }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error('Network response was not ok');
        }

        return await response.json();
      } catch (error) {
        console.error('Error executing SQL:', error);
        return null;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    async login(username, password) {
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch('/.netlify/functions/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        // 存储JWT令牌
        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
        }
        return result;
      } catch (error) {
        console.error('Error during login:', error);
        return null;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 获取数据
    async getData(table = null) {
      // 访客模式下不获取数据
      if (this.isGuestMode()) {
        console.log('访客模式下不获取服务器数据');
        return { data: [] };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        let url = `${this.baseUrl}/get-data`;
        if (table) {
          url += `?table=${table}`;
        }
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('获取数据失败:', error);
        throw error;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 插入数据
    async postData(table, data) {
      // 访客模式下不插入数据
      if (this.isGuestMode()) {
        console.log('访客模式下不插入服务器数据');
        return { success: true };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch(`${this.baseUrl}/post-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ table, data }),
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('插入数据失败:', error);
        throw error;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 更新数据
    async putData(table, id, data) {
      // 访客模式下不更新数据
      if (this.isGuestMode()) {
        console.log('访客模式下不更新服务器数据');
        return { success: true };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch(`${this.baseUrl}/put-data`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ table, id, data }),
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('更新数据失败:', error);
        throw error;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 删除数据
    async deleteData(table, id) {
      // 访客模式下不删除数据
      if (this.isGuestMode()) {
        console.log('访客模式下不删除服务器数据');
        return { success: true };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch(`${this.baseUrl}/delete-data`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ table, id }),
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('删除数据失败:', error);
        throw error;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 添加用户
    async addUser(userData) {
      // 访客模式下不添加用户
      if (this.isGuestMode()) {
        console.log('访客模式下不添加用户');
        return { success: false, message: '访客模式下不允许添加用户' };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        const response = await fetch(`${this.baseUrl}/add-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(userData),
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('添加用户失败:', error);
        throw error;
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 同步本地数据到数据库
    async syncLocalToDatabase() {
      // 访客模式下不同步数据
      if (this.isGuestMode()) {
        console.log('访客模式下不同步数据到服务器');
        return {
          success: true,
          message: '访客模式下不同步数据到服务器',
        };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        // 获取本地数据
        const localExams = Storage.getExams();
        const localProfile = Storage.getProfile();
        const localGoals = Storage.getGoals();
        const localFullMarks = Storage.getFullMarks();

        // 同步个人资料
        await this.postData('profile', localProfile);
        
        // 同步目标
        await this.postData('goals', localGoals);
        
        // 同步满分设置
        await this.postData('full_marks', localFullMarks);
        
        // 同步考试记录
        for (const exam of localExams) {
          await this.postData('exams', exam);
        }

        return {
          success: true,
          message: '本地数据已成功同步到数据库',
        };
      } catch (error) {
        console.error('同步本地数据到数据库失败:', error);
        return {
          success: false,
          message: `同步失败: ${error.message}`,
        };
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 从数据库同步数据到本地
    async syncDatabaseToLocal() {
      // 访客模式下不同步数据
      if (this.isGuestMode()) {
        console.log('访客模式下不同步服务器数据到本地');
        return {
          success: true,
          message: '访客模式下不同步服务器数据到本地',
        };
      }
      
      // 显示加载状态
      const globalLoading = document.getElementById('globalLoading');
      if (globalLoading) {
        globalLoading.classList.remove('hidden');
      }
      
      try {
        // 获取数据库数据
        const examsData = await this.getData('exams');
        const profileData = await this.getData('profile');
        const goalsData = await this.getData('goals');
        const fullMarksData = await this.getData('full_marks');

        // 保存到本地存储
        Storage.saveExams(examsData.data || []);
        Storage.saveProfile(profileData.data[0] || {});
        Storage.saveGoals(goalsData.data[0] || {});
        Storage.saveFullMarks(fullMarksData.data[0] || {});

        return {
          success: true,
          message: '数据库数据已成功同步到本地',
        };
      } catch (error) {
        console.error('从数据库同步数据到本地失败:', error);
        return {
          success: false,
          message: `同步失败: ${error.message}`,
        };
      } finally {
        // 隐藏加载状态
        if (globalLoading) {
          globalLoading.classList.add('hidden');
        }
      }
    }

    // 处理401未授权错误
    handleUnauthorized() {
      // 清除本地存储中的登录状态和令牌
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      
      // 显示错误信息
      alert('登录已过期，请重新登录');
      
      // 跳转到登录页面
      window.location.href = '/login.html';
    }
  }

  // 创建API服务实例并赋值给window对象，确保全局可用
  window.apiService = new ApiService();
}