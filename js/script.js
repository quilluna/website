// 导航菜单数据 - 统一管理移动端和桌面端导航项
const navItems = [
    { id: 'dashboard', name: '仪表盘', icon: 'fa-solid fa-chart-line', href: '#dashboard' },
    { id: 'input', name: '成绩录入', icon: 'fa-solid fa-pen-to-square', href: '#input' },
    { id: 'records', name: '成绩记录', icon: 'fa-solid fa-list', href: '#records' },
    { id: 'analysis', name: '成绩分析', icon: 'fa-solid fa-chart-bar', href: '#analysis' },
    { id: 'profile', name: '个人档案', icon: 'fa-solid fa-user-circle', href: '#profile' }
];

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
    saveExam(exam) {
        const exams = this.getExams();
        exams.push(exam);
        localStorage.setItem('exams', JSON.stringify(exams));
        return true;
    },
    
    // 添加考试记录（别名方法）
    addExam(exam) {
        return this.saveExam(exam);
    },

    // 更新考试记录
    updateExam(index, updatedExam) {
        const exams = this.getExams();
        if (index >= 0 && index < exams.length) {
            exams[index] = updatedExam;
            localStorage.setItem('exams', JSON.stringify(exams));
            return true;
        }
        return false;
    },

    // 删除考试记录
    deleteExam(index) {
        const exams = this.getExams();
        if (index >= 0 && index < exams.length) {
            exams.splice(index, 1);
            localStorage.setItem('exams', JSON.stringify(exams));
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
    saveProfile(profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
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
    saveGoals(goals) {
        localStorage.setItem('goals', JSON.stringify(goals));
        return true;
    },

    // 导入数据
    importData(data) {
        try {
            if (data.exams) localStorage.setItem('exams', JSON.stringify(data.exams));
            if (data.profile) localStorage.setItem('profile', JSON.stringify(data.profile));
            if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
            if (data.fullMarks) localStorage.setItem('fullMarks', JSON.stringify(data.fullMarks));
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
            fullMarks: this.getFullMarks()
        };
    },
    
    // 获取满分设置
    getFullMarks() {
        const fullMarks = localStorage.getItem('fullMarks');
        return fullMarks ? JSON.parse(fullMarks) : null;
    },
    
    // 保存满分设置
    saveFullMarks(fullMarks) {
        localStorage.setItem('fullMarks', JSON.stringify(fullMarks));
        return true;
    }
};

// 图表管理
const Charts = {
    // 成绩趋势图
    renderScoreTrendChart() {
        const ctx = document.getElementById('scoreTrendChart');
        if (!ctx) return;

        const exams = Storage.getExams().sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = exams.map(exam => {
            const date = new Date(exam.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const scores = exams.map(exam => exam.totalScore);

        // 使用与grade.html一致的对象名称
        if (window.scoreTrendChartInstance) {
            window.scoreTrendChartInstance.destroy();
        }

        // 使用全局 Chart 构造函数创建图表实例
        window.scoreTrendChartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                        label: '总分',
                        data: scores,
                        // 使用ThemeColors工具类获取主题色
                        borderColor: ThemeColors.getPrimaryColor(),
                        backgroundColor: ThemeColors.getPrimaryColorWithOpacity(0.1),
                        tension: 0.4,
                        fill: true
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // 科目雷达图（用于首页）
    renderSubjectRadarChart() {
        try {
            const ctx = document.getElementById('subjectRadarChart');
            if (!ctx) {
                console.error('科目雷达图容器不存在');
                return;
            }

            const exams = Storage.getExams();
            if (exams.length === 0) {
                console.log('暂无考试数据，无法渲染雷达图');
                return;
            }

            // 获取最近一次考试的数据
            const latestExam = exams.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
            const subjectNames = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
            
            // 获取数据优先级：1.年级排名率 2.班级排名率 3.得分率
            const getSubjectPriorityData = (subject) => {
                // 年级排名率
                const gradeRank = latestExam.subjectRankGrade && latestExam.subjectRankGrade[subject];
                if (gradeRank) {
                    return 100 - parseFloat(((gradeRank / 650) * 100).toFixed(2));
                }
                
                // 班级排名率
                const classRank = latestExam.subjectRankClass && latestExam.subjectRankClass[subject];
                if (classRank) {
                    return 100 - parseFloat(((classRank / 51) * 100).toFixed(2));
                }
                
                // 得分率
                const score = latestExam.subjects && latestExam.subjects[subject] || 0;
                const fullMark = latestExam.fullMarks && latestExam.fullMarks[subject] || 100;
                return fullMark > 0 ? parseFloat(((score / fullMark) * 100).toFixed(2)) : 0;
            };
            
            // 计算各项数据
            const gradeRankRates = subjects.map(subject => {
                const gradeRank = latestExam.subjectRankGrade && latestExam.subjectRankGrade[subject];
                return gradeRank ? 100 - parseFloat(((gradeRank / 650) * 100).toFixed(2)) : 0;
            });
            
            const classRankRates = subjects.map(subject => {
                const classRank = latestExam.subjectRankClass && latestExam.subjectRankClass[subject];
                return classRank ? 100 - parseFloat(((classRank / 51) * 100).toFixed(2)) : 0;
            });
            
            const scoreRates = subjects.map(subject => {
                const score = latestExam.subjects && latestExam.subjects[subject] || 0;
                const fullMark = latestExam.fullMarks && latestExam.fullMarks[subject] || 100;
                return fullMark > 0 ? parseFloat(((score / fullMark) * 100).toFixed(2)) : 0;
            });
            
            // 获取优先级数据
            const priorityData = subjects.map(getSubjectPriorityData);

            console.log('雷达图数据:', { subjects, subjectNames, priorityData, gradeRankRates, classRankRates, scoreRates });

            if (window.subjectRadarChart && typeof window.subjectRadarChart.destroy === 'function') {
                window.subjectRadarChart.destroy();
            }

            window.subjectRadarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: subjectNames,
                    datasets: [{
                        label: '科目表现(优先级:年级排名率>班级排名率>得分率)',
                        data: priorityData,
                        // 使用ThemeColors工具类获取主题色
                        borderColor: ThemeColors.getPrimaryColor(),
                        backgroundColor: ThemeColors.getPrimaryColorWithOpacity(0.2)
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
                    }
                }
            });
        } catch (error) {
            console.error('渲染雷达图时出错:', error);
        }
    },
    
    // 考试详情模态框中的科目分布雷达图
    renderDetailSubjectRadarChart(examData) {
        try {
            const ctx = document.getElementById('detailSubjectRadarChart');
            if (!ctx) {
                console.error('详情模态框科目雷达图容器不存在');
                return;
            }

            if (!examData || !examData.subjects) {
                console.error('无效的考试数据');
                return;
            }

            const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
            const subjectNames = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
            
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

            // 销毁旧图表
            if (window.detailSubjectRadarChart && typeof window.detailSubjectRadarChart.destroy === 'function') {
                window.detailSubjectRadarChart.destroy();
            }

            window.detailSubjectRadarChart = new Chart(ctx, {
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
    },

    // 排名对比图
    renderRankComparisonChart() {
        const ctx = document.getElementById('rankComparisonChart');
        if (!ctx) return;

        const exams = Storage.getExams().sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = exams.map(exam => {
            const date = new Date(exam.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const classRanks = exams.map(exam => exam.rankClass || 0);
        const gradeRanks = exams.map(exam => exam.rankGrade || 0);

        // 使用与grade.html一致的对象名称
        if (window.rankComparisonChartInstance && typeof window.rankComparisonChartInstance.destroy === 'function') {
            window.rankComparisonChartInstance.destroy();
        }

        window.rankComparisonChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '班级排名',
                        data: classRanks,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '年级排名',
                        data: gradeRanks,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        reverse: true,
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // 科目强弱分析图
    renderSubjectStrengthChart() {
        const ctx = document.getElementById('subjectStrengthChart');
        if (!ctx) return;

        const exams = Storage.getExams();
        if (exams.length === 0) return;

        const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        const subjectNames = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
        const avgScores = subjects.map(subject => {
            let totalPriorityScore = 0;
            let count = 0;

            exams.forEach(exam => {
                if (exam.subjects && exam.fullMarks && exam.subjects[subject] !== undefined && exam.fullMarks[subject] > 0) {
                    const subjectData = {
                        score: exam.subjects[subject],
                        rankClass: exam.subjectRankClass ? exam.subjectRankClass[subject] : null,
                        rankGrade: exam.subjectRankGrade ? exam.subjectRankGrade[subject] : null
                    };
                    const priorityScore = getSubjectPriorityScore(subjectData, exam.fullMarks[subject]);
                    if (priorityScore !== null) {
                        totalPriorityScore += priorityScore;
                        count++;
                    }
                }
            });

            return count > 0 ? totalPriorityScore / count : 0;
        });

        if (window.subjectStrengthChart && typeof window.subjectStrengthChart.destroy === 'function') {
            window.subjectStrengthChart.destroy();
        }

        window.subjectStrengthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjectNames,
                datasets: [{
                    label: '平均得分率(%)',
                    data: avgScores,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(209, 213, 219, 0.7)',
                        'rgba(107, 114, 128, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // 成绩分布图 - 显示得分率分布
    renderScoreDistributionChart() {
        const ctx = document.getElementById('scoreDistributionChart');
        if (!ctx) return;

        const exams = Storage.getExams();
        if (exams.length === 0) return;

        // 统计各得分率段的考试次数
        const ranges = [
            { name: '90%+', min: 90 },
            { name: '80%-89%', min: 80, max: 90 },
            { name: '70%-79%', min: 70, max: 80 },
            { name: '60%-69%', min: 60, max: 70 },
            { name: '<60%', max: 60 }
        ];

        const distribution = ranges.map(range => {
            let count = 0;
            exams.forEach(exam => {
                // 确保totalFullMark存在且不为0，否则尝试根据科目计算总分
                let totalFullMark = exam.totalFullMark || 0;
                if (totalFullMark <= 0 && exam.subjects && exam.fullMarks) {
                    totalFullMark = Object.keys(exam.subjects).reduce((sum, subject) => {
                        return sum + (exam.fullMarks[subject] || 100);
                    }, 0);
                }
                
                // 计算得分率
                const scoreRate = totalFullMark > 0 ? (exam.totalScore / totalFullMark) * 100 : 0;
                
                // 判断得分率所在区间
                if (range.min !== undefined && range.max !== undefined) {
                    if (scoreRate >= range.min && scoreRate < range.max) count++;
                } else if (range.min !== undefined) {
                    if (scoreRate >= range.min) count++;
                } else if (range.max !== undefined) {
                    if (scoreRate < range.max) count++;
                }
            });
            return count;
        });

        if (window.scoreDistributionChart && typeof window.scoreDistributionChart.destroy === 'function') {
            window.scoreDistributionChart.destroy();
        }

        window.scoreDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ranges.map(range => range.name),
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(100, 116, 139, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
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

// 主题色切换功能
function setThemeColor(theme) {
    // 设置主题色数据属性
    document.body.dataset.theme = theme || '';
    
    // 更新按钮的active状态
    document.querySelectorAll('.theme-color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // 保存到localStorage
    try {
        localStorage.setItem('themeColor', theme);
    } catch (e) {
        console.warn('无法保存主题设置到localStorage:', e);
    }
}

// 初始化主题色设置
function initThemeColor() {
    // 从localStorage读取保存的主题色
    try {
        const savedTheme = localStorage.getItem('themeColor');
        if (savedTheme) {
            setThemeColor(savedTheme);
            return;
        }
    } catch (e) {
        console.warn('无法从localStorage读取主题设置:', e);
    }
    
    // 默认为蓝色主题
    setThemeColor('blue');
}

// 通用视图模式切换函数
function switchToViewMode() {
    document.getElementById('editModeContainer').classList.add('hidden');
    document.getElementById('viewModeContainer').classList.remove('hidden');
}

function switchToEditMode() {
    document.getElementById('viewModeContainer').classList.add('hidden');
    document.getElementById('editModeContainer').classList.remove('hidden');
}

// 用户界面管理
const UI = {
    // 存储当前排序后的数据，用于详情查看和删除操作
    currentExams: [],

    currentPage: 'dashboard',
    editingExamIndex: -1,
    editingSubject: '',
    undoStack: null, // 存储可撤销的操作
    notificationTimeout: null, // 通知超时计时器
    progressInterval: null, // 进度条动画计时器

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
        this.loadGoals();
        this.loadFullMarks();
        this.loadStudentInfo();
        this.updateDashboard();
        
        // 初始化图表（确保第一次打开页面时图表也能显示）
        // 但只在有图表容器的页面执行
        if (document.getElementById('scoreTrendChart')) {
            Charts.renderScoreTrendChart();
        }
        if (document.getElementById('subjectRadarChart')) {
            Charts.renderSubjectRadarChart();
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
                            this.updateDashboard();
                            this.updateAnalysisPage();
                            this.updateProfilePage();
                            this.updateExamSelects();
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

        // 排序选择事件
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortExams();
            });
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

        // 如果是仪表盘页面，更新图表
        if (page === 'dashboard') {
            Charts.renderScoreTrendChart();
            Charts.renderSubjectRadarChart();
        }

        // 如果是分析页面，更新图表
        if (page === 'analysis') {
            Charts.renderRankComparisonChart();
            Charts.renderSubjectStrengthChart();
            Charts.renderScoreDistributionChart();
            this.updateAnalysisPage();
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
        const isLoggedIn = Storage.isLoggedIn();
        
        if (profile) {
            // 重新调用loadProfile方法，确保完整的动态渲染
            this.loadProfile();
        }
    },

    // 添加考试
    addExam() {
        const examName = document.getElementById('examName').value.trim();
        const examDate = document.getElementById('examDate').value;
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
            this.updateDashboard();
            this.updateAnalysisPage();
        } else {
            this.showNotification('error', '添加失败', '保存考试记录时出错');
        }
    },

    // 加载考试记录
    loadExams(tempExams = null) {
        // 如果提供了临时数据，则使用临时数据，否则从存储中获取
        const exams = tempExams !== null ? tempExams : Storage.getExams();
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
            const row = document.createElement('tr');
            row.className = 'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
            
            const date = new Date(exam.date);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            row.innerHTML = `
                <td class="py-3 px-4">${exam.name}</td>
                <td class="py-3 px-4">${formattedDate}</td>
                <td class="py-3 px-4 font-medium text-primary">${typeof exam.totalScore === 'number' ? exam.totalScore.toFixed(1) : '-'}</td>
                <td class="py-3 px-4">${exam.rankClass || '-'}</td>
                <td class="py-3 px-4">${exam.rankGrade || '-'}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="UI.showExamDetail(${index})"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="UI.showDeleteConfirm(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            examsTable.appendChild(row);
        });
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
            const rankGradeRate = calculateRankRate(rankGrade, 650);
            
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
        const exams = Storage.getExams();
        const exam = exams[index];
        if (!exam) return;

        this.editingExamIndex = index;
        
        // 填充编辑表单
        document.getElementById('editExamName').value = exam.name;
        document.getElementById('editExamDate').value = exam.date;
        document.getElementById('editRankClass').value = exam.rankClass || '';
        document.getElementById('editRankGrade').value = exam.rankGrade || '';
        document.getElementById('editExamSummary').value = exam.summary || '';
        
        // 填充科目成绩表格
        const tbody = document.getElementById('editScoresTable').querySelector('tbody');
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
        
        Object.keys(subjectNames).forEach(subject => {
            const score = (exam.subjects && exam.subjects[subject]) || '';
            const fullMark = (exam.fullMarks && exam.fullMarks[subject]) || (subject === 'chinese' || subject === 'math' || subject === 'english' ? 150 : 100);
            const rankClass = (exam.subjectRankClass && exam.subjectRankClass[subject]) || '';
            const rankGrade = (exam.subjectRankGrade && exam.subjectRankGrade[subject]) || '';
            
            const row = document.createElement('tr');
            row.className = 'border-b dark:border-gray-700';
            row.innerHTML = `
                <td class="py-3 px-4">${subjectNames[subject]}</td>
                <td class="py-3 px-4">
                    <input type="number" name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}Score" 
                           class="input-field" value="${score}" placeholder="0-${fullMark}" max="${fullMark}">
                </td>
                <td class="py-3 px-4">
                    <input type="number" name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}FullMark" 
                           class="input-field" value="${fullMark}" min="0" step="0.1">
                </td>
                <td class="py-3 px-4">
                    <input type="number" name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankClass" 
                           class="input-field" value="${rankClass}" placeholder="班级排名" min="1" max="51">
                </td>
                <td class="py-3 px-4">
                    <input type="number" name="edit${subject.charAt(0).toUpperCase() + subject.slice(1)}RankGrade" 
                           class="input-field" value="${rankGrade}" placeholder="年级排名" min="1" max="650">
                </td>
            `;
            
            tbody.appendChild(row);
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
    
    // 临时更新UI（不修改存储）
    tempUpdateUI(index, examData, isInsert = false) {
        const currentExams = Storage.getExams();
        const tempExams = [...currentExams];
        
        if (isInsert) {
            // 插入操作（用于撤销删除时恢复数据）
            tempExams.splice(index, 0, examData);
        } else {
            // 更新操作
            tempExams[index] = examData;
        }
        
        // 使用临时数据直接更新界面
        this.loadExams(tempExams);
        this.updateDashboard();
        this.updateAnalysisPage();
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

    // 更新仪表盘
    updateDashboard() {
        // 检查仪表盘元素是否存在，避免在登录页面调用时出错
        const totalScoreCard = document.getElementById('totalScoreCard');
        if (!totalScoreCard) return;

        const exams = Storage.getExams();
        if (exams.length === 0) {
            document.getElementById('totalScoreCard').textContent = '--';
            document.getElementById('rankCard').textContent = '--';
            document.getElementById('examCountCard').textContent = '0';
            document.getElementById('averageScoreCard').textContent = '--';
            document.getElementById('highestScoreCard').textContent = '--';
            document.getElementById('monthlyExamCount').textContent = '0';
            document.getElementById('totalScoreTrend').innerHTML = '<i class="fa-solid fa-minus"></i> 0%相比上次';
            document.getElementById('rankTrend').innerHTML = '<i class="fa-solid fa-minus"></i> 0位相比上次';
            return;
        }

        // 按日期排序，最新的在前
        const sortedExams = [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 更新考试次数
        document.getElementById('examCountCard').textContent = exams.length;
        
        // 计算本月考试次数
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyCount = exams.filter(exam => {
            const examDate = new Date(exam.date);
            return examDate.getMonth() === currentMonth && examDate.getFullYear() === currentYear;
        }).length;
        document.getElementById('monthlyExamCount').textContent = monthlyCount;
        
        // 获取最新考试数据
        const latestExam = sortedExams[0];
        document.getElementById('totalScoreCard').textContent = latestExam.totalScore ? latestExam.totalScore.toFixed(1) : '--';
        
        // 计算总分趋势
        if (sortedExams.length > 1) {
            const previousExam = sortedExams[1];
            const trendElement = document.getElementById('totalScoreTrend');
            
            // 检查totalScore是否存在且previousExam.totalScore不为0
            if (latestExam.totalScore !== undefined && previousExam.totalScore !== undefined && previousExam.totalScore !== 0) {
                const scoreDiff = latestExam.totalScore - previousExam.totalScore;
                const scorePercent = (scoreDiff / previousExam.totalScore) * 100;
                
                if (scoreDiff > 0) {
                    trendElement.className = 'text-success';
                    trendElement.innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${Math.abs(scorePercent).toFixed(1)}%`;
                } else if (scoreDiff < 0) {
                    trendElement.className = 'text-danger';
                    trendElement.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${Math.abs(scorePercent).toFixed(1)}%`;
                } else {
                    trendElement.className = 'text-gray-500';
                    trendElement.innerHTML = '<i class="fa-solid fa-minus"></i> 0%';
                }
            } else {
                trendElement.innerHTML = '<i class="fa-solid fa-minus"></i> 0%相比上次';
            }
        } else {
            document.getElementById('totalScoreTrend').innerHTML = '<i class="fa-solid fa-minus"></i> 0%';
        }
        
        // 更新排名
        if (latestExam.rankClass) {
            document.getElementById('rankCard').textContent = latestExam.rankClass;
            
            // 计算排名趋势
            if (sortedExams.length > 1) {
                const previousExam = sortedExams[1];
                if (previousExam.rankClass) {
                    const rankDiff = latestExam.rankClass - previousExam.rankClass;
                    const trendElement = document.getElementById('rankTrend');
                    
                    if (rankDiff < 0) {
                        trendElement.className = 'text-success';
                        trendElement.innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${Math.abs(rankDiff)}位`;
                    } else if (rankDiff > 0) {
                        trendElement.className = 'text-danger';
                        trendElement.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${rankDiff}位`;
                    } else {
                        trendElement.className = 'text-gray-500';
                        trendElement.innerHTML = '<i class="fa-solid fa-minus"></i> 0位';
                    }
                }
            }
        } else {
            document.getElementById('rankCard').textContent = '--';
        }
        
        // 计算平均成绩和最高成绩
        const validTotalScores = exams
            .map(exam => exam.totalScore)
            .filter(score => score !== undefined && score !== null && !isNaN(score));
        
        let averageScore = '--';
        let highestScore = '--';
        
        if (validTotalScores.length > 0) {
            averageScore = validTotalScores.reduce((sum, score) => sum + score, 0) / validTotalScores.length;
            highestScore = Math.max(...validTotalScores);
        }
        
        document.getElementById('averageScoreCard').textContent = typeof averageScore === 'number' ? averageScore.toFixed(1) : averageScore;
        document.getElementById('highestScoreCard').textContent = typeof highestScore === 'number' ? highestScore.toFixed(1) : highestScore;
        
        // 更新考试总结
        const summaryElement = document.getElementById('latestExamSummary');
        if (latestExam.summary && latestExam.summary.trim() !== '') {
            const date = new Date(latestExam.date);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            summaryElement.innerHTML = `
                <div class="mb-2 flex justify-between items-center">
                    <span class="font-medium text-primary dark:text-blue-400">${latestExam.name}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</span>
                </div>
                <p>${latestExam.summary}</p>
            `;
        } else {
            summaryElement.innerHTML = '<p class="text-center text-gray-400 dark:text-gray-500">最近的考试没有添加总结</p>';
        }
    },

    // 更新分析页面
    updateAnalysisPage() {
        // 检查分析页面元素是否存在，避免在登录页面调用时出错
        const chineseAvgScore = document.getElementById('chineseAvgScore');
        if (!chineseAvgScore) return;

        const exams = Storage.getExams();
        if (exams.length === 0) return;

        const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        const subjectNames = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];
        
        subjects.forEach((subject, index) => {
            let totalScore = 0;
            let totalFullMark = 0;
            let totalClassRank = 0;
            let totalGradeRank = 0;
            let countScore = 0;
            let countClassRank = 0;
            let countGradeRank = 0;
            
            // 计算排名率的总和和计数
            let totalClassRankRate = 0;
            let totalGradeRankRate = 0;
            let countClassRankRate = 0;
            let countGradeRankRate = 0;
            
            exams.forEach(exam => {
                // 计算平均分和得分率
                if (exam.subjects && exam.fullMarks && exam.subjects[subject] !== undefined && exam.fullMarks[subject] > 0) {
                    totalScore += exam.subjects[subject];
                    totalFullMark += exam.fullMarks[subject];
                    countScore++;
                }
                
                // 计算班级排名和班级排名率
                if (exam.subjectRankClass && exam.subjectRankClass[subject] !== undefined && exam.subjectRankClass[subject] > 0) {
                    const classRank = exam.subjectRankClass[subject];
                    totalClassRank += classRank;
                    countClassRank++;
                    
                    // 计算班级排名率
                    const classRankRate = ((classRank / 51) * 100);
                    totalClassRankRate += classRankRate;
                    countClassRankRate++;
                }
                
                // 计算年级排名和年级排名率
                if (exam.subjectRankGrade && exam.subjectRankGrade[subject] !== undefined && exam.subjectRankGrade[subject] > 0) {
                    const gradeRank = exam.subjectRankGrade[subject];
                    totalGradeRank += gradeRank;
                    countGradeRank++;
                    
                    // 计算年级排名率
                    const gradeRankRate = ((gradeRank / 650) * 100);
                    totalGradeRankRate += gradeRankRate;
                    countGradeRankRate++;
                }
            });
            
            const avgScore = countScore > 0 ? totalScore / countScore : 0;
            const avgRate = countScore > 0 ? (totalScore / totalFullMark) * 100 : 0;
            const avgClassRank = countClassRank > 0 ? totalClassRank / countClassRank : '--';
            const avgGradeRank = countGradeRank > 0 ? totalGradeRank / countGradeRank : '--';
            
            // 计算平均班级排名率和平均年级排名率
            const avgClassRankRate = countClassRankRate > 0 ? totalClassRankRate / countClassRankRate : '--';
            const avgGradeRankRate = countGradeRankRate > 0 ? totalGradeRankRate / countGradeRankRate : '--';
            
            // 更新平均分和得分率
            document.getElementById(`${subject}AvgScore`).textContent = avgScore.toFixed(1);
            document.getElementById(`${subject}ScoreRate`).textContent = avgRate.toFixed(1);
            document.getElementById(`${subject}ScoreBar`).style.width = `${Math.min(avgRate, 100)}%`;
            
            // 更新班级排名和年级排名
            document.getElementById(`${subject}ClassRank`).textContent = typeof avgClassRank === 'number' ? avgClassRank.toFixed(1) : avgClassRank;
            document.getElementById(`${subject}GradeRank`).textContent = typeof avgGradeRank === 'number' ? avgGradeRank.toFixed(1) : avgGradeRank;
            
            // 更新班级排名率和年级排名率
            document.getElementById(`${subject}ClassRankRate`).textContent = typeof avgClassRankRate === 'number' ? avgClassRankRate.toFixed(1) + '%' : avgClassRankRate;
            document.getElementById(`${subject}GradeRankRate`).textContent = typeof avgGradeRankRate === 'number' ? avgGradeRankRate.toFixed(1) + '%' : avgGradeRankRate;
        });
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

    // 撤销操作
    undoAction() {
        if (this.undoStack && this.undoStack.undo) {
            this.undoStack.undo();
            
            // 清除定时器
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
            
            // 隐藏当前通知
            this.hideNotification();
            
            // 显示撤销成功通知
            setTimeout(() => {
                this.showNotification('success', '撤销成功', '您的操作已成功撤销', false);
            }, 300);
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
        const currentMark = document.querySelector(`input[name="${subject}FullMark"]`).value;
        document.getElementById('fullMarkInput').value = currentMark;
        const editModal = document.getElementById('editFullMarkModal');
        // 确保动画能够正常触发
        setTimeout(() => {
            editModal.classList.remove('hidden');
        }, 10);
    },

    // 加载满分设置
    loadFullMarks() {
        const fullMarks = Storage.getFullMarks() || { chinese: 150, math: 150, english: 150, physics: 100, chemistry: 100, biology: 100 };
        this.fullMarks = fullMarks;
        
        // 更新所有科目的满分显示
        const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
        subjects.forEach(subject => {
            const mark = fullMarks[subject] || 100;
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
            
            // 更新得分输入框的最大值
            const scoreInput = document.querySelector(`input[name="${subject}Score"]`);
            if (scoreInput) {
                scoreInput.max = mark;
                scoreInput.placeholder = `0-${displayMark}`;
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

        // 更新显示和隐藏输入框
        // 如果满分是整数，显示为整数，否则显示一位小数
        const displayMark = newMark % 1 === 0 ? newMark : newMark.toFixed(1);
        document.getElementById(`${subject}FullMarkDisplay`).textContent = displayMark;
        document.querySelector(`input[name="${subject}FullMark"]`).value = newMark;

        // 更新得分输入框的最大值
        const scoreInput = document.querySelector(`input[name="${subject}Score"]`);
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
        
        // 更新fullMarks对象并保存到localStorage
        const currentFullMarks = this.fullMarks || {};
        currentFullMarks[subject] = newMark;
        this.fullMarks = currentFullMarks;
        Storage.saveFullMarks(currentFullMarks);

        // 关闭满分设置模态框
        hideModal('editFullMarkModal');
        this.showNotification('success', '设置成功', '满分已更新');
    },

    // 获取等级
    getGrade(scoreRate) {
        if (scoreRate >= 90) return '优秀';
        if (scoreRate >= 80) return '良好';
        if (scoreRate >= 60) return '及格';
        return '不及格';
    },

    // 筛选考试记录
    filterExams() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        let filteredExams = Storage.getExams();
        
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
                // 检查缓存时间戳
                const lastSyncTime = localStorage.getItem('lastSyncTime');
                const now = new Date().getTime();
                const oneHour = 60 * 60 * 1000; // 1小时
                
                // 如果缓存时间戳不存在或已过期，则同步数据
                if (!lastSyncTime || (now - parseInt(lastSyncTime)) > oneHour) {
                    console.log('缓存时间戳过期或不存在，开始同步数据');
                    
                    // 从localStorage获取同步数据
                    const syncDataStr = localStorage.getItem('syncData');
                    if (syncDataStr) {
                        try {
                            const syncData = JSON.parse(syncDataStr);
                            Storage.importData(syncData);
                        } catch (e) {
                            console.error('解析syncData失败:', e);
                        }
                    }
                    
                    // 同步完成后，设置新的缓存时间戳
                    localStorage.setItem('lastSyncTime', now.toString());
                    console.log('已设置新的缓存时间戳:', new Date(now).toLocaleString());
                } else {
                    console.log('缓存时间戳未过期，跳过数据同步');
                    console.log('上次同步时间:', new Date(parseInt(lastSyncTime)).toLocaleString());
                    console.log('下次同步时间:', new Date(parseInt(lastSyncTime) + oneHour).toLocaleString());
                }
                
                // 用登录信息覆盖姓名、班级和学校
                const currentProfile = Storage.getProfile();
                const updatedProfile = {
                    ...currentProfile,
                    name: user.username,
                    className: user.class || '',
                    school: user.school || ''
                };
                Storage.saveProfile(updatedProfile);
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