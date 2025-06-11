// 全局变量
let questionBank = []; // 存储所有题目
let currentQuestions = []; // 当前答题的题目集
let currentQuestionIndex = 0; // 当前题目索引
let score = 0; // 当前得分
let wrongQuestions = new Set(); // 错题集（改用Set存储题目ID）
let correctQuestions = new Set(); // 存储已答对的题目ID
let currentSession = null; // 当前答题会话
let isWrongQuestionsMode = false; // 是否在错题本模式

// 页面状态枚举
const PageState = {
    HOME: 'home',
    QUIZ: 'quiz',
    RESULT: 'result',
    REVIEW: 'review'
};

// DOM元素
const homePage = document.getElementById('home-page');
const quizPage = document.getElementById('quiz-page');
const resultPage = document.getElementById('result-page');
const reviewPage = document.getElementById('review-page');
const questionInput = document.getElementById('question-input');
const importBtn = document.getElementById('import-btn');
const startBtn = document.getElementById('start-btn');
const questionCountElem = document.getElementById('question-count');
const jsonQuestionCountElem = document.getElementById('json-question-count');
const questionTitle = document.getElementById('question-title');
const optionsContainer = document.getElementById('options-container');
const answerContainer = document.querySelector('.answer-container');
const resultStatus = document.getElementById('result-status');
const userAnswerElem = document.getElementById('user-answer');
const correctAnswerElem = document.getElementById('correct-answer');
const explanationElem = document.getElementById('explanation');
const nextBtn = document.getElementById('next-btn');
const currentQuestionElem = document.getElementById('current-question');
const totalQuestionsElem = document.getElementById('total-questions');
const scoreElem = document.getElementById('score');
const finalScoreElem = document.getElementById('final-score');
const maxScoreElem = document.getElementById('max-score');
const accuracyElem = document.getElementById('accuracy');
const progressFill = document.querySelector('.progress-fill');
const reviewBtn = document.getElementById('review-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const wrongQuestionsContainer = document.getElementById('wrong-questions-container');
const backToResultsBtn = document.getElementById('back-to-results');
const resetBtn = document.createElement('button');
resetBtn.textContent = '重置答题记录';
resetBtn.addEventListener('click', resetProgress);
document.querySelector('.start-section').appendChild(resetBtn);

// 保存页面状态
function savePageState(state) {
    localStorage.setItem('pageState', state);
}

// 从localStorage加载已答对的题目和当前会话
function loadSavedData() {
    // 加载已答对的题目
    const saved = localStorage.getItem('correctQuestions');
    if (saved) {
        correctQuestions = new Set(JSON.parse(saved));
    }
    
    // 加载错题集
    const savedWrong = localStorage.getItem('wrongQuestions');
    if (savedWrong) {
        wrongQuestions = new Set(JSON.parse(savedWrong));
    }
    
    // 加载当前会话
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
        currentSession = JSON.parse(savedSession);
    }
    
    // 加载页面状态
    const pageState = localStorage.getItem('pageState');
    if (pageState) {
        switch (pageState) {
            case PageState.QUIZ:
                if (currentSession) {
                    continueQuiz(false); // 不显示提示信息
                }
                break;
            case PageState.RESULT:
                if (currentSession) {
                    showResult();
                }
                break;
            case PageState.REVIEW:
                if (wrongQuestions && wrongQuestions.size > 0) {
                    showReview();
                }
                break;
            default:
                goHome();
        }
    }
}

// 保存已答对的题目到localStorage
function saveCorrectQuestions() {
    localStorage.setItem('correctQuestions', JSON.stringify([...correctQuestions]));
}

// 保存错题集到localStorage
function saveWrongQuestions() {
    localStorage.setItem('wrongQuestions', JSON.stringify([...wrongQuestions]));
}

// 保存当前会话
function saveCurrentSession() {
    if (currentQuestions.length > 0) {
        const sessionData = {
            questions: currentQuestions,
            currentIndex: currentQuestionIndex,
            score: score,
            wrongQuestions: wrongQuestions
        };
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
    } else {
        localStorage.removeItem('currentSession');
    }
}

