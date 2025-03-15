// 语言配置
const translations = {
    // 基础翻译，后续会从languages.ini动态加载更多
    en: {
        title: 'AMMF Settings',
        save: 'Save',
        loading: 'Loading settings...',
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Error saving settings',
        booleanTrue: 'Enabled',
        booleanFalse: 'Disabled',
        loadingDescriptions: 'Loading descriptions...',
        loadingExclusions: 'Loading exclusions...',
        loadingOptions: 'Loading options...',
        select: 'Select',
        languageSelect: 'Select Language',
        languageTitle: 'Available Languages'
    },
    zh: {
        title: '模块设置',
        save: '保存',
        loading: '加载设置中...',
        saveSuccess: '设置保存成功！',
        saveError: '保存设置时出错',
        booleanTrue: '已启用',
        booleanFalse: '已禁用',
        loadingDescriptions: '加载描述中...',
        loadingExclusions: '加载排除项中...',
        loadingOptions: '加载选项中...',
        select: '选择',
        languageSelect: '选择语言',
        languageTitle: '可用语言'
    }
};

// 应用状态
const state = {
    settings: {},
    language: 'en',
    isDarkMode: false,
    excludedSettings: [],
    settingsDescriptions: {},
    settingsOptions: {},  // 存储设置选项
    availableLanguages: [] // 存储可用语言列表
};

// 初始化应用
async function initApp() {
    // 检测系统暗色模式
    checkDarkMode();
    
    try {
        // 加载可用语言
        await loadAvailableLanguages();
        
        // 加载排除设置
        await loadExcludedSettings();
        
        // 加载设置描述
        await loadSettingsDescriptions();
        
        // 加载设置选项
        await loadSettingsOptions();
        
        // 加载设置
        await loadSettings();
        
        // 设置事件监听器
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
        document.getElementById('language-toggle').addEventListener('click', showLanguageMenu);
        document.getElementById('save-button').addEventListener('click', saveSettings);
        
        // 更新UI语言
        updateLanguage();
    } catch (error) {
        console.error('Error initializing app:', error);
        showSnackbar(translations[state.language].saveError);
    }
}

// 加载可用语言
async function loadAvailableLanguages() {
    try {
        // 尝试从languages.ini加载语言配置
        const languagesContent = await execCommand('cat /data/adb/modules/AMMF/settings/languages.ini');
        
        // 解析languages.ini文件
        const languageFunctions = languagesContent.match(/lang_([a-z]{2,})\(\)/g);
        
        if (languageFunctions && languageFunctions.length > 0) {
            // 提取语言代码
            state.availableLanguages = languageFunctions.map(func => {
                const match = func.match(/lang_([a-z]{2,})\(\)/);
                return match ? match[1] : null;
            }).filter(lang => lang !== null);
            
            // 为每种语言加载翻译
            for (const langCode of state.availableLanguages) {
                // 如果translations中没有该语言，则初始化
                if (!translations[langCode]) {
                    translations[langCode] = {
                        ...translations.en, // 使用英语作为基础
                    };
                }
                
                // 提取该语言的翻译内容
                const langSection = languagesContent.match(new RegExp(`lang_${langCode}\\(\\)[\\s\\S]*?\\}`, 'm'));
                
                if (langSection && langSection[0]) {
                    // 解析翻译键值对
                    const translationPairs = langSection[0].match(/([A-Z_]+)="([^"]*)"/g);
                    
                    if (translationPairs) {
                        translationPairs.forEach(pair => {
                            const match = pair.match(/([A-Z_]+)="([^"]*)"/);
                            if (match && match.length === 3) {
                                const key = match[1];
                                const value = match[2];
                                
                                // 将WebUI相关的键映射到translations对象
                                if (key.startsWith('WEBUI_')) {
                                    // 移除WEBUI_前缀并转换为小写
                                    const translationKey = key.replace('WEBUI_', '').toLowerCase();
                                    translations[langCode][translationKey] = value;
                                } else if (key === 'ERROR_TEXT') {
                                    translations[langCode].saveError = value;
                                }
                                
                                // 添加语言名称
                                if (key === 'WEBUI_LANGUAGE_NAME') {
                                    translations[langCode].languageName = value;
                                }
                            }
                        });
                    }
                }
            }
            
            console.log('Available languages:', state.availableLanguages);
        }
    } catch (error) {
        console.error('Error loading available languages:', error);
        // 如果加载失败，至少确保有英语和中文
        state.availableLanguages = ['en', 'zh'];
    }
}

