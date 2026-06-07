// 保存和恢复位置的函数
function saveCurrentLocation() {
    // 获取当前激活的页面
    let currentPage = 'dashboard';
    const activeNavItem = document.querySelector('.nav-item.active');
    if (activeNavItem) {
        currentPage = activeNavItem.getAttribute('data-page') || 'dashboard';
    } else {
        // 从 hash 获取
        const hash = window.location.hash.replace('#', '');
        if (hash && ['dashboard', 'input', 'records', 'analysis', 'profile'].includes(hash)) {
            currentPage = hash;
        }
    }
    
    const location = {
        page: currentPage,
        scrollY: window.scrollY
    };
    localStorage.setItem('savedLocation', JSON.stringify(location));
}

function restoreLocation() {
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
        try {
            const location = JSON.parse(savedLocation);
            if (location.page && UI && typeof UI.navigateTo === 'function') {
                UI.navigateTo(location.page);
            }
            if (location.scrollY !== undefined) {
                setTimeout(() => {
                    window.scrollTo(0, location.scrollY);
                }, 200);
            }
            localStorage.removeItem('savedLocation');
        } catch (e) {
            console.error('恢复位置失败', e);
        }
    }
}

// 导航菜单数据 - 统一管理移动端和桌面端导航项
const navItems = [
    { id: 'dashboard', name: '仪表盘', icon: 'fa-solid fa-chart-line', href: '#dashboard' },
    { id: 'input', name: '成绩录入', icon: 'fa-solid fa-pen-to-square', href: '#input' },
    { id: 'records', name: '成绩记录', icon: 'fa-solid fa-list', href: '#records' },
    { id: 'analysis', name: '成绩分析', icon: 'fa-solid fa-chart-bar', href: '#analysis' },
    { id: 'profile', name: '个人档案', icon: 'fa-solid fa-user-circle', href: '#profile' }
];

// 获取API基础URL
let apiBaseUrl = null;
async function getApiBaseUrl() {
    if (apiBaseUrl === null) {
        try {
            // 尝试获取dev文件
            const response = await fetch('/dev');
            if (response.ok) {
                apiBaseUrl = 'http://localhost:8787/haozhiyu';
            } else {
                apiBaseUrl = 'https://api.280910.xyz/haozhiyu';
            }
        } catch (error) {
            // 如果获取失败，使用默认域名
            apiBaseUrl = 'https://api.280910.xyz/haozhiyu';
        }
    }
    return apiBaseUrl;
}

// 同步获取API基础URL（用于需要立即获取的场景）
function getApiBaseUrlSync() {
    if (apiBaseUrl === null) {
        // 默认使用域名，异步检查会在后台更新
        apiBaseUrl = 'https://api.280910.xyz/haozhiyu';
        // 后台异步检查
        getApiBaseUrl();
    }
    return apiBaseUrl;
}

// 主题色管理工具
const ThemeColors = {
    // 获取当前主题的主色调
    getPrimaryColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    },
    
    // 获取当前主题的主色调（深色）
    getPrimaryDarkColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary-dark').trim();
    },
    
    // 获取当前主题的主色调（浅色）
    getPrimaryLightColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary-light').trim();
    },
    
    // 获取当前主题的主色调（带透明度）
    getPrimaryColorWithOpacity(opacity = 0.2) {
        const primaryColor = this.getPrimaryColor();
        // 转换为rgba格式
        if (primaryColor.startsWith('#')) {
            const r = parseInt(primaryColor.slice(1, 3), 16);
            const g = parseInt(primaryColor.slice(3, 5), 16);
            const b = parseInt(primaryColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return primaryColor;
    },
    
    // 获取辅助颜色
    getSecondaryColor() {
        return '#64748b'; // 可以考虑也将其添加到CSS变量中
    },
    
    // 获取状态颜色
    getSuccessColor() {
        return '#10b981';
    },
    
    getWarningColor() {
        return '#f59e0b';
    },
    
    getDangerColor() {
        return '#ef4444';
    },
    
    getInfoColor() {
        return '#06b6d4';
    }
};

// 全局函数：计算排名率（返回数字，不包含百分号）
const calculateRankRate = (rank, total) => {
    // 如果rank是'-'或其他非数字值，返回null
    if (rank === '-' || isNaN(rank) || !rank || rank <= 0 || !total || total <= 0) {
        return null;
    }
    return parseFloat(((rank / total) * 100).toFixed(2));
};

// 全局函数：根据优先级获取科目的综合评估分数
const getSubjectPriorityScore = (subjectData, fullMark) => {
    // 数据优先级：1.年级排名率 2.班级排名率 3.得分率
    const gradeRankRate = calculateRankRate(subjectData.rankGrade, 650);
    const classRankRate = calculateRankRate(subjectData.rankClass, 51);
    const scoreRate = subjectData.score && fullMark ? parseFloat(((subjectData.score / fullMark) * 100).toFixed(2)) : null;

    // 返回综合评估分数，优先使用排名率，排名率为空时使用得分率
    // 注意：排名率数值越小表现越好，得分率数值越大表现越好
    // 为了统一比较标准，将排名率转换为100-排名率，这样数值越大表现越好
    if (gradeRankRate !== null) {
        return 100 - gradeRankRate;
    } else if (classRankRate !== null) {
        return 100 - classRankRate;
    } else if (scoreRate !== null) {
        return scoreRate;
    } else {
        return null;
    }
};

// Tailwind 配置 - 仅在Tailwind对象存在时设置
if (window.tailwind) {
    window.tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    primary: 'var(--primary-color)',
                    'primary-dark': 'var(--primary-dark)',
                    'primary-light': 'var(--primary-light)',
                    secondary: '#64748b',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    info: '#06b6d4',
                    light: '#f8fafc',
                    dark: '#1e293b'
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif']
                },
                boxShadow: {
                    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };
}

// 密码加密辅助函数
const PasswordUtils = {
    // 简单的加密算法（实际项目中应使用更安全的加密方式）
    encrypt(password) {
        if (!password) return '';
        // 使用简单的Base64编码+字符串反转实现基本加密
        return btoa(password.split('').reverse().join(''));
    },
    
    // 解密算法
    decrypt(encryptedPassword) {
        if (!encryptedPassword) return '';
        // 解密：Base64解码+字符串反转
        try {
            return atob(encryptedPassword).split('').reverse().join('');
        } catch (e) {
            console.error('密码解密失败:', e);
            return '';
        }
    }
};