// 重置答题记录
function resetProgress() {
    if (confirm('确定要重置所有答题记录吗？这将清除所有已答对的题目记录、错题记录和当前进度。')) {
        correctQuestions.clear();
        wrongQuestions.clear();
        saveCorrectQuestions();
        saveWrongQuestions();
        localStorage.removeItem('currentSession');
        currentSession = null;
        alert('答题记录已重置');
        updateWrongCount();
        goHome();
    }
}

// 添加继续答题按钮
const continueBtn = document.createElement('button');
continueBtn.textContent = '继续上次答题';
continueBtn.id = 'continue-btn';
continueBtn.style.display = 'none';
document.querySelector('.start-section').insertBefore(continueBtn, startBtn);

// 添加退出答题按钮
const exitBtn = document.createElement('button');
exitBtn.textContent = '退出答题';
exitBtn.id = 'exit-btn';
document.querySelector('.quiz-header').appendChild(exitBtn);

// 添加错题本按钮
const wrongBookBtn = document.createElement('button');
wrongBookBtn.textContent = '练习错题';
wrongBookBtn.id = 'wrong-book-btn';
document.querySelector('.start-section').appendChild(wrongBookBtn);

// 显示错题数量
const wrongCountSpan = document.createElement('span');
wrongCountSpan.id = 'wrong-count';
wrongCountSpan.style.marginLeft = '10px';
document.querySelector('.start-section').appendChild(wrongCountSpan);

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 加载保存的数据
    loadSavedData();
    
    // 页面加载时从全局变量加载题库
    loadQuestionBankFromData();
    
    importBtn.addEventListener('click', importQuestions);
    startBtn.addEventListener('click', startNewQuiz);
    continueBtn.addEventListener('click', () => continueQuiz(true));
    exitBtn.addEventListener('click', exitQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    reviewBtn.addEventListener('click', showReview);
    restartBtn.addEventListener('click', restartQuiz);
    homeBtn.addEventListener('click', goHome);
    backToResultsBtn.addEventListener('click', () => {
        reviewPage.style.display = 'none';
        resultPage.style.display = 'block';
        savePageState(PageState.RESULT);
    });
    wrongBookBtn.addEventListener('click', startWrongQuestionsQuiz);
    
    // 检查是否有未完成的答题会话
    updateContinueButton();
    
    // 初始化错题数量显示
    updateWrongCount();
    
    // 添加页面刷新前的保存操作
    window.addEventListener('beforeunload', () => {
        if (quizPage.style.display === 'block') {
            saveCurrentSession();
            savePageState(PageState.QUIZ);
        }
    });
});

// 更新继续答题按钮状态
function updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    if (currentSession) {
        continueBtn.style.display = 'block';
    } else {
        continueBtn.style.display = 'none';
    }
}

// 更新错题数量显示
function updateWrongCount() {
    const wrongCount = wrongQuestions.size;
    wrongCountSpan.textContent = `错题数量: ${wrongCount}`;
    wrongBookBtn.disabled = wrongCount === 0;
}

// 开始新的答题会话
function startNewQuiz() {
    // 如果有未完成的会话，询问用户
    if (currentSession && !confirm('你有未完成的答题进度，确定要开始新的答题吗？')) {
        return;
    }
    
    isWrongQuestionsMode = false;
    startQuiz(true);
}

// 继续上次的答题会话
function continueQuiz(showPrompt = true) {
    if (!currentSession) {
        if (showPrompt) {
            alert('没有找到未完成的答题进度');
        }
        return;
    }
    
    // 恢复会话数据
    currentQuestions = currentSession.questions;
    currentQuestionIndex = currentSession.currentIndex;
    score = currentSession.score;
    wrongQuestions = currentSession.wrongQuestions;
    
    // 更新UI
    totalQuestionsElem.textContent = currentQuestions.length;
    scoreElem.textContent = score;
    
    // 显示答题页面
    homePage.style.display = 'none';
    quizPage.style.display = 'block';
    resultPage.style.display = 'none';
    reviewPage.style.display = 'none';
    
    // 加载当前题目
    loadQuestion();
    
    // 保存页面状态
    savePageState(PageState.QUIZ);
}

