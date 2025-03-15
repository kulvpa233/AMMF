// 语言配置
const translations = {
    en: {
        title: 'AMMF Settings',
        save: 'Save',
        loading: 'Loading settings...',
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Error saving settings',
        booleanTrue: 'Enabled',
        booleanFalse: 'Disabled'
    },
    zh: {
        title: '模块设置',
        save: '保存',
        loading: '加载设置中...',
        saveSuccess: '设置保存成功！',
        saveError: '保存设置时出错',
        booleanTrue: '已启用',
        booleanFalse: '已禁用'
    }
};

// 应用状态
const state = {
    settings: {},
    language: 'en',
    isDarkMode: false
};

// 初始化应用
async function initApp() {
    // 检测系统暗色模式
    checkDarkMode();
    
    // 加载设置
    await loadSettings();
    
    // 设置事件监听器
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('save-button').addEventListener('click', saveSettings);
    
    // 更新UI语言
    updateLanguage();
}

// 检测系统暗色模式
function checkDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.isDarkMode = true;
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').querySelector('span').textContent = 'light_mode';
    }
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        state.isDarkMode = e.matches;
        document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        document.getElementById('theme-toggle').querySelector('span').textContent = e.matches ? 'light_mode' : 'dark_mode';
    });
}

// 切换主题
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    document.body.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
    document.getElementById('theme-toggle').querySelector('span').textContent = state.isDarkMode ? 'light_mode' : 'dark_mode';
}

// 切换语言
function toggleLanguage() {
    state.language = state.language === 'en' ? 'zh' : 'en';
    updateLanguage();
}

// 更新UI语言
function updateLanguage() {
    document.getElementById('title').textContent = translations[state.language].title;
    document.getElementById('loading-text').textContent = translations[state.language].loading;
    
    // 更新所有已生成的设置项的语言
    const settingLabels = document.querySelectorAll('.setting-label');
    settingLabels.forEach(label => {
        const key = label.getAttribute('data-key');
        if (key) {
            label.textContent = key;
        }
    });
    
    // 更新布尔值显示
    const booleanValues = document.querySelectorAll('.boolean-value');
    booleanValues.forEach(element => {
        const isChecked = element.previousElementSibling.querySelector('input').checked;
        element.textContent = isChecked ? 
            translations[state.language].booleanTrue : 
            translations[state.language].booleanFalse;
    });
}