// 显示语言选择菜单
function showLanguageMenu() {
    // 移除已存在的菜单
    const existingMenu = document.getElementById('language-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // 创建菜单容器
    const menuContainer = document.createElement('div');
    menuContainer.id = 'language-menu';
    menuContainer.className = 'language-menu';
    
    // 创建菜单标题
    const menuTitle = document.createElement('div');
    menuTitle.className = 'language-menu-title';
    menuTitle.textContent = translations[state.language].languageTitle || 'Available Languages';
    menuContainer.appendChild(menuTitle);
    
    // 创建语言列表
    const languageList = document.createElement('div');
    languageList.className = 'language-list';
    
    // 添加语言选项
    state.availableLanguages.forEach(langCode => {
        const langOption = document.createElement('div');
        langOption.className = 'language-option';
        if (langCode === state.language) {
            langOption.classList.add('selected');
        }
        
        // 使用从languages.ini加载的语言名称
        let langName = langCode.toUpperCase();
        if (translations[langCode] && translations[langCode].languageName) {
            langName = translations[langCode].languageName;
        }
        
        langOption.textContent = langName;
        
        // 点击事件
        langOption.addEventListener('click', () => {
            state.language = langCode;
            updateLanguage();
            menuContainer.remove();
        });
        
        languageList.appendChild(langOption);
    });
    
    menuContainer.appendChild(languageList);
    
    // 添加到页面
    document.body.appendChild(menuContainer);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menuContainer.contains(e.target) && e.target.id !== 'language-toggle') {
                menuContainer.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

// 加载排除设置
async function loadExcludedSettings() {
    try {
        // 尝试从文件加载排除设置
        const excludedContent = await execCommand('cat /data/adb/modules/AMMF/webroot/settings/excluded_settings.json');
        const excludedData = JSON.parse(excludedContent);
        state.excludedSettings = excludedData.excluded || [];
        
        // 确保MODULE_ID被排除
        if (!state.excludedSettings.includes('MODULE_ID')) {
            state.excludedSettings.push('MODULE_ID');
        }
    } catch (error) {
        console.error('Error loading excluded settings:', error);
        // 如果加载失败，使用默认排除列表
        state.excludedSettings = ['MODULE_ID'];
    }
}

// 加载设置描述
async function loadSettingsDescriptions() {
    try {
        // 尝试从文件加载设置描述
        const descriptionsContent = await execCommand('cat /data/adb/modules/AMMF/webroot/settings/settings_descriptions.json');
        state.settingsDescriptions = JSON.parse(descriptionsContent);
    } catch (error) {
        console.error('Error loading settings descriptions:', error);
        // 如果加载失败，使用空对象
        state.settingsDescriptions = {};
    }
}

// 加载设置选项
async function loadSettingsOptions() {
    try {
        // 尝试从文件加载设置选项
        const optionsContent = await execCommand('cat /data/adb/modules/AMMF/webroot/settings/settings_options.json');
        state.settingsOptions = JSON.parse(optionsContent);
        
        // 动态更新print_languages选项，使其包含所有可用语言
        if (state.settingsOptions.print_languages && state.availableLanguages.length > 0) {
            state.settingsOptions.print_languages.options = state.availableLanguages.map(langCode => {
                // 使用从languages.ini加载的语言名称
                let langName = {};
                
                // 为每种UI语言提供当前语言的名称
                state.availableLanguages.forEach(uiLang => {
                    if (translations[langCode] && translations[langCode].languageName) {
                        // 如果有该语言的本地化名称，优先使用
                        langName[uiLang] = translations[langCode].languageName;
                    } else {
                        // 否则使用默认名称
                        langName[uiLang] = langCode.toUpperCase();
                    }
                });
                
                return {
                    value: langCode,
                    label: langName
                };
            });
        }
    } catch (error) {
        console.error('Error loading settings options:', error);
        // 如果加载失败，使用空对象
        state.settingsOptions = {};
    }
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
    // 这个函数保留但不再直接使用，改为通过菜单选择语言
    const currentIndex = state.availableLanguages.indexOf(state.language);
    const nextIndex = (currentIndex + 1) % state.availableLanguages.length;
    state.language = state.availableLanguages[nextIndex];
    updateLanguage();
}

// 更新UI语言
function updateLanguage() {
    // 更新页面标题
    document.title = translations[state.language].title;
    
    // 更新UI元素
    document.getElementById('title').textContent = translations[state.language].title;
    document.getElementById('loading-text').textContent = translations[state.language].loading;
    
    // 更新保存按钮的提示文本
    if (document.getElementById('save-button')) {
        (document.getElementById('save-button')).title = translations[state.language].save;
    }
    
    // 更新所有已生成的设置项的语言
    const settingLabels = document.querySelectorAll('.setting-label');
    settingLabels.forEach(label => {
        const key = label.getAttribute('data-key');
        if (key) {
            // 如果有描述，使用描述，否则使用键名
            if (state.settingsDescriptions[key] && state.settingsDescriptions[key][state.language]) {
                label.textContent = key + ' - ' + state.settingsDescriptions[key][state.language];
            } else {
                label.textContent = key;
            }
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
    
    // 更新选择框选项
    const selects = document.querySelectorAll('.select-input');
    selects.forEach(select => {
        const key = select.id.replace('setting-', '');
        if (state.settingsOptions[key] && state.settingsOptions[key].options) {
            Array.from(select.options).forEach((option, index) => {
                const optionData = state.settingsOptions[key].options[index];
                if (optionData && optionData.label) {
                    option.textContent = optionData.label[state.language] || optionData.value;
                }
            });
        }
    });
    
    // 更新保存按钮
    const saveButton = document.getElementById('save-button');
    if (document.getElementById('save-button')) {
        const saveSpan = (document.getElementById('save-button')).querySelector('span');
        if (saveSpan) {
            saveSpan.title = translations[state.language].save;
        }
    }
    
    // 更新语言切换按钮
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.title = translations[state.language].languageSelect;
    }
    
    // 更新主题切换按钮
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.title = state.isDarkMode ? '切换到亮色模式' : '切换到暗色模式';
    }
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
        
        // 使用更精确的正则表达式匹配变量赋值，处理行尾注释
        const match = line.match(/^([A-Za-z0-9_]+)=([^#]*)(#.*)?$/);
        if (match) {
            const key = match[1];
            // 去除值两端的空格
            let value = match[2].trim();
            let originalFormat = value; // 保存原始格式用于保存时恢复引号和格式
            
            // 检查是否为带引号的字符串，并提取实际值用于类型判断
            let valueForTypeCheck = value;
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                // 保存原始值（带引号）用于保存时恢复格式
                originalFormat = value;
                // 移除引号用于显示和类型判断
                valueForTypeCheck = value.substring(1, value.length - 1);
                value = valueForTypeCheck;
            }
            
            // 确定变量类型
            let type = 'text';
            
            // 检查是否为布尔值
            if (valueForTypeCheck === 'true' || valueForTypeCheck === 'false') {
                type = 'boolean';
            } 
            // 检查是否为数字
            else if (!isNaN(valueForTypeCheck) && valueForTypeCheck.trim() !== '') {
                type = 'number';
            }
            
            // 存储设置
            state.settings[key] = {
                value: value,
                type: type,
                originalFormat: originalFormat // 保存原始格式信息
            };
        }
    }
}

// 生成设置表单
function generateSettingsForm() {
    const formContainer = document.getElementById('settings-form');
    formContainer.innerHTML = '';
    
    for (const key in state.settings) {
        // 跳过排除的设置项
        if (state.excludedSettings.includes(key)) {
            continue;
        }
        
        const setting = state.settings[key];
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';
        
        // 创建标签
        const label = document.createElement('label');
        label.className = 'setting-label';
        label.setAttribute('data-key', key);
        
        // 如果有描述，使用描述，否则使用键名
        if (state.settingsDescriptions[key] && state.settingsDescriptions[key][state.language]) {
            label.textContent = key + ' - ' + state.settingsDescriptions[key][state.language];
        } else {
            label.textContent = key;
        }
        
        settingItem.appendChild(label);
        
        // 检查是否有预定义的选项
        if (state.settingsOptions[key] && state.settingsOptions[key].options) {
            // 创建选择框
            const selectContainer = document.createElement('div');
            selectContainer.className = 'select-container';
            
            const select = document.createElement('select');
            select.className = 'select-input';
            select.id = `setting-${key}`;
            
            // 添加选项
            state.settingsOptions[key].options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label[state.language] || option.value;
                
                // 设置当前选中的选项
                if (setting.value === option.value) {
                    optionElement.selected = true;
                }
                
                select.appendChild(optionElement);
            });
            
            // 监听选择变化
            select.addEventListener('change', function() {
                state.settings[key].value = this.value;
            });
            
            selectContainer.appendChild(select);
            settingItem.appendChild(selectContainer);
        } else if (setting.type === 'boolean') {
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
                // 修复布尔值实时更新的bug
                const booleanValue = switchContainer.querySelector('.boolean-value');
                booleanValue.textContent = this.checked ? 
                    translations[state.language].booleanTrue : 
                    translations[state.language].booleanFalse;
                
                // 更新状态中的值
                state.settings[key].value = this.checked ? 'true' : 'false';
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
            // 创建数字输入控件
            const numContainer = document.createElement('div');
            numContainer.className = 'range-container';
            
            // 数字值
            const numValue = parseInt(setting.value);
            
            // 如果数字大于100，直接使用输入框
            const useInputBox = numValue > 100;
            
            // 创建输入框
            const textInput = document.createElement('input');
            textInput.type = 'number';
            textInput.className = 'text-input';
            textInput.style.width = '80px';
            textInput.style.marginRight = '10px';
            textInput.value = numValue;
            textInput.id = `setting-${key}`;
            textInput.style.display = useInputBox ? 'inline-block' : 'none';
            
            // 创建滑动条
            const rangeInput = document.createElement('input');
            rangeInput.type = 'range';
            rangeInput.className = 'range-input';
            rangeInput.min = 0;
            rangeInput.max = Math.max(100, numValue * 2);
            rangeInput.value = numValue;
            rangeInput.style.display = useInputBox ? 'none' : 'block';
            
            // 显示当前值
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'range-value';
            valueDisplay.textContent = numValue;
            valueDisplay.style.display = useInputBox ? 'none' : 'inline-block';
            
            // 切换按钮
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'icon-button';
            toggleBtn.innerHTML = '<span class="material-symbols-outlined">' + 
                                 (useInputBox ? 'tune' : 'edit') + '</span>';
            toggleBtn.title = useInputBox ? '使用滑动条' : '使用输入框';
            
            // 滑动条事件
            rangeInput.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
                textInput.value = this.value;
                state.settings[key].value = this.value;
            });
            
            // 输入框事件
            textInput.addEventListener('input', function() {
                rangeInput.value = this.value;
                valueDisplay.textContent = this.value;
                state.settings[key].value = this.value;
            });
            
            // 切换按钮事件
            toggleBtn.addEventListener('click', function() {
                const isInputVisible = textInput.style.display !== 'none';
                textInput.style.display = isInputVisible ? 'none' : 'inline-block';
                rangeInput.style.display = isInputVisible ? 'block' : 'none';
                valueDisplay.style.display = isInputVisible ? 'inline-block' : 'none';
                this.innerHTML = '<span class="material-symbols-outlined">' + 
                               (isInputVisible ? 'edit' : 'tune') + '</span>';
                this.title = isInputVisible ? '使用输入框' : '使用滑动条';
            });
            
            numContainer.appendChild(rangeInput);
            numContainer.appendChild(textInput);
            numContainer.appendChild(valueDisplay);
            numContainer.appendChild(toggleBtn);
            settingItem.appendChild(numContainer);
        } else {
            // 创建文本输入框
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'text-input';
            textInput.value = setting.value;
            textInput.id = `setting-${key}`;
            
            settingItem.appendChild(textInput);
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
            
            // 对于排除的设置项，保持原值和原始格式
            if (state.excludedSettings.includes(key)) {
                // 使用原始格式而不仅仅是值，这样可以保留引号
                updatedSettings[key] = setting.originalFormat || setting.value;
                continue;
            }
            
            const input = document.getElementById(`setting-${key}`);
            
            // 如果找不到输入元素（可能是排除的设置），跳过
            if (!input) continue;
            
            if (setting.type === 'boolean') {
                updatedSettings[key] = input.checked ? 'true' : 'false';
            } else if (setting.type === 'number') {
                // 确保数字值有效
                let numValue = parseInt(input.value);
                if (isNaN(numValue)) numValue = 0;
                updatedSettings[key] = numValue.toString();
            } else {
                // 文本类型，检查原始格式以保持一致性
                let value = input.value;
                
                // 如果原始值有引号格式，恢复相同的引号格式
                if (setting.originalFormat && 
                   ((setting.originalFormat.startsWith('"') && setting.originalFormat.endsWith('"')) || 
                    (setting.originalFormat.startsWith("'") && setting.originalFormat.endsWith("'")))) {
                    // 确定使用的是单引号还是双引号
                    const quoteChar = setting.originalFormat.startsWith('"') ? '"' : "'";
                    value = `${quoteChar}${value}${quoteChar}`;
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