// 退出答题
function exitQuiz() {
    if (confirm('确定要退出答题吗？系统会保存当前进度。')) {
        saveCurrentSession();
        goHome();
    }
}

// 从全局变量加载题库
function loadQuestionBankFromData() {
    if (window.questionData && window.questionData.单选题 && Array.isArray(window.questionData.单选题)) {
        questionBank = window.questionData.单选题.map(item => {
            // 解析选项
            const options = {};
            if (Array.isArray(item.选项)) {
                item.选项.forEach(option => {
                    const key = option.charAt(0); // 获取选项字母，如A
                    const value = option.substring(3); // 获取选项内容，跳过"A. "
                    options[key] = value;
                });
            }
            
            // 解析正确答案
            let correctAnswer = '';
            if (item.正确答案) {
                correctAnswer = item.正确答案.charAt(0); // 获取正确答案字母，如C
            }
            
            return {
                id: parseInt(item.题目.match(/^\d+/) ? item.题目.match(/^\d+/)[0] : Math.floor(Math.random() * 10000)),
                type: '单选题',
                content: item.题目.replace(/^\d+\.\s*\(单选题\)\s*/, ''),
                options: options,
                correctAnswer: correctAnswer,
                explanation: ''
            };
        });
        
        // 更新题目数量显示
        updateQuestionCount();
        
        console.log(`成功加载 ${questionBank.length} 道题目`);
    }
}

// 更新题目数量显示
function updateQuestionCount() {
    questionCountElem.textContent = `当前题库: ${questionBank.length} 道题`;
    jsonQuestionCountElem.textContent = questionBank.length;
    
    // 如果题库不为空，启用开始按钮
    startBtn.disabled = questionBank.length === 0;
}

// 导入题目
function importQuestions() {
    const text = questionInput.value.trim();
    if (!text) {
        alert('请粘贴题目文本');
        return;
    }

    try {
        // 尝试解析为JSON
        try {
            const jsonData = JSON.parse(text);
            if (jsonData && jsonData.单选题 && Array.isArray(jsonData.单选题)) {
                // 处理JSON数据
                processJsonData(jsonData);
            }
        } catch (jsonError) {
            // 如果不是JSON，则使用正则表达式解析
            const parsedQuestions = parseQuestionText(text);
            if (parsedQuestions.length > 0) {
                // 创建JSON数据结构
                const jsonData = {
                    "单选题": parsedQuestions
                };
                
                // 处理解析后的数据
                processJsonData(jsonData);
                
                // 保存为JSON文件
                saveAsJsonFile(jsonData);
            } else {
                alert('无法解析题目，请检查文本格式');
            }
        }
    } catch (error) {
        console.error('解析题目出错:', error);
        alert('解析题目出错，请检查文本格式');
    }
}

// 处理JSON数据
function processJsonData(jsonData) {
    // 将JSON数据转换为题库格式
    questionBank = jsonData.单选题.map(item => {
        // 解析选项
        const options = {};
        if (Array.isArray(item.选项)) {
            item.选项.forEach(option => {
                const key = option.charAt(0); // 获取选项字母，如A
                const value = option.substring(3); // 获取选项内容，跳过"A. "
                options[key] = value;
            });
        }
        
        // 解析正确答案
        let correctAnswer = '';
        if (item.正确答案) {
            correctAnswer = item.正确答案.charAt(0); // 获取正确答案字母，如C
        }
        
        return {
            id: parseInt(item.题目.match(/^\d+/) ? item.题目.match(/^\d+/)[0] : Math.floor(Math.random() * 10000)),
            type: '单选题',
            content: item.题目.replace(/^\d+\.\s*\(单选题\)\s*/, ''),
            options: options,
            correctAnswer: correctAnswer,
            explanation: ''
        };
    });
    
    // 更新题目数量显示
    updateQuestionCount();
    
    alert(`成功导入 ${questionBank.length} 道题目`);
}

