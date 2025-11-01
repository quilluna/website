// 清除所有示例数据的脚本
document.addEventListener('DOMContentLoaded', () => {
    // 清除localStorage中的考试数据
    localStorage.removeItem('exams');
    localStorage.removeItem('gradeSystemExams');
    localStorage.removeItem('profile');
    localStorage.removeItem('goals');
    
    // 显示清除成功的消息
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #10b981;
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 9999;
        text-align: center;
    `;
    message.textContent = '示例数据已清除！';
    document.body.appendChild(message);
    
    // 3秒后关闭消息并刷新页面
    setTimeout(() => {
        message.remove();
        location.reload();
    }, 3000);
});