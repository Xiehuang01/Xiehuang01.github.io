// 在文件开头添加这些变量声明
let scores = [];
let sidebar;

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素引用
    sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const modal = document.getElementById('modal');
    const addNewBtn = document.getElementById('addNewBtn');
    const closeBtn = document.querySelector('.close');
    const scoreForm = document.getElementById('scoreForm');
    const scoresList = document.getElementById('scoresList');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const overlay = document.getElementById('overlay');
    
    // 从localStorage加载数据
    scores = JSON.parse(localStorage.getItem('scores')) || [];
    
    // 初始显示所有乐谱
    displayScores(scores);

    // 侧边栏相关的所有功能初始化
    initializeSidebar();

    // 主题切换功能
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';

    // 添加主题切换事件
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';
        localStorage.setItem('theme', newTheme);
    });

    // 获取警告弹窗元素
    const warningModal = document.getElementById('warningModal');
    const warningConfirmBtn = document.getElementById('warningConfirmBtn');

    // 显示警告弹窗
    warningModal.style.display = 'block';
    overlay.style.display = 'block';

    // 点击确认按钮关闭弹窗
    warningConfirmBtn.addEventListener('click', () => {
        warningModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // 获取密钥验证相关元素
    const keyModal = document.getElementById('keyModal');
    const keyInput = document.getElementById('keyInput');
    const keySubmitBtn = document.getElementById('keySubmitBtn');
    const keyError = document.querySelector('.key-error');
    
    // 检查是否已经验证过密钥
    const isKeyVerified = localStorage.getItem('keyVerified');
    
    if (!isKeyVerified) {
        // 显示密钥验证弹窗
        keyModal.style.display = 'block';
        overlay.style.display = 'block';
        
        // 验证密钥
        keySubmitBtn.addEventListener('click', validateKey);
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validateKey();
            }
        });
    }
    
    function validateKey() {
        const key = keyInput.value.trim();
        const validKeys = ['invKey520', 'invKeyfdd', 'invKeyfmusic'];
        
        if (validKeys.includes(key)) {
            // 密钥正确
            localStorage.setItem('keyVerified', 'true');
            keyModal.style.display = 'none';
            
            // 显示警告提示
            showWarningModal();
        } else {
            // 密钥错误
            keyError.style.display = 'block';
            keyInput.value = '';
            keyInput.focus();
        }
    }
    
    function showWarningModal() {
        const warningModal = document.getElementById('warningModal');
        warningModal.style.display = 'block';
        
        const warningConfirmBtn = document.getElementById('warningConfirmBtn');
        warningConfirmBtn.addEventListener('click', () => {
            warningModal.style.display = 'none';
            overlay.style.display = 'none';
        });
    }

    // 在 DOMContentLoaded 事件监听器中添加
    const resetBtn = document.getElementById('resetBtn');
    const resetModal = document.getElementById('resetModal');
    const resetConfirmBtn = document.getElementById('resetConfirmBtn');
    const resetCancelBtn = document.getElementById('resetCancelBtn');

    // 点击重置按钮显示确认弹窗
    resetBtn.addEventListener('click', () => {
        resetModal.style.display = 'block';
        overlay.style.display = 'block';
    });

    // 点击取消按钮
    resetCancelBtn.addEventListener('click', () => {
        resetModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // 点击确认按钮
    resetConfirmBtn.addEventListener('click', () => {
        // 清除所有本地存储数据
        localStorage.clear();
        // 重新加载页面
        window.location.reload();
    });

    // 修改imageInput，添加multiple属性
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.setAttribute('multiple', 'true');
    }
});

