// 多语言支持
const translations = {
    zh: {
        title: "模块设置",
        loading: "加载中...",
        save: "保存",
        reset: "重置",
        saveSuccess: "设置已保存",
        saveFailed: "保存失败",
        resetConfirm: "确定要重置所有设置吗？",
        boolean: {
            true: "开启",
            false: "关闭"
        }
    },
    en: {
        title: "Module Settings",
        loading: "Loading...",
        save: "Save",
        reset: "Reset",
        saveSuccess: "Settings saved",
        saveFailed: "Save failed",
        resetConfirm: "Are you sure you want to reset all settings?",
        boolean: {
            true: "ON",
            false: "OFF"
        }
    }
};

// 默认语言
let currentLang = 'zh';

// 语言切换函数
function setLanguage(lang) {
    currentLang = lang;
    
    // 更新UI文本
    document.getElementById('title').textContent = translations[lang].title;
    document.getElementById('loading-text').textContent = translations[lang].loading;
    document.getElementById('save-btn').textContent = translations[lang].save;
    document.getElementById('reset-btn').textContent = translations[lang].reset;
    
    // 更新设置项的描述文本
    const descElements = document.querySelectorAll('.setting-description');
    descElements.forEach(elem => {
        const key = elem.getAttribute('data-i18n-key');
        if (key && sDescriptions[key]) {
            elem.textContent = settingsDescriptions[key][lang];
        }
    });
    
    // 更新布尔值选项的文本
    const toggleLabels = document.querySelectorAll('.toggle-label');
    toggleLabels.forEach(label => {
        const isOn = label.getAttribute('data-value') === 'true';
        label.textContent = translations[lang].boolean[isOn ? 'true' : 'false'];
    });
    
    // 高亮当前语言按钮
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    
    // 保存语言选择到localStorage
    localStorage.setItem('ammf-language', lang);
}

// 设置项描述的多语言支持
const settingsDescriptions = {
    // 这里将根据settings.sh中的变量动态填充
};

// 初始化语言设置
document.addEventListener('DOMContentLoaded', () => {
    // 绑定语言切换按钮事件
    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    
    // 从localStorage或settings.sh获取默认语言
    // 实际语言设置将在app.js中完成，因为需要先读取settings.sh
});