// 存储管理
const Storage = {
    // 获取用户信息
    getUser() {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            // 解密密码
            if (parsedUser.password) {
                parsedUser.password = PasswordUtils.decrypt(parsedUser.password);
            }
            return parsedUser;
        }
        return null;
    },

    // 保存用户信息
    saveUser(user) {
        // 创建用户信息的副本，避免修改原始对象
        const userCopy = { ...user };
        // 加密密码
        if (userCopy.password) {
            userCopy.password = PasswordUtils.encrypt(userCopy.password);
        }
        localStorage.setItem('user', JSON.stringify(userCopy));
        return true;
    },

    // 删除用户信息
    removeUser() {
        localStorage.removeItem('user');
        return true;
    },

    // 检查是否登录
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' && this.getUser() !== null;
    },

    // 设置登录状态
    setLoggedIn(isLoggedIn) {
        localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
        return true;
    },

    // 获取所有考试记录
    getExams() {
        const exams = localStorage.getItem('exams');
        return exams ? JSON.parse(exams) : [];
    },

    // 保存考试记录
    async saveExam(exam) {
        const exams = this.getExams();
        exams.push(exam);
        localStorage.setItem('exams', JSON.stringify(exams));
        // 自动同步到服务器
        try {
            await this.syncDataToServer();
        } catch (error) {
            console.error('同步考试记录失败:', error);
        }
        return true;
    },
    
    // 添加考试记录（别名方法）
    addExam(exam) {
        return this.saveExam(exam);
    },

    // 更新考试记录
    async updateExam(index, updatedExam) {
        const exams = this.getExams();
        if (index >= 0 && index < exams.length) {
            exams[index] = updatedExam;
            localStorage.setItem('exams', JSON.stringify(exams));
            // 自动同步到服务器
            try {
                await this.syncDataToServer();
            } catch (error) {
                console.error('同步考试记录失败:', error);
            }
            return true;
        }
        return false;
    },

    // 删除考试记录
    async deleteExam(index) {
        const exams = this.getExams();
        if (index >= 0 && index < exams.length) {
            exams.splice(index, 1);
            localStorage.setItem('exams', JSON.stringify(exams));
            // 自动同步到服务器
            try {
                await this.syncDataToServer();
            } catch (error) {
                console.error('同步考试记录失败:', error);
            }
            return true;
        }
        return false;
    },
    
    // 保存所有考试记录（用于从数据库同步）
    saveExams(exams) {
        // 过滤掉空考试记录（没有名称的考试）
        const validExams = exams.filter(exam => exam.name && exam.name.trim() !== '');
        localStorage.setItem('exams', JSON.stringify(validExams));
        // 不需要同步到数据库，因为这是从数据库同步过来的数据
        return true;
    },

    // 获取个人信息
    getProfile() {
        const profile = localStorage.getItem('profile');
        return profile ? JSON.parse(profile) : {
            name: '',
            className: '',
            school: '',
            targetUniversity: ''
        };
    },

    // 保存个人信息
    async saveProfile(profile, syncToServer = true) {
        localStorage.setItem('profile', JSON.stringify(profile));
        // 自动同步到服务器
        if (syncToServer) {
            try {
                await this.syncDataToServer();
            } catch (error) {
                console.error('同步个人信息失败:', error);
            }
        }
        return true;
    },

    // 获取学习目标
    getGoals() {
        const goals = localStorage.getItem('goals');
        return goals ? JSON.parse(goals) : {
            targetTotalScore: '',
            targetRank: '',
            weakSubjectPlan: ''
        };
    },

    // 保存学习目标
    async saveGoals(goals) {
        localStorage.setItem('goals', JSON.stringify(goals));
        // 自动同步到服务器
        try {
            await this.syncDataToServer();
        } catch (error) {
            console.error('同步学习目标失败:', error);
        }
        return true;
    },

    // 同步数据到服务器
    async syncDataToServer() {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        
        if (!username || !password) {
            console.log('未登录，跳过数据同步');
            return false;
        }

        try {
            // 准备要同步的数据
            const dataToSync = {
                exams: this.getExams(),
                profile: this.getProfile(),
                goals: this.getGoals(),
                fullMarks: this.getFullMarks(),
                electiveSubjects: this.getElectiveSubjects()
            };

            // 发送同步请求
            const apiUrl = await getApiBaseUrl();
            const response = await fetch(`${apiUrl}/sync_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x_username': username,
                    'x_password': password
                },
                body: JSON.stringify(dataToSync)
            });

            const result = await response.json();
            if (result.code === 200) {
                console.log('数据同步成功');
                return true;
            } else {
                console.error('数据同步失败:', result.msg);
                return false;
            }
        } catch (error) {
            console.error('数据同步出错:', error);
            return false;
        }
    },

    // 导入数据
    async importData(data) {
        try {
            if (data.exams) localStorage.setItem('exams', JSON.stringify(data.exams));
            if (data.profile) localStorage.setItem('profile', JSON.stringify(data.profile));
            if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
            if (data.fullMarks) localStorage.setItem('fullMarks', JSON.stringify(data.fullMarks));
            if (data.electiveSubjects) localStorage.setItem('electiveSubjects', JSON.stringify(data.electiveSubjects));
            
            // 自动同步到服务器
            try {
                await this.syncDataToServer();
            } catch (error) {
                console.error('同步导入数据失败:', error);
            }
            
            return true;
        } catch (error) {
            console.error('导入数据失败', error);
            return false;
        }
    },

    // 导出数据
    exportData() {
        return {
            exams: this.getExams(),
            profile: this.getProfile(),
            goals: this.getGoals(),
            fullMarks: this.getFullMarks(),
            electiveSubjects: this.getElectiveSubjects()
        };
    },
    
    // 获取满分设置
    getFullMarks() {
        const fullMarks = localStorage.getItem('fullMarks');
        return fullMarks ? JSON.parse(fullMarks) : null;
    },
    
    // 保存满分设置
    async saveFullMarks(fullMarks) {
        localStorage.setItem('fullMarks', JSON.stringify(fullMarks));
        // 自动同步到服务器
        try {
            await this.syncDataToServer();
        } catch (error) {
            console.error('同步满分设置失败:', error);
        }
        return true;
    },
    
    // 获取用户名
    getUsername() {
        const user = this.getUser();
        if (user && user.username) {
            return user.username;
        }
        return localStorage.getItem('username') || '';
    },

    // 获取选科
    getElectiveSubjects() {
        const elective = localStorage.getItem('electiveSubjects');
        return elective ? JSON.parse(elective) : [];
    },

    // 保存选科
    async saveElectiveSubjects(subjects) {
        localStorage.setItem('electiveSubjects', JSON.stringify(subjects));
        // 自动同步到服务器
        try {
            await this.syncDataToServer();
        } catch (error) {
            console.error('同步选科设置失败:', error);
        }
        return true;
    },

    // 获取核心科目（语数英+选科）
    getCoreSubjects() {
        const electiveSubjects = this.getElectiveSubjects();
        return ['chinese', 'math', 'english', ...electiveSubjects];
    },

    // 判断是否为未选科目（物理、化学、生物、政治、历史、地理中未选的）
    isUnselectedElective(subject) {
        const allElectives = ['physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        const electiveSubjects = this.getElectiveSubjects();
        return allElectives.includes(subject) && !electiveSubjects.includes(subject);
    },

    // 计算选科总分（语数英+选科）
    calculateElectiveTotalScore(exam) {
        const coreSubjects = this.getCoreSubjects();
        let total = 0;
        coreSubjects.forEach(subject => {
            if (exam.subjects && exam.subjects[subject] !== undefined && exam.subjects[subject] !== null) {
                total += exam.subjects[subject];
            }
        });
        return total;
    }
};

// 图表管理
const Charts = {
    // 考试详情模态框中的科目分布雷达图
    renderDetailSubjectRadarChart(examData, canvasId = 'detailSubjectRadarChart') {
        try {
            const ctx = document.getElementById(canvasId);
            if (!ctx) {
                console.error(`雷达图容器 ${canvasId} 不存在`);
                return;
            }

            if (!examData || !examData.subjects) {
                console.error('无效的考试数据');
                return;
            }

            const allSubjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
            const allSubjectNames = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
            
            // 根据选科过滤科目
            const electiveSubjects = Storage.getElectiveSubjects();
            let subjects, subjectNames;
            
            if (electiveSubjects.length > 0) {
                // 有选科，只显示语数英+选科
                subjects = ['chinese', 'math', 'english', ...electiveSubjects];
                subjects = subjects.filter((s, i, arr) => arr.indexOf(s) === i); // 去重
                subjectNames = subjects.map(s => {
                    const idx = allSubjects.indexOf(s);
                    return idx >= 0 ? allSubjectNames[idx] : s;
                });
            } else {
                // 没有选科，显示所有科目
                subjects = allSubjects;
                subjectNames = allSubjectNames;
            }
            
            // 获取数据优先级：1.年级排名率 2.班级排名率 3.得分率
            const getSubjectPriorityData = (subject) => {
                // 年级排名率
                const gradeRank = examData.subjectRankGrade && examData.subjectRankGrade[subject];
                if (gradeRank) {
                    return 100 - parseFloat(((gradeRank / 650) * 100).toFixed(2));
                }
                
                // 班级排名率
                const classRank = examData.subjectRankClass && examData.subjectRankClass[subject];
                if (classRank) {
                    return 100 - parseFloat(((classRank / 51) * 100).toFixed(2));
                }
                
                // 得分率
                const score = examData.subjects[subject] || 0;
                const fullMark = examData.fullMarks ? (examData.fullMarks[subject] || 100) : 100;
                return fullMark > 0 ? parseFloat(((score / fullMark) * 100).toFixed(2)) : 0;
            };
            
            // 获取优先级数据
            const priorityData = subjects.map(getSubjectPriorityData);

            // 确保图表容器对象存在
            if (!window.detailSubjectRadarCharts) {
                window.detailSubjectRadarCharts = {};
            }
            
            // 销毁旧图表
            if (window.detailSubjectRadarCharts[canvasId] && typeof window.detailSubjectRadarCharts[canvasId].destroy === 'function') {
                window.detailSubjectRadarCharts[canvasId].destroy();
            }

            window.detailSubjectRadarCharts[canvasId] = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: subjectNames,
                    datasets: [{
                        label: '科目表现(优先级:年级排名率>班级排名率>得分率)',
                        data: priorityData,
                        // 使用ThemeColors工具类获取主题色
                        borderColor: ThemeColors.getPrimaryColor(),
                        backgroundColor: ThemeColors.getPrimaryColorWithOpacity(0.2),
                        borderWidth: 2,
                        pointBackgroundColor: ThemeColors.getPrimaryColor(),
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        } catch (error) {
            console.error('渲染详情模态框雷达图时出错:', error);
        }
    }
};

// 通用模态框处理函数
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // 触发淡入动画 - 支持多种模态框内容类名
        const modalContent = modal.querySelector('.modal-content') || 
                            modal.querySelector('.settings-modal-content') || 
                            modal.querySelector('.clear-data-modal-content') ||
                            modal.querySelector('.login-modal-content');
        if (modalContent) {
            modalContent.classList.add('active');
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 添加消失动画 - 支持多种模态框内容类名
        const modalContent = modal.querySelector('.modal-content') || 
                            modal.querySelector('.settings-modal-content') || 
                            modal.querySelector('.clear-data-modal-content') ||
                            modal.querySelector('.login-modal-content');
        if (modalContent) {
            modalContent.classList.add('pop-out');
            // 动画完成后隐藏
            setTimeout(() => {
                modal.classList.add('hidden');
                modalContent.classList.remove('pop-out', 'active');
            }, 300);
        } else {
            modal.classList.add('hidden');
        }
    }
}

function initThemeColor() {
    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
        setThemeColor(savedTheme);
    }
}

function setThemeColor(theme) {
    const themeColors = {
        blue: { primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#60a5fa' },
        green: { primary: '#10b981', primaryDark: '#059669', primaryLight: '#34d399' },
        purple: { primary: '#8b5cf6', primaryDark: '#7c3aed', primaryLight: '#a78bfa' },
        red: { primary: '#ef4444', primaryDark: '#dc2626', primaryLight: '#f87171' },
        amber: { primary: '#f59e0b', primaryDark: '#d97706', primaryLight: '#fbbf24' }
    };
    
    const colors = themeColors[theme] || themeColors.blue;
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--primary-dark', colors.primaryDark);
    document.documentElement.style.setProperty('--primary-light', colors.primaryLight);
    
    localStorage.setItem('themeColor', theme);
    
    document.querySelectorAll('.theme-color-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
}

function switchToEditMode() {
    const viewModeContainer = document.getElementById('viewModeContainer');
    const editModeContainer = document.getElementById('editModeContainer');
    
    if (viewModeContainer) {
        viewModeContainer.classList.add('hidden');
    }
    if (editModeContainer) {
        editModeContainer.classList.remove('hidden');
    }
}

function switchToViewMode() {
    const viewModeContainer = document.getElementById('viewModeContainer');
    const editModeContainer = document.getElementById('editModeContainer');
    
    if (editModeContainer) {
        editModeContainer.classList.add('hidden');
    }
    if (viewModeContainer) {
        viewModeContainer.classList.remove('hidden');
    }
}



// 用户界面管理
const UI = {
    // 存储当前排序后的数据，用于详情查看和删除操作
    currentExams: [],

    currentPage: 'dashboard',
    editingExamIndex: -1,
    notificationTimeout: null, // 通知超时计时器

    // 初始化
    init() {
        // 如果当前是登录页面，直接返回，不执行任何初始化操作
        if (window.location.pathname === '/login.html' || window.location.pathname === '/login') {
            return;
        }
        
        // 设置默认日期为今天（仅在有examDate元素的页面）
        const examDateElement = document.getElementById('examDate');
        if (examDateElement) {
            try {
                examDateElement.valueAsDate = new Date();
            } catch (error) {
                console.error('无法设置考试日期:', error);
            }
        }

        // 生成导航菜单
        this.generateNavMenu();

        // 加载数据
        this.loadExams();
        this.loadProfile();
        this.loadFullMarks();
        
        // 初始化仪表盘（确保第一次打开页面时仪表盘也能显示）
        if (document.getElementById('dashboardPage')) {
            if (typeof window.initDashboardPage === 'function') {
                window.initDashboardPage();
            }
        }

        // 绑定事件
        this.bindEvents();

        // 初始化主题
        if (localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark');
            const themeToggleElement = document.getElementById('themeToggle');
            if (themeToggleElement) {
                themeToggleElement.innerHTML = '<i class="fa-solid fa-sun text-yellow-400"></i>';
            }
        }
    },
    
    // 生成导航菜单
    generateNavMenu() {
        // 渲染桌面端导航菜单
        const desktopNav = document.querySelector('.nav-container-desktop');
        if (desktopNav) {
            desktopNav.innerHTML = navItems.map(item => `
                <a href="${item.href}" class="nav-item ${item.id === 'dashboard' ? 'active' : ''}" data-page="${item.id}">
                    <i class="${item.icon} w-5 text-center"></i>
                    <span>${item.name}</span>
                </a>
            `).join('');
        }
        
        // 渲染移动端导航菜单
        const mobileNav = document.querySelector('.nav-container-mobile');
        if (mobileNav) {
            mobileNav.innerHTML = navItems.map(item => `
                <a href="${item.href}" class="nav-item ${item.id === 'dashboard' ? 'active' : ''}" data-page="${item.id}">
                    <i class="${item.icon} w-5 text-center"></i>
                    <span>${item.name}</span>
                </a>
            `).join('');
        }
    },

    // 绑定事件
    bindEvents() {
        // 导航点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateTo(page);

                // 关闭移动端菜单
                if (window.innerWidth < 768) {
                    this.closeMobileMenu();
                }
            });
        });

        // 移动端菜单按钮点击事件
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileMenuContent = document.getElementById('mobileMenuContent');
                if (mobileMenu && mobileMenuContent) {
                    mobileMenu.classList.remove('hidden');
                    setTimeout(() => {
                        mobileMenuContent.classList.remove('-translate-x-full');
                    }, 10);
                }
            });
        }

        // 关闭移动端菜单按钮点击事件
        const closeMobileMenu = document.getElementById('closeMobileMenu');
        if (closeMobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // 移动端菜单背景点击事件
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    this.closeMobileMenu();
                }
            });
        }

        // 考试表单提交事件
        const examForm = document.getElementById('examForm');
        if (examForm) {
            examForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addExam();
            });
        }

        // 编辑考试表单提交事件
        const editExamForm = document.getElementById('editExamForm');
        if (editExamForm) {
            editExamForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateExam();
            });
        }

        // 关闭详情模态框
        const closeDetailModal = document.getElementById('closeDetailModal');
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => {
                hideModal('detailModal');
            });
        }

        // 撤销按钮点击事件
        const undoNotificationBtn = document.getElementById('undoNotificationBtn');
        if (undoNotificationBtn) {
            undoNotificationBtn.addEventListener('click', () => {
                this.undoAction();
            });
        }

        // 关闭编辑模态框
        const closeEditModal = document.getElementById('closeEditModal');
        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => {
                hideModal('detailModal');
            });
        }

        // 取消编辑
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                // 切换回查看模式
                switchToViewMode();
            });
        }

        // 编辑按钮点击事件
        const editExamBtn = document.getElementById('editExamBtn');
        if (editExamBtn) {
            editExamBtn.addEventListener('click', () => {
                // 切换到编辑模式
                switchToEditMode();
                this.showEditExam(this.editingExamIndex);
            });
        }

        // 关闭删除确认模态框
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                hideModal('deleteModal');
            });
        }

        // 确认删除
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.deleteExam();
            });
        }

        // 导出按钮点击事件
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // 导入按钮点击事件
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const importFile = document.getElementById('importFile');
                if (importFile) {
                    importFile.click();
                }
            });
        }

        // 导入文件选择
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
            const data = JSON.parse(event.target.result);
            if (Storage.importData(data)) {
                this.showNotification('success', '导入成功', '数据已成功导入');
                this.loadExams();
                this.updateProfilePage();
            } else {
                this.showNotification('error', '导入失败', '数据格式错误');
            }
        } catch (error) {
            console.error('导入失败', error);
            this.showNotification('error', '导入失败', '数据格式错误');
        }
                };
                reader.readAsText(file);

                // 重置文件输入
                e.target.value = '';
            });
        }

        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 编辑满分按钮点击事件
        document.querySelectorAll('.edit-fullmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.target.closest('.edit-fullmark-btn').getAttribute('data-subject');
                const defaultMark = e.target.closest('.edit-fullmark-btn').getAttribute('data-default');
                this.showEditFullMarkModal(subject, defaultMark);
            });
        });

        // 取消编辑满分
        const cancelFullMarkBtn = document.getElementById('cancelFullMarkBtn');
        if (cancelFullMarkBtn) {
            cancelFullMarkBtn.addEventListener('click', () => {
                hideModal('editFullMarkModal');
            });
        }

        // 保存满分设置
        const saveFullMarkBtn = document.getElementById('saveFullMarkBtn');
        if (saveFullMarkBtn) {
            saveFullMarkBtn.addEventListener('click', () => {
                this.saveFullMark();
            });
        }

        // 保存个人信息
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // 保存学习目标
        const saveGoalsBtn = document.getElementById('saveGoalsBtn');
        if (saveGoalsBtn) {
            saveGoalsBtn.addEventListener('click', () => {
                this.saveGoals();
            });
        }

        // 搜索输入事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterExams();
            });
        }

        // 学期筛选下拉框交互
        const semesterDropdownBtn = document.getElementById('semesterDropdownBtn');
        const semesterDropdownMenu = document.getElementById('semesterDropdownMenu');
        const semesterDropdownClose = document.getElementById('semesterDropdownClose');
        
        semesterDropdownBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            // 如果菜单已经打开，再次点击则关闭
            if (semesterDropdownMenu && !semesterDropdownMenu.classList.contains('hidden')) {
                semesterDropdownMenu.classList.add('hidden');
                return;
            }
            
            const rect = semesterDropdownBtn.getBoundingClientRect();
            const margin = 10;
            
            // 先设置基础样式并显示菜单，以便测量其实际尺寸
            semesterDropdownMenu.removeAttribute('style');
            semesterDropdownMenu.style.position = 'fixed';
            semesterDropdownMenu.style.top = '0';
            semesterDropdownMenu.style.left = '0';
            semesterDropdownMenu.style.visibility = 'hidden';
            semesterDropdownMenu.style.zIndex = '9999';
            semesterDropdownMenu.classList.remove('hidden');
            
            // 获取菜单实际尺寸
            const menuRect = semesterDropdownMenu.getBoundingClientRect();
            const menuWidth = menuRect.width;
            const menuHeight = menuRect.height;
            
            // 计算水平位置：优先让菜单右边缘对齐按钮右边缘
            let left = rect.right - menuWidth;
            // 检查左边是否超出屏幕
            if (left < margin) left = margin;
            // 检查右边是否超出屏幕
            if (left + menuWidth > window.innerWidth - margin) {
                left = window.innerWidth - menuWidth - margin;
                // 如果连这个位置都不行（菜单比屏幕宽），贴左边
                if (left < margin) left = margin;
            }
            
            // 计算垂直位置：优先放在按钮下方
            let top = rect.bottom + 5;
            if (top + menuHeight > window.innerHeight - margin) {
                // 下方放不下，尝试放按钮上方
                top = rect.top - menuHeight - 5;
                if (top < margin) {
                    // 上方也放不下，贴顶部，设置最大高度和滚动
                    top = margin;
                    semesterDropdownMenu.style.maxHeight = (window.innerHeight - margin * 2) + 'px';
                    semesterDropdownMenu.style.overflowY = 'auto';
                }
            }
            
            // 设置最终位置
            semesterDropdownMenu.style.left = left + 'px';
            semesterDropdownMenu.style.top = top + 'px';
            semesterDropdownMenu.style.visibility = 'visible';
            semesterDropdownMenu.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
        });
        
        // 关闭按钮
        semesterDropdownClose?.addEventListener('click', () => {
            semesterDropdownMenu?.classList.add('hidden');
        });
        
        // 全选复选框
        const selectAllSemesters = document.getElementById('selectAllSemesters');
        selectAllSemesters?.addEventListener('change', (e) => {
            document.querySelectorAll('.semester-checkbox').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            this.updateSemesterDropdownText();
            this.filterExams();
        });
        
        // 学期筛选事件（复选框）
        document.querySelectorAll('.semester-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSemesterDropdownText();
                this.filterExams();
            });
        });
        
        // 点击外部关闭下拉框
        document.addEventListener('click', (e) => {
            if (semesterDropdownMenu && !semesterDropdownMenu.contains(e.target) && e.target !== semesterDropdownBtn) {
                semesterDropdownMenu.classList.add('hidden');
            }
        });

        // 排序选择事件
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortExams();
            });
        }
    },
    
    // 更新学期下拉框显示文本
    updateSemesterDropdownText() {
        const selectedSemesters = Array.from(document.querySelectorAll('.semester-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        const dropdownText = document.getElementById('semesterDropdownText');
        if (dropdownText) {
            if (selectedSemesters.length === 0) {
                dropdownText.textContent = '全部学期';
            } else if (selectedSemesters.length === 6) {
                dropdownText.textContent = '全部学期';
            } else {
                dropdownText.textContent = selectedSemesters.join('、');
            }
        }
    },

    // 关闭移动端菜单
    closeMobileMenu() {
        document.getElementById('mobileMenuContent').classList.add('-translate-x-full');
        setTimeout(() => {
            document.getElementById('mobileMenu').classList.add('hidden');
        }, 300);
    },

    // 导航到指定页面
    navigateTo(page) {
        // 更新导航项状态
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新页面标题
        const pageTitles = {
            'dashboard': '仪表盘',
            'input': '成绩录入',
            'records': '成绩记录',
            'analysis': '成绩分析',
            'profile': '个人档案'
        };
        document.getElementById('pageTitle').textContent = pageTitles[page];

        // 获取所有页面元素
        const allPages = document.querySelectorAll('.page-content');
        const targetPage = document.getElementById(`${page}Page`);
        
        if (!targetPage) return;
        
        // 立即隐藏所有页面（减少切换延迟）
        allPages.forEach(content => {
            content.classList.add('hidden');
        });
        
        // 显示目标页面
        targetPage.classList.remove('hidden');
        
        // 添加淡入动画
        targetPage.style.opacity = '0';
        targetPage.style.transform = 'translateY(10px)';
        
        // 触发重排
        void targetPage.offsetWidth;
        
        // 应用动画
        targetPage.style.opacity = '1';
        targetPage.style.transform = 'translateY(0)';
        targetPage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        // 如果是仪表盘页面，初始化仪表盘
        if (page === 'dashboard') {
            if (typeof window.initDashboardPage === 'function') {
                window.initDashboardPage();
            }
        }

        // 如果是分析页面，更新图表
        if (page === 'analysis') {
            // 调用新的成绩分析页面初始化函数
            if (typeof initAnalysisPage === 'function') {
                initAnalysisPage();
            }
        }

        // 如果是个人档案页面，加载数据
        if (page === 'profile') {
            this.updateProfilePage();
        }

        // 保存当前页面
        this.currentPage = page;
        
        // 移除卡片动画逻辑，避免与全局页面动画重复播放
        // 页面切换的全局动画已经包含了整个页面的淡入效果
        // 不需要再为卡片单独添加动画
    },

    // 更新个人档案页面
    updateProfilePage() {
        // 获取存储的个人信息
        const profile = Storage.getProfile();
        
        if (profile) {
            // 重新调用loadProfile方法，确保完整的动态渲染
            this.loadProfile();
        }
    },

    updateAnalysisPage() {
        if (typeof window.initAnalysisPage === 'function') {
            window.initAnalysisPage();
        }
    },

    updateDashboard() {
        if (typeof window.initDashboardPage === 'function') {
            window.initDashboardPage();
        }
    },

    // 添加考试
    addExam() {
        const examName = document.getElementById('examName').value.trim();
        const examDate = document.getElementById('examDate').value;
        const semester = document.getElementById('examSemester').value;
        const rankClass = parseInt(document.getElementById('rankClass').value) || 0;
        const rankGrade = parseInt(document.getElementById('rankGrade').value) || 0;
        const examSummary = document.getElementById('examSummary').value.trim();

        // 验证必填字段
        if (!examName || !examDate) {
            this.showNotification('error', '输入错误', '请填写考试名称和日期');
            return;
        }

        // 验证排名输入
        const validateRank = (rank, total, fieldName) => {
            if (rank && (isNaN(rank) || rank < 1 || rank > total)) {
                this.showNotification('error', '输入错误', `${fieldName}必须是1到${total}之间的正整数`);
                return false;
            }
            return true;
        };

        // 验证班级排名和年级排名
        if (!validateRank(rankClass, 51, '班级排名')) return;
        if (!validateRank(rankGrade, 650, '年级排名')) return;

        // 获取科目成绩
        const subjects = {};
        const subjectRankClass = {};
        const subjectRankGrade = {};
        const fullMarks = {};
        let totalScore = 0;
        let totalFullMark = 0;

        const subjectFields = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        let isValid = true;
        subjectFields.forEach(subject => {
            const scoreInput = document.querySelector(`input[name="${subject}Score"]`);
            const fullMarkInput = document.querySelector(`input[name="${subject}FullMark"]`);
            const rankClassInput = document.querySelector(`input[name="${subject}RankClass"]`);
            const rankGradeInput = document.querySelector(`input[name="${subject}RankGrade"]`);
            
            if (scoreInput.value) {
                subjects[subject] = parseFloat(scoreInput.value);
            }
            
            if (fullMarkInput.value) {
                const fullMark = parseFloat(fullMarkInput.value);
                fullMarks[subject] = fullMark;
                
                if (subjects[subject] !== undefined && fullMark > 0) {
                    totalScore += subjects[subject];
                    totalFullMark += fullMark;
                }
            }
            
            if (rankClassInput && rankClassInput.value) {
                const rank = parseInt(rankClassInput.value);
                if (!validateRank(rank, 51, `${subject}班级排名`)) {
                    isValid = false;
                } else {
                    subjectRankClass[subject] = rank;
                }
            }
            
            if (rankGradeInput && rankGradeInput.value) {
                const rank = parseInt(rankGradeInput.value);
                if (!validateRank(rank, 650, `${subject}年级排名`)) {
                    isValid = false;
                } else {
                    subjectRankGrade[subject] = rank;
                }
            }
        });

        if (!isValid) return;

        // 创建考试对象
        const exam = {
            name: examName,
            date: examDate,
            semester: semester,
            subjects: subjects,
            subjectRankClass: subjectRankClass,
            subjectRankGrade: subjectRankGrade,
            fullMarks: fullMarks,
            totalScore: totalScore,
            totalFullMark: totalFullMark,
            rankClass: rankClass,
            rankGrade: rankGrade,
            summary: examSummary
        };

        // 保存考试记录
        if (Storage.saveExam(exam)) {
            this.showNotification('success', '添加成功', '考试记录已成功添加');
            document.getElementById('examForm').reset();
            document.getElementById('examDate').valueAsDate = new Date();
            this.loadExams();
        } else {
            this.showNotification('error', '添加失败', '保存考试记录时出错');
        }
    },

    // 加载考试记录
    loadExams(tempExams = null) {
        // 如果提供了临时数据，则使用临时数据，否则从存储中获取
        let exams = tempExams !== null ? tempExams : Storage.getExams();
        const examsTable = document.getElementById('examsTable');
        const noRecords = document.getElementById('noRecords');

        // 检查元素是否存在，避免在登录页面调用时出错
        if (!examsTable || !noRecords) {
            return;
        }

        if (exams.length === 0) {
            examsTable.innerHTML = '';
            noRecords.classList.remove('hidden');
            return;
        }

        // 应用默认排序（日期降序）
        exams.sort((a, b) => new Date(b.date) - new Date(a.date));

        noRecords.classList.add('hidden');
        this.updateExamsTable(exams);
    },

    // 更新考试表格
    updateExamsTable(exams) {
        const examsTable = document.getElementById('examsTable');
        // 检查元素是否存在，避免在登录页面调用时出错
        if (!examsTable) {
            return;
        }
        // 存储当前显示的数据
        this.currentExams = exams;
        examsTable.innerHTML = '';

        exams.forEach((exam, index) => {
            // 创建主行
            const row = document.createElement('tr');
            row.className = 'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer';
            
            const date = new Date(exam.date);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <i class="fa-solid fa-chevron-down mr-2 text-gray-500 transform transition-transform duration-300"></i>
                        ${exam.name}
                    </div>
                </td>
                <td class="py-3 px-4">${exam.semester || '-'}</td>
                <td class="py-3 px-4">${formattedDate}</td>
                <td class="py-3 px-4 font-medium text-primary">${(() => {
                    const electiveSubjects = Storage.getElectiveSubjects();
                    if (electiveSubjects.length > 0) {
                        const electiveTotal = Storage.calculateElectiveTotalScore(exam);
                        const fullTotal = typeof exam.totalScore === 'number' ? exam.totalScore : 0;
                        return `${electiveTotal.toFixed(1)}/${fullTotal.toFixed(1)}`;
                    } else {
                        return typeof exam.totalScore === 'number' ? exam.totalScore.toFixed(1) : '-';
                    }
                })()}</td>
                <td class="py-3 px-4">${exam.rankClass || '-'}</td>
                <td class="py-3 px-4">${exam.rankGrade || '-'}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); UI.showEditExam(${index})">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); UI.showDeleteConfirm(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // 创建详情行
            const detailRow = document.createElement('tr');
            detailRow.className = 'border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
            detailRow.style.display = 'none';
            detailRow.style.opacity = '0';
            detailRow.style.transform = 'translateY(-10px)';
            detailRow.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            // 构建详情内容
            const detailContent = this.generateExamDetailContent(exam, index);
            detailRow.innerHTML = `<td colspan="7" class="py-4 px-6">${detailContent}</td>`;
            
            // 添加点击事件
            row.addEventListener('click', () => {
                const isCollapsed = detailRow.style.display === 'none';
                
                // 收起其他所有详情行
                document.querySelectorAll('tr').forEach(row => {
                    if (row !== detailRow && row.style.transition) {
                        row.style.opacity = '0';
                        row.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            row.style.display = 'none';
                        }, 300);
                        const parentRow = row.previousElementSibling;
                        if (parentRow) {
                            const icon = parentRow.querySelector('.fa-chevron-down');
                            if (icon) {
                                icon.style.transform = 'rotate(0deg)';
                            }
                        }
                    }
                });
                
                // 切换当前详情行
                if (isCollapsed) {
                    // 先显示行
                    detailRow.style.display = 'table-row';
                    // 触发重排
                    detailRow.offsetHeight;
                    // 然后添加动画
                    detailRow.style.opacity = '1';
                    detailRow.style.transform = 'translateY(0)';
                    const icon = row.querySelector('.fa-chevron-down');
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                    // 渲染雷达图
                    if (exam.subjects) {
                        setTimeout(() => {
                            Charts.renderDetailSubjectRadarChart(exam, `detailSubjectRadarChart_${index}`);
                        }, 300);
                    }
                } else {
                    // 先添加收起动画
                    detailRow.style.opacity = '0';
                    detailRow.style.transform = 'translateY(-10px)';
                    // 动画结束后隐藏
                    setTimeout(() => {
                        detailRow.style.display = 'none';
                    }, 300);
                    const icon = row.querySelector('.fa-chevron-down');
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // 添加到表格
            examsTable.appendChild(row);
            examsTable.appendChild(detailRow);
        });
    },
    
    // 生成考试详情内容
    generateExamDetailContent(exam, index) {
        const date = new Date(exam.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const electiveSubjects = Storage.getElectiveSubjects();
        const hasElective = electiveSubjects.length > 0;
        
        // 计算选科总分
        let electiveTotal = 0;
        if (hasElective) {
            electiveTotal = Storage.calculateElectiveTotalScore(exam);
        }
        
        let rankText = '';
        if (exam.rankClass) rankText += `班级: ${exam.rankClass}`;
        if (exam.rankGrade) rankText += (rankText ? ' | ' : '') + `年级: ${exam.rankGrade}`;
        
        // 科目成绩表格
        let subjectsTable = '';
        if (exam.subjects) {
            const subjectNames = {
                'chinese': '语文',
                'math': '数学',
                'english': '英语',
                'physics': '物理',
                'chemistry': '化学',
                'biology': '生物',
                'politics': '政治',
                'history': '历史',
                'geography': '地理'
            };
            
            subjectsTable = `
                <div class="mt-4">
                    <h4 class="font-semibold mb-2">科目成绩</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full border border-gray-200 dark:border-gray-700">
                            <thead>
                                <tr class="bg-gray-100 dark:bg-gray-700">
                                    <th class="py-2 px-4 text-left text-sm">科目</th>
                                    <th class="py-2 px-4 text-left text-sm">分数</th>
                                    <th class="py-2 px-4 text-left text-sm">等级</th>
                                    <th class="py-2 px-4 text-left text-sm">得分率</th>
                                    <th class="py-2 px-4 text-left text-sm">班级排名</th>
                                    <th class="py-2 px-4 text-left text-sm">年级排名</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            Object.keys(exam.subjects).forEach(subject => {
                const score = exam.subjects[subject];
                const fullMark = (exam.fullMarks && exam.fullMarks[subject]) !== undefined ? exam.fullMarks[subject] : 100;
                
                // 如果有选科设置且满分为0，跳过显示
                if (hasElective && fullMark === 0) {
                    return;
                }
                
                const rate = fullMark > 0 ? (score / fullMark) * 100 : 0;
                const grade = this.getGrade(rate);
                const rankClass = (exam.subjectRankClass && exam.subjectRankClass[subject]) || '-';
                const rankGrade = (exam.subjectRankGrade && exam.subjectRankGrade[subject]) || '-';
                
                // 检查是否及格（得分率低于60%为不及格）
                const isFail = rate < 60;
                
                // 判断是否为未选科目（需要变灰）
                const isUnselected = hasElective && Storage.isUnselectedElective(subject);
                const rowClass = isUnselected ? 'border-t border-gray-200 dark:border-gray-700 opacity-50' : 'border-t border-gray-200 dark:border-gray-700';
                
                subjectsTable += `
                    <tr class="${rowClass}">
                        <td class="py-2 px-4 ${isUnselected ? 'text-gray-400' : ''}">${subjectNames[subject] || subject}${isUnselected ? ' (未选)' : ''}</td>
                        <td class="py-2 px-4">
                            ${typeof score === 'number' && !isNaN(score) ? `
                                <span class="${isFail ? 'text-danger font-medium' : ''}">${score.toFixed(1)}</span>
                                <span class="text-gray-500 text-sm">/${fullMark}</span>
                            ` : '-'}
                        </td>
                        <td class="py-2 px-4">
                            <span class="badge badge-${grade.toLowerCase()}">${grade}</span>
                        </td>
                        <td class="py-2 px-4">${typeof rate === 'number' && !isNaN(rate) ? rate.toFixed(1) + '%' : '-'}</td>
                        <td class="py-2 px-4">${rankClass}</td>
                        <td class="py-2 px-4">${rankGrade}</td>
                    </tr>
                `;
            });
            
            subjectsTable += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // 总分显示（如果有选科，显示选科总分）
        let totalScoreDisplay = '';
        if (typeof exam.totalScore === 'number' && !isNaN(exam.totalScore)) {
            totalScoreDisplay = `
                <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-gray-600 dark:text-gray-300">总分</span>
                            <span class="ml-2 text-2xl font-bold text-primary">${exam.totalScore.toFixed(1)}</span>
                        </div>
                        ${hasElective ? `
                        <div class="text-right">
                            <span class="text-gray-600 dark:text-gray-300">选科总分</span>
                            <span class="ml-2 text-2xl font-bold text-info">${electiveTotal.toFixed(1)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // 构建详情内容
        return `
            <div class="exam-detail-content">
                ${exam.summary ? `
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">考试总结</h4>
                        <p class="text-gray-600 dark:text-gray-300">${exam.summary}</p>
                    </div>
                ` : ''}
                
                ${totalScoreDisplay}
                
                ${subjectsTable}
                
                ${exam.subjects ? `
                    <div class="mt-6">
                        <h4 class="font-semibold mb-3">科目表现分析</h4>
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <canvas id="detailSubjectRadarChart_${index}" height="300"></canvas>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // 显示考试详情
    showExamDetail(index) {
        // 使用当前显示的数据（排序后）
        const exam = this.currentExams[index];
        if (!exam) return;

        // 查找原始数据中的索引，用于后续操作
        const originalExams = Storage.getExams();
        this.editingExamIndex = originalExams.findIndex(e => e.date === exam.date && e.name === exam.name);
        
        // 填充详情数据
        document.getElementById('detailExamName').textContent = exam.name;
        
        const date = new Date(exam.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        document.getElementById('detailExamDate').textContent = formattedDate;
        
        document.getElementById('detailTotalScore').textContent = typeof exam.totalScore === 'number' ? exam.totalScore.toFixed(1) : '-';
        
        let rankText = '';
        if (exam.rankClass) rankText += `班级: ${exam.rankClass}`;
        if (exam.rankGrade) rankText += (rankText ? ' | ' : '') + `年级: ${exam.rankGrade}`;
        document.getElementById('detailRank').textContent = rankText || '-';
        
        document.getElementById('detailExamSummary').textContent = exam.summary || '无';
        
        // 填充科目成绩表格
        const tbody = document.getElementById('viewScoresTable').querySelector('tbody');
        tbody.innerHTML = '';
        
        const subjectNames = {
            'chinese': '语文',
            'math': '数学',
            'english': '英语',
            'physics': '物理',
            'chemistry': '化学',
            'biology': '生物',
            'politics': '政治',
            'history': '历史',
            'geography': '地理'
        };
        
        if (exam.subjects) {
            Object.keys(exam.subjects).forEach(subject => {
                const score = exam.subjects[subject];
                const fullMark = (exam.fullMarks && exam.fullMarks[subject]) || 100;
                const rate = fullMark > 0 ? (score / fullMark) * 100 : 0;
                const grade = this.getGrade(rate);
                const rankClass = (exam.subjectRankClass && exam.subjectRankClass[subject]) || '-';
                const rankGrade = (exam.subjectRankGrade && exam.subjectRankGrade[subject]) || '-';
            
            // 计算排名率
            const calculateRankRate = (rank, total) => {
                // 如果rank是'-'或其他非数字值，直接返回'-'
                if (rank === '-' || isNaN(rank) || !rank || rank <= 0 || total <= 0) return '-';
                return ((rank / total) * 100).toFixed(2) + '%';
            };
            
            const rankClassRate = calculateRankRate(rankClass, 51);
            const rankGradeRate = calculateRankRate(rankGrade, 620);
            
            const row = document.createElement('tr');
            row.className = 'border-b dark:border-gray-700';
            row.innerHTML = `
                <td class="py-3 px-4">${subjectNames[subject] || subject}</td>
                <td class="py-3 px-4 font-medium">${typeof score === 'number' && !isNaN(score) ? score.toFixed(1) : '-'}</td>
                <td class="py-3 px-4">${fullMark}</td>
                <td class="py-3 px-4"><span class="badge badge-${grade.toLowerCase()}">${grade}</span></td>
                <td class="py-3 px-4">${typeof rate === 'number' && !isNaN(rate) ? rate.toFixed(1) + '%' : '-'}</td>
                <td class="py-3 px-4">${rankClass}</td>
                <td class="py-3 px-4">${rankGrade}</td>
                <td class="py-3 px-4">${rankClassRate}</td>
                <td class="py-3 px-4">${rankGradeRate}</td>
            `;
            
            tbody.appendChild(row);
        });
        }
        
        // 先切换到查看模式并显示模态框
        switchToViewMode();
        // 确保动画能够正常触发
        setTimeout(() => {
            showModal('detailModal');
        }, 10);
        
        // 然后渲染科目分布雷达图（放在模态框显示之后，避免阻塞UI）
        setTimeout(() => {
            Charts.renderDetailSubjectRadarChart(exam);
        }, 0);
    },

    // 显示编辑考试界面
    showEditExam(index) {
        const exams = this.currentExams || Storage.getExams();
        const exam = exams[index];
        if (!exam) return;

        // 找到该考试在原始数据中的索引
        const originalExams = Storage.getExams();
        this.editingExamIndex = originalExams.findIndex(e => e.date === exam.date && e.name === exam.name);
        
        // 填充编辑表单
        document.getElementById('editExamName').value = exam.name;
        document.getElementById('editExamDate').value = exam.date;
        document.getElementById('editExamSemester').value = exam.semester || '';
        document.getElementById('editRankClass').value = exam.rankClass || '';
        document.getElementById('editRankGrade').value = exam.rankGrade || '';
        document.getElementById('editExamSummary').value = exam.summary || '';
        
        // 填充科目成绩（卡片式表单）
        const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        subjects.forEach(subject => {
            const score = (exam.subjects && exam.subjects[subject]) || '';
            const fullMark = (exam.fullMarks && exam.fullMarks[subject]) || (subject === 'chinese' || subject === 'math' || subject === 'english' ? 150 : 100);
            const rankClass = (exam.subjectRankClass && exam.subjectRankClass[subject]) || '';
            const rankGrade = (exam.subjectRankGrade && exam.subjectRankGrade[subject]) || '';
            
            // 设置分数输入框
            const scoreInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}Score"]`);
            if (scoreInput) {
                scoreInput.value = score;
                scoreInput.max = fullMark;
                scoreInput.placeholder = `0-${fullMark}`;
            }
            
            // 设置满分显示和隐藏字段
            const fullMarkDisplay = document.getElementById(`edit${subject.charAt(0).toUpperCase() + subject.slice(1)}FullMarkDisplay`);
            const fullMarkInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}FullMark"]`);
            if (fullMarkDisplay) {
                fullMarkDisplay.textContent = fullMark;
            }
            if (fullMarkInput) {
                fullMarkInput.value = fullMark;
            }
            
            // 设置排名输入框
            const rankClassInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankClass"]`);
            if (rankClassInput) {
                rankClassInput.value = rankClass;
            }
            const rankGradeInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankGrade"]`);
            if (rankGradeInput) {
                rankGradeInput.value = rankGrade;
            }
        });
        
        // 切换到编辑模式并显示模态框
        switchToEditMode();
        // 确保动画能够正常触发
        setTimeout(() => {
            showModal('detailModal');
        }, 10);
    },

    // 更新考试
    updateExam() {
        const exams = Storage.getExams();
        if (this.editingExamIndex < 0 || this.editingExamIndex >= exams.length) return;

        const examName = document.getElementById('editExamName').value.trim();
        const examDate = document.getElementById('editExamDate').value;
        const semester = document.getElementById('editExamSemester').value;
        const rankClass = parseInt(document.getElementById('editRankClass').value) || 0;
        const rankGrade = parseInt(document.getElementById('editRankGrade').value) || 0;
        const examSummary = document.getElementById('editExamSummary').value.trim();

        // 验证必填字段
        if (!examName || !examDate) {
            this.showNotification('error', '输入错误', '请填写考试名称和日期');
            return;
        }

        // 验证排名输入
        const validateRank = (rank, total, fieldName) => {
            if (rank && (isNaN(rank) || rank < 1 || rank > total)) {
                this.showNotification('error', '输入错误', `${fieldName}必须是1到${total}之间的正整数`);
                return false;
            }
            return true;
        };

        // 验证班级排名和年级排名
        if (!validateRank(rankClass, 51, '班级排名')) return;
        if (!validateRank(rankGrade, 650, '年级排名')) return;

        // 获取科目成绩
        const subjects = {};
        const subjectRankClass = {};
        const subjectRankGrade = {};
        const fullMarks = {};
        let totalScore = 0;
        let totalFullMark = 0;

        const subjectFields = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        let isValid = true;
        subjectFields.forEach(subject => {
            const scoreInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}Score"]`);
            const fullMarkInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}FullMark"]`);
            const rankClassInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankClass"]`);
            const rankGradeInput = document.querySelector(`input[name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankGrade"]`);
            
            if (scoreInput.value) {
                subjects[subject] = parseFloat(scoreInput.value);
            }
            
            if (fullMarkInput.value) {
                const fullMark = parseFloat(fullMarkInput.value);
                fullMarks[subject] = fullMark;
                
                if (subjects[subject] !== undefined && fullMark > 0) {
                    totalScore += subjects[subject];
                    totalFullMark += fullMark;
                }
            }
            
            if (rankClassInput && rankClassInput.value) {
                const rank = parseInt(rankClassInput.value);
                if (!validateRank(rank, 51, `${subject}班级排名`)) {
                    isValid = false;
                } else {
                    subjectRankClass[subject] = rank;
                }
            }
            
            if (rankGradeInput && rankGradeInput.value) {
                const rank = parseInt(rankGradeInput.value);
                if (!validateRank(rank, 650, `${subject}年级排名`)) {
                    isValid = false;
                } else {
                    subjectRankGrade[subject] = rank;
                }
            }
        });

        if (!isValid) return;

        // 创建更新后的考试对象
        const updatedExam = {
            name: examName,
            date: examDate,
            semester: semester,
            subjects: subjects,
            subjectRankClass: subjectRankClass,
            subjectRankGrade: subjectRankGrade,
            fullMarks: fullMarks,
            totalScore: totalScore,
            totalFullMark: totalFullMark,
            rankClass: rankClass,
            rankGrade: rankGrade,
            summary: examSummary
        };

        // 保存原始数据用于撤销
        const originalExam = { ...exams[this.editingExamIndex] };
        
        // 存储撤销操作
        this.undoStack = {
            type: 'update',
            index: this.editingExamIndex,
            original: originalExam,
            updated: updatedExam,
            execute: () => {
                // 执行实际更新到存储 - 只有在未撤销的情况下才真正更新数据
                Storage.updateExam(this.editingExamIndex, updatedExam);
                this.undoStack = null;
            },
            undo: () => {
                // 执行撤销操作 - 只需要重新加载原始数据来恢复界面
                this.loadExams(); // 直接加载原始数据，不需要修改存储
                this.updateDashboard();
                this.updateAnalysisPage();
                
                this.showNotification('success', '已撤销', '考试记录已恢复到修改前的状态');
                this.undoStack = null;
            }
        };
        
        // 立即在界面上显示更新效果 - 只在UI上临时显示修改，不修改存储
        const tempExams = [...exams];
        tempExams[this.editingExamIndex] = updatedExam;
        
        // 刷新界面，只修改显示，不修改存储
        this.loadExams(tempExams);
        this.updateDashboard();
        this.updateAnalysisPage();
        
        // 关闭当前打开的编辑模态框
        hideModal('detailModal');
        
        // 显示可撤销的通知
        this.showNotification('success', '已更新', '5秒后将永久保存，点击撤销可恢复', true);
        
        // 延迟执行实际的存储更新
        setTimeout(() => {
            if (this.undoStack && this.undoStack.type === 'update') {
                this.undoStack.execute();
            }
        }, 5000);
    },
    


    // 显示删除确认
    showDeleteConfirm(index) {
        // 查找原始数据中的索引，用于后续操作
        const originalExams = Storage.getExams();
        const examToDelete = this.currentExams[index];
        this.editingExamIndex = originalExams.findIndex(e => e.date === examToDelete.date && e.name === examToDelete.name);
        
        // 使用通用函数显示模态框，并确保动画能够正常触发
        setTimeout(() => {
            showModal('deleteModal');
        }, 10);
    },

    // 删除考试
    deleteExam() {
        const exams = Storage.getExams();
        const examToDelete = { ...exams[this.editingExamIndex] };
        const deleteIndex = this.editingExamIndex;
        
        // 存储撤销操作 - 只记录需要恢复的信息
        this.undoStack = {
            type: 'delete',
            index: deleteIndex,
            exam: examToDelete,
            execute: () => {
                // 执行实际删除到存储 - 只有在未撤销的情况下才真正删除数据
                Storage.deleteExam(deleteIndex);
                this.undoStack = null;
            },
            undo: () => {
                // 执行撤销操作 - 只需要重新加载原始数据来显示被隐藏的记录
                this.loadExams(); // 直接加载原始数据，不需要修改存储
                this.updateDashboard();
                this.updateAnalysisPage();
                
                this.showNotification('success', '已撤销', '考试记录已恢复显示');
                this.undoStack = null;
            }
        };
        
        const tempExams = [...exams];
        tempExams.splice(deleteIndex, 1);
        
        this.loadExams(tempExams);
        this.updateDashboard();
        this.updateAnalysisPage();
        
        // 使用通用函数关闭删除模态框
        hideModal('deleteModal');
        
        // 显示可撤销的通知
        this.showNotification('success', '已删除', '5秒后将永久删除，点击撤销可恢复', true);
        
        // 延迟执行实际的存储删除 - 只有在未撤销的情况下才真正删除数据
        setTimeout(() => {
            if (this.undoStack && this.undoStack.type === 'delete') {
                this.undoStack.execute();
            }
        }, 5000);
    },





    // 加载个人信息
    loadProfile() {
        const profile = Storage.getProfile();
        const isLoggedIn = Storage.isLoggedIn();
        // 检查元素是否存在，避免在登录页面调用时出错
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = profile.name || '未设置';
        }
        
        const profileClass = document.getElementById('profileClass');
        if (profileClass) {
            profileClass.textContent = (profile.className ? profile.className + '班' : '未设置');
        }
        
        // 处理姓名字段
        const editProfileName = document.querySelector('#editProfileName');
        if (editProfileName) {
            const editProfileNameContainer = editProfileName.closest('div');
            if (editProfileNameContainer) {
                if (isLoggedIn) {
                    // 已登录，替换为纯文本显示
                    editProfileNameContainer.innerHTML = `
                        <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">姓名</label>
                        <div class="text-lg font-medium text-gray-800 dark:text-gray-200">${profile.name || '未设置'}</div>
                    `;
                } else {
                    // 未登录，显示输入框
                    editProfileName.value = profile.name || '';
                    editProfileName.disabled = false;
                }
            }
        }
        
        // 处理班级字段
        const editProfileClass = document.querySelector('#editProfileClass');
        if (editProfileClass) {
            const editProfileClassContainer = editProfileClass.closest('div');
            if (editProfileClassContainer) {
                if (isLoggedIn) {
                    // 已登录，替换为纯文本显示
                    editProfileClassContainer.innerHTML = `
                        <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">班级</label>
                        <div class="text-lg font-medium text-gray-800 dark:text-gray-200">${profile.className || '未设置'}</div>
                    `;
                } else {
                    // 未登录，显示输入框
                    editProfileClass.value = profile.className || '';
                    editProfileClass.disabled = false;
                }
            }
        }
        
        // 处理学校字段
        const editProfileSchool = document.querySelector('#editProfileSchool');
        if (editProfileSchool) {
            const editProfileSchoolContainer = editProfileSchool.closest('div');
            if (editProfileSchoolContainer) {
                if (isLoggedIn) {
                    // 已登录，替换为纯文本显示
                    editProfileSchoolContainer.innerHTML = `
                        <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">学校</label>
                        <div class="text-lg font-medium text-gray-800 dark:text-gray-200">${profile.school || '未设置'}</div>
                    `;
                } else {
                    // 未登录，显示输入框
                    editProfileSchool.value = profile.school || '';
                    editProfileSchool.disabled = false;
                }
            }
        }
        
        // 处理目标大学字段（始终显示输入框）
        const editProfileTargetUniversity = document.getElementById('editProfileTargetUniversity');
        if (editProfileTargetUniversity) {
            editProfileTargetUniversity.value = profile.targetUniversity || '';
            editProfileTargetUniversity.disabled = false;
        }
    },

    // 保存个人信息
    saveProfile() {
        const isLoggedIn = Storage.isLoggedIn();
        const currentProfile = Storage.getProfile();
        
        // 根据登录状态决定哪些字段可以修改
        const profile = {
            // 已登录用户保留原有姓名、班级和学校，未登录用户可修改
            name: isLoggedIn ? currentProfile.name : document.getElementById('editProfileName').value.trim(),
            className: isLoggedIn ? currentProfile.className : document.getElementById('editProfileClass').value.trim(),
            school: isLoggedIn ? currentProfile.school : document.getElementById('editProfileSchool').value.trim(),
            // 目标大学始终允许修改
            targetUniversity: document.getElementById('editProfileTargetUniversity').value.trim()
        };
        
        if (Storage.saveProfile(profile)) {
            this.showNotification('success', '保存成功', '个人信息已成功保存');
            this.loadProfile();
        } else {
            this.showNotification('error', '保存失败', '保存个人信息时出错');
        }
    },

    // 加载学习目标
    loadGoals() {
        const goals = Storage.getGoals();
        // 检查元素是否存在，避免在登录页面调用时出错
        const targetTotalScore = document.getElementById('targetTotalScore');
        if (targetTotalScore) {
            targetTotalScore.value = goals.targetTotalScore || '';
        }
        
        const targetRank = document.getElementById('targetRank');
        if (targetRank) {
            targetRank.value = goals.targetRank || '';
        }
        
        const weakSubjectPlan = document.getElementById('weakSubjectPlan');
        if (weakSubjectPlan) {
            weakSubjectPlan.value = goals.weakSubjectPlan || '';
        }
    },

    // 保存学习目标
    saveGoals() {
        const goals = {
            targetTotalScore: document.getElementById('targetTotalScore').value.trim(),
            targetRank: document.getElementById('targetRank').value.trim(),
            weakSubjectPlan: document.getElementById('weakSubjectPlan').value.trim()
        };
        
        if (Storage.saveGoals(goals)) {
            this.showNotification('success', '保存成功', '学习目标已成功保存');
            this.loadGoals();
        } else {
            this.showNotification('error', '保存失败', '保存学习目标时出错');
        }
    },

    // 导出数据
    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `成绩数据_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('success', '导出成功', '数据已成功导出');
    },

    // 显示通知
    showNotification(type, title, message, canUndo = false) {
        // 非空检查，确保title和message都存在
        if (!title || !message) {
            console.warn('通知标题和内容不能为空');
            return;
        }
        
        // 获取通知相关元素
        const notification = document.getElementById('notification');
        const notificationIcon = document.getElementById('notificationIcon');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');
        const undoButton = document.getElementById('undoNotificationBtn');
        const progressBar = document.getElementById('notificationProgress');
        
        // 检查所有必需元素是否存在
        if (!notification || !notificationIcon || !notificationTitle || !notificationMessage || !progressBar) {
            console.warn('通知组件元素缺失，无法显示通知');
            return;
        }
        
        // 检查是否与当前显示的通知内容完全相同，避免重复显示
        if (notificationTitle.textContent === title && 
            notificationMessage.textContent === message &&
            !notification.classList.contains('translate-x-full') &&
            !notification.classList.contains('opacity-0')) {
            console.log('相同通知已在显示中，跳过显示');
            return;
        }

        // 清除之前的定时器
        if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
        if (this.progressInterval) clearInterval(this.progressInterval);

        // 设置通知类型
        switch (type) {
            case 'success':
                notificationIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 dark:bg-green-900 dark:text-green-400';
                notificationIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
                break;
            case 'error':
                notificationIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3 dark:bg-red-900 dark:text-red-400';
                notificationIcon.innerHTML = '<i class="fa-solid fa-times"></i>';
                break;
            case 'warning':
                notificationIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3 dark:bg-yellow-900 dark:text-yellow-400';
                notificationIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
                break;
            case 'info':
                notificationIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 dark:bg-blue-900 dark:text-blue-400';
                notificationIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
                break;
        }

        // 设置通知内容
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;

        // 显示或隐藏撤销按钮
        if (undoButton) {
            if (canUndo && this.undoStack) {
                undoButton.classList.remove('hidden');
            } else {
                undoButton.classList.add('hidden');
            }
        }

        // 重置进度条 - 适配绝对定位的进度条
        progressBar.style.width = '100%';

        // 显示通知
        notification.classList.remove('translate-x-full', 'opacity-0', 'hide');
        notification.classList.add('show');

        // 设置进度条动画
        let startTime = Date.now();
        const duration = 5000; // 5秒
        
        this.progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const percentage = (1 - elapsed / duration) * 100;
            
            if (percentage <= 0) {
                clearInterval(this.progressInterval);
                progressBar.style.width = '0%';
                this.hideNotification();
            } else {
                progressBar.style.width = `${percentage}%`;
            }
        }, 50);

        // 设置自动隐藏定时器
        this.notificationTimeout = setTimeout(() => {
            clearInterval(this.progressInterval);
            this.hideNotification();
        }, 5000);
    },

    // 隐藏通知
    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            // 立即清除所有通知相关元素内容
            const notificationTitle = document.getElementById('notificationTitle');
            const notificationMessage = document.getElementById('notificationMessage');
            const notificationIcon = document.getElementById('notificationIcon');
            const progressBar = document.getElementById('notificationProgress');
            const undoButton = document.getElementById('undoNotificationBtn');
            
            if (notificationTitle) notificationTitle.textContent = '';
            if (notificationMessage) notificationMessage.textContent = '';
            if (notificationIcon) notificationIcon.innerHTML = '';
            if (progressBar) progressBar.style.width = '0%';
            if (undoButton) undoButton.classList.add('hidden');
            
            // 立即清除所有计时器
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
            
            // 移除所有可能导致显示的类
            notification.classList.remove('show');
            
            // 添加确保隐藏的类
            notification.classList.add('hide');
            notification.classList.add('translate-x-full', 'opacity-0');
        }
    },



    // 切换主题
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');

        if (body.classList.contains('dark')) {
            // 切换到亮色主题
            body.classList.remove('dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon text-gray-600"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            // 切换到暗色主题
            body.classList.add('dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun text-yellow-400"></i>';
            localStorage.setItem('theme', 'dark');
        }
    },

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    // 显示满分编辑模态框
    showEditFullMarkModal(subject, defaultMark) {
        this.editingSubject = subject;
        const fullMarkInput = document.querySelector(`input[name="${subject}FullMark"]`);
        const currentMark = fullMarkInput ? fullMarkInput.value : defaultMark;
        document.getElementById('fullMarkInput').value = currentMark;
        const editModal = document.getElementById('editFullMarkModal');
        // 确保动画能够正常触发
        setTimeout(() => {
            editModal.classList.remove('hidden');
        }, 10);
    },

    // 加载满分设置
    loadFullMarks() {
        const electiveSubjects = Storage.getElectiveSubjects();
        
        // 获取当前的满分设置，如果没有则使用默认值
        let fullMarks = Storage.getFullMarks() || {
            chinese: 150,
            math: 150,
            english: 150,
            physics: 100,
            chemistry: 100,
            biology: 100,
            politics: 100,
            history: 100,
            geography: 100
        };
        
        // 根据选科设置动态更新满分：选科保持原有值，非选科设为0
        fullMarks = {
            chinese: fullMarks.chinese || 150,
            math: fullMarks.math || 150,
            english: fullMarks.english || 150,
            physics: electiveSubjects.includes('physics') ? (fullMarks.physics || 100) : 0,
            chemistry: electiveSubjects.includes('chemistry') ? (fullMarks.chemistry || 100) : 0,
            biology: electiveSubjects.includes('biology') ? (fullMarks.biology || 100) : 0,
            politics: electiveSubjects.includes('politics') ? (fullMarks.politics || 100) : 0,
            history: electiveSubjects.includes('history') ? (fullMarks.history || 100) : 0,
            geography: electiveSubjects.includes('geography') ? (fullMarks.geography || 100) : 0
        };
        
        this.fullMarks = fullMarks;
        
        // 更新所有科目的满分显示
        const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        subjects.forEach(subject => {
            const mark = fullMarks[subject] !== undefined ? fullMarks[subject] : 100;
            const displayMark = mark % 1 === 0 ? mark : mark.toFixed(1);
            
            // 更新显示元素
            const displayElement = document.getElementById(`${subject}FullMarkDisplay`);
            if (displayElement) {
                displayElement.textContent = displayMark;
            }
            
            // 更新隐藏输入框
            const hiddenInput = document.querySelector(`input[name="${subject}FullMark"]`);
            if (hiddenInput) {
                hiddenInput.value = mark;
            }
            
            // 根据满分设置科目卡片的样式
            const subjectCard = document.querySelector(`input[name="${subject}Score"]`)?.closest('.bg-gray-50, .dark\\:bg-gray-700');
            const scoreInput = document.querySelector(`input[name="${subject}Score"]`);
            const rankClassInput = document.querySelector(`input[name="${subject}RankClass"]`);
            const rankGradeInput = document.querySelector(`input[name="${subject}RankGrade"]`);
            
            if (subjectCard && mark === 0) {
                subjectCard.style.opacity = '0.5';
                // 禁用分数输入框和排名输入框
                if (scoreInput) {
                    scoreInput.disabled = true;
                    scoreInput.placeholder = '不统计';
                    scoreInput.value = '';
                }
                if (rankClassInput) {
                    rankClassInput.disabled = true;
                    rankClassInput.placeholder = '-';
                    rankClassInput.value = '';
                }
                if (rankGradeInput) {
                    rankGradeInput.disabled = true;
                    rankGradeInput.placeholder = '-';
                    rankGradeInput.value = '';
                }
            } else if (subjectCard) {
                subjectCard.style.opacity = '1';
                if (scoreInput) {
                    scoreInput.disabled = false;
                    scoreInput.max = mark;
                    scoreInput.placeholder = `0-${displayMark}`;
                }
                if (rankClassInput) {
                    rankClassInput.disabled = false;
                    rankClassInput.placeholder = '班级排名';
                }
                if (rankGradeInput) {
                    rankGradeInput.disabled = false;
                    rankGradeInput.placeholder = '年级排名';
                }
            }
        });
    },
    
    // 加载学生信息
    loadStudentInfo() {
        // 使用getProfile方法获取学生信息
        const studentInfo = Storage.getProfile() || {};
        this.studentInfo = studentInfo;
        
        // 更新学生信息显示
        this.updateProfileInfo();
    },
    
    // 更新个人信息显示
    updateProfileInfo() {
        const profile = this.studentInfo;
        
        // 更新个人档案页面的显示
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = profile.name || '--';
        
        const profileClassEl = document.getElementById('profileClass');
        if (profileClassEl) profileClassEl.textContent = (profile.className ? profile.className + '班' : '--');
        
        // 更新编辑表单的默认值
        const editProfileNameEl = document.getElementById('editProfileName');
        if (editProfileNameEl) editProfileNameEl.value = profile.name || '';
        
        const editProfileClassEl = document.getElementById('editProfileClass');
        if (editProfileClassEl) editProfileClassEl.value = profile.className || '';
        
        const editProfileSchoolEl = document.getElementById('editProfileSchool');
            if (editProfileSchoolEl) editProfileSchoolEl.value = profile.school || '';
        
        const editProfileTargetUniversityEl = document.getElementById('editProfileTargetUniversity');
        if (editProfileTargetUniversityEl) editProfileTargetUniversityEl.value = profile.targetUniversity || '';
    },
    
    // 保存满分设置
    saveFullMark() {
        const newMark = parseFloat(document.getElementById('fullMarkInput').value);
        const subject = this.editingSubject;

        if (isNaN(newMark) || newMark < 0) {
            this.showNotification('error', '输入错误', '请输入有效的满分值');
            return;
        }

        // 获取科目名称（去除edit前缀）
        let subjectName = subject;
        let isEditMode = false;
        if (subject.startsWith('edit')) {
            subjectName = subject.charAt(4).toLowerCase() + subject.slice(5);
            isEditMode = true;
        }

        // 更新显示和隐藏输入框
        // 如果满分是整数，显示为整数，否则显示一位小数
        const displayMark = newMark % 1 === 0 ? newMark : newMark.toFixed(1);
        
        // 更新显示元素
        const displayId = isEditMode ? `edit${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}FullMarkDisplay` : `${subjectName}FullMarkDisplay`;
        const displayEl = document.getElementById(displayId);
        if (displayEl) {
            displayEl.textContent = displayMark;
        }
        
        // 更新隐藏的满分输入框
        const fullMarkInput = document.querySelector(`input[name="${subject}FullMark"]`);
        if (fullMarkInput) {
            fullMarkInput.value = newMark;
        }

        // 更新得分输入框的最大值
        const scoreInput = document.querySelector(`input[name="${subject}Score"]`);
        if (scoreInput) {
            if (newMark > 0) {
                scoreInput.max = newMark;
                scoreInput.disabled = false;
                // 如果满分是整数，显示为整数，否则显示一位小数
                const placeholderMark = newMark % 1 === 0 ? newMark : newMark.toFixed(1);
                scoreInput.placeholder = `0-${placeholderMark}`;
            } else {
                scoreInput.disabled = true;
                scoreInput.placeholder = '不统计';
                scoreInput.value = '';
            }
        }
        
        // 更新排名输入框
        const rankClassInput = document.querySelector(`input[name="${subject}RankClass"]`);
        const rankGradeInput = document.querySelector(`input[name="${subject}RankGrade"]`);
        
        if (newMark === 0) {
            if (rankClassInput) {
                rankClassInput.disabled = true;
                rankClassInput.placeholder = '-';
                rankClassInput.value = '';
            }
            if (rankGradeInput) {
                rankGradeInput.disabled = true;
                rankGradeInput.placeholder = '-';
                rankGradeInput.value = '';
            }
        } else {
            if (rankClassInput) {
                rankClassInput.disabled = false;
                rankClassInput.placeholder = '班级排名';
            }
            if (rankGradeInput) {
                rankGradeInput.disabled = false;
                rankGradeInput.placeholder = '年级排名';
            }
        }
        
        // 更新科目卡片样式
        if (scoreInput) {
            const subjectCard = scoreInput.closest('.bg-gray-50, .dark\\:bg-gray-700');
            if (subjectCard) {
                if (newMark === 0) {
                    subjectCard.style.opacity = '0.5';
                } else {
                    subjectCard.style.opacity = '1';
                }
            }
        }
        
        // 更新fullMarks对象并保存到localStorage
        const currentFullMarks = this.fullMarks || {};
        currentFullMarks[subjectName] = newMark;
        this.fullMarks = currentFullMarks;
        Storage.saveFullMarks(currentFullMarks);

        // 关闭满分设置模态框
        hideModal('editFullMarkModal');
        this.showNotification('success', '设置成功', '满分已更新');
    },

    // 获取等级
    getGrade(scoreRate) {
        if (scoreRate >= 60) return '及格';
        return '不及格';
    },

    // 筛选考试记录
    filterExams() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        // 获取选中的学期（复选框形式）
        const selectedSemesters = Array.from(document.querySelectorAll('.semester-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        let filteredExams = Storage.getExams();
        
        // 学期筛选（多选）
        if (selectedSemesters.length > 0) {
            filteredExams = filteredExams.filter(exam => 
                selectedSemesters.includes(exam.semester)
            );
        }
        
        // 搜索筛选
        if (searchTerm) {
            filteredExams = filteredExams.filter(exam => 
                exam.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // 排序
        this.sortExams(filteredExams);
    },

    // 排序考试记录
    sortExams(examsToSort) {
        const sortType = document.getElementById('sortSelect').value;
        let sortedExams = examsToSort || Storage.getExams();
        
        switch (sortType) {
            case 'date-desc':
                sortedExams.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sortedExams.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'score-desc':
                sortedExams.sort((a, b) => b.totalScore - a.totalScore);
                break;
            case 'score-asc':
                sortedExams.sort((a, b) => a.totalScore - b.totalScore);
                break;
            case 'rank-desc':
                sortedExams.sort((a, b) => b.rankClass - a.rankClass);
                break;
            case 'rank-asc':
                sortedExams.sort((a, b) => a.rankClass - b.rankClass);
                break;
        }

        this.updateExamsTable(sortedExams);
    },

    // 更新分析页面的考试选择器
    updateExamSelects() {
        // 这里可以添加考试选择器的更新逻辑
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    const checkLoginStatus = async () => {
        // 如果当前不是登录页面且未登录，允许访客模式访问
        // 不再强制跳转到登录页面，而是允许访客模式使用
        
        // 已登录用户，检查是否需要同步数据
        const user = Storage.getUser();
        if (user && Storage.isLoggedIn()) {
            try {
                const username = localStorage.getItem('username');
                const password = localStorage.getItem('password');
                
                if (username && password) {
                    // 检查缓存时间戳
                    const lastSyncTime = localStorage.getItem('lastSyncTime');
                    const now = new Date().getTime();
                    const oneHour = 60 * 60 * 1000; // 1小时
                    
                    // 如果缓存时间戳不存在或已过期，则同步数据
                    if (!lastSyncTime || (now - parseInt(lastSyncTime)) > oneHour) {
                        console.log('缓存时间戳过期或不存在，开始同步数据');
                        
                        // 从服务器获取最新数据
                        const apiUrl = await getApiBaseUrl();
                        const response = await fetch(`${apiUrl}/sync_data`, {
                            method: 'POST',
                            headers: {
                                'x_username': username,
                                'x_password': password
                            }
                        });
                        
                        const result = await response.json();
                        if (result.code === 200 && result.data) {
                            // 存储返回的数据
                            localStorage.setItem('syncData', JSON.stringify(result.data));
                            
                            // 解析同步数据
                            try {
                                if (result.data.exams) {
                                    localStorage.setItem('exams', JSON.stringify(result.data.exams));
                                }
                                if (result.data.profile) {
                                    localStorage.setItem('profile', JSON.stringify(result.data.profile));
                                }
                                if (result.data.goals) {
                                    localStorage.setItem('goals', JSON.stringify(result.data.goals));
                                }
                                if (result.data.fullMarks) {
                                    localStorage.setItem('fullMarks', JSON.stringify(result.data.fullMarks));
                                }
                                if (result.data.electiveSubjects) {
                                    localStorage.setItem('electiveSubjects', JSON.stringify(result.data.electiveSubjects));
                                }
                                console.log('数据同步成功');
                            } catch (error) {
                                console.error('解析同步数据失败', error);
                            }
                        }
                        
                        // 更新缓存时间戳
                        localStorage.setItem('lastSyncTime', now.toString());
                        console.log('已设置新的缓存时间戳:', new Date(now).toLocaleString());
                    } else {
                        console.log('缓存时间戳未过期，跳过数据同步');
                        console.log('上次同步时间:', new Date(parseInt(lastSyncTime)).toLocaleString());
                        console.log('下次同步时间:', new Date(parseInt(lastSyncTime) + oneHour).toLocaleString());
                    }
                }
                
                // 用登录信息覆盖姓名、班级和学校
                const currentProfile = Storage.getProfile();
                const updatedProfile = {
                    ...currentProfile,
                    name: user.username,
                    className: user.class || '',
                    school: user.school || ''
                };
                Storage.saveProfile(updatedProfile, false); // 不自动同步
            } catch (error) {
                console.error('同步数据失败:', error);
            }
        }
        return true;
    };

    // 登出功能
    const logout = () => {
        Storage.setLoggedIn(false);
        Storage.removeUser();
        localStorage.removeItem('lastSyncTime');
        window.location.href = 'login.html';
    };

    // 页面加载时检查登录状态
    (async () => {
        if (!(await checkLoginStatus())) {
            return;
        }
    })();
    
    // 只有当当前不是登录页面和管理页面时，才初始化UI
    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/login' && window.location.pathname !== '/admin.html' && window.location.pathname !== '/admin') {
        UI.init();
        
        // 初始化主题色设置
        initThemeColor();
        
        // 显示测试版本通知
        UI.showNotification('info', '测试版本', '当前为测试版本，可能存在不稳定性,请悉知');
        
        // 在 UI 初始化后恢复位置
        setTimeout(() => {
            restoreLocation();
        }, 150);
    }
    
    // 绑定登出事件
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // 交互元素获取
    const dataMenuBtn = document.getElementById('dataMenuBtn');
    const dataMenuDropdown = document.getElementById('dataMenuDropdown');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
        
        // 切换下拉菜单显示/隐藏
        function toggleDropdown() {
            if (dataMenuDropdown) {
                if (dataMenuDropdown.classList.contains('invisible')) {
                    // 显示菜单
                    dataMenuDropdown.classList.remove('invisible', 'opacity-0', 'translate-y-2');
                    dataMenuDropdown.classList.add('opacity-100', 'translate-y-0');
                } else {
                    // 隐藏菜单
                    dataMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
                    dataMenuDropdown.classList.add('invisible', 'opacity-0', 'translate-y-2');
                }
            }
        }
        
        // 打开设置对话框
        function openSettingsModal() {
            showModal('settingsModal');
        }
        
        // 主题色选择按钮事件监听
        document.querySelectorAll('.theme-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                setThemeColor(theme);
            });
        });
        
        // 关闭设置对话框
        function closeSettingsModalFunc() {
            hideModal('settingsModal');
        }
        
        // 点击菜单按钮显示/隐藏下拉菜单
        if (dataMenuBtn) {
            dataMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown();
            });
        }
        
        // 点击设置按钮打开设置对话框
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSettingsModal();
            });
        }
        
        // 点击关闭按钮关闭设置对话框
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', closeSettingsModalFunc);
        }
        
        // 选科模态框相关
        const electiveModal = document.getElementById('electiveModal');
        const closeElectiveModal = document.getElementById('closeElectiveModal');
        const openElectiveModalBtn = document.getElementById('openElectiveModalBtn');
        
        // 打开选科对话框
        function openElectiveModal() {
            showModal('electiveModal');
            loadElectiveSubjectsSettings();
        }
        
        // 关闭选科对话框
        function closeElectiveModalFunc() {
            hideModal('electiveModal');
        }
        
        // 点击打开选科按钮
        if (openElectiveModalBtn) {
            openElectiveModalBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openElectiveModal();
            });
        }
        
        // 点击关闭按钮关闭选科对话框
        if (closeElectiveModal) {
            closeElectiveModal.addEventListener('click', closeElectiveModalFunc);
        }
        
        // 点击对话框外部关闭选科对话框
        if (electiveModal) {
            electiveModal.addEventListener('click', (event) => {
                if (event.target === electiveModal) {
                    closeElectiveModalFunc();
                }
            });
        }
        
        // 选科功能
        function loadElectiveSubjectsSettings() {
            const savedElectives = Storage.getElectiveSubjects();
            const checkboxes = document.querySelectorAll('input[name="elective"]');
            const countHint = document.getElementById('electiveCountHint');
            const saveBtn = document.getElementById('saveElectiveBtn');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = savedElectives.includes(checkbox.value);
            });
            
            updateElectiveCountHint();
        }
        
        function updateElectiveCountHint() {
            const checkboxes = document.querySelectorAll('input[name="elective"]:checked');
            const count = checkboxes.length;
            const countHint = document.getElementById('electiveCountHint');
            const saveBtn = document.getElementById('saveElectiveBtn');
            
            if (countHint) {
                countHint.textContent = `已选择 ${count}/3 门`;
            }
            
            if (saveBtn) {
                saveBtn.disabled = count !== 3;
            }
        }
        
        // 更新仪表盘选科显示
        function updateElectiveDisplay() {
            const electiveSubjects = Storage.getElectiveSubjects();
            const selectedElectivesEl = document.getElementById('selectedElectives');
            const subjectNames = {
                'physics': '物理',
                'chemistry': '化学',
                'biology': '生物',
                'politics': '政治',
                'history': '历史',
                'geography': '地理'
            };
            
            if (selectedElectivesEl) {
                if (electiveSubjects.length > 0) {
                    selectedElectivesEl.textContent = electiveSubjects.map(s => subjectNames[s] || s).join('、');
                } else {
                    selectedElectivesEl.textContent = '未设置';
                }
            }
        }
        
        // 页面加载时更新选科显示
        updateElectiveDisplay();
        
        // 选科复选框事件
        document.querySelectorAll('input[name="elective"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateElectiveCountHint);
        });
        
        // 保存选科按钮
        const saveElectiveBtn = document.getElementById('saveElectiveBtn');
        if (saveElectiveBtn) {
            saveElectiveBtn.addEventListener('click', async () => {
                const selectedSubjects = [];
                document.querySelectorAll('input[name="elective"]:checked').forEach(checkbox => {
                    selectedSubjects.push(checkbox.value);
                });
                
                if (selectedSubjects.length !== 3) {
                    UI.showNotification('error', '保存失败', '请选择恰好3门科目');
                    return;
                }
                
                await Storage.saveElectiveSubjects(selectedSubjects);
                UI.showNotification('success', '保存成功', '选科设置已保存');
                
                // 关闭选科对话框
                closeElectiveModalFunc();
                
                // 更新仪表盘显示
                updateElectiveDisplay();
                
                // 刷新页面以应用新设置
                saveCurrentLocation();
                window.location.reload();
            });
        }
        
        // 点击对话框外部关闭设置对话框
        if (settingsModal) {
            settingsModal.addEventListener('click', (event) => {
                if (event.target === settingsModal) {
                    closeSettingsModalFunc();
                }
            });
        }
        
        // 点击菜单外部关闭下拉菜单
        document.addEventListener('click', () => {
            if (dataMenuDropdown && !dataMenuDropdown.classList.contains('invisible')) {
                dataMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
                dataMenuDropdown.classList.add('invisible', 'opacity-0', 'translate-y-2');
            }
        });
        
        // 点击菜单内部项目不关闭菜单
        if (dataMenuDropdown) {
            dataMenuDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // 为通知关闭按钮添加点击事件
        const closeNotificationBtn = document.getElementById('closeNotification');
        if (closeNotificationBtn) {
            closeNotificationBtn.addEventListener('click', () => {
                // 如果有延迟执行的操作（如删除），立即执行它
                if (UI.undoStack && UI.undoStack.execute && (UI.undoStack.type === 'delete' || UI.undoStack.type === 'clear')) {
                    // 清除定时器，防止重复执行
                    if (window.clearUndoTimer) {
                        clearTimeout(window.clearUndoTimer);
                        window.clearUndoTimer = null;
                    }
                    
                    // 立即执行操作
                    UI.undoStack.execute();
                    
                    // 清除撤销栈
                    UI.undoStack = null;
                }
                UI.hideNotification();
            });
        }
        
        // 为撤销按钮添加点击事件
        const undoNotificationBtn = document.getElementById('undoNotificationBtn');
        if (undoNotificationBtn) {
            undoNotificationBtn.addEventListener('click', () => {
                UI.undoAction();
            });
        }
        
        // 清空数据功能
        const clearDataBtn = document.getElementById('clearDataBtn');
        const clearDataModal = document.getElementById('clearDataModal');
        const cancelClearDataBtn = document.getElementById('cancelClearDataBtn');
        const confirmClearDataBtn = document.getElementById('confirmClearDataBtn');
        const closeClearDataModalBtn = document.getElementById('closeClearDataModal');
        
        // 定义清空数据倒计时变量
        let countdownInterval = null;
        
        // 显示清空数据确认对话框
        if (clearDataBtn && clearDataModal) {
            clearDataBtn.addEventListener('click', () => {
                // 显示模态框并应用动画
                clearDataModal.classList.remove('hidden');
                const modalContent = clearDataModal.querySelector('.clear-data-modal-content');
                if (modalContent) {
                    // 先设置初始状态（缩小和透明度降低）
                    modalContent.style.transform = 'scale(0.9) translateY(-20px)';
                    modalContent.style.opacity = '0';
                    
                    // 触发重绘
                    void modalContent.offsetWidth;
                    
                    // 然后应用平滑过渡到正常状态
                    modalContent.style.transform = 'scale(1) translateY(0)';
                    modalContent.style.opacity = '1';
                    modalContent.classList.add('active');
                }
                
                // 重置倒计时
                let countdown = 5;
                if (confirmClearDataBtn) {
                    confirmClearDataBtn.disabled = true;
                    confirmClearDataBtn.textContent = `确认(${countdown}s)`;
                    confirmClearDataBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    
                    // 启动倒计时
                    if (countdownInterval) clearInterval(countdownInterval);
                    countdownInterval = setInterval(() => {
                        countdown--;
                        if (countdown > 0) {
                            confirmClearDataBtn.textContent = `确认(${countdown}s)`;
                        } else {
                            // 倒计时结束 - 平滑过渡效果
                            clearInterval(countdownInterval);
                            
                            // 先淡出
                            confirmClearDataBtn.style.opacity = '0';
                            
                            // 短暂延迟后更新文本并平滑显示
                            setTimeout(() => {
                                confirmClearDataBtn.disabled = false;
                                confirmClearDataBtn.textContent = '确认';
                                confirmClearDataBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                                
                                // 平滑显示
                                confirmClearDataBtn.style.opacity = '1';
                            }, 200);
                        }
                    }, 1000);
                }
            });
        }
        
        // 取消清空数据
        if (cancelClearDataBtn) {
            cancelClearDataBtn.addEventListener('click', () => {
                closeClearDataModal();
            });
        }
        
        // 关闭清空数据模态框
        if (closeClearDataModalBtn) {
            closeClearDataModalBtn.addEventListener('click', () => {
                closeClearDataModal();
            });
        }
        
        // 确认清空数据
        if (confirmClearDataBtn) {
            confirmClearDataBtn.addEventListener('click', () => {
                if (!confirmClearDataBtn.disabled) {
                    // 保存当前所有数据作为备份，用于撤销操作
                    const backupData = {
                        exams: localStorage.getItem('exams'),
                        fullMarks: localStorage.getItem('fullMarks'),
                        profile: localStorage.getItem('profile'),
                        goals: localStorage.getItem('goals')
                    };
                    
                    // 清空所有数据
                    localStorage.removeItem('exams');
                    localStorage.removeItem('fullMarks');
                    localStorage.removeItem('profile');
                    localStorage.removeItem('goals');
                    
                    // 确保exams被设置为空数组，而不是仅被移除
                    localStorage.setItem('exams', JSON.stringify([]));
                    localStorage.setItem('fullMarks', JSON.stringify({}));
                    localStorage.setItem('profile', JSON.stringify({}));
                    localStorage.setItem('goals', JSON.stringify({}));
                    
                    // 刷新界面
                    UI.exams = [];
                    UI.fullMarks = { chinese: 150, math: 150, english: 150, physics: 100, chemistry: 100, biology: 100 };
                    UI.studentInfo = {};
                    
                    // 重新加载考试数据
                    UI.loadExams([]);
                    UI.updateDashboard();
                    UI.updateAnalysisPage();
                    if (typeof UI.updateProfileInfo === 'function') {
                        UI.updateProfileInfo();
                    }
                    

                    
                    // 存储撤销操作
                    UI.undoStack = {
                        type: 'clear',
                        backup: backupData,
                        execute: () => {
                            // 执行实际清空操作
                            UI.undoStack = null;
                        },
                        undo: () => {
                            // 清除定时器
                            if (UI.notificationTimeout) {
                                clearTimeout(UI.notificationTimeout);
                                UI.notificationTimeout = null;
                            }
                            if (UI.progressInterval) {
                                clearInterval(UI.progressInterval);
                                UI.progressInterval = null;
                            }
                            
                            // 隐藏当前通知
                            UI.hideNotification();
                            
                            // 执行撤销操作 - 恢复所有备份的数据
                            if (backupData.exams) localStorage.setItem('exams', backupData.exams);
                            if (backupData.fullMarks) localStorage.setItem('fullMarks', backupData.fullMarks);
                            if (backupData.profile) localStorage.setItem('profile', backupData.profile);
                            if (backupData.goals) localStorage.setItem('goals', backupData.goals);
                            
                            // 重新加载数据到UI
                            UI.loadExams();
                            UI.loadFullMarks();
                            UI.loadStudentInfo();
                            UI.updateDashboard();
                            UI.updateAnalysisPage();
                            if (typeof UI.updateProfileInfo === 'function') {
                                UI.updateProfileInfo();
                            }
                            
                            // 延迟显示撤销成功通知
                            setTimeout(() => {
                                UI.showNotification('success', '撤销成功', '已恢复所有数据', false);
                            }, 300);
                            
                            UI.undoStack = null;
                        }
                    };
                    
                    // 显示可撤销的通知
                    UI.showNotification('success', '清空成功', '5秒后将永久清空，点击撤销可恢复', true);
                    
                    // 延迟执行实际的永久清空（即清除undoStack）
                    setTimeout(() => {
                        if (UI.undoStack && UI.undoStack.type === 'clear') {
                            UI.undoStack.execute();
                        }
                    }, 5000);
                    
                    // 关闭模态框
                    closeClearDataModal();
                }
            });
        }
        
        // 关闭清空数据模态框函数
        function closeClearDataModal() {
            hideModal('clearDataModal');
            
            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        }
        
        // 点击模态框背景关闭
        if (clearDataModal) {
            clearDataModal.addEventListener('click', (event) => {
                if (event.target === clearDataModal) {
                    closeClearDataModal();
                }
            });
        }
    });
// 登录功能
        document.addEventListener('DOMContentLoaded', function() {
            // 登录按钮点击事件
            const loginButton = document.getElementById('loginButton');
            const loginModal = document.getElementById('loginModal');
            const closeLoginModal = document.getElementById('closeLoginModal');
            const loginForm = document.getElementById('loginForm');
            const loginMessage = document.getElementById('loginMessage');

            // 打开登录模态框或执行登出
            if (loginButton && loginModal) {
                loginButton.addEventListener('click', function() {
                    const username = localStorage.getItem('username') || '';
                    
                    if (username) {
                        // 已登录，执行登出
                        if (confirm('确定要登出吗？')) {
                            // 清除所有登录相关存储
                            localStorage.removeItem('username');
                            localStorage.removeItem('password');
                            localStorage.removeItem('autologin');
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('user');
                            localStorage.removeItem('syncData');
                            localStorage.removeItem('lastSyncTime');
                            
                            // 更新登录按钮显示
                            updateLoginButton();
                            
                            // 显示登出成功消息
                            alert('登出成功！');
                        }
                    } else {
                        // 未登录，显示登录模态框
                        loginModal.classList.remove('hidden');
                        
                        // 添加输入事件监听器，当用户输入时移除错误状态
                        const usernameInput = document.getElementById('username');
                        const passwordInput = document.getElementById('password');
                        
                        if (usernameInput) {
                            usernameInput.addEventListener('input', function() {
                                this.classList.remove('input-error');
                                const usernameError = document.getElementById('usernameError');
                                if (usernameError) {
                                    usernameError.textContent = '';
                                    usernameError.classList.add('hidden');
                                }
                            });
                        }
                        
                        if (passwordInput) {
                            passwordInput.addEventListener('input', function() {
                                this.classList.remove('input-error');
                                const passwordError = document.getElementById('passwordError');
                                if (passwordError) {
                                    passwordError.textContent = '';
                                    passwordError.classList.add('hidden');
                                }
                            });
                        }
                    }
                });
            }

            // 关闭登录模态框
            if (closeLoginModal && loginModal) {
                closeLoginModal.addEventListener('click', function() {
                    hideModal('loginModal');
                    resetLoginForm();
                });
            }

            // 点击模态框外部关闭
            if (loginModal) {
                loginModal.addEventListener('click', function(e) {
                    if (e.target === loginModal) {
                        hideModal('loginModal');
                        resetLoginForm();
                    }
                });
            }

            // 登录表单提交
            if (loginForm) {
                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;

                    // 显示加载状态
                    showLoginMessage('登录中...', 'info');

                    try {
                        // 发送登录请求到API
                        const apiUrl = await getApiBaseUrl();
                        const response = await fetch(`${apiUrl}/sync_data`, {
                            method: 'POST',
                            headers: {
                                'x_username': username,
                                'x_password': password
                            }
                        });

                        const result = await response.json();

                        if (result.code === 200) {
                            // 登录成功
                            showLoginMessage('登录成功！', 'success');
                            
                            // 存储用户名和密码到localStorage
                            localStorage.setItem('username', username);
                            localStorage.setItem('password', password);
                            localStorage.setItem('autologin', 'true');
                            
                            // 同时更新Storage对象使用的登录状态和用户信息
                            // 密码加密后存储
                            function encrypt(password) {
                                if (!password) return '';
                                return btoa(password.split('').reverse().join(''));
                            }
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('user', JSON.stringify({ username: username, password: encrypt(password) }));
                            
                            // 存储返回的数据到localStorage并解析
                            if (result.data) {
                                localStorage.setItem('syncData', JSON.stringify(result.data));
                                console.log('同步数据已存储到本地');
                                
                                // 解析同步数据（模拟importData的行为）
                                console.log('开始解析同步数据');
                                try {
                                    // 模拟Storage.importData函数的行为
                                    if (result.data.exams) {
                                        localStorage.setItem('exams', JSON.stringify(result.data.exams));
                                    }
                                    if (result.data.profile) {
                                        localStorage.setItem('profile', JSON.stringify(result.data.profile));
                                    }
                                    if (result.data.goals) {
                                        localStorage.setItem('goals', JSON.stringify(result.data.goals));
                                    }
                                    if (result.data.fullMarks) {
                                        localStorage.setItem('fullMarks', JSON.stringify(result.data.fullMarks));
                                    }
                                    console.log('同步数据解析成功');
                                } catch (error) {
                                    console.error('同步数据解析失败', error);
                                }
                            } else {
                                console.log('返回结果中没有data字段');
                            }
                            
                            // 保存当前位置后刷新页面
                            setTimeout(() => {
                                saveCurrentLocation();
                                window.location.reload();
                            }, 1000);
                        } else {
                        // 登录失败
                        console.log('登录失败:', result.msg);
                        
                        // 隐藏登录中消息
                        document.getElementById('loginMessage').style.display = 'none';
                        
                        // 重置所有错误状态
                        resetErrorStates();
                        
                        // 检查是否有锁定时间
                        if (result.lockUntil) {
                            // 处理登录锁定
                            handleLoginLock(result.lockUntil);
                        } else {
                            // 根据错误信息确定哪个输入框有问题
                            const usernameInput = document.getElementById('username');
                            const passwordInput = document.getElementById('password');
                            const usernameError = document.getElementById('usernameError');
                            const passwordError = document.getElementById('passwordError');
                            
                            // 假设错误信息包含用户名或密码的信息
                            // 这里需要根据实际的错误信息格式进行调整
                            if (result.msg.includes('用户名') || result.msg.includes('用户不存在')) {
                                // 用户名错误
                                usernameInput.classList.add('input-error');
                                usernameError.textContent = result.msg;
                                usernameError.classList.remove('hidden');
                            } else if (result.msg.includes('密码') || result.msg.includes('密码错误')) {
                                // 密码错误
                                passwordInput.classList.add('input-error');
                                passwordError.textContent = result.msg;
                                passwordError.classList.remove('hidden');
                            } else {
                                // 其他错误，显示在密码框旁边
                                passwordInput.classList.add('input-error');
                                passwordError.textContent = result.msg;
                                passwordError.classList.remove('hidden');
                            }
                        }
                    }
                    } catch (error) {
                        console.error('登录请求失败:', error);
                        showLoginMessage('登录失败：网络错误', 'error');
                    }
                });
            }

            // 检查自动登录
        checkAutoLogin();

        // 更新登录按钮显示
        updateLoginButton();

        // 刷新数据按钮点击事件
        const refreshDataBtn = document.getElementById('refreshDataBtn');
        if (refreshDataBtn) {
            refreshDataBtn.addEventListener('click', async function() {
                const username = localStorage.getItem('username');
                const password = localStorage.getItem('password');
                
                if (!username || !password) {
                    alert('请先登录');
                    return;
                }
                
                // 显示加载状态
                refreshDataBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>刷新中...</span>';
                refreshDataBtn.disabled = true;
                
                try {
                    // 直接从服务器同步数据
                    console.log('开始同步数据');
                    const apiUrl = await getApiBaseUrl();
                    const syncResponse = await fetch(`${apiUrl}/sync_data`, {
                        method: 'POST',
                        headers: {
                            'x_username': username,
                            'x_password': password
                        }
                    });
                    
                    const syncResult = await syncResponse.json();
                    console.log('sync_data 接口响应:', syncResult);
                    
                    if (syncResult.code === 200 && syncResult.data) {
                        // 存储返回的数据到 localStorage
                        localStorage.setItem('syncData', JSON.stringify(syncResult.data));
                        console.log('同步数据已存储到本地');
                        
                        // 解析同步数据（模拟 importData 的行为）
                        console.log('开始解析同步数据');
                        console.log('同步数据内容:', JSON.stringify(syncResult.data, null, 2));
                        try {
                            // 模拟 Storage.importData 函数的行为
                            if (syncResult.data.exams) {
                                localStorage.setItem('exams', JSON.stringify(syncResult.data.exams));
                                console.log('解析并存储 exams 数据:', syncResult.data.exams.length, '条记录');
                            }
                            if (syncResult.data.profile) {
                                localStorage.setItem('profile', JSON.stringify(syncResult.data.profile));
                                console.log('解析并存储 profile 数据:', syncResult.data.profile);
                            }
                            if (syncResult.data.goals) {
                                localStorage.setItem('goals', JSON.stringify(syncResult.data.goals));
                                console.log('解析并存储 goals 数据:', syncResult.data.goals);
                            }
                            if (syncResult.data.fullMarks) {
                                localStorage.setItem('fullMarks', JSON.stringify(syncResult.data.fullMarks));
                                console.log('解析并存储 fullMarks 数据:', syncResult.data.fullMarks);
                            }
                            console.log('同步数据解析成功');
                            
                            UI.showNotification('success', '刷新成功', '数据已同步，正在刷新页面...');
                            
                            // 保存当前位置后刷新页面
                            setTimeout(() => {
                                saveCurrentLocation();
                                window.location.reload();
                            }, 500);
                        } catch (error) {
                            console.error('同步数据解析失败', error);
                            UI.showNotification('error', '解析失败', '同步数据解析失败');
                        }
                    } else {
                        console.error('同步数据失败', syncResult);
                        UI.showNotification('error', '刷新失败', syncResult.msg || '同步数据时出错');
                    }
                } catch (error) {
                    console.error('刷新数据失败', error);
                    UI.showNotification('error', '刷新失败', '网络错误或服务器异常');
                } finally {
                    // 恢复按钮状态
                    refreshDataBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i><span>刷新数据</span>';
                    refreshDataBtn.disabled = false;
                }
            });
        }

        // 重置错误状态
        function resetErrorStates() {
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const usernameError = document.getElementById('usernameError');
            const passwordError = document.getElementById('passwordError');
            
            // 重置用户名输入框
            if (usernameInput) {
                usernameInput.classList.remove('input-error');
            }
            if (usernameError) {
                usernameError.textContent = '';
                usernameError.classList.add('hidden');
            }
            
            // 重置密码输入框
            if (passwordInput) {
                passwordInput.classList.remove('input-error');
            }
            if (passwordError) {
                passwordError.textContent = '';
                passwordError.classList.add('hidden');
            }
        }

        // 重置登录表单
        function resetLoginForm() {
            document.getElementById('loginForm').reset();
            document.getElementById('loginMessage').style.display = 'none';
            resetErrorStates();
        }

        // 显示登录消息
        function showLoginMessage(message, type) {
            // 只有在登录中或登录成功时显示消息，错误信息在输入框旁边显示
            if (type !== 'error') {
                const loginMessage = document.getElementById('loginMessage');
                loginMessage.textContent = message;
                loginMessage.style.display = 'block';
                
                // 设置消息样式
                if (type === 'success') {
                    loginMessage.style.backgroundColor = 'rgba(163, 228, 215, 0.2)';
                    loginMessage.style.color = '#2ecc71';
                    loginMessage.style.border = '1px solid #2ecc71';
                } else {
                    loginMessage.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
                    loginMessage.style.color = '#3498db';
                    loginMessage.style.border = '1px solid #3498db';
                }
            }
        }
        
        // 处理登录锁定
        function handleLoginLock(lockUntil) {
            const loginButton = document.querySelector('#loginForm button[type="submit"]');
            const loginMessage = document.getElementById('loginMessage');
            
            // 禁用登录按钮
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.classList.add('bg-gray-400');
                loginButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            }
            
            // 开始倒计时
            const countdownInterval = setInterval(() => {
                const now = Date.now();
                const remainingTime = Math.max(0, lockUntil - now);
                
                if (remainingTime > 0) {
                    // 计算分秒
                    const minutes = Math.floor(remainingTime / 60000);
                    const seconds = Math.floor((remainingTime % 60000) / 1000);
                    
                    // 显示倒计时
                    if (loginMessage) {
                        loginMessage.textContent = `登录失败次数过多，请等待 ${minutes}分${seconds}秒后重试`;
                        loginMessage.style.display = 'block';
                        loginMessage.style.backgroundColor = 'rgba(248, 113, 113, 0.2)';
                        loginMessage.style.color = '#ef4444';
                        loginMessage.style.border = '1px solid #ef4444';
                    }
                } else {
                    // 锁定时间结束
                    clearInterval(countdownInterval);
                    
                    // 启用登录按钮
                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.classList.remove('bg-gray-400');
                        loginButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
                    }
                    
                    // 清除消息
                    if (loginMessage) {
                        loginMessage.style.display = 'none';
                    }
                }
            }, 1000);
            
            // 初始执行一次
            const now = Date.now();
            const remainingTime = Math.max(0, lockUntil - now);
            if (remainingTime > 0) {
                const minutes = Math.floor(remainingTime / 60000);
                const seconds = Math.floor((remainingTime % 60000) / 1000);
                
                if (loginMessage) {
                    loginMessage.textContent = `登录失败次数过多，请等待 ${minutes}分${seconds}秒后重试`;
                    loginMessage.style.display = 'block';
                    loginMessage.style.backgroundColor = 'rgba(248, 113, 113, 0.2)';
                    loginMessage.style.color = '#ef4444';
                    loginMessage.style.border = '1px solid #ef4444';
                }
            }
        }

        // 检查自动登录
        async function checkAutoLogin() {
            const autologin = localStorage.getItem('autologin') === 'true';
            const username = localStorage.getItem('username');
            const password = localStorage.getItem('password');

            if (autologin && username && password) {
                try {
                    // 发送自动登录请求
                    const apiUrl = await getApiBaseUrl();
                    const response = await fetch(`${apiUrl}/sync_data`, {
                        method: 'POST',
                        headers: {
                            'x_username': username,
                            'x_password': password
                        }
                    });

                    const result = await response.json();

                    if (result.code === 200) {
                        // 自动登录成功
                        console.log('自动登录成功');
                        
                        // 同时更新Storage对象使用的登录状态和用户信息
                        // 密码加密后存储
                        function encrypt(password) {
                            if (!password) return '';
                            return btoa(password.split('').reverse().join(''));
                        }
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('user', JSON.stringify({ username: username, password: encrypt(password) }));
                        
                        // 存储返回的数据到localStorage并解析
                        if (result.data) {
                            localStorage.setItem('syncData', JSON.stringify(result.data));
                            console.log('同步数据已存储到本地');
                            
                            // 解析同步数据（模拟importData的行为）
                            console.log('开始解析同步数据');
                            try {
                                // 模拟Storage.importData函数的行为
                                if (result.data.exams) {
                                    localStorage.setItem('exams', JSON.stringify(result.data.exams));
                                }
                                if (result.data.profile) {
                                    localStorage.setItem('profile', JSON.stringify(result.data.profile));
                                }
                                if (result.data.goals) {
                                    localStorage.setItem('goals', JSON.stringify(result.data.goals));
                                }
                                if (result.data.fullMarks) {
                                    localStorage.setItem('fullMarks', JSON.stringify(result.data.fullMarks));
                                }
                                console.log('同步数据解析成功');
                            } catch (error) {
                                console.error('同步数据解析失败', error);
                            }
                        } else {
                            console.log('返回结果中没有data字段');
                        }

                        // 更新登录按钮显示
                        updateLoginButton();
                        

                    } else {
                        // 自动登录失败，清除存储
                        localStorage.removeItem('username');
                        localStorage.removeItem('password');
                        localStorage.removeItem('syncData');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('自动登录失败:', error);
                    // 清除存储
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                    localStorage.removeItem('syncData');
                    localStorage.removeItem('user');
                }
            }
        }

        // 更新登录按钮显示
        function updateLoginButton() {
            const loginButton = document.getElementById('loginButton');
            const refreshDataBtn = document.getElementById('refreshDataBtn');
            const username = localStorage.getItem('username');

            if (username) {
                loginButton.innerHTML = `<i class="fas fa-user-check mr-1"></i> ${username}`;
                // 显示刷新数据按钮
                if (refreshDataBtn) {
                    refreshDataBtn.style.display = 'flex';
                }
            } else {
                loginButton.innerHTML = '<i class="fas fa-user mr-1"></i> 登录';
                // 隐藏刷新数据按钮
                if (refreshDataBtn) {
                    refreshDataBtn.style.display = 'none';
                }
            }
        }

        // 成绩分析页面功能
        function initAnalysisPage() {
            // 根据选科设置显示/隐藏科目按钮
            const electiveSubjects = Storage.getElectiveSubjects();
            const allElectiveButtons = document.querySelectorAll('.subject-select-btn');
            allElectiveButtons.forEach(button => {
                const subject = button.getAttribute('data-subject');
                // 语数英总是显示，其他科目根据选科决定样式
                if (!['chinese', 'math', 'english'].includes(subject)) {
                    if (electiveSubjects.includes(subject)) {
                        button.style.display = '';
                        button.classList.remove('btn-outline-secondary');
                        button.classList.add('btn-outline-primary');
                    } else {
                        // 非选科保留但变成次级按钮
                        button.style.display = '';
                        button.classList.remove('btn-outline-primary');
                        button.classList.add('btn-outline-secondary');
                        button.style.opacity = '0.7';
                    }
                }
            });
            
            // 标签页切换功能
            const tabs = document.querySelectorAll('#analysisTabs button');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // 更新标签页状态
                    tabs.forEach(t => {
                        t.classList.remove('border-primary', 'active');
                        t.classList.add('border-transparent');
                        t.setAttribute('aria-selected', 'false');
                        t.classList.remove('text-gray-700', 'dark:text-gray-200');
                        t.classList.add('text-gray-700', 'dark:text-gray-300');
                    });
                    this.classList.add('border-primary', 'active');
                    this.classList.remove('border-transparent');
                    this.setAttribute('aria-selected', 'true');
                    this.classList.remove('text-gray-700', 'dark:text-gray-300');
                    this.classList.add('text-gray-700', 'dark:text-gray-200');
                    
                    // 显示对应内容
                    const tabContents = document.querySelectorAll('.tab-content');
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        content.classList.add('hidden');
                    });
                    document.getElementById(tabId).classList.add('active');
                    document.getElementById(tabId).classList.remove('hidden');
                    
                    // 如果切换到全览标签页，初始化图表
                    if (tabId === 'overview') {
                        initOverviewCharts();
                    }
                });
            });

            // 科目选择功能
            const subjectButtons = document.querySelectorAll('.subject-select-btn');
            subjectButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const subject = this.getAttribute('data-subject');
                    const subjectName = this.textContent;
                    
                    // 更新选中状态
                    subjectButtons.forEach(btn => btn.classList.remove('btn-primary'));
                    this.classList.add('btn-primary');
                    
                    // 更新科目名称
                    document.getElementById('selectedSubjectName').textContent = subjectName;
                    
                    // 加载科目详情
                    loadSubjectDetail(subject, subjectName);
                });
            });
            
            // 成绩分析页面学期筛选下拉框交互
            const analysisSemesterDropdownBtn = document.getElementById('analysisSemesterDropdownBtn');
            const analysisSemesterDropdownMenu = document.getElementById('analysisSemesterDropdownMenu');
            const analysisSemesterDropdownClose = document.getElementById('analysisSemesterDropdownClose');
            
            analysisSemesterDropdownBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                // 如果菜单已经打开，再次点击则关闭
                if (analysisSemesterDropdownMenu && !analysisSemesterDropdownMenu.classList.contains('hidden')) {
                    analysisSemesterDropdownMenu.classList.add('hidden');
                    return;
                }
                
                const rect = analysisSemesterDropdownBtn.getBoundingClientRect();
                const margin = 10;
                
                // 先设置基础样式并显示菜单，以便测量其实际尺寸
                analysisSemesterDropdownMenu.removeAttribute('style');
                analysisSemesterDropdownMenu.style.position = 'fixed';
                analysisSemesterDropdownMenu.style.top = '0';
                analysisSemesterDropdownMenu.style.left = '0';
                analysisSemesterDropdownMenu.style.visibility = 'hidden';
                analysisSemesterDropdownMenu.style.zIndex = '9999';
                analysisSemesterDropdownMenu.classList.remove('hidden');
                
                // 获取菜单实际尺寸
                const menuRect = analysisSemesterDropdownMenu.getBoundingClientRect();
                const menuWidth = menuRect.width;
                const menuHeight = menuRect.height;
                
                // 计算水平位置：优先让菜单右边缘对齐按钮右边缘
                let left = rect.right - menuWidth;
                // 检查左边是否超出屏幕
                if (left < margin) left = margin;
                // 检查右边是否超出屏幕
                if (left + menuWidth > window.innerWidth - margin) {
                    left = window.innerWidth - menuWidth - margin;
                    // 如果连这个位置都不行（菜单比屏幕宽），贴左边
                    if (left < margin) left = margin;
                }
                
                // 计算垂直位置：优先放在按钮下方
                let top = rect.bottom + 5;
                if (top + menuHeight > window.innerHeight - margin) {
                    // 下方放不下，尝试放按钮上方
                    top = rect.top - menuHeight - 5;
                    if (top < margin) {
                        // 上方也放不下，贴顶部，设置最大高度和滚动
                        top = margin;
                        analysisSemesterDropdownMenu.style.maxHeight = (window.innerHeight - margin * 2) + 'px';
                        analysisSemesterDropdownMenu.style.overflowY = 'auto';
                    }
                }
                
                // 设置最终位置
                analysisSemesterDropdownMenu.style.left = left + 'px';
                analysisSemesterDropdownMenu.style.top = top + 'px';
                analysisSemesterDropdownMenu.style.visibility = 'visible';
                analysisSemesterDropdownMenu.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
            });
            
            // 关闭按钮
            analysisSemesterDropdownClose?.addEventListener('click', () => {
                analysisSemesterDropdownMenu?.classList.add('hidden');
            });
            
            // 全选复选框
            const selectAllAnalysisSemesters = document.getElementById('selectAllAnalysisSemesters');
            selectAllAnalysisSemesters?.addEventListener('change', (e) => {
                document.querySelectorAll('.analysis-semester-checkbox').forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
                updateAnalysisSemesterDropdownText();
                initOverviewCharts();
            });
            
            // 学期筛选事件（复选框）
            document.querySelectorAll('.analysis-semester-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateAnalysisSemesterDropdownText();
                    initOverviewCharts();
                });
            });
            
            // 点击外部关闭下拉框
            document.addEventListener('click', (e) => {
                if (analysisSemesterDropdownMenu && !analysisSemesterDropdownMenu.contains(e.target) && e.target !== analysisSemesterDropdownBtn) {
                    analysisSemesterDropdownMenu.classList.add('hidden');
                }
            });
            
            // 更新分析页面学期下拉框显示文本
            function updateAnalysisSemesterDropdownText() {
                const selectedSemesters = Array.from(document.querySelectorAll('.analysis-semester-checkbox:checked'))
                    .map(checkbox => checkbox.value);
                
                const dropdownText = document.getElementById('analysisSemesterDropdownText');
                if (dropdownText) {
                    if (selectedSemesters.length === 0) {
                        dropdownText.textContent = '全部学期';
                    } else if (selectedSemesters.length === 6) {
                        dropdownText.textContent = '全部学期';
                    } else {
                        dropdownText.textContent = selectedSemesters.join('、');
                    }
                }
            }
            
            // 自动初始化全览标签页的图表
            initOverviewCharts();
        }

        // 初始化全览页面图表
        function initOverviewCharts() {
            // 获取选中的学期（复选框形式）
            const selectedSemesters = Array.from(document.querySelectorAll('.analysis-semester-checkbox:checked'))
                .map(checkbox => checkbox.value);
            
            let exams = Storage.getExams().sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // 应用学期筛选（多选）
            if (selectedSemesters.length > 0) {
                exams = exams.filter(exam => selectedSemesters.includes(exam.semester));
            }
            
            const electiveSubjects = Storage.getElectiveSubjects();
            const hasElective = electiveSubjects.length > 0;
            
            // 总分趋势图
            const totalScoreCtx = document.getElementById('totalScoreTrendChart');
            if (totalScoreCtx && exams.length > 0) {
                // 销毁旧图表实例
                if (window.totalScoreTrendChart && typeof window.totalScoreTrendChart.destroy === 'function') {
                    window.totalScoreTrendChart.destroy();
                }
                
                const examNames = exams.map(exam => exam.name);
                // 如果有选科，显示选科总分，否则显示总分
                const totalScores = hasElective 
                    ? exams.map(exam => Storage.calculateElectiveTotalScore(exam) || 0)
                    : exams.map(exam => exam.totalScore || 0);
                const classRanks = exams.map(exam => exam.rankClass || null);
                const gradeRanks = exams.map(exam => exam.rankGrade || null);
                
                const datasets = [
                    {
                        label: hasElective ? '选科总分' : '总分',
                        data: totalScores,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: '班级排名',
                        data: classRanks,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y1'
                    },
                    {
                        label: '年级排名',
                        data: gradeRanks,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ];
                
                window.totalScoreTrendChart = new Chart(totalScoreCtx, {
                    type: 'line',
                    data: {
                        labels: examNames,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: '分数'
                                },
                                beginAtZero: false,
                                min: totalScores.length > 0 ? Math.min(...totalScores) - 50 : 0
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: '排名'
                                },
                                beginAtZero: false,
                                reverse: true,
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        }
                    }
                });
            }

            // 各科雷达图
            const radarCtx = document.getElementById('subjectRadarChart');
            if (radarCtx && exams.length > 0) {
                // 销毁旧图表实例
                if (window.subjectRadarChart && typeof window.subjectRadarChart.destroy === 'function') {
                    window.subjectRadarChart.destroy();
                }
                
                // 获取最近一次考试的数据
                const latestExam = exams[exams.length - 1];
                
                // 根据选科过滤科目
                let subjects, subjectKeys;
                if (hasElective) {
                    subjects = ['语文', '数学', '英语'];
                    subjectKeys = ['chinese', 'math', 'english'];
                    electiveSubjects.forEach(s => {
                        const idx = ['physics', 'chemistry', 'biology', 'politics', 'history', 'geography'].indexOf(s);
                        if (idx >= 0) {
                            subjects.push(['物理', '化学', '生物', '政治', '历史', '地理'][idx]);
                            subjectKeys.push(s);
                        }
                    });
                } else {
                    subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
                    subjectKeys = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
                }
                
                // 计算得分率
                const scoreRates = subjectKeys.map(key => {
                    if (latestExam.subjects && latestExam.fullMarks && latestExam.subjects[key] && latestExam.fullMarks[key]) {
                        return latestExam.subjects[key] / latestExam.fullMarks[key];
                    }
                    return 0;
                });
                
                // 计算班级排名率（排名率越低越好，转换为1-排名率）
                const classRankRates = subjectKeys.map(key => {
                    if (latestExam.subjectRankClass && latestExam.subjectRankClass[key]) {
                        return 1 - (latestExam.subjectRankClass[key] / 51);
                    }
                    return 0;
                });
                
                // 计算年级排名率（排名率越低越好，转换为1-排名率）
                const gradeRankRates = subjectKeys.map(key => {
                    if (latestExam.subjectRankGrade && latestExam.subjectRankGrade[key]) {
                        return 1 - (latestExam.subjectRankGrade[key] / 620);
                    }
                    return 0;
                });
                
                window.subjectRadarChart = new Chart(radarCtx, {
                    type: 'radar',
                    data: {
                        labels: subjects,
                        datasets: [
                            {
                                label: '得分率',
                                data: scoreRates,
                                borderColor: '#3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)'
                            },
                            {
                                label: '班级排名率',
                                data: classRankRates,
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)'
                            },
                            {
                                label: '年级排名率',
                                data: gradeRankRates,
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.2)'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 1,
                                ticks: {
                                    callback: function(value) {
                                        return value * 100 + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // 生成学习建议
            generateStudyAdvice();
        }

        // 生成学习建议
        function generateStudyAdvice() {
            const exams = Storage.getExams();
            const electiveSubjects = Storage.getElectiveSubjects();
            
            if (exams.length === 0) {
                document.getElementById('strengthSubjects').textContent = '暂无数据';
                document.getElementById('weakSubjects').textContent = '暂无数据';
                document.getElementById('generalAdvice').textContent = '请先录入考试数据，系统将为你生成个性化的学习建议。';
                return;
            }
            
            // 获取最近一次考试的数据（按日期排序）
            const sortedExams = exams.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestExam = sortedExams[0];
            
            // 根据选科确定要分析的科目
            let subjectKeys = ['chinese', 'math', 'english', ...electiveSubjects];
            subjectKeys = [...new Set(subjectKeys)]; // 去重
            
            const subjectNames = {
                'chinese': '语文',
                'math': '数学',
                'english': '英语',
                'physics': '物理',
                'chemistry': '化学',
                'biology': '生物',
                'politics': '政治',
                'history': '历史',
                'geography': '地理'
            };
            
            const subjectScores = [];
            
            // 计算各科得分率
            subjectKeys.forEach(key => {
                if (latestExam.subjects && latestExam.fullMarks && latestExam.subjects[key] && latestExam.fullMarks[key]) {
                    const scoreRate = latestExam.subjects[key] / latestExam.fullMarks[key];
                    subjectScores.push({ name: subjectNames[key], key: key, score: scoreRate });
                }
            });
            
            // 检查是否有有效科目数据
            if (subjectScores.length === 0) {
                document.getElementById('strengthSubjects').textContent = '暂无数据';
                document.getElementById('weakSubjects').textContent = '暂无数据';
                document.getElementById('generalAdvice').textContent = '请先录入完整的考试数据，系统将为你生成个性化的学习建议。';
                return;
            }
            
            // 排序科目得分率
            subjectScores.sort((a, b) => b.score - a.score);
            
            // 确定优势科目和弱势科目（最多显示2个）
            const topSubjects = subjectScores.slice(0, Math.min(2, subjectScores.length)).map(s => s.name).join('、');
            const weakSubjects = subjectScores.slice(-Math.min(2, subjectScores.length)).map(s => s.name).join('、');
            
            // 生成建议
            document.getElementById('strengthSubjects').textContent = topSubjects || '暂无数据';
            document.getElementById('weakSubjects').textContent = weakSubjects || '暂无数据';
            
            if (topSubjects && weakSubjects && topSubjects !== weakSubjects) {
                document.getElementById('generalAdvice').textContent = `继续保持${topSubjects}的优势，加强${weakSubjects}的基础知识学习。建议制定合理的学习计划，注重错题整理和知识点巩固。保持积极的学习态度，相信你会取得更大的进步！`;
            } else {
                document.getElementById('generalAdvice').textContent = '继续保持当前的学习状态，注重各科的均衡发展。建议制定合理的学习计划，注重错题整理和知识点巩固。';
            }
        }

        // 加载科目详情
        function loadSubjectDetail(subject, subjectName) {
            const exams = Storage.getExams().sort((a, b) => new Date(a.date) - new Date(b.date));
            const electiveSubjects = Storage.getElectiveSubjects();
            const isUnselectedElective = Storage.isUnselectedElective(subject);
            
            if (exams.length === 0) {
                document.getElementById('subjectScore').textContent = '--';
                document.getElementById('subjectClassRank').textContent = '--';
                document.getElementById('subjectGradeRank').textContent = '--';
                document.getElementById('subjectAdvice').innerHTML = '<p>请先录入考试数据</p>';
                document.getElementById('subjectStatusText').textContent = '--';
                return;
            }
            
            // 获取最近一次考试的科目数据
            const latestExam = exams[exams.length - 1];
            let score = 0;
            let classRank = '--';
            let gradeRank = '--';
            let status = 0;
            let advice = '';
            
            if (latestExam.subjects && latestExam.subjects[subject]) {
                score = latestExam.subjects[subject];
            }
            
            if (latestExam.subjectRankClass && latestExam.subjectRankClass[subject]) {
                classRank = latestExam.subjectRankClass[subject];
            }
            
            if (latestExam.subjectRankGrade && latestExam.subjectRankGrade[subject]) {
                gradeRank = latestExam.subjectRankGrade[subject];
            }
            
            // 计算平均排名（使用所有考试的排名数据）
            let totalClassRank = 0;
            let totalGradeRank = 0;
            let classRankCount = 0;
            let gradeRankCount = 0;
            
            exams.forEach(exam => {
                if (exam.subjectRankClass && exam.subjectRankClass[subject]) {
                    totalClassRank += exam.subjectRankClass[subject];
                    classRankCount++;
                }
                if (exam.subjectRankGrade && exam.subjectRankGrade[subject]) {
                    totalGradeRank += exam.subjectRankGrade[subject];
                    gradeRankCount++;
                }
            });
            
            // 计算平均排名得分（排名越小越好，转换为0-1的得分）
            let avgRankScore = 0;
            if (classRankCount > 0 || gradeRankCount > 0) {
                // 使用班级排名和年级排名的平均值
                let avgClassRank = classRankCount > 0 ? totalClassRank / classRankCount : 26; // 假设班级有51人，默认排名26
                let avgGradeRank = gradeRankCount > 0 ? totalGradeRank / gradeRankCount : 310; // 假设年级有620人，默认排名310
                
                // 转换为0-1的得分（排名越小得分越高）
                const classRankScore = 1 - (avgClassRank / 51); // 班级51人
                const gradeRankScore = 1 - (avgGradeRank / 620); // 年级620人
                
                // 综合得分（班级排名权重更高）
                avgRankScore = (classRankScore * 0.6 + gradeRankScore * 0.4);
                // 确保得分在0-1之间
                avgRankScore = Math.max(0, Math.min(1, avgRankScore));
            }
            
            // 如果没有排名数据，使用得分率作为备用
            if (avgRankScore === 0 && latestExam.subjects && latestExam.fullMarks && latestExam.subjects[subject] && latestExam.fullMarks[subject]) {
                avgRankScore = latestExam.subjects[subject] / latestExam.fullMarks[subject];
            }
            
            status = avgRankScore;
            
            // 生成建议（未选科目不显示建议）
            if (isUnselectedElective) {
                advice = '<p class="text-gray-500">未选科目，暂无建议</p>';
            } else {
                if (status >= 0.9) {
                    advice = `${subjectName}成绩优秀，继续保持。建议挑战一些难题，拓展解题思路，保持领先地位。`;
                } else if (status >= 0.8) {
                    advice = `${subjectName}成绩良好，建议加强知识点的系统性整理，多做练习题巩固知识点。`;
                } else if (status >= 0.7) {
                    advice = `${subjectName}成绩中等，建议注重基础知识的学习，多做练习题，提高解题能力。`;
                } else {
                    advice = `${subjectName}成绩有待提高，建议加强基础知识学习，多做练习题，注重理解概念和公式的应用。`;
                }
                advice = `<p>${advice}</p>`;
            }
            
            // 更新建议
            document.getElementById('subjectAdvice').innerHTML = advice;
            
            // 更新学习状态
            const statusBar = document.getElementById('subjectStatusBar');
            const statusText = document.getElementById('subjectStatusText');
            statusBar.style.width = (status * 100) + '%';
            
            // 清空之前的状态文本类
            statusText.className = 'ml-3 text-sm font-medium';
            
            if (status >= 0.9) {
                statusText.textContent = '优秀';
                statusText.classList.add('text-success');
            } else if (status >= 0.8) {
                statusText.textContent = '良好';
                statusText.classList.add('text-primary');
            } else if (status >= 0.7) {
                statusText.textContent = '中等';
                statusText.classList.add('text-warning');
            } else {
                // 需要加强的区间改成稍弱
                statusText.textContent = '稍弱';
                statusText.classList.add('text-danger');
            }
            
            // 初始化排名趋势图
            initSubjectRankChart(subject);
        }

        // 初始化科目排名趋势图
        function initSubjectRankChart(subject) {
            const ctx = document.getElementById('subjectRankTrendChart');
            if (!ctx) return;
            
            // 销毁旧图表实例
            if (window.subjectRankChart) {
                window.subjectRankChart.destroy();
            }
            
            const exams = Storage.getExams().sort((a, b) => new Date(a.date) - new Date(b.date));
            if (exams.length === 0) return;
            
            const examNames = exams.map(exam => exam.name);
            const classRanks = exams.map(exam => {
                return exam.subjectRankClass && exam.subjectRankClass[subject] ? exam.subjectRankClass[subject] : null;
            });
            const gradeRanks = exams.map(exam => {
                return exam.subjectRankGrade && exam.subjectRankGrade[subject] ? exam.subjectRankGrade[subject] : null;
            });
            const scores = exams.map(exam => {
                return exam.subjects && exam.subjects[subject] ? exam.subjects[subject] : null;
            });
            
            window.subjectRankChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: examNames,
                    datasets: [
                        {
                            label: '分数',
                            data: scores,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            yAxisID: 'y'
                        },
                        {
                            label: '班级排名',
                            data: classRanks,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            yAxisID: 'y1'
                        },
                        {
                            label: '年级排名',
                            data: gradeRanks,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: '分数'
                            },
                            beginAtZero: false
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: '排名'
                            },
                            beginAtZero: false,
                            reverse: true,
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            });
        }

        // 初始化仪表盘页面
        function initDashboardPage() {
            // 更新问候语
            updateGreeting();
            
            // 加载最近一次考试
            loadLatestExam();
            
            // 加载一言
            loadHitokoto();
            
            // 绑定查看全部按钮事件
            document.getElementById('viewAllExamsBtn').addEventListener('click', function() {
                if (UI && UI.navigateTo) {
                    UI.navigateTo('records');
                }
            });
            
            // 绑定去录入按钮事件
            document.getElementById('goToInputBtn').addEventListener('click', function() {
                if (UI && UI.navigateTo) {
                    UI.navigateTo('input');
                }
            });
        }
        
        // 更新问候语
        function updateGreeting() {
            const now = new Date();
            const hour = now.getHours();
            let timeGreeting = '';
            
            if (hour >= 5 && hour < 6) {
                timeGreeting = '凌晨';
            } else if (hour >= 6 && hour < 8) {
                timeGreeting = '清晨';
            } else if (hour >= 8 && hour < 11) {
                timeGreeting = '上午';
            } else if (hour >= 11 && hour < 13) {
                timeGreeting = '中午';
            } else if (hour >= 13 && hour < 15) {
                timeGreeting = '午后';
            } else if (hour >= 15 && hour < 18) {
                timeGreeting = '下午';
            } else if (hour >= 18 && hour < 20) {
                timeGreeting = '傍晚';
            } else if (hour >= 20 && hour < 22) {
                timeGreeting = '晚上';
            } else if (hour >= 22 && hour < 24) {
                timeGreeting = '深夜';
            } else {
                timeGreeting = '凌晨';
            }
            
            const profile = Storage.getProfile();
            const username = profile.name || '欢迎使用';
            const greetingElement = document.getElementById('greeting');
            greetingElement.textContent = `${timeGreeting}好，${username}`;
        }
        
        // 加载最近一次考试
        function loadLatestExam() {
            const exams = Storage.getExams();
            if (exams.length === 0) {
                document.getElementById('latestExamScore').textContent = '--';
                return;
            }
            
            // 按日期排序，取最新的一次考试
            const latestExam = exams.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const scoreElement = document.getElementById('latestExamScore');
            scoreElement.textContent = latestExam.totalScore || '--';
        }
        
        // 加载一言
        function loadHitokoto() {
            fetch('https://v1.hitokoto.cn/?c=i&c=k')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('hitokoto').textContent = data.hitokoto;
                    document.getElementById('hitokotoFrom').textContent = `—— ${data.from || '一言'}`;
                })
                .catch(error => {
                    console.error('加载一言失败:', error);
                    document.getElementById('hitokoto').textContent = '愿你拥有美好的一天';
                    document.getElementById('hitokotoFrom').textContent = '—— 系统';
                });
        }

        // 确保所有函数都是全局可访问的
        window.initDashboardPage = initDashboardPage;
        window.initAnalysisPage = initAnalysisPage;
        
        // 页面加载完成后立即初始化仪表盘
        initDashboardPage();
    });