// 初始化侧边栏的所有功能
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const collapseBtn = document.getElementById('collapseBtn');
    const searchInput = document.getElementById('searchInput');
    const navItems = document.querySelectorAll('.nav-item');
    const addNewBtn = document.getElementById('addNewBtn');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const menuBtn = document.getElementById('menuBtn');
    
    // 1. 折叠功能
    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // 保存侧边栏状态
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });

    // 恢复侧边栏状态
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }

    // 2. 导航项切换
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const view = item.dataset.view;
            if (view === 'all') {
                displayScores(scores);
            } else if (view === 'liked') {
                const likedScores = scores.filter(score => score.liked);
                displayScores(likedScores);
            }
        });
    });

    // 3. 搜索功能
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredScores = scores.filter(score => 
            score.title.toLowerCase().includes(searchTerm)
        );
        displayScores(filteredScores);
    });

    // 搜索框样式
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.boxShadow = '0 0 0 2px var(--primary-color)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.boxShadow = 'none';
    });

    // 5. 新建按钮功能
    addNewBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        overlay.style.display = 'block';
    });

    // 6. 新建文件夹功能
    addFolderBtn.addEventListener('click', () => {
        const newFolder = {
            id: Date.now(),
            title: '新建文件夹',
            isFolder: true,
            date: new Date().toISOString().split('T')[0],
            liked: false,
            items: []
        };
        scores.unshift(newFolder);
        localStorage.setItem('scores', JSON.stringify(scores));
        
        // 获取当前激活的视图
        const activeView = document.querySelector('.nav-item.active').dataset.view;
        // 根据当前视图显示内容
        if (activeView === 'liked') {
            const likedScores = scores.filter(score => score.liked);
            displayScores(likedScores);
        } else {
            displayScores(scores);
        }
    });

    // 7. 移动端菜单功能
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
    });

    // 8. 响应式处理
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        }
    });
}

// DOM 元素
const modal = document.getElementById('modal');
const addNewBtn = document.getElementById('addNewBtn');
const closeBtn = document.querySelector('.close');
const scoreForm = document.getElementById('scoreForm');
const scoresList = document.getElementById('scoresList');
const themeIcon = document.getElementById('themeIcon');
const overlay = document.getElementById('overlay');

// 在展开卡片时禁用新建按钮
function toggleNewButton(disabled) {
    addNewBtn.classList.toggle('disabled', disabled);
}

// 添加图片缩放和拖动功能
function initializeImageZoom(imageContainer, img) {
    let scale = 1;
    let isDragging = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;

    // 鼠标滚轮缩放
    imageContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const scaleChange = delta > 0 ? 0.9 : 1.1;
        const newScale = scale * scaleChange;
        
        // 限制缩放范围
        if (newScale >= 0.5 && newScale <= 3) {
            scale = newScale;
            
            // 使用中心点缩放，不受鼠标位置影响
            updateTransform();
        }
    });

    // 开始拖动
    imageContainer.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            imageContainer.style.cursor = 'grabbing';
        }
    });

    // 拖动中
    imageContainer.addEventListener('mousemove', (e) => {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    // 结束拖动
    imageContainer.addEventListener('mouseup', () => {
        isDragging = false;
        imageContainer.style.cursor = 'grab';
    });

    imageContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        imageContainer.style.cursor = 'grab';
    });

    // 双击还原
    imageContainer.addEventListener('dblclick', () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        imageContainer.style.cursor = 'grab';
    });

    // 更新变换
    function updateTransform() {
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
}

// 修改 expandCard 函数以支持多图片
function expandCard(card) {
    const imgSrc = card.querySelector('img').src;
    const title = card.querySelector('.card-title')?.textContent || '';
    const note = card.querySelector('.note-content')?.innerHTML || '';
    
    // 找到对应的score对象
    const id = card.dataset.id;
    const score = scores.find(s => s.id == id);
    
    const expandedCard = document.createElement('div');
    expandedCard.className = 'score-card expanded';
    
    // 基本结构
    let imageGalleryHtml = '';
    
    // 检查是否有多张图片
    if (score && score.images && score.images.length > 1) {
        // 创建图片切换器
        imageGalleryHtml = `
            <div class="image-gallery">
                <div class="main-image-container image-container" style="cursor: grab;">
                    <img src="${imgSrc}" alt="${title}" style="transform-origin: center center; transition: transform 0.1s ease;">
                </div>
                <div class="image-thumbnails">
                    ${score.images.map((img, index) => `
                        <div class="image-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img}" alt="${title} - ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        // 单张图片
        imageGalleryHtml = `
            <div class="image-container" style="cursor: grab;">
                <img src="${imgSrc}" alt="${title}" style="transform-origin: center center; transition: transform 0.1s ease;">
            </div>
        `;
    }
    
    expandedCard.innerHTML = `
        <div class="expanded-header">
            <button class="close-btn" id="closeExpandedBtn">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h3>${title}</h3>
            <div class="note-content">${note}</div>
        </div>
        ${imageGalleryHtml}
    `;
    
    document.body.appendChild(expandedCard);
    
    // 添加关闭按钮的事件监听
    const closeBtn = expandedCard.querySelector('#closeExpandedBtn');
    closeBtn.addEventListener('click', closeExpandedCard);
    
    // 初始化图片缩放功能
    const imageContainer = expandedCard.querySelector('.image-container');
    const img = imageContainer.querySelector('img');
    initializeImageZoom(imageContainer, img);
    
    // 如果有多张图片，初始化缩略图点击事件
    if (score && score.images && score.images.length > 1) {
        const thumbnails = expandedCard.querySelectorAll('.image-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                // 移除所有active类
                thumbnails.forEach(t => t.classList.remove('active'));
                // 添加active类到当前点击的缩略图
                thumbnail.classList.add('active');
                
                // 更新主图
                const index = thumbnail.dataset.index;
                const mainImage = expandedCard.querySelector('.main-image-container img');
                mainImage.src = score.images[index];
                
                // 重置缩放状态
                const mainImageContainer = expandedCard.querySelector('.main-image-container');
                mainImageContainer.querySelector('img').style.transform = 'translate(0px, 0px) scale(1)';
            });
        });
    }
    
    overlay.style.display = 'block';
    toggleNewButton(true);
}

