// Import KernelSU API
import { exec, toast } from 'kernelsu';

// Global variables
let currentLanguage = 'en';
let originalSettings = {};
let currentSettings = {};

// DOM elements
const loadingElement = document.getElementById('loading');
const settingsContainer = document.getElementById('settings-container');
const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const languageToggle = document.getElementById('language-toggle');
const titleElement = document.getElementById('title');
const loadingText = document.getElementById('loading-text');
const saveText = document.getElementById('save-text');
const resetText = document.getElementById('reset-text');
const toastElement = document.getElementById('toast');

// Initialize the application
async function init() {
    try {
        // 确定默认语言从 settings.sh
        await loadLanguageFromSettings();
        
        // 更新 UI 语言
        updateUILanguage();
        
        // 从 settings.sh 加载设置
        await loadSettings();
        
        // 为设置生成 UI
        generateSettingsUI();
        
        // 隐藏加载中，显示设置
        loadingElement.style.display = 'none';
        settingsContainer.style.display = 'block';
        
        // 设置事件监听器
        setupEventListeners();
    } catch (error) {
        console.error('初始化错误:', error);
        showToast(error.message || '加载设置失败');
    }
}

// 从 settings.sh 加载语言设置
async function loadLanguageFromSettings() {
    try {
        const { errno, stdout } = await exec("grep 'print_languages=' /data/adb/modules/AMMF/settings/settings.sh | cut -d'\"' -f2");
        
        if (errno === 0 && stdout.trim()) {
            currentLanguage = stdout.trim();
            // 确保语言是支持的
            if (currentLanguage !== 'en' && currentLanguage !== 'zh') {
                currentLanguage = 'en';
            }
        }
    } catch (error) {
        console.error('加载语言设置错误:', error);
        currentLanguage = 'en'; // 默认为英语
    }
}

// 更新 UI 语言
function updateUILanguage() {
    const translations = currentLanguage === 'zh' ? zh : en;
    
    // 更新静态元素
    titleElement.textContent = translations.title;
    loadingText.textContent = translations.loading;
    saveText.textContent = translations.save;
    resetText.textContent = translations.reset;
}

// 从 settings.sh 加载设置
async function loadSettings() {
    try {
        const { errno, stdout } = await exec("cat /data/adb/modules/AMMF/settings/settings.sh");
        
        if (errno === 0) {
            // 解析设置文件
            parseSettingsFile(stdout);
        } else {
            throw new Error('无法读取设置文件');
        }
    } catch (error) {
        console.error('加载设置错误:', error);
        throw error;
    }
}

// 解析设置文件内容
function parseSettingsFile(fileContent) {
    originalSettings = {};
    currentSettings = {};
    
    // 正则表达式匹配变量定义
    const variableRegex = /^([A-Za-z_][A-Za-z0-9_]*)=("([^"]*)"|([^"\s]*))/gm;
    let match;
    
    while ((match = variableRegex.exec(fileContent)) !== null) {
        const name = match[1];
        const value = match[3] !== undefined ? match[3] : match[4];
        
        // 确定变量类型
        let type = 'text';
        if (value === 'true' || value === 'false') {
            type = 'boolean';
        } else if (!isNaN(value) && value !== '') {
            type = 'number';
        }
        
        originalSettings[name] = { value, type };
        currentSettings[name] = { value, type };
    }
}

