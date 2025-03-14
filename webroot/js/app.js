// 导入KernelSU API
import { exec, toast } from 'kernelsu';

// 存储设置项
let settings = {};
let originalSettings = {};

// 初始化
async function init() {
    try {
        await loadSettings();
        renderSettingsForm();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('settings-form').style.display = 'block';
        
        // 绑定按钮事件
        document.getElementById('save-btn').addEventListener('click', saveSettings);
        document.getElementById('reset-btn').addEventListener('click', resetSettings);
    } catch (error) {
        console.error('初始化失败:', error);
        showToast('初始化失败: ' + error.message);
    }
}

// 从settings.sh加载设置
async function loadSettings() {
    const { errno, stdout } = await exec('cat /data/adb/modules/AMMF/settings.sh');
    
    if (errno !== 0) {
        throw new Error('无法读取设置文件');
    }
    
    // 解析settings.sh文件
    const lines = stdout.split('\n');
    
    for (const line of lines) {
        // 跳过注释和空行
        if (line.trim().startsWith('#') || line.trim() === '') continue;
        
        // 匹配变量定义 VAR_NAME="value" 或 VAR_NAME=value
        const match = line.match(/^([A-Za-z0-9_]+)=["']?(.*?)["']?$/);
        if (match) {
            const [, name, value] = match;
            
            // 特殊处理布尔值
            if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                settings[name] = value.toLowerCase() === 'true';
            } else {
                settings[name] = value;
            }
            
            // 如果有LANGUAGE变量，设置当前语言
            if (name === 'print_languages') {
                currentLang = value.toLowerCase() === 'en' ? 'en' : 'zh';
            }
            
            // 添加设置项描述（从注释中提取）
            const descIndex = lines.findIndex((l, i) => i < lines.indexOf(line) && l.includes(`# ${name}:`));
            if (descIndex !== -1) {
                const descLine = lines[descIndex];
                const zhDesc = descLine.split('# ')[1].split(':')[1].trim();
                
                // 查找英文描述（通常在下一行）
                let enDesc = zhDesc;
                if (descIndex + 1 < lines.length && lines[descIndex + 1].trim().startsWith('# ')) {
                    enDesc = lines[descIndex + 1].split('# ')[1].trim();
                }
                
                settingsDescriptions[name] = {
                    zh: zhDesc,
                    en: enDesc
                };
            }
        }
    }
    
    // 保存原始设置用于重置
    originalSettings = JSON.parse(JSON.stringify(settings));
    
    // 设置语言
    setLanguage(currentLang);
}

// 渲染设置表单
function renderSettingsForm() {
    const form = document.getElementById('settings-form');
    form.innerHTML = '';
    
    for (const [key, value] of Object.entries(settings)) {
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';
        
        const label = document.createElement('label');
        label.textContent = key;
        settingItem.appendChild(label);
        
        if (typeof value === 'boolean') {
            // 布尔值使用开关控件
            const toggleContainer = document.createElement('label');
            toggleContainer.className = 'toggle';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = value;
            checkbox.id = key;
            checkbox.name = key;
            checkbox.addEventListener('change', e => {
                settings[key] = e.target.checked;
                updateToggleLabel(key, e.target.checked);
            });
            
            const slider = document.createElement('span');
            slider.className = 'slider';
            
            toggleContainer.appendChild(checkbox);
            toggleContainer.appendChild(slider);
            
            const toggleLabel = document.createElement('span');
            toggleLabel.className = 'toggle-label';
            toggleLabel.setAttribute('data-value', value.toString());
            toggleLabel.textContent = translations[currentLang].boolean[value ? 'true' : 'false'];
            toggleLabel.id = `${key}-label`;
            
            settingItem.appendChild(toggleContainer);
            settingItem.appendChild(toggleLabel);
        } else {
            // 文本值使用输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.id = key;
            input.name = key;
            input.addEventListener('input', e => {
                settings[key] = e.target.value;
            });
            settingItem.appendChild(input);
        }
        
        // 添加描述（如果有）
        if (settingsDescriptions[key]) {
            const desc = document.createElement('div');
            desc.className = 'setting-description';
            desc.setAttribute('data-i18n-key', key);
            desc.textContent = settingsDescriptions[key][currentLang];
            settingItem.appendChild(desc);
        }
        
        form.appendChild(settingItem);
    }
}

// 更新开关标签文本
function updateToggleLabel(key, value) {
    const label = document.getElementById(`${key}-label`);
    if (label) {
        label.setAttribute('data-value', value.toString());
        label.textContent = translations[currentLang].boolean[value ? 'true' : 'false'];
    }
}

// 保存设置到settings.sh
async function saveSettings() {
    try {
        let settingsContent = '#!/system/bin/sh\n\n';
        
        // 生成settings.sh内容
        for (const [key, value] of Object.entries(settings)) {
            if (typeof value === 'boolean') {
                settingsContent += `${key}=${value ? 'true' : 'false'}\n`;
            } else {
                settingsContent += `${key}="${value}"\n`;
            }
        }
        
        // 写入文件
        const tempFile = '/data/local/tmp/ammf_settings.sh';
        const { errno } = await exec(`echo '${settingsContent}' > ${tempFile}`);
        
        if (errno !== 0) {
            throw new Error('无法创建临时文件');
        }
        
        // 移动到模块目录
        const { errno: moveErrno } = await exec(`cp ${tempFile} /data/adb/modules/AMMF/settings.sh && chmod 0755 /data/adb/modules/AMMF/settings.sh`);
        
        if (moveErrno !== 0) {
            throw new Error('无法保存设置文件');
        }
        
        // 清理临时文件
        await exec(`rm ${tempFile}`);
        
        showToast(translations[currentLang].saveSuccess);
        
        // 更新原始设置
        originalSettings = JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error('保存设置失败:', error);
        showToast(translations[currentLang].saveFailed + ': ' + error.message);
    }
}

// 重置设置
function resetSettings() {
    if (confirm(translations[currentLang].resetConfirm)) {
        settings = JSON.parse(JSON.stringify(originalSettings));
        renderSettingsForm();
    }
}

// 显示Toast消息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);