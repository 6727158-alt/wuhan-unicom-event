/**
 * 武汉联通合作伙伴大会 H5 小程序
 * 单页面应用 (SPA) 主逻辑
 */

const app = {
    // 当前页面状态
    currentPage: 'cover',
    
    // 用户预约状态
    isRegistered: false,
    
    // 评分状态
    ratings: {
        overall: 0,
        org: 0,
        service: 0,
        atmosphere: 0,
        content: 0
    },

    // 初始化
    init() {
        this.loadRegistrationStatus();
        this.initStarRatings();
        this.initTextareaCount();
        this.generateBoothData();
        this.generateProjectData();
        this.showPage('cover');
        this.initSwipeHandler();
    },

    // 初始化上滑手势
    initSwipeHandler() {
        const coverPage = document.getElementById('page-cover');
        if (!coverPage) return;

        let startY = 0;
        let endY = 0;
        const threshold = 80; // 滑动阈值

        // 触摸事件
        coverPage.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        coverPage.addEventListener('touchmove', (e) => {
            endY = e.touches[0].clientY;
        }, { passive: true });

        coverPage.addEventListener('touchend', () => {
            const diff = startY - endY;
            if (diff > threshold) {
                // 上滑超过阈值，进入下一页
                this.showPage('register');
            }
        });

        // 鼠标事件（桌面端）
        coverPage.addEventListener('mousedown', (e) => {
            startY = e.clientY;
        });

        coverPage.addEventListener('mouseup', (e) => {
            endY = e.clientY;
            const diff = startY - endY;
            if (diff > threshold) {
                this.showPage('register');
            }
        });

        // 点击上滑提示也能进入
        const swipeHint = coverPage.querySelector('.swipe-hint');
        if (swipeHint) {
            swipeHint.addEventListener('click', () => {
                this.showPage('register');
            });
        }

        // 滚轮事件
        coverPage.addEventListener('wheel', (e) => {
            if (e.deltaY < -30) {
                this.showPage('register');
            }
        });
    },

    // 加载预约状态
    loadRegistrationStatus() {
        const status = localStorage.getItem('wuhanUnicomRegistered');
        this.isRegistered = status === 'true';
    },

    // 保存预约状态
    saveRegistrationStatus() {
        localStorage.setItem('wuhanUnicomRegistered', 'true');
        this.isRegistered = true;
    },

    // 显示指定页面
    showPage(pageName) {
        console.log('Showing page:', pageName);
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // 滚动到顶部
            const scrollable = targetPage.querySelector('.scrollable');
            if (scrollable) {
                scrollable.scrollTop = 0;
            }
        } else {
            console.error('Page not found:', pageName);
        }
    },

    // 进入活动（封面页按钮）
    enterEvent() {
        if (this.isRegistered) {
            // 已预约用户直接进入首页
            this.showPage('home');
        } else {
            // 未预约用户进入登记页
            this.showPage('register');
        }
    },

    // 提交预约登记
    submitRegistration() {
        const fields = [
            { id: 'regName', errorId: 'error-name', key: 'name' },
            { id: 'regPhone', errorId: 'error-phone', key: 'phone' },
            { id: 'regCompany', errorId: 'error-company', key: 'company' },
            { id: 'regIndustry', errorId: 'error-industry', key: 'industry' },
            { id: 'regGuests', errorId: 'error-guests', key: 'guests' }
        ];

        let isValid = true;
        const formData = {};

        // 验证所有字段
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const errorMsg = document.getElementById(field.errorId);
            const value = input.value.trim();
            
            formData[field.key] = value;
            
            if (!value) {
                isValid = false;
                errorMsg.style.display = 'block';
                input.classList.add('error');
            } else {
                errorMsg.style.display = 'none';
                input.classList.remove('error');
            }
        });

        // 验证手机号格式
        const phoneInput = document.getElementById('regPhone');
        const phoneValue = phoneInput.value.trim();
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (phoneValue && !phoneRegex.test(phoneValue)) {
            isValid = false;
            document.getElementById('error-phone').textContent = '*请输入正确的手机号码';
            document.getElementById('error-phone').style.display = 'block';
            phoneInput.classList.add('error');
        }

        if (isValid) {
            // 保存用户数据
            localStorage.setItem('wuhanUnicomUserData', JSON.stringify(formData));
            this.saveRegistrationStatus();
            
            // 显示成功弹窗
            this.showSuccessModal();
            
            // 2秒后跳转到首页
            setTimeout(() => {
                this.closeModal();
                this.showPage('home');
            }, 2000);
        }
    },

    // 显示成功弹窗
    showSuccessModal() {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('successModal');
        
        overlay.classList.add('active');
        modal.classList.add('active');
    },

    // 关闭弹窗
    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        const modals = document.querySelectorAll('.modal');
        
        overlay.classList.remove('active');
        modals.forEach(modal => modal.classList.remove('active'));
    },

    // 显示场地信息弹窗
    showModal(type) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('venueModal');
        const title = document.getElementById('venueModalTitle');
        const body = document.getElementById('venueModalBody');

        const contents = {
            route: {
                title: '参会路线图',
                content: `
                    <div class="map-placeholder">
                        <div class="map-icon">🗺️</div>
                        <p>参会路线图</p>
                        <p class="map-desc">请从武汉会议中心主入口进入，沿指示牌前往黄鹤厅</p>
                    </div>
                `
            },
            layout: {
                title: '会场布局图',
                content: `
                    <div class="map-placeholder">
                        <div class="map-icon">🏛️</div>
                        <p>会场布局图</p>
                        <p class="map-desc">黄鹤厅分为A、B、C、D四个区域，舞台位于北侧</p>
                    </div>
                `
            },
            address: {
                title: '会场详细地址',
                content: `
                    <div class="address-info">
                        <div class="address-item">
                            <span class="address-label">会场名称</span>
                            <span class="address-value">武汉会议中心</span>
                        </div>
                        <div class="address-item">
                            <span class="address-label">详细地址</span>
                            <span class="address-value">武汉市江岸区惠济路38号</span>
                        </div>
                        <div class="address-item">
                            <span class="address-label">会场电话</span>
                            <span class="address-value">027-82300888</span>
                        </div>
                        <div class="address-item">
                            <span class="address-label">活动负责人</span>
                            <span class="address-value">139XXXXXXXX</span>
                        </div>
                    </div>
                `
            }
        };

        const data = contents[type];
        if (data) {
            title.textContent = data.title;
            body.innerHTML = data.content;
            
            overlay.classList.add('active');
            modal.classList.add('active');
        }
    },

    // 页面导航
    navigateTo(page) {
        const pageMap = {
            'venue': 'venue',
            'seating': 'seating',
            'projects': 'projects',
            'review': 'review'
        };
        
        const targetPage = pageMap[page];
        if (targetPage) {
            this.showPage(targetPage);
        }
    },

    // 返回上一页
    goBack() {
        this.showPage('home');
    },

    // 生成展位数据
    generateBoothData() {
        const companies = [
            { name: '华为技术有限公司', project: '5G智慧园区联合建设', contact: '张经理', phone: '13800138001' },
            { name: '中兴通讯股份有限公司', project: '企业专线升级服务', contact: '李经理', phone: '13800138002' },
            { name: '烽火通信科技股份有限公司', project: '光纤网络改造工程', contact: '王经理', phone: '13800138003' },
            { name: '腾讯云计算有限公司', project: '云数据中心合作', contact: '陈经理', phone: '13800138004' },
            { name: '阿里巴巴网络技术有限公司', project: '智慧城市解决方案', contact: '刘经理', phone: '13800138005' },
            { name: '百度在线网络技术公司', project: 'AI智能客服系统', contact: '赵经理', phone: '13800138006' },
            { name: '京东数字科技集团', project: '物联网平台建设', contact: '孙经理', phone: '13800138007' },
            { name: '小米通讯技术有限公司', project: '智能家居生态合作', contact: '周经理', phone: '13800138008' }
        ];

        const boothList = document.getElementById('boothList');
        if (!boothList) return;

        boothList.innerHTML = companies.map((company, index) => `
            <div class="booth-card">
                <div class="booth-header">
                    <span class="booth-number">A${String(index + 1).padStart(2, '0')}</span>
                    <span class="booth-name">${company.name}</span>
                </div>
                <div class="booth-info">
                    <div class="booth-item">
                        <span class="booth-label">合作项目</span>
                        <span class="booth-value">${company.project}</span>
                    </div>
                    <div class="booth-item">
                        <span class="booth-label">联系人</span>
                        <span class="booth-value">${company.contact}</span>
                    </div>
                    <div class="booth-item">
                        <span class="booth-label">联系方式</span>
                        <span class="booth-value">${company.phone}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // 生成项目数据
    generateProjectData() {
        const projects = [
            {
                name: '武汉市政务云5G专网建设',
                company: '武汉市政务服务中心',
                manager: '张主任',
                phone: '13912345678',
                createTime: '2026-01-15',
                progress: '已完成需求调研，正在进行方案设计',
                percent: 35
            },
            {
                name: '东湖高新区智慧园区项目',
                company: '东湖高新集团',
                manager: '李经理',
                phone: '13987654321',
                createTime: '2026-02-01',
                progress: '设备采购中，预计3月底到货',
                percent: 50
            },
            {
                name: '武汉地铁5G覆盖工程',
                company: '武汉地铁集团',
                manager: '王工',
                phone: '13811112222',
                createTime: '2025-12-10',
                progress: '一期施工已完成，二期准备中',
                percent: 65
            },
            {
                name: '江汉路商圈数字化改造',
                company: '江汉区商务局',
                manager: '陈科长',
                phone: '13833334444',
                createTime: '2026-01-20',
                progress: '正在进行系统集成测试',
                percent: 80
            },
            {
                name: '武汉大学5G智慧校园',
                company: '武汉大学',
                manager: '刘处长',
                phone: '13855556666',
                createTime: '2026-02-15',
                progress: '项目启动会已召开，需求收集中',
                percent: 15
            }
        ];

        // 从localStorage读取新增的项目
        const savedProjects = localStorage.getItem('wuhanUnicomProjects');
        const allProjects = savedProjects ? [...projects, ...JSON.parse(savedProjects)] : projects;

        this.renderProjectList(allProjects);
    },

    // 渲染项目列表
    renderProjectList(projects) {
        const projectList = document.getElementById('projectList');
        if (!projectList) return;

        projectList.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-name">${project.name}</div>
                    <div class="project-company">${project.company}</div>
                </div>
                <div class="project-info">
                    <div class="info-row">
                        <span class="info-label">对接负责人</span>
                        <span class="info-value">${project.manager}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">联系电话</span>
                        <span class="info-value">${project.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">创建时间</span>
                        <span class="info-value">${project.createTime}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">目前进展</span>
                        <span class="info-value">${project.progress}</span>
                    </div>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.percent}%"></div>
                    </div>
                    <div class="progress-text">${project.percent}%</div>
                </div>
            </div>
        `).join('');
    },

    // 显示新增项目弹窗
    showAddProjectModal() {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('addProjectModal');
        
        // 重置表单
        document.getElementById('addProjectForm').reset();
        document.getElementById('rangeValue').textContent = '0%';
        
        overlay.classList.add('active');
        modal.classList.add('active');
    },

    // 提交新增项目
    submitNewProject() {
        const name = document.getElementById('newProjectName').value.trim();
        const company = document.getElementById('newProjectCompany').value.trim();
        const manager = document.getElementById('newProjectManager').value.trim();
        const phone = document.getElementById('newProjectPhone').value.trim();
        const progress = document.getElementById('newProjectProgress').value.trim();
        const percent = parseInt(document.getElementById('newProjectPercent').value);

        if (!name || !company || !manager || !phone) {
            alert('请填写完整的项目信息');
            return;
        }

        const newProject = {
            name,
            company,
            manager,
            phone,
            createTime: new Date().toISOString().split('T')[0],
            progress: progress || '项目已创建',
            percent
        };

        // 保存到localStorage
        const savedProjects = localStorage.getItem('wuhanUnicomProjects');
        const projects = savedProjects ? JSON.parse(savedProjects) : [];
        projects.push(newProject);
        localStorage.setItem('wuhanUnicomProjects', JSON.stringify(projects));

        // 关闭弹窗并刷新列表
        this.closeModal();
        this.generateProjectData();
    },

    // 初始化星级评分
    initStarRatings() {
        const ratingGroups = [
            { id: 'overallRating', key: 'overall' },
            { id: 'ratingOrg', key: 'org' },
            { id: 'ratingService', key: 'service' },
            { id: 'ratingAtmosphere', key: 'atmosphere' },
            { id: 'ratingContent', key: 'content' }
        ];

        ratingGroups.forEach(group => {
            const container = document.getElementById(group.id);
            if (!container) return;

            const stars = container.querySelectorAll('.star');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    this.ratings[group.key] = index + 1;
                    this.updateStarDisplay(container, index + 1);
                });
            });
        });
    },

    // 更新星级显示
    updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    },

    // 初始化文本框字数统计
    initTextareaCount() {
        const textarea = document.getElementById('reviewText');
        const charCount = document.getElementById('charCount');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length;
            });
        }
    },

    // 提交评价
    submitReview() {
        const reviewText = document.getElementById('reviewText').value.trim();
        
        // 验证评分
        if (this.ratings.overall === 0) {
            alert('请为活动整体满意度评分');
            return;
        }

        // 收集评价数据
        const reviewData = {
            overall: this.ratings.overall,
            text: reviewText,
            org: this.ratings.org,
            service: this.ratings.service,
            atmosphere: this.ratings.atmosphere,
            content: this.ratings.content,
            submitTime: new Date().toISOString()
        };

        // 保存评价（实际项目中应发送到服务器）
        const existingReviews = localStorage.getItem('wuhanUnicomReviews');
        const reviews = existingReviews ? JSON.parse(existingReviews) : [];
        reviews.push(reviewData);
        localStorage.setItem('wuhanUnicomReviews', JSON.stringify(reviews));

        // 显示成功提示
        alert('感谢您的评价！');
        
        // 返回首页
        this.showPage('home');
        
        // 重置表单
        this.resetReviewForm();
    },

    // 重置评价表单
    resetReviewForm() {
        document.getElementById('reviewText').value = '';
        document.getElementById('charCount').textContent = '0';
        
        this.ratings = { overall: 0, org: 0, service: 0, atmosphere: 0, content: 0 };
        
        const ratingGroups = ['overallRating', 'ratingOrg', 'ratingService', 'ratingAtmosphere', 'ratingContent'];
        ratingGroups.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                this.updateStarDisplay(container, 0);
            }
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 防止iOS橡皮筋效果
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.scrollable')) {
        const scrollable = e.target.closest('.scrollable');
        const scrollTop = scrollable.scrollTop;
        const scrollHeight = scrollable.scrollHeight;
        const clientHeight = scrollable.clientHeight;
        
        if ((scrollTop <= 0 && e.touches[0].clientY > 0) || 
            (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < 0)) {
            e.preventDefault();
        }
    }
}, { passive: false });