// 为设置生成 UI
function generateSettingsUI() {
    settingsContainer.innerHTML = '';
    const translations = currentLanguage === 'zh' ? zh : en;
    
    // 按字母顺序排序键
    const sortedKeys = Object.keys(currentSettings).sort();
    
    for (const key of sortedKeys) {
        const setting = currentSettings[key];
        const settingElement = document.createElement('div');
        settingElement.className = 'setting-item';
        
        // 设置标题和描述
        const headerElement = document.createElement('div');
        headerElement.className = 'setting-header';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'setting-name';
        nameElement.textContent = translations[key] || key;
        
        headerElement.appendChild(nameElement);
        settingElement.appendChild(headerElement);
        
        // 添加描述（如果有）
        if (translations[`${key}_desc`]) {
            const descElement = document.createElement('div');
            descElement.className = 'setting-description';
            descElement.textContent = translations[`${key}_desc`];
            settingElement.appendChild(descElement);
        }
        
        // 根据类型创建控件
        let inputElement;
        
        if (setting.type === 'boolean') {
            // 为布尔值创建开关
            const switchContainer = document.createElement('label');
            switchContainer.className = 'switch';
            
            inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
            inputElement.checked = setting.value === 'true';
            inputElement.addEventListener('change', () => {
                currentSettings[key].value = inputElement.checked ? 'true' : 'false';
            });
            
            const sliderElement = document.createElement('span');
            sliderElement.className = 'slider';
            
            switchContainer.appendChild(inputElement);
            switchContainer.appendChild(sliderElement);
            headerElement.appendChild(switchContainer);
        } else if (setting.type === 'number') {
            // 为数字创建滑动条
            const rangeContainer = document.createElement('div');
            rangeContainer.className = 'range-container';
            
            inputElement = document.createElement('input');
            inputElement.type = 'range';
            inputElement.className = 'range-slider';
            inputElement.min = '0';
            inputElement.max = Math.max(100, parseInt(setting.value) * 2);
            inputElement.value = setting.value;
            
            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'range-value';
            valueDisplay.textContent = setting.value;
            
            inputElement.addEventListener('input', () => {
                valueDisplay.textContent = inputElement.value;
                currentSettings[key].value = inputElement.value;
            });
            
            rangeContainer.appendChild(inputElement);
            rangeContainer.appendChild(valueDisplay);
            settingElement.appendChild(rangeContainer);
        } else {
            // 为文本创建输入框
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'text-input';
            inputElement.value = setting.value;
            inputElement.addEventListener('input', () => {
                currentSettings[key].value = inputElement.value;
            });
            
            settingElement.appendChild(inputElement);
        }
        
        settingsContainer.appendChild(settingElement);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 保存按钮
    saveButton.addEventListener('click', saveSettings);
    
    // 重置按钮
    resetButton.addEventListener('click', resetSettings);
    
    // 语言切换
    languageToggle.addEventListener('click', toggleLanguage);
}

// 保存设置
async function saveSettings() {
    try {
        const translations = currentLanguage === 'zh' ? zh : en;
        
        // 构建新的设置文件内容
        let newSettingsContent = "# Script configuration parameters\n";
        
        for (const [key, setting] of Object.entries(currentSettings)) {
            let valueStr = setting.value;
            
            // 为字符串添加引号
            if (setting.type === 'text' && !valueStr.startsWith('"') && !valueStr.endsWith('"')) {
                valueStr = `"${valueStr}"`;
            }
            
            newSettingsContent += `${key}=${valueStr}\n`;
        }
        
        // 写入文件
        const { errno } = await exec(`echo '${newSettingsContent}' > /data/adb/modules/AMMF/settings/settings.sh`);
        
        if (errno === 0) {
            showToast(translations.saveSuccess);
            // 更新原始设置
            originalSettings = JSON.parse(JSON.stringify(currentSettings));
        } else {
            throw new Error(translations.saveError);
        }
    } catch (error) {
        console.error('保存设置错误:', error);
        const translations = currentLanguage === 'zh' ? zh : en;
        showToast(error.message || translations.saveError);
    }
}

// 重置设置
function resetSettings() {
    const translations = currentLanguage === 'zh' ? zh : en;
    
    if (confirm(translations.resetConfirm)) {
        // 重置为原始值
        currentSettings = JSON.parse(JSON.stringify(originalSettings));
        generateSettingsUI();
    }
}

// 切换语言
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    updateUILanguage();
    generateSettingsUI();
}

// 显示 Toast 消息
function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add('show');
    
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);