// 解析题目文本
function parseQuestionText(text) {
    const questions = [];
    
    // 使用正则表达式匹配题目格式
    const questionRegex = /(\d+)\.\s*\(单选题\)(.*?)\(\).*?\n(A\.\s*.*?)\n(B\.\s*.*?)\n(C\.\s*.*?)\n(D\.\s*.*?)\n.*?正确答案:(.*?)[;；]/gs;
    
    let match;
    while ((match = questionRegex.exec(text)) !== null) {
        const [, number, content, optionA, optionB, optionC, optionD, correctAnswer] = match;
        
        // 提取正确答案
        const answerMatch = correctAnswer.match(/([A-D])\s*[:：]\s*(.*)/);
        let correctOption = '';
        let correctContent = '';
        
        if (answerMatch) {
            correctOption = answerMatch[1];
            correctContent = answerMatch[2];
        }
        
        // 创建题目对象
        const question = {
            "题目": `${number}. (单选题)${content.trim()}`,
            "选项": [
                optionA.trim(),
                optionB.trim(),
                optionC.trim(),
                optionD.trim()
            ],
            "正确答案": `${correctOption}: ${correctContent}`
        };
        
        questions.push(question);
    }
    
    return questions;
}

// 保存为JSON文件
function saveAsJsonFile(jsonData) {
    // 创建Blob对象
    const jsonString = JSON.stringify(jsonData, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 获取当前时间戳作为文件名
    const timestamp = new Date().getTime();
    const fileName = `tiku_${timestamp}.json`;
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // 将新题目合并到现有题库
    mergeWithExistingTiku(jsonData);
}

// 将新题目合并到现有题库
function mergeWithExistingTiku(newData) {
    // 检查是否有现有的题库数据
    if (window.questionData && window.questionData.单选题) {
        // 获取现有题目的ID列表
        const existingIds = new Set(window.questionData.单选题.map(q => {
            const match = q.题目.match(/^\d+/);
            return match ? parseInt(match[0]) : -1;
        }));
        
        // 过滤掉已存在的题目
        const newQuestions = newData.单选题.filter(q => {
            const match = q.题目.match(/^\d+/);
            const id = match ? parseInt(match[0]) : -1;
            return !existingIds.has(id);
        });
        
        // 合并新题目
        if (newQuestions.length > 0) {
            window.questionData.单选题 = [...window.questionData.单选题, ...newQuestions];
            
            // 重新加载题库
            loadQuestionBankFromData();
            
            alert(`成功添加 ${newQuestions.length} 道新题目到题库`);
        } else {
            alert('没有新的题目可添加，所有题目已存在于题库中');
        }
    }
}

// 开始答题
function startQuiz(isNewSession = false) {
    // 获取未答对的题目
    const availableQuestions = questionBank.filter(q => !correctQuestions.has(q.id));
    
    if (availableQuestions.length === 0) {
        alert('恭喜你！所有题目都已答对。如果要重新答题，请点击"重置答题记录"按钮。');
        return;
    }
    
    // 如果是新会话，清除之前的会话数据
    if (isNewSession) {
        localStorage.removeItem('currentSession');
        currentSession = null;
    }
    
    // 如果未答对的题目超过50道，随机抽取50道
    if (availableQuestions.length > 50) {
        currentQuestions = getRandomQuestions(availableQuestions, 50);
    } else {
        currentQuestions = [...availableQuestions];
    }
    
    // 重置状态
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = new Set();
    
    // 更新UI
    totalQuestionsElem.textContent = currentQuestions.length;
    scoreElem.textContent = score;
    
    // 显示答题页面
    homePage.style.display = 'none';
    quizPage.style.display = 'block';
    resultPage.style.display = 'none';
    reviewPage.style.display = 'none';
    
    // 加载第一道题
    loadQuestion();
    
    // 更新进度显示
    updateProgressDisplay();
    
    // 保存页面状态
    savePageState(PageState.QUIZ);
}

// 随机抽取指定数量的题目
function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 加载当前题目
function loadQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // 更新题目内容
    questionTitle.textContent = `${currentQuestionIndex + 1}. (${question.type})${question.content}`;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    
    // 添加选项
    for (const [key, value] of Object.entries(question.options)) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.option = key;
        optionDiv.textContent = `${key}: ${value}`;
        
        // 添加点击事件
        optionDiv.addEventListener('click', selectOption);
        
        optionsContainer.appendChild(optionDiv);
    }
    
    // 更新进度
    currentQuestionElem.textContent = currentQuestionIndex + 1;
    progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
    
    // 隐藏答案容器
    answerContainer.style.display = 'none';
}

