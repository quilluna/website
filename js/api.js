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

    // 清空指定表的所有数据
    async clearAllData(table) {
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
          body: JSON.stringify({ table, clearAll: true }),
        });
        if (!response.ok) {
          if (response.status === 401) {
            this.handleUnauthorized();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`清空${table}表数据失败:`, error);
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
        
        console.log('开始同步本地数据到数据库...');
        
        // 1. 同步考试记录
        console.log(`准备同步 ${localExams.length} 条考试记录`);
        
        // 先获取服务器上的现有考试记录
        let serverExams = [];
        try {
          const serverData = await this.getData('exams');
          serverExams = serverData.data || [];
          console.log(`✅ 成功获取服务器上的 ${serverExams.length} 条考试记录`);
        } catch (error) {
          console.error('❌ 获取服务器考试记录失败:', error.message);
          serverExams = [];
        }
        
        // 从服务器删除所有考试记录，然后重新插入本地记录
        // 这样可以确保服务器和本地数据完全一致
        console.log('先删除服务器上的所有考试记录，然后重新插入本地记录');
        
        // 先删除服务器上的所有考试记录
        for (const serverExam of serverExams) {
          try {
            await this.deleteData('exams', serverExam.id);
            console.log(`✅ 成功删除服务器上的考试记录: ${serverExam.exam_name || serverExam.name}`);
          } catch (error) {
            console.error(`❌ 删除服务器上的考试记录失败: ${serverExam.exam_name || serverExam.name}`, error.message);
          }
        }
        
        // 如果本地有考试记录，重新插入到服务器
        if (localExams.length > 0) {
          // 逐个同步考试记录
          for (const exam of localExams) {
            try {
              // 跳过空考试记录（没有名称的考试）
              if (!exam.name || exam.name.trim() === '') {
                console.log(`⚠️  跳过空考试记录`);
                continue;
              }
              
              // 格式化考试数据以匹配数据库结构
              const formattedExam = this.formatExamForDatabase(exam);
              
              // 插入考试记录
              await this.postData('exams', formattedExam);
              console.log(`✅ 成功同步考试记录: ${formattedExam.exam_name} (${formattedExam.exam_date})`);
            } catch (error) {
              console.error(`❌ 同步考试记录失败:`, error.message);
            }
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
        
        // 3. 同步学习目标 - 已移除
        // 4. 同步满分设置 - 已移除

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
          // 直接保存到localStorage，不通过Storage.saveProfile()，避免触发同步
          localStorage.setItem('profile', JSON.stringify(profileData.data[0] || {}));
          console.log('✅ 成功同步个人资料到本地');
        } catch (error) {
          console.log('获取个人资料失败，使用本地数据:', error.message);
        }

        // 学习目标同步 - 已移除
        // 满分设置同步 - 已移除

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
      
      // 1. 基础字段映射
    // 将前端的name字段映射到数据库的exam_name字段
    if (formattedExam.name && !formattedExam.exam_name) {
      formattedExam.exam_name = formattedExam.name;
    }
    
    // 确保exam_name字段存在
    formattedExam.exam_name = formattedExam.exam_name || '';
    
    // 将前端的date字段映射到数据库的exam_date字段
    if (formattedExam.date && !formattedExam.exam_date) {
      formattedExam.exam_date = formattedExam.date;
      delete formattedExam.date;
    }
    
    // 确保考试日期格式正确
    if (formattedExam.exam_date && !(formattedExam.exam_date instanceof Date)) {
      // 如果是字符串，转换为日期对象
      formattedExam.exam_date = new Date(formattedExam.exam_date).toISOString().split('T')[0];
    }
    
    // 确保exam_date字段存在且不为空
    if (!formattedExam.exam_date) {
      formattedExam.exam_date = new Date().toISOString().split('T')[0];
    }
    
    // 2. 科目成绩映射
    // 从subjects对象中提取成绩
    const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
    
    // 处理subjects对象中的成绩
    if (formattedExam.subjects) {
      for (const subject of subjects) {
        // 成绩字段映射：subjects.chinese → chinese_score
        const scoreKey = `${subject}_score`;
        if (formattedExam.subjects[subject] !== undefined) {
          formattedExam[scoreKey] = parseFloat(formattedExam.subjects[subject]) || 0;
        } else {
          formattedExam[scoreKey] = 0;
        }
      }
    }
    
    // 3. 排名映射
    // 处理subjectRankClass对象中的排名
    if (formattedExam.subjectRankClass) {
      for (const subject of subjects) {
        // 班级排名字段映射：subjectRankClass.chinese → chinese_rank_class
        const rankClassKey = `${subject}_rank_class`;
        if (formattedExam.subjectRankClass[subject] !== undefined) {
          formattedExam[rankClassKey] = parseInt(formattedExam.subjectRankClass[subject]) || null;
        }
      }
    }
    
    // 处理subjectRankGrade对象中的排名
    if (formattedExam.subjectRankGrade) {
      for (const subject of subjects) {
        // 年级排名字段映射：subjectRankGrade.chinese → chinese_rank_grade
        const rankGradeKey = `${subject}_rank_grade`;
        if (formattedExam.subjectRankGrade[subject] !== undefined) {
          formattedExam[rankGradeKey] = parseInt(formattedExam.subjectRankGrade[subject]) || null;
        }
      }
    }
    
    // 4. 满分映射
    // 处理fullMarks对象中的满分
    if (formattedExam.fullMarks) {
      for (const subject of subjects) {
        // 满分字段映射：fullMarks.chinese → chinese_full_mark
        const fullMarkKey = `${subject}_full_mark`;
        if (formattedExam.fullMarks[subject] !== undefined) {
          formattedExam[fullMarkKey] = parseInt(formattedExam.fullMarks[subject]) || 100;
        } else {
          formattedExam[fullMarkKey] = 100;
        }
      }
    }
    
    // 5. 总分和排名映射
    // 将totalScore映射到total_score
    if (formattedExam.totalScore !== undefined) {
      formattedExam.total_score = parseFloat(formattedExam.totalScore) || 0;
    } else {
      formattedExam.total_score = 0;
    }
    
    // 将totalFullMark映射到total_full_mark
    if (formattedExam.totalFullMark !== undefined) {
      formattedExam.total_full_mark = parseInt(formattedExam.totalFullMark) || 900;
    } else {
      formattedExam.total_full_mark = 900;
    }
    
    // 将rankClass映射到rank_class
    if (formattedExam.rankClass !== undefined) {
      formattedExam.rank_class = parseInt(formattedExam.rankClass) || 0;
    } else {
      formattedExam.rank_class = 0;
    }
    
    // 将rankGrade映射到rank_grade
    if (formattedExam.rankGrade !== undefined) {
      formattedExam.rank_grade = parseInt(formattedExam.rankGrade) || 0;
    } else {
      formattedExam.rank_grade = 0;
    }
    
    // 6. 总结映射
    // 将summary映射到summary（如果存在）
    if (formattedExam.summary === undefined) {
      formattedExam.summary = '';
    }
    
    return formattedExam;
    }
    
    // 格式化考试数据以匹配localStorage结构
    formatExamForLocalStorage(exam) {
      // 创建考试数据的副本，避免修改原始对象
      const formattedExam = { ...exam };
      
      // 将数据库字段名转换为前端使用的字段名
      if (formattedExam.exam_name && !formattedExam.name) {
        formattedExam.name = formattedExam.exam_name;
        delete formattedExam.exam_name;
      }
      
      if (formattedExam.exam_date && !formattedExam.date) {
        formattedExam.date = formattedExam.exam_date;
        delete formattedExam.exam_date;
      }
      
      // 确保考试日期是字符串格式
      if (formattedExam.date) {
        formattedExam.date = formattedExam.date.toString();
      }
      
      // 确保所有成绩字段都是数字类型
      const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
      
      for (const subject of subjects) {
        // 成绩字段 - 转换为前端的subjects对象格式
        const scoreKey = `${subject}_score`;
        if (formattedExam[scoreKey] !== undefined) {
          if (!formattedExam.subjects) {
            formattedExam.subjects = {};
          }
          formattedExam.subjects[subject] = parseFloat(formattedExam[scoreKey]);
          delete formattedExam[scoreKey];
        }
        
        // 班级排名字段 - 转换为前端的subjectRankClass对象格式
        const rankClassKey = `${subject}_rank_class`;
        if (formattedExam[rankClassKey] !== undefined) {
          if (!formattedExam.subjectRankClass) {
            formattedExam.subjectRankClass = {};
          }
          formattedExam.subjectRankClass[subject] = parseInt(formattedExam[rankClassKey]);
          delete formattedExam[rankClassKey];
        }
        
        // 年级排名字段 - 转换为前端的subjectRankGrade对象格式
        const rankGradeKey = `${subject}_rank_grade`;
        if (formattedExam[rankGradeKey] !== undefined) {
          if (!formattedExam.subjectRankGrade) {
            formattedExam.subjectRankGrade = {};
          }
          formattedExam.subjectRankGrade[subject] = parseInt(formattedExam[rankGradeKey]);
          delete formattedExam[rankGradeKey];
        }
        
        // 满分设置字段 - 转换为前端的fullMarks对象格式
        const fullMarkKey = `${subject}_full_mark`;
        if (formattedExam[fullMarkKey] !== undefined) {
          if (!formattedExam.fullMarks) {
            formattedExam.fullMarks = {};
          }
          formattedExam.fullMarks[subject] = parseInt(formattedExam[fullMarkKey]);
          delete formattedExam[fullMarkKey];
        }
      }
      
      // 确保总分和总满分是数字类型
      if (formattedExam.total_score !== undefined) {
        formattedExam.totalScore = parseFloat(formattedExam.total_score);
        delete formattedExam.total_score;
      }
      
      if (formattedExam.total_full_mark !== undefined) {
        formattedExam.totalFullMark = parseInt(formattedExam.total_full_mark);
        delete formattedExam.total_full_mark;
      }
      
      // 确保排名是数字类型
      if (formattedExam.rank_class !== undefined) {
        formattedExam.rankClass = parseInt(formattedExam.rank_class);
        delete formattedExam.rank_class;
      }
      
      if (formattedExam.rank_grade !== undefined) {
        formattedExam.rankGrade = parseInt(formattedExam.rank_grade);
        delete formattedExam.rank_grade;
      }
      
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