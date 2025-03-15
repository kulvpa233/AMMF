# AMMF WebUI 开发指南

[简体中文](WEBUI_GUIDE.md) | [English](WEBUI_GUIDE_EN.md)

## 📱 WebUI 概述

AMMF框架提供了一个基于Web的用户界面，允许用户通过图形化界面配置模块设置。WebUI使用现代化的Material Design风格，支持多语言和暗色模式，为用户提供了良好的体验。

## 🗂️ 文件结构

WebUI相关文件位于`webroot`目录下：

```
webroot/
├── index.html          # 主HTML文件
├── script.js           # JavaScript逻辑
├── styles.css          # CSS样式表
└── settings/           # 设置相关JSON文件
    ├── excluded_settings.json    # 排除的设置项
    ├── settings_descriptions.json # 设置项描述
    └── settings_options.json     # 设置项选项
```

## ⚙️ 配置文件说明

### 1. excluded_settings.json

此文件定义了不在WebUI中显示的设置项列表。

```json
{
  "excluded": [
    "MODULE_ID",
    "MODULE_NAME",
    "MODULE_DES",
    // 其他需要排除的设置项
  ]
}
```

### 2. settings_descriptions.json

此文件为设置项提供多语言描述。

```json
{
  "setting_key": {
    "en": "English description",
    "zh": "中文描述"
  }
}
```

### 3. settings_options.json

此文件为设置项定义预设选项（用于下拉菜单）。

```json
{
  "setting_key": {
    "options": [
      {"value": "option1", "label": {"en": "Option 1", "zh": "选项1"}},
      {"value": "option2", "label": {"en": "Option 2", "zh": "选项2"}}
    ]
  }
}
```

## 🛠️ 自定义WebUI

### 添加新设置项

1. 在`settings.sh`中添加新的变量：

```bash
# 在settings.sh中添加
new_setting="default_value"
```

2. 在`settings_descriptions.json`中添加描述：

```json
{
  "new_setting": {
    "en": "Description in English",
    "zh": "中文描述"
  }
}
```

3. 如果需要预设选项，在`settings_options.json`中添加：

```json
{
  "new_setting": {
    "options": [
      {"value": "value1", "label": {"en": "Label 1", "zh": "标签1"}},
      {"value": "value2", "label": {"en": "Label 2", "zh": "标签2"}}
    ]
  }
}
```

### 排除设置项

如果不希望某些设置项在WebUI中显示，将其添加到`excluded_settings.json`的`excluded`数组中。

```json
{
  "excluded": [
    "MODULE_ID",
    "new_setting_to_exclude"
  ]
}
```

## 🌐 多语言支持

### 支持的语言

目前AMMF WebUI支持以下语言：
- 英语 (en)
- 中文 (zh)
- 日语 (jp)
- 俄语 (ru)

### 添加新语言

1. 在`script.js`的`translations`对象中添加新语言：

```javascript
const translations = {
  en: { /* 英文翻译 */ },
  zh: { /* 中文翻译 */ },
  jp: { /* 日语翻译 */ },
  ru: { /* 俄语翻译 */ },
  new_lang: { /* 新语言翻译 */ }
};
```

2. 在`settings_descriptions.json`和`settings_options.json`中添加新语言的描述和标签。

3. 在`settings/languages.ini`中添加新语言的函数：

```bash
lang_new_lang() {
  # 系统消息
  ERROR_TEXT="Error text in new language"
  
  # WebUI相关
  WEBUI_TITLE="Title in new language"
  WEBUI_SAVE="Save in new language"
  WEBUI_LOADING="Loading in new language"
  WEBUI_SAVE_SUCCESS="Save success in new language"
  WEBUI_SAVE_ERROR="Save error in new language"
  WEBUI_BOOLEAN_TRUE="Enabled in new language"
  WEBUI_BOOLEAN_FALSE="Disabled in new language"
  WEBUI_LOADING_DESCRIPTIONS="Loading descriptions in new language"
  WEBUI_LOADING_EXCLUSIONS="Loading exclusions in new language"
  WEBUI_LOADING_OPTIONS="Loading options in new language"
  WEBUI_SELECT="Select in new language"
  WEBUI_LANGUAGE_SELECT="Select language in new language"
  WEBUI_LANGUAGE_TITLE="Available languages in new language"
  WEBUI_LANGUAGE_NAME="Language name in new language"
  
  # 其他翻译项
}
```

## 🎨 自定义样式

可以通过修改`styles.css`文件来自定义WebUI的外观：

- 修改颜色变量以更改主题色
- 调整组件尺寸和间距
- 添加新的CSS类以支持新功能

```css
:root {
  --primary-color: #your-color-code;
  --on-primary-color: #your-color-code;
  /* 其他颜色变量 */
}
```

## 📋 设置类型

WebUI支持以下类型的设置项：

1. **文本** - 字符串值
2. **布尔值** - true/false开关
3. **数字** - 带滑动条或直接输入的数值
4. **选择框** - 预定义选项的下拉菜单

系统会根据`settings.sh`中变量的值自动检测类型，也可以通过`settings_options.json`指定为选择框类型。

## 🔄 工作原理

WebUI的工作流程：

1. 加载`settings.sh`中的设置项
2. 排除`excluded_settings.json`中列出的项
3. 应用`settings_descriptions.json`中的描述
4. 为`settings_options.json`中定义的项创建选择框
5. 用户修改设置后，点击保存按钮将更新写入`settings.sh`

## 🚀 最佳实践

1. 为所有设置项提供清晰的描述
2. 使用合适的设置类型（文本、布尔值、数字、选择框）
3. 排除不应由用户修改的技术性设置项
4. 为所有用户界面元素提供多语言支持
5. 保持设计一致性，遵循Material Design风格

---

如有任何问题或建议，欢迎提交PR或Issue！