// 修改关闭展开图片功能
function closeExpandedCard() {
    const expandedCard = document.querySelector('.score-card.expanded');
    if (expandedCard) {
        expandedCard.remove(); // 直接移除元素
        overlay.style.display = 'none';
        toggleNewButton(false);
    }
}

// 添加上传类型切换功能
const switchBtns = document.querySelectorAll('.switch-btn');
const imageUpload = document.getElementById('imageUpload');
const linkInput = document.getElementById('linkInput');

switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const type = btn.dataset.type;
        if (type === 'image') {
            imageUpload.classList.remove('hidden');
            linkInput.classList.add('hidden');
            imageInput.required = true;
            linkInput.required = false;
        } else {
            imageUpload.classList.add('hidden');
            linkInput.classList.remove('hidden');
            imageInput.required = false;
            linkInput.required = true;
        }
    });
});

// 修改表单打开时的初始状态
addNewBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    setDefaultDate();
    
    // 设置默认为链接模式
    imageUpload.classList.add('hidden');
    linkInput.classList.remove('hidden');
    imageInput.required = false;
    linkInput.required = true;
});

// 修改表单提交处理
scoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('titleInput').value;
    const date = document.getElementById('dateInput').value;
    const link = document.getElementById('linkInput').value;
    const isLinkType = document.querySelector('.switch-btn[data-type="link"]').classList.contains('active');
    
    // 验证链接输入
    if (isLinkType && !link) {
        alert('请输入链接地址');
        return;
    }
    
    let newScore = {
        id: Date.now(),
        title,
        date,
        link: link || '',
        isLinkType,
        liked: false
    };

    if (isLinkType) {
        // 使用标题文字作为封面
        scores.push(newScore);
        localStorage.setItem('scores', JSON.stringify(scores));
        displayScores(scores);
        scoreForm.reset();
        modal.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        // 处理图片上传
        const imageFiles = document.getElementById('imageInput').files;
        if (!imageFiles || imageFiles.length === 0) {
            alert('请选择图片');
            return;
        }
        
        // 如果只有一张图片，使用原来的处理方式
        if (imageFiles.length === 1) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newScore.image = e.target.result;
                scores.push(newScore);
                localStorage.setItem('scores', JSON.stringify(scores));
                displayScores(scores);
                scoreForm.reset();
                modal.style.display = 'none';
                overlay.style.display = 'none';
            };
            reader.readAsDataURL(imageFiles[0]);
        } else {
            // 处理多张图片的情况
            newScore.images = [];
            let loadedCount = 0;
            
            for (let i = 0; i < imageFiles.length; i++) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 添加到图片数组
                    newScore.images.push(e.target.result);
                    loadedCount++;
                    
                    // 当所有图片都加载完成时
                    if (loadedCount === imageFiles.length) {
                        // 设置第一张图片作为主图
                        newScore.image = newScore.images[0];
                        scores.push(newScore);
                        localStorage.setItem('scores', JSON.stringify(scores));
                        displayScores(scores);
                        scoreForm.reset();
                        modal.style.display = 'none';
                        overlay.style.display = 'none';
                    }
                };
                reader.readAsDataURL(imageFiles[i]);
            }
        }
    }

    // 获取当前激活的视图
    const activeView = document.querySelector('.nav-item.active').dataset.view;
    // 根据当前视图显示内容
    if (activeView === 'liked') {
        const likedScores = scores.filter(score => score.liked);
        displayScores(likedScores);
    } else {
        displayScores(scores);
    }
});

