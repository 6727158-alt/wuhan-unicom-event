// 应用状态
const appState = {
    currentPage: 'home',
    bookingData: {},
    ratings: {
        overall: 0,
        organization: 0,
        service: 0,
        atmosphere: 0,
        content: 0
    }
};

// 合作伙伴数据（随机生成）
const companies = [
    '华为技术有限公司', '中兴通讯股份有限公司', '腾讯科技', '阿里巴巴集团', '百度在线网络技术',
    '京东集团', '小米科技', '联想集团', '海尔集团', '美的集团',
    '中国移动通信', '中国电信集团', '中国联合网络通信', '烽火通信科技', '长飞光纤光缆',
    '东风汽车集团', '武汉钢铁集团', '中国建筑集团', '中国中铁股份', '中国交建集团'
];

const industries = ['互联网', '通信', '制造业', '金融', '教育', '医疗', '政务', '能源'];

const projectTypes = [
    '5G智慧园区建设', '企业专线升级服务', '云计算数据中心', '物联网平台搭建', '智慧城市解决方案',
    '工业互联网平台', 'AI智能客服系统', '大数据分析平台', '网络安全防护', '视频会议系统'
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initSplashScreen();
    initForms();
    initRatings();
    generateBooths();
    generateProjects();
    generateGallery();
});

// 启动页动画
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    
    setTimeout(() => {
        splash.classList.add('hidden');
        app.style.display = 'block';
        
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }, 2500);
}

// 页面导航
function navigateTo(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = page;
        
        // 更新底部导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    }
    
    // 更新底部导航状态
    updateBottomNav(page);
}

function updateBottomNav(page) {
    const navMap = {
        'home': 0,
        'booking': 1,
        'live': 2,
        'review': 3
    };
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === navMap[page]) {
            item.classList.add('active');
        }
    });
}

// 数字选择器
function changeNumber(delta) {
    const input = document.querySelector('input[name="companions"]');
    let value = parseInt(input.value) + delta;
    value = Math.max(0, Math.min(10, value));
    input.value = value;
}

// 初始化表单
function initForms() {
    // 预约表单
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            appState.bookingData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                company: formData.get('company'),
                industry: formData.get('industry'),
                companions: formData.get('companions')
            };
            
            showToast('预约提交成功！我们会尽快与您联系。');
            this.reset();
            
            setTimeout(() => {
                navigateTo('home');
            }, 1500);
        });
    }
    
    // 评价表单
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (appState.ratings.overall === 0) {
                showToast('请为活动整体满意度评分');
                return;
            }
            
            showToast('评价提交成功！感谢您的反馈。');
            this.reset();
            resetRatings();
            
            setTimeout(() => {
                navigateTo('home');
            }, 1500);
        });
        
        // 字数统计
        const textarea = reviewForm.querySelector('textarea[name="comment"]');
        const charCount = reviewForm.querySelector('.char-count');
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/100`;
        });
    }
}

// 初始化评分
function initRatings() {
    // 整体满意度评分
    const overallStars = document.querySelector('.star-rating');
    if (overallStars) {
        const stars = overallStars.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                appState.ratings.overall = index + 1;
                updateStarDisplay(overallStars, index + 1);
            });
        });
    }
    
    // 单项评分
    const categories = ['organization', 'service', 'atmosphere', 'content'];
    categories.forEach(category => {
        const container = document.querySelector(`.category-stars[data-category="${category}"]`);
        if (container) {
            const stars = container.querySelectorAll('i');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    appState.ratings[category] = index + 1;
                    updateStarDisplay(container, index + 1);
                });
            });
        }
    });
}

function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

function resetRatings() {
    appState.ratings = {
        overall: 0,
        organization: 0,
        service: 0,
        atmosphere: 0,
        content: 0
    };
    
    document.querySelectorAll('.star-rating i, .category-stars i').forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
}

// 生成展位数据
function generateBooths() {
    const boothList = document.getElementById('booth-list');
    if (!boothList) return;
    
    const boothData = [];
    const zones = ['A', 'B', 'C'];
    
    zones.forEach(zone => {
        for (let i = 1; i <= 6; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const project = projectTypes[Math.floor(Math.random() * projectTypes.length)];
            
            boothData.push({
                number: `${zone}0${i}`,
                name: company,
                project: project,
                contact: `张经理`,
                phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`
            });
        }
    });
    
    boothList.innerHTML = boothData.map(booth => `
        <div class="booth-card">
            <div class="booth-header">
                <span class="booth-number">${booth.number}</span>
                <span class="booth-name">${booth.name}</span>
            </div>
            <div class="booth-project">
                <i class="fas fa-project-diagram"></i> ${booth.project}
            </div>
            <div class="booth-contact">
                <span><i class="fas fa-user"></i> ${booth.contact}</span>
                <span><i class="fas fa-phone"></i> ${booth.phone}</span>
            </div>
        </div>
    `).join('');
}

