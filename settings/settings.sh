# Script configuration parameters
MODULE_ID="gxlc_hyper"
MODULE_NAME="澎湃美化模块"
MODULE_DES="美化澎湃OS"
# Base path for module storage
# MODPATH

print_languages="zh"                   # Default language for printing
CustomScript=true
# Path definitions for various directories
SDCARD="/storage/emulated/0"           # Path to user-space sdcard
download_destination="/$SDCARD/Download/AMMF/" # Download path
max_retries=3                      # Maximum number of download retries

# Magisk module settings
CustomScriptPath="/settings/custom_script.sh"   # Path to custom script
langpath="/settings/languages.ini"              # Path to language settings file
script_path="/settings/script/Path.sh"     # Path to the script path file
user_script_path="/settings/custom_script_user.sh"   # Path to the user script file

# Advanced settings

# User-defined variable area (you can add more variables as needed)

# Version requirements for Magisk and related components
magisk_min_version="25400"             # Minimum required version of Magisk
ksu_min_version="11300"                # Minimum compatible version of KernelSU
ksu_min_kernel_version="11300"         # Minimum compatible kernel version of KernelSU
apatch_min_version="10657"             # Minimum compatible version of APatch
ANDROID_API="26"                       # Minimum required Android API version