// 拖拽相关变量
let draggedCard = null;

function displayScores(scoresToShow) {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = '';

    // 检查是否是在"我的喜欢"视图
    const isLikedView = document.querySelector('.nav-item.active').dataset.view === 'liked';
    
    // 如果没有乐谱要显示，显示空状态提示
    if (scoresToShow.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = isLikedView ? 
            '快去点亮你的第一个喜欢吧' : 
            '快去创建你的第一个乐谱吧';
        scoresList.appendChild(emptyState);
        return;
    }

    scoresToShow.forEach(score => {
        if (!score) {
            console.error('Invalid score object:', score);
            return;
        }

        const scoreCard = document.createElement('div');
        scoreCard.className = 'score-card';
        scoreCard.draggable = !score.isFolder;
        scoreCard.dataset.type = score.isFolder ? 'folder' : 'score';
        scoreCard.dataset.id = score.id;
        
        let cardContent;
        
        try {
            if (score.isFolder) {
                cardContent = `
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="text-cover">
                                <i class="fas fa-folder fa-3x"></i>
                            </div>
                            <div class="score-card-content">
                                <h3 class="card-title" data-id="${score.id}">${score.title}</h3>
                                <div class="like-btn ${score.liked ? 'liked' : ''}" data-id="${score.id}">
                                    <i class="fas ${score.liked ? 'fa-heart' : 'fa-heart'}"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="delete-container">
                                <i class="fas fa-trash-alt"></i>
                                <span>点击删除</span>
                            </div>
                        </div>
                    </div>
                `;

                scoreCard.innerHTML = cardContent;

                // 修改文件夹点击事件绑定
                scoreCard.addEventListener('click', (e) => {
                    // 如果点击的是点赞按钮，不处理
                    if (e.target.closest('.like-btn')) return;
                    // 如果点击的是删除按钮，不处理
                    if (e.target.closest('.delete-container')) return;
                    // 如果卡片处于翻转状态，不处理
                    if (scoreCard.classList.contains('flipped')) return;
                    
                    expandFolder(scoreCard);
                });

                // 添加文件夹拖拽接收事件
                scoreCard.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (!scoreCard.classList.contains('drag-over')) {
                        scoreCard.classList.add('drag-over');
                    }
                });

                scoreCard.addEventListener('dragleave', () => {
                    scoreCard.classList.remove('drag-over');
                });

                scoreCard.addEventListener('drop', (e) => {
                    e.preventDefault();
                    scoreCard.classList.remove('drag-over');
                    
                    try {
                        const draggingCard = document.querySelector('.dragging');
                        if (draggingCard && draggingCard.dataset.type === 'score') {
                            const draggedId = draggingCard.querySelector('.like-btn').dataset.id;
                            const folderId = score.id;
                            moveItemToFolder(draggedId, folderId);
                        }
                    } catch (err) {
                        console.error('Drop error:', err);
                    }
                });
            } else if (score.isLinkType) {
                // 链接类型卡片的内容
                cardContent = `
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="text-cover">${score.title.slice(0, 2)}</div>
                            <div class="score-card-content">
                                <h3 class="card-title" data-id="${score.id}">${score.title}</h3>
                                <div class="like-btn ${score.liked ? 'liked' : ''}" data-id="${score.id}">
                                    <i class="fas ${score.liked ? 'fa-heart' : 'fa-heart'}"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="delete-container">
                                <i class="fas fa-trash-alt"></i>
                                <span>点击删除</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 图片类型卡片的内容
                cardContent = `
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${score.image}" alt="${score.title}">
                            <div class="score-card-content">
                                <h3 class="card-title" data-id="${score.id}">${score.title}</h3>
                                <div class="like-btn ${score.liked ? 'liked' : ''}" data-id="${score.id}">
                                    <i class="fas ${score.liked ? 'fa-heart' : 'fa-heart'}"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="delete-container">
                                <i class="fas fa-trash-alt"></i>
                                <span>点击删除</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            scoreCard.innerHTML = cardContent;

            // 添加标题右键编辑功能
            const titleElement = scoreCard.querySelector('.card-title');
            titleElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const id = titleElement.dataset.id;
                const currentTitle = titleElement.textContent;
                
                // 创建输入框
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentTitle;
                input.className = 'title-edit-input';
                
                // 替换标题为输入框
                titleElement.innerHTML = '';
                titleElement.appendChild(input);
                input.focus();
                
                // 处理输入框失去焦点或按下回车
                function handleEdit() {
                    const newTitle = input.value.trim();
                    if (newTitle && newTitle !== currentTitle) {
                        // 更新数据
                        const scoreIndex = scores.findIndex(s => s.id == id);
                        scores[scoreIndex].title = newTitle;
                        localStorage.setItem('scores', JSON.stringify(scores));
                        
                        // 更新显示
                        titleElement.textContent = newTitle;
                        if (score.isLinkType) {
                            const textCover = scoreCard.querySelector('.text-cover');
                            textCover.textContent = newTitle.slice(0, 2);
                        }
                    } else {
                        titleElement.textContent = currentTitle;
                    }
                }
                
                input.addEventListener('blur', handleEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        input.blur();
                    }
                });
            });

            // 为链接类型添加点击跳转
            if (score.isLinkType) {
                scoreCard.querySelector('.card-front').addEventListener('click', (e) => {
                    if (!scoreCard.classList.contains('flipped')) {
                        window.open(score.link, '_blank');
                    }
                });
            }

            // 添加长按事件（用于移动端）
            let pressTimer;
            let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            scoreCard.addEventListener('touchstart', (e) => {
                if (!isMobile) return;
                pressTimer = setTimeout(() => {
                    scoreCard.classList.toggle('flipped');
                }, 500); // 500ms长按后翻转卡片
            });

            scoreCard.addEventListener('touchend', (e) => {
                if (!isMobile) return;
                clearTimeout(pressTimer);
            });

            // 右键菜单事件（用于桌面端）
            scoreCard.addEventListener('contextmenu', (e) => {
                if (isMobile) return;
                e.preventDefault();
                scoreCard.classList.toggle('flipped');
            });

            // 删除功能
            const cardBack = scoreCard.querySelector('.card-back');
            cardBack.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = score.id;
                
                // 如果是文件夹且包含项目，显示确认弹窗
                if (score.isFolder && score.items && score.items.length > 0) {
                    const confirmDialog = document.createElement('div');
                    confirmDialog.className = 'confirm-dialog';
                    confirmDialog.innerHTML = `
                        <div class="confirm-content">
                            <h3>确认删除</h3>
                            <p>此文件夹包含 ${score.items.length} 个乐谱，删除文件夹将同时删除所有乐谱。</p>
                            <div class="confirm-buttons">
                                <button class="cancel-btn">取消</button>
                                <button class="confirm-btn">确认删除</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(confirmDialog);
                    
                    // 添加确认弹窗的样式
                    const style = document.createElement('style');
                    style.textContent = `
                        .confirm-dialog {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 2000;
                        }
                        
                        .confirm-content {
                            background: var(--card-background);
                            padding: 24px;
                            border-radius: 12px;
                            width: 90%;
                            max-width: 400px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                        }
                        
                        .confirm-content h3 {
                            margin: 0 0 16px 0;
                            color: var(--text-color);
                        }
                        
                        .confirm-content p {
                            margin: 0 0 24px 0;
                            color: var(--text-color);
                            line-height: 1.5;
                        }
                        
                        .confirm-buttons {
                            display: flex;
                            justify-content: flex-end;
                            gap: 12px;
                        }
                        
                        .confirm-buttons button {
                            padding: 8px 16px;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.9rem;
                            transition: all 0.2s ease;
                        }
                        
                        .cancel-btn {
                            background: var(--border-color);
                            color: var(--text-color);
                        }
                        
                        .confirm-btn {
                            background: #ff4757;
                            color: white;
                        }
                        
                        .cancel-btn:hover {
                            background: var(--hover-color);
                        }
                        
                        .confirm-btn:hover {
                            background: #ff3344;
                        }
                    `;
                    document.head.appendChild(style);
                    
                    // 添加按钮事件
                    const cancelBtn = confirmDialog.querySelector('.cancel-btn');
                    const confirmBtn = confirmDialog.querySelector('.confirm-btn');
                    
                    cancelBtn.addEventListener('click', () => {
                        confirmDialog.remove();
                    });
                    
                    confirmBtn.addEventListener('click', () => {
                        const cardToDelete = document.querySelector(`.score-card[data-id="${id}"]`);
                        if (cardToDelete) {
                            cardToDelete.classList.add('shake');
                            
                            setTimeout(() => {
                                cardToDelete.classList.remove('shake');
                                cardToDelete.classList.add('fade-out');
                                
                                setTimeout(() => {
                                    const index = scores.findIndex(s => s.id == id);
                                    if (index !== -1) {
                                        scores.splice(index, 1);
                                        localStorage.setItem('scores', JSON.stringify(scores));
                                        displayScores(scores);
                                    }
                                }, 300);
                            }, 500);
                        }
                        confirmDialog.remove();
                    });
                    
                    // 点击遮罩层关闭弹窗
                    confirmDialog.addEventListener('click', (e) => {
                        if (e.target === confirmDialog) {
                            confirmDialog.remove();
                        }
                    });
                } else {
                    // 如果不是文件夹或文件夹为空，添加动画后删除
                    const cardToDelete = document.querySelector(`.score-card[data-id="${id}"]`);
                    if (cardToDelete) {
                        cardToDelete.classList.add('shake');
                        
                        setTimeout(() => {
                            cardToDelete.classList.remove('shake');
                            cardToDelete.classList.add('fade-out');
                            
                            setTimeout(() => {
                                const index = scores.findIndex(s => s.id == id);
                                if (index !== -1) {
                                    scores.splice(index, 1);
                                    localStorage.setItem('scores', JSON.stringify(scores));
                                    displayScores(scores);
                                }
                            }, 300);
                        }, 500);
                    }
                }
            });

            // 点赞功能
            const likeBtn = scoreCard.querySelector('.like-btn');
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = likeBtn.dataset.id;
                const scoreIndex = scores.findIndex(s => s.id == id);
                scores[scoreIndex].liked = !scores[scoreIndex].liked;
                localStorage.setItem('scores', JSON.stringify(scores));
                likeBtn.classList.toggle('liked');
                likeBtn.querySelector('i').style.color = scores[scoreIndex].liked ? '#ff4757' : '#000000';
            });

            // 图片展开功能
            scoreCard.querySelector('.card-front').addEventListener('click', () => {
                if (!scoreCard.classList.contains('flipped')) {
                    expandCard(scoreCard);
                }
            });

            // 添加拖拽事件监听器
            if (!score.isFolder) { // 只为乐谱卡片添加拖拽开始事件
                scoreCard.addEventListener('dragstart', (e) => {
                    scoreCard.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', score.id);
                    e.dataTransfer.setData('application/json', JSON.stringify({
                        id: score.id,
                        type: 'score'
                    }));
                });

                scoreCard.addEventListener('dragend', () => {
                    scoreCard.classList.remove('dragging');
                    document.querySelectorAll('.score-card').forEach(card => {
                        card.classList.remove('drag-over');
                    });
                    updateScoresOrder(); // 添加这个函数调用来保存新的顺序
                });
            }

            // 为所有卡片添加拖拽相关事件（包括文件夹）
            scoreCard.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.dragging');
                if (draggingCard && draggingCard !== scoreCard) {
                    const container = scoreCard.parentNode;
                    const cards = [...container.querySelectorAll('.score-card:not(.dragging)')];
                    const nextCard = cards.find(card => {
                        const rect = card.getBoundingClientRect();
                        return e.clientX < rect.left + rect.width / 2;
                    });

                    if (nextCard === scoreCard) {
                        container.insertBefore(draggingCard, scoreCard);
                    } else {
                        container.insertBefore(draggingCard, scoreCard.nextSibling);
                    }
                }
            });

            scoresList.appendChild(scoreCard);
        } catch (error) {
            console.error('Error processing score:', score, error);
        }
    });
}

// 设置日期输入框的默认值为当前日期
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById('dateInput').value = formattedDate;
}

// 修改关闭按钮事件
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
});

// 修改点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === modal || e.target === overlay) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
});

// 移除遮罩层点击事件，因为现在使用返回按钮关闭
overlay.removeEventListener('click', closeExpandedCard);

// 添加ESC键关闭展开的图片
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeExpandedCard();
    }
});

// 修改搜索功能样式
searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.boxShadow = '0 0 0 2px var(--primary-color)';
});

searchInput.addEventListener('blur', () => {
    searchInput.parentElement.style.boxShadow = 'none';
});

// 添加菜单控制功能
const menuBtn = document.getElementById('menuBtn');
const sidebarOverlay = document.createElement('div');
sidebarOverlay.className = 'sidebar-overlay';
document.body.appendChild(sidebarOverlay);

menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    sidebarOverlay.classList.toggle('show');
});

// 点击遮罩层关闭侧边栏
sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
});

// 在窗口调整大小时处理侧边栏状态
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
    }
});

// 添加 updateScoresOrder 函数
function updateScoresOrder() {
    const cards = document.querySelectorAll('.score-card');
    const newScores = [];
    cards.forEach(card => {
        const id = card.dataset.id;
        const score = scores.find(s => s.id == id);
        if (score) {
            newScores.push(score);
        }
    });
    scores = newScores;
    localStorage.setItem('scores', JSON.stringify(scores));
}

// 修改 expandFolder 函数
function expandFolder(folderCard) {
    const folderId = folderCard.querySelector('.card-title').dataset.id;
    const folder = scores.find(s => s.id == folderId);
    
    // 添加遮罩层
    overlay.style.display = 'block';
    
    // 创建扑克牌式展开视图
    const expandedView = document.createElement('div');
    expandedView.className = 'folder-expanded-view';
    expandedView.innerHTML = `
        <div class="folder-header">
            <h3>${folder.title}</h3>
            <button class="close-folder-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="folder-items-container">
            ${folder.items.map(item => `
                <div class="folder-item" data-id="${item.id}">
                    <div class="folder-item-inner">
                        <div class="folder-item-front">
                            <div class="folder-item-content">
                                ${item.isLinkType ? `
                                    <div class="text-cover">
                                        <span>${item.title}</span>
                                    </div>
                                ` : `
                                    <img src="${item.image}" alt="${item.title}">
                                `}
                                <div class="item-title">${item.title}</div>
                            </div>
                        </div>
                        <div class="folder-item-back">
                            <h4>${item.title}</h4>
                            <p>创建于: ${item.date}</p>
                            <button class="remove-from-folder-btn">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>移出文件夹</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(expandedView);

    // 为文件夹中的每个项目添加事件
    const items = expandedView.querySelectorAll('.folder-item');
    items.forEach(item => {
        item.draggable = true;

        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.folder-item').forEach(card => {
                card.classList.remove('drag-target');
            });
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem !== item) {
                const container = item.parentNode;
                const items = [...container.querySelectorAll('.folder-item:not(.dragging)')];
                const nextItem = items.find(card => {
                    const rect = card.getBoundingClientRect();
                    return e.clientX < rect.left + rect.width / 2;
                });

                if (nextItem === item) {
                    item.classList.add('drag-target');
                } else {
                    item.classList.remove('drag-target');
                }

                if (nextItem) {
                    container.insertBefore(draggingItem, nextItem);
                } else {
                    container.appendChild(draggingItem);
                }
            }
        });

        // 添加右键菜单事件
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            item.classList.toggle('flipped');
        });

        // 修改移出文件夹按钮的事件绑定
        const removeButtons = expandedView.querySelectorAll('.remove-from-folder-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const itemId = button.closest('.folder-item').dataset.id;
                moveItemToMain(itemId, folder);
            });
        });

        // 添加点击事件（打开链接或显示图片）
        const itemContent = item.querySelector('.folder-item-content');
        itemContent.addEventListener('click', () => {
            const itemId = item.dataset.id;
            const itemData = folder.items.find(i => i.id == itemId);
            if (itemData) {
                if (itemData.isLinkType) {
                    window.open(itemData.link, '_blank');
                } else if (itemData.image) {
                    const tempCard = document.createElement('div');
                    tempCard.className = 'score-card';
                    tempCard.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front">
                                <img src="${itemData.image}" alt="${itemData.title}">
                            </div>
                        </div>
                    `;
                    expandCard(tempCard);
                }
            }
        });
    });

    // 添加关闭事件
    expandedView.querySelector('.close-folder-btn').addEventListener('click', () => {
        expandedView.remove();
        overlay.style.display = 'none';
    });
    
    // 点击遮罩层关闭文件夹
    overlay.addEventListener('click', () => {
        expandedView.remove();
        overlay.style.display = 'none';
    });
    
    // 修改主界面的拖拽处理
    const mainContent = document.querySelector('.main-content');
    const scoresList = document.getElementById('scoresList');

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        mainContent.classList.add('drag-target');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        mainContent.classList.remove('drag-target');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        mainContent.classList.remove('drag-target');
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            console.log('Drop data:', data); // 调试日志
            
            if (data.fromFolder && data.id) {
                moveItemToMain(data.id, folder);
            }
        } catch (err) {
            console.error('Drop error:', err);
        }
    }

    // 移除之前的事件监听器
    scoresList.removeEventListener('dragover', handleDragOver);
    scoresList.removeEventListener('dragleave', handleDragLeave);
    scoresList.removeEventListener('drop', handleDrop);
    mainContent.removeEventListener('dragover', handleDragOver);
    mainContent.removeEventListener('dragleave', handleDragLeave);
    mainContent.removeEventListener('drop', handleDrop);

    // 添加新的事件监听器
    scoresList.addEventListener('dragover', handleDragOver);
    scoresList.addEventListener('dragleave', handleDragLeave);
    scoresList.addEventListener('drop', handleDrop);
    mainContent.addEventListener('dragover', handleDragOver);
    mainContent.addEventListener('dragleave', handleDragLeave);
    mainContent.addEventListener('drop', handleDrop);
}