// 选择选项
function selectOption(event) {
    // 如果已经选择了选项，不再响应点击
    if (answerContainer.style.display === 'block') return;
    
    const selectedOption = event.target;
    const optionKey = selectedOption.dataset.option;
    const question = currentQuestions[currentQuestionIndex];
    
    // 标记选中的选项
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    selectedOption.classList.add('selected');
    
    // 判断答案是否正确
    const isCorrect = optionKey === question.correctAnswer;
    
    // 更新分数和记录
    if (isCorrect) {
        score++;
        scoreElem.textContent = score;
        correctQuestions.add(question.id);
        saveCorrectQuestions();
        
        // 如果在错题本模式下答对，从错题集中移除
        if (isWrongQuestionsMode) {
            wrongQuestions.delete(question.id);
            saveWrongQuestions();
            updateWrongCount();
        }
    } else {
        // 添加到错题集
        wrongQuestions.add(question.id);
        saveWrongQuestions();
        updateWrongCount();
    }
    
    // 显示正确和错误的选项
    options.forEach(option => {
        const key = option.dataset.option;
        if (key === question.correctAnswer) {
            option.classList.add('correct');
        } else if (key === optionKey && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // 显示答案解析
    showAnswer(optionKey, question.correctAnswer, isCorrect);
}

// 显示答案解析
function showAnswer(userOption, correctOption, isCorrect) {
    // 设置结果状态
    if (isCorrect) {
        resultStatus.textContent = '回答正确！';
        resultStatus.className = 'correct';
    } else {
        resultStatus.textContent = '回答错误！';
        resultStatus.className = 'incorrect';
    }
    
    // 设置用户答案和正确答案
    const question = currentQuestions[currentQuestionIndex];
    userAnswerElem.textContent = `${userOption}: ${question.options[userOption]}`;
    correctAnswerElem.textContent = `${correctOption}: ${question.options[correctOption]}`;
    
    // 设置解析内容
    if (question.explanation) {
        explanationElem.textContent = question.explanation;
    } else {
        explanationElem.textContent = '暂无解析';
    }
    
    // 显示答案容器
    answerContainer.style.display = 'block';
}

// 下一题
function nextQuestion() {
    currentQuestionIndex++;
    
    // 如果已经是最后一题，显示结果页面
    if (currentQuestionIndex >= currentQuestions.length) {
        showResult();
        return;
    }
    
    // 加载下一题
    loadQuestion();
}

// 显示结果页面
function showResult() {
    // 清除当前会话
    localStorage.removeItem('currentSession');
    currentSession = null;
    isWrongQuestionsMode = false;
    
    // 更新结果数据
    finalScoreElem.textContent = score;
    maxScoreElem.textContent = currentQuestions.length;
    const accuracy = (score / currentQuestions.length * 100).toFixed(1);
    accuracyElem.textContent = `${accuracy}%`;
    
    // 显示结果页面
    quizPage.style.display = 'none';
    resultPage.style.display = 'block';
    reviewPage.style.display = 'none';
    
    // 更新进度显示
    updateProgressDisplay();
    updateWrongCount();
    
    // 保存页面状态
    savePageState(PageState.RESULT);
}

// 显示错题集
function showReview() {
    // 如果没有错题，提示用户
    if (wrongQuestions.size === 0) {
        alert('恭喜你！没有错题');
        return;
    }
    
    // 清空错题容器
    wrongQuestionsContainer.innerHTML = '';
    
    // 添加错题
    wrongQuestions.forEach((question, index) => {
        const wrongQuestionDiv = document.createElement('div');
        wrongQuestionDiv.className = 'wrong-question';
        
        // 题目标题
        const title = document.createElement('h3');
        title.textContent = `${index + 1}. (${question.type})${question.content}`;
        wrongQuestionDiv.appendChild(title);
        
        // 选项
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'wrong-options';
        
        for (const [key, value] of Object.entries(question.options)) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'wrong-option';
            
            // 标记用户选择的选项和正确选项
            if (key === question.userAnswer) {
                optionDiv.classList.add('user-selected');
            }
            if (key === question.correctAnswer) {
                optionDiv.classList.add('correct');
            }
            
            optionDiv.textContent = `${key}: ${value}`;
            optionsDiv.appendChild(optionDiv);
        }
        
        wrongQuestionDiv.appendChild(optionsDiv);
        
        // 答案信息
        const answerInfo = document.createElement('div');
        answerInfo.className = 'answer-info';
        answerInfo.innerHTML = `
            <p>你的答案: ${question.userAnswer}: ${question.options[question.userAnswer]}</p>
            <p>正确答案: ${question.correctAnswer}: ${question.options[question.correctAnswer]}</p>
        `;
        
        wrongQuestionDiv.appendChild(answerInfo);
        
        // 解析
        if (question.explanation) {
            const explanation = document.createElement('div');
            explanation.className = 'explanation';
            explanation.textContent = question.explanation;
            wrongQuestionDiv.appendChild(explanation);
        }
        
        wrongQuestionsContainer.appendChild(wrongQuestionDiv);
    });
    
    // 显示错题集页面
    resultPage.style.display = 'none';
    reviewPage.style.display = 'block';
    
    // 保存页面状态
    savePageState(PageState.REVIEW);
}

// 重新开始答题
function restartQuiz() {
    startQuiz();
}

// 返回主页
function goHome() {
    homePage.style.display = 'block';
    quizPage.style.display = 'none';
    resultPage.style.display = 'none';
    reviewPage.style.display = 'none';
    
    // 更新进度显示
    updateProgressDisplay();
    
    // 保存页面状态
    savePageState(PageState.HOME);
}

// 开始错题练习
function startWrongQuestionsQuiz() {
    if (wrongQuestions.size === 0) {
        alert('当前没有错题');
        return;
    }
    
    isWrongQuestionsMode = true;
    
    // 获取错题列表
    const wrongQuestionsList = questionBank.filter(q => wrongQuestions.has(q.id));
    
    // 随机排序错题
    currentQuestions = getRandomQuestions(wrongQuestionsList, wrongQuestionsList.length);
    
    // 重置状态
    currentQuestionIndex = 0;
    score = 0;
    
    // 更新UI
    totalQuestionsElem.textContent = currentQuestions.length;
    scoreElem.textContent = score;
    
    // 显示答题页面
    homePage.style.display = 'none';
    quizPage.style.display = 'block';
    resultPage.style.display = 'none';
    reviewPage.style.display = 'none';
    
    // 加载第一道题
    loadQuestion();
    
    // 保存页面状态
    savePageState(PageState.QUIZ);
}

// 更新进度显示
function updateProgressDisplay() {
    const totalQuestions = questionBank.length;
    const completedQuestions = correctQuestions.size;
    const remainingQuestions = totalQuestions - completedQuestions;
    const wrongCount = wrongQuestions.size;
    const progressText = `总题数: ${totalQuestions} | 已答对: ${completedQuestions} | 未答: ${remainingQuestions} | 错题: ${wrongCount}`;
    document.getElementById('question-count').textContent = progressText;
} 