# AMMF WebUI Development Guide

[简体中文](WEBUI_GUIDE.md) | [English](WEBUI_GUIDE_EN.md)

## 📱 WebUI Overview

The AMMF framework provides a web-based user interface that allows users to configure module settings through a graphical interface. The WebUI uses a modern Material Design style, supports multiple languages and dark mode, providing users with a good experience.

## 🗂️ File Structure

WebUI related files are located in the `webroot` directory:

```
webroot/
├── index.html          # Main HTML file
├── script.js           # JavaScript logic
├── styles.css          # CSS stylesheet
└── settings/           # Settings related JSON files
    ├── excluded_settings.json    # Excluded settings
    ├── settings_descriptions.json # Settings descriptions
    └── settings_options.json     # Settings options
```

## ⚙️ Configuration Files

### 1. excluded_settings.json

This file defines a list of settings that are not displayed in the WebUI.

```json
{
  "excluded": [
    "MODULE_ID",
    "MODULE_NAME",
    "MODULE_DES",
    // Other settings to exclude
  ]
}
```

### 2. settings_descriptions.json

This file provides multilingual descriptions for settings.

```json
{
  "setting_key": {
    "en": "English description",
    "zh": "Chinese description"
  }
}
```

### 3. settings_options.json

This file defines preset options for settings (used for dropdown menus).

```json
{
  "setting_key": {
    "options": [
      {"value": "option1", "label": {"en": "Option 1", "zh": "Option 1 in Chinese"}},
      {"value": "option2", "label": {"en": "Option 2", "zh": "Option 2 in Chinese"}}
    ]
  }
}
```

## 🛠️ Customizing WebUI

### Adding New Settings

1. Add a new variable in `settings.sh`:

```bash
# Add in settings.sh
new_setting="default_value"
```

2. Add a description in `settings_descriptions.json`:

```json
{
  "new_setting": {
    "en": "Description in English",
    "zh": "Description in Chinese"
  }
}
```

3. If preset options are needed, add them in `settings_options.json`:

```json
{
  "new_setting": {
    "options": [
      {"value": "value1", "label": {"en": "Label 1", "zh": "Label 1 in Chinese"}},
      {"value": "value2", "label": {"en": "Label 2", "zh": "Label 2 in Chinese"}}
    ]
  }
}
```

### Excluding Settings

If you don't want certain settings to be displayed in the WebUI, add them to the `excluded` array in `excluded_settings.json`.

```json
{
  "excluded": [
    "MODULE_ID",
    "new_setting_to_exclude"
  ]
}
```

## 🌐 Multilingual Support

### Supported Languages

Currently, AMMF WebUI supports the following languages:
- English (en)
- Chinese (zh)
- Japanese (jp)
- Russian (ru)

### Adding a New Language

1. Add a new language in the `translations` object in `script.js`:

```javascript
const translations = {
  en: { /* English translations */ },
  zh: { /* Chinese translations */ },
  jp: { /* Japanese translations */ },
  ru: { /* Russian translations */ },
  new_lang: { /* New language translations */ }
};
```

2. Add descriptions and labels for the new language in `settings_descriptions.json` and `settings_options.json`.

3. Add a function for the new language in `settings/languages.ini`:

```bash
lang_new_lang() {
  # System messages
  ERROR_TEXT="Error text in new language"
  
  # WebUI related
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
  
  # Other translation items
}
```

## 🎨 Customizing Styles

You can customize the appearance of the WebUI by modifying the `styles.css` file:

- Modify color variables to change the theme color
- Adjust component sizes and spacing
- Add new CSS classes to support new features

```css
:root {
  --primary-color: #your-color-code;
  --on-primary-color: #your-color-code;
  /* Other color variables */
}
```

## 📋 Setting Types

The WebUI supports the following types of settings:

1. **Text** - String values
2. **Boolean** - true/false switches
3. **Number** - Numeric values with sliders or direct input
4. **Select** - Dropdown menus with predefined options

The system automatically detects the type based on the value of the variable in `settings.sh`, or it can be specified as a select type through `settings_options.json`.

## 🔄 How It Works

The WebUI workflow:

1. Load settings from `settings.sh`
2. Exclude items listed in `excluded_settings.json`
3. Apply descriptions from `settings_descriptions.json`
4. Create select boxes for items defined in `settings_options.json`
5. After the user modifies the settings, clicking the save button writes the updates to `settings.sh`

## 🚀 Best Practices

1. Provide clear descriptions for all settings
2. Use appropriate setting types (text, boolean, number, select)
3. Exclude technical settings that should not be modified by users
4. Provide multilingual support for all UI elements
5. Maintain design consistency, following Material Design style

---

If you have any questions or suggestions, feel free to submit a PR or Issue!