// 修改 moveItemToMain 函数
function moveItemToMain(itemId, folder) {
    const itemIndex = folder.items.findIndex(item => item.id == itemId);
    if (itemIndex !== -1) {
        const item = folder.items.splice(itemIndex, 1)[0];
        scores.push(item);
        localStorage.setItem('scores', JSON.stringify(scores));
        
        // 刷新主界面显示
        displayScores(scores);
        
        // 重新渲染文件夹内容
        const expandedView = document.querySelector('.folder-expanded-view');
        if (expandedView) {
            const folderItemsContainer = expandedView.querySelector('.folder-items-container');
            folderItemsContainer.innerHTML = folder.items.map(item => `
                <div class="folder-item" data-id="${item.id}">
                    <div class="folder-item-inner">
                        <div class="folder-item-front">
                            <div class="folder-item-content">
                                ${item.isLinkType ? `
                                    <div class="text-cover">
                                        <span>${item.title}</span>
                                    </div>
                                ` : `
                                    <img src="${item.image}" alt="${item.title}">
                                `}
                                <div class="item-title">${item.title}</div>
                            </div>
                        </div>
                        <div class="folder-item-back">
                            <h4>${item.title}</h4>
                            <p>创建于: ${item.date}</p>
                            <button class="remove-from-folder-btn">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>移出文件夹</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // 重新绑定事件
            initializeFolderItems(expandedView, folder);
        }
    }
}

// 添加初始化文件夹项目的函数
function initializeFolderItems(expandedView, folder) {
    const items = expandedView.querySelectorAll('.folder-item');
    items.forEach(item => {
        // 添加右键菜单事件
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            item.classList.toggle('flipped');
        });

        // 修改移出文件夹按钮的事件绑定
        const removeButton = item.querySelector('.remove-from-folder-btn');
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = item.dataset.id;
            moveItemToMain(itemId, folder);
        });

        // 其他事件绑定（如拖拽等）...
    });
}

// 修改 moveItemToFolder 函数，添加类型检查
function moveItemToFolder(itemId, folderId) {
    const itemIndex = scores.findIndex(s => s.id == itemId);
    const folderIndex = scores.findIndex(s => s.id == folderId);
    
    if (itemIndex !== -1 && folderIndex !== -1) {
        const item = scores[itemIndex];
        const folder = scores[folderIndex];
        
        // 检查是否符合拖拽规则
        if (!item.isFolder && folder.isFolder) {
            const movedItem = scores.splice(itemIndex, 1)[0];
            if (!folder.items) {
                folder.items = [];
            }
            folder.items.push(movedItem);
            localStorage.setItem('scores', JSON.stringify(scores));
            displayScores(scores);
        }
    }
} 