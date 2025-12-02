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
        
        console.log('开始同步本地数据到数据库...');
        
        // 1. 同步考试记录
        console.log(`准备同步 ${localExams.length} 条考试记录`);
        for (const exam of localExams) {
          try {
            // 确保数据结构匹配数据库表结构
            const formattedExam = this.formatExamForDatabase(exam);
            
            // 尝试插入，如果已存在则更新
            await this.postData('exams', formattedExam);
            console.log(`✅ 成功同步考试记录: ${formattedExam.exam_name} (${formattedExam.exam_date})`);
          } catch (error) {
            console.error(`❌ 同步考试记录失败:`, error.message);
            console.error(`考试数据:`, exam);
          }
        }
        
        // 2. 同步个人资料
        if (localProfile && Object.keys(localProfile).length > 0) {
          try {
            await this.postData('profile', localProfile);
            console.log('✅ 成功同步个人资料');
          } catch (error) {
            console.error(`❌ 同步个人资料失败:`, error.message);
          }
        }
        
        // 3. 同步学习目标
        if (localGoals && Object.keys(localGoals).length > 0) {
          try {
            await this.postData('goals', localGoals);
            console.log('✅ 成功同步学习目标');
          } catch (error) {
            console.error(`❌ 同步学习目标失败:`, error.message);
          }
        }
        
        // 4. 同步满分设置
        if (localFullMarks && Object.keys(localFullMarks).length > 0) {
          try {
            await this.postData('full_marks', localFullMarks);
            console.log('✅ 成功同步满分设置');
          } catch (error) {
            console.error(`❌ 同步满分设置失败:`, error.message);
          }
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
        console.log('开始从数据库同步数据到本地...');
        
        // 1. 获取数据库中的考试数据
        let examsData = { data: [] };
        try {
          examsData = await this.getData('exams');
          console.log(`从数据库获取到 ${examsData.data.length} 条考试记录`);
        } catch (error) {
          console.error('获取考试数据失败:', error.message);
          throw error;
        }

        // 2. 格式化考试数据以匹配localStorage结构
        const formattedExams = examsData.data.map(exam => this.formatExamForLocalStorage(exam));
        
        // 3. 保存到本地存储
        Storage.saveExams(formattedExams);
        console.log('✅ 成功将考试数据保存到本地存储');
        
        // 4. 同步其他数据（个人资料、学习目标、满分设置）
        let profileData = { data: [] };
        let goalsData = { data: [] };
        let fullMarksData = { data: [] };

        try {
          profileData = await this.getData('profile');
          Storage.saveProfile(profileData.data[0] || {});
          console.log('✅ 成功同步个人资料到本地');
        } catch (error) {
          console.log('获取个人资料失败，使用本地数据:', error.message);
        }

        try {
          goalsData = await this.getData('goals');
          Storage.saveGoals(goalsData.data[0] || {});
          console.log('✅ 成功同步学习目标到本地');
        } catch (error) {
          console.log('获取学习目标失败，使用本地数据:', error.message);
        }

        try {
          fullMarksData = await this.getData('full_marks');
          Storage.saveFullMarks(fullMarksData.data[0] || {});
          console.log('✅ 成功同步满分设置到本地');
        } catch (error) {
          console.log('获取满分设置失败，使用本地数据:', error.message);
        }

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
    
    // 格式化考试数据以匹配数据库表结构
    formatExamForDatabase(exam) {
      // 创建考试数据的副本，避免修改原始对象
      const formattedExam = { ...exam };
      
      // 确保所有必填字段都存在
      formattedExam.exam_name = formattedExam.exam_name || '';
      
      // 确保考试日期格式正确
      if (formattedExam.exam_date && !(formattedExam.exam_date instanceof Date)) {
        // 如果是字符串，转换为日期对象
        formattedExam.exam_date = new Date(formattedExam.exam_date).toISOString().split('T')[0];
      }
      
      // 确保各科成绩是数字类型
      const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
      
      for (const subject of subjects) {
        // 成绩字段
        const scoreKey = `${subject}_score`;
        if (formattedExam[scoreKey] !== undefined) {
          formattedExam[scoreKey] = parseFloat(formattedExam[scoreKey]) || 0;
        } else {
          formattedExam[scoreKey] = 0;
        }
        
        // 班级排名字段
        const rankClassKey = `${subject}_rank_class`;
        if (formattedExam[rankClassKey] !== undefined) {
          formattedExam[rankClassKey] = parseInt(formattedExam[rankClassKey]) || null;
        }
        
        // 年级排名字段
        const rankGradeKey = `${subject}_rank_grade`;
        if (formattedExam[rankGradeKey] !== undefined) {
          formattedExam[rankGradeKey] = parseInt(formattedExam[rankGradeKey]) || null;
        }
        
        // 满分设置字段
        const fullMarkKey = `${subject}_full_mark`;
        if (formattedExam[fullMarkKey] !== undefined) {
          formattedExam[fullMarkKey] = parseInt(formattedExam[fullMarkKey]) || 100;
        } else {
          formattedExam[fullMarkKey] = 100;
        }
      }
      
      // 确保总分和总满分是数字类型
      formattedExam.total_score = parseFloat(formattedExam.total_score) || 0;
      formattedExam.total_full_mark = parseInt(formattedExam.total_full_mark) || 900;
      
      // 确保排名是数字类型
      formattedExam.rank_class = parseInt(formattedExam.rank_class) || 0;
      formattedExam.rank_grade = parseInt(formattedExam.rank_grade) || 0;
      
      // 确保总结字段存在
      formattedExam.summary = formattedExam.summary || '';
      
      return formattedExam;
    }
    
    // 格式化考试数据以匹配localStorage结构
    formatExamForLocalStorage(exam) {
      // 创建考试数据的副本，避免修改原始对象
      const formattedExam = { ...exam };
      
      // 确保考试日期是字符串格式
      if (formattedExam.exam_date) {
        formattedExam.exam_date = formattedExam.exam_date.toString();
      }
      
      // 确保所有成绩字段都是数字类型
      const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
      
      for (const subject of subjects) {
        // 成绩字段
        const scoreKey = `${subject}_score`;
        if (formattedExam[scoreKey] !== undefined) {
          formattedExam[scoreKey] = parseFloat(formattedExam[scoreKey]);
        }
        
        // 班级排名字段
        const rankClassKey = `${subject}_rank_class`;
        if (formattedExam[rankClassKey] !== undefined) {
          formattedExam[rankClassKey] = parseInt(formattedExam[rankClassKey]);
        }
        
        // 年级排名字段
        const rankGradeKey = `${subject}_rank_grade`;
        if (formattedExam[rankGradeKey] !== undefined) {
          formattedExam[rankGradeKey] = parseInt(formattedExam[rankGradeKey]);
        }
        
        // 满分设置字段
        const fullMarkKey = `${subject}_full_mark`;
        if (formattedExam[fullMarkKey] !== undefined) {
          formattedExam[fullMarkKey] = parseInt(formattedExam[fullMarkKey]);
        }
      }
      
      // 确保总分和总满分是数字类型
      formattedExam.total_score = parseFloat(formattedExam.total_score);
      formattedExam.total_full_mark = parseInt(formattedExam.total_full_mark);
      
      // 确保排名是数字类型
      formattedExam.rank_class = parseInt(formattedExam.rank_class);
      formattedExam.rank_grade = parseInt(formattedExam.rank_grade);
      
      return formattedExam;
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