// 生成项目数据
function generateProjects() {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;
    
    const statuses = ['in-progress', 'completed', 'pending'];
    const statusText = {
        'in-progress': '进行中',
        'completed': '已完成',
        'pending': '待启动'
    };
    
    const projectData = [];
    
    for (let i = 0; i < 8; i++) {
        const company = companies[Math.floor(Math.random() * companies.length)];
        const project = projectTypes[Math.floor(Math.random() * projectTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const progress = status === 'completed' ? 100 : status === 'pending' ? 0 : Math.floor(Math.random() * 80) + 10;
        
        const startDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        projectData.push({
            title: `${company}${project}`,
            company: company,
            manager: `李经理`,
            phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            startDate: startDate.toLocaleDateString('zh-CN'),
            progress: progress,
            status: status,
            statusText: statusText[status]
        });
    }
    
    projectsList.innerHTML = projectData.map(project => `
        <div class="project-card">
            <div class="project-header">
                <div>
                    <h4 class="project-title">${project.title}</h4>
                    <span class="project-company">${project.company}</span>
                </div>
                <span class="project-status ${project.status}">${project.statusText}</span>
            </div>
            <div class="project-info">
                <div class="project-info-item">
                    <span>对接负责人</span>
                    <strong>${project.manager}</strong>
                </div>
                <div class="project-info-item">
                    <span>联系电话</span>
                    <strong>${project.phone}</strong>
                </div>
                <div class="project-info-item">
                    <span>创建时间</span>
                    <strong>${project.startDate}</strong>
                </div>
                <div class="project-info-item">
                    <span>当前进展</span>
                    <strong>${project.progress}%</strong>
                </div>
            </div>
            <div class="project-progress">
                <div class="progress-header">
                    <span>项目进度</span>
                    <span>${project.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// 生成相册
function generateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    const colors = [
        'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
        'linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%)',
        'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
        'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
        'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
        'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)'
    ];
    
    for (let i = 1; i <= 9; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-index', i);
        item.style.background = colors[(i - 1) % colors.length];
        galleryGrid.appendChild(item);
    }
}

// 加载更多照片
function loadMorePhotos() {
    const galleryGrid = document.getElementById('gallery-grid');
    const currentCount = galleryGrid.children.length;
    const colors = [
        'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
        'linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%)',
        'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
        'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
        'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
        'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)'
    ];
    
    for (let i = 1; i <= 6; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-index', currentCount + i);
        item.style.background = colors[(currentCount + i - 1) % colors.length];
        galleryGrid.appendChild(item);
    }
    
    showToast('已加载更多照片');
}

// 打开地图导航
function openMap() {
    const address = '武汉市江岸区惠济路38号';
    const url = `https://map.baidu.com/search/${encodeURIComponent(address)}`;
    window.open(url, '_blank');
}

// 显示提示消息
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 防止页面滚动穿透
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.page.active')) {
        return;
    }
}, { passive: false });

// 处理返回按钮
window.addEventListener('popstate', function(e) {
    if (appState.currentPage !== 'home') {
        e.preventDefault();
        navigateTo('home');
    }
});
