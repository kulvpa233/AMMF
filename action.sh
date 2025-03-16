#!/bin/bash
# 为了确保后期同步AMMF新版本和使用Path.sh中变量，请勿随意修改
ACTION_PATH="$NOW_PATH/AMMF/settings/script/User_START.sh"
NOW_PATH="/data/local/tmp"
MODPATH=${0%/*}
VERSION=$(grep "version" "$MODPATH/module.prop" | awk -F'=' '{print $2}' | awk 'NR==1')
echo "Module Version: $VERSION"
echo ""
mkdir -p "$NOW_PATH"/AMMF/
cp -r "$MODPATH"/* "$NOW_PATH"/AMMF/
chmod -R 755 "$NOW_PATH"/AMMF/

sh "$ACTION_PATH" "$MODPATH" "$NOW_PATH/AMMF" "Action"