// 加载设置
async function loadSettings() {
    try {
        // 使用KSU执行命令获取settings.sh内容
        const settingsContent = await execCommand('cat /data/adb/modules/AMMF/settings/settings.sh');
        
        // 解析设置文件
        parseSettings(settingsContent);
        
        // 获取默认语言设置
        if (state.settings.print_languages && state.settings.print_languages.value) {
            state.language = state.settings.print_languages.value.replace(/"/g, '') === 'zh' ? 'zh' : 'en';
        }
        
        // 生成设置表单
        generateSettingsForm();
        
        // 隐藏加载指示器，显示设置表单
        document.getElementById('loading').style.display = 'none';
        document.getElementById('settings-form').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showSnackbar(translations[state.language].saveError);
    }
}

// 解析设置文件
function parseSettings(content) {
    const lines = content.split('\n');
    
    for (const line of lines) {
        // 跳过注释和空行
        if (line.trim().startsWith('#') || line.trim() === '') continue;
        
        // 查找变量赋值
        const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
        if (match) {
            const key = match[1];
            let value = match[2];
            
            // 确定变量类型
            let type = 'text';
            
            // 检查是否为布尔值
            if (value === 'true' || value === 'false') {
                type = 'boolean';
            } 
            // 检查是否为数字
            else if (!isNaN(value) && value.trim() !== '') {
                type = 'number';
            }
            // 检查是否为带引号的字符串
            else if ((value.startsWith('"') && value.endsWith('"')) || 
                     (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            
            // 存储设置
            state.settings[key] = {
                value: value,
                type: type
            };
        }
    }
}

// 生成设置表单
function generateSettingsForm() {
    const formContainer = document.getElementById('settings-form');
    formContainer.innerHTML = '';
    
    // 获取设置文件中的注释，用于显示描述
    const descriptions = {};
    
    for (const key in state.settings) {
        const setting = state.settings[key];
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';
        
        // 创建标签
        const label = document.createElement('label');
        label.className = 'setting-label';
        label.setAttribute('data-key', key);
        label.textContent = key;
        settingItem.appendChild(label);
        
        // 根据类型创建不同的控件
        if (setting.type === 'boolean') {
            // 创建开关
            const switchContainer = document.createElement('div');
            switchContainer.style.display = 'flex';
            switchContainer.style.alignItems = 'center';
            
            const switchLabel = document.createElement('label');
            switchLabel.className = 'switch';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = setting.value === 'true';
            input.id = `setting-${key}`;
            input.addEventListener('change', function() {
                const booleanValue = this.nextElementSibling.nextElementSibling;
                booleanValue.textContent = this.checked ? 
                    translations[state.language].booleanTrue : 
                    translations[state.language].booleanFalse;
            });
            
            const slider = document.createElement('span');
            slider.className = 'slider';
            
            switchLabel.appendChild(input);
            switchLabel.appendChild(slider);
            
            const booleanValue = document.createElement('span');
            booleanValue.className = 'boolean-value';
            booleanValue.style.marginLeft = '12px';
            booleanValue.textContent = input.checked ? 
                translations[state.language].booleanTrue : 
                translations[state.language].booleanFalse;
            
            switchContainer.appendChild(switchLabel);
            switchContainer.appendChild(booleanValue);
            settingItem.appendChild(switchContainer);
            
        } else if (setting.type === 'number') {
            // 创建滑动条
            const rangeContainer = document.createElement('div');
            rangeContainer.className = 'range-container';
            
            const input = document.createElement('input');
            input.type = 'range';
            input.className = 'range-input';
            input.id = `setting-${key}`;
            input.min = 0;
            input.max = Math.max(100, parseInt(setting.value) * 2);
            input.value = setting.value;
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'range-value';
            valueDisplay.textContent = setting.value;
            
            input.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
            
            rangeContainer.appendChild(input);
            rangeContainer.appendChild(valueDisplay);
            settingItem.appendChild(rangeContainer);
            
        } else {
            // 创建文本输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'text-input';
            input.id = `setting-${key}`;
            input.value = setting.value;
            settingItem.appendChild(input);
        }
        
        // 添加描述（如果有）
        if (descriptions[key]) {
            const description = document.createElement('div');
            description.className = 'setting-description';
            description.textContent = descriptions[key];
            settingItem.appendChild(description);
        }
        
        formContainer.appendChild(settingItem);
    }
}

// 保存设置
async function saveSettings() {
    try {
        // 收集所有设置的当前值
        const updatedSettings = {};
        
        for (const key in state.settings) {
            const setting = state.settings[key];
            const input = document.getElementById(`setting-${key}`);
            
            if (setting.type === 'boolean') {
                updatedSettings[key] = input.checked ? 'true' : 'false';
            } else if (setting.type === 'number') {
                updatedSettings[key] = input.value;
            } else {
                // 文本类型，检查是否需要添加引号
                let value = input.value;
                if (setting.value.startsWith('"') && setting.value.endsWith('"')) {
                    value = `"${value}"`;
                } else if (setting.value.startsWith("'") && setting.value.endsWith("'")) {
                    value = `'${value}'`;
                }
                updatedSettings[key] = value;
            }
        }
        
        // 生成新的settings.sh内容
        let newContent = '';
        
        // 获取原始文件内容以保留注释
        const originalContent = await execCommand('cat /data/adb/modules/AMMF/settings/settings.sh');
        const lines = originalContent.split('\n');
        
        for (const line of lines) {
            // 保留注释和空行
            if (line.trim().startsWith('#') || line.trim() === '') {
                newContent += line + '\n';
                continue;
            }
            
            // 查找变量赋值
            const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
            if (match) {
                const key = match[1];
                if (updatedSettings[key] !== undefined) {
                    newContent += `${key}=${updatedSettings[key]}\n`;
                } else {
                    newContent += line + '\n';
                }
            } else {
                newContent += line + '\n';
            }
        }
        
        // 写入新的设置文件
        await execCommand(`echo '${newContent}' > /data/adb/modules/AMMF/settings/settings.sh`);
        
        // 显示成功消息
        showSnackbar(translations[state.language].saveSuccess);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showSnackbar(translations[state.language].saveError);
    }
}

// 显示提示消息
function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show';
    
    // 3秒后隐藏
    setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

// 执行shell命令
async function execCommand(command) {
    const callbackName = `exec_callback_${Date.now()}`;
    return new Promise((resolve, reject) => {
        window[callbackName] = (errno, stdout, stderr) => {
            delete window[callbackName];
            errno === 0 ? resolve(stdout) : reject(stderr);
        };
        ksu.exec(command, "{}", callbackName);
    });
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);