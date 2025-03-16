#!/bin/bash
# 为了确保后期同步AMMF新版本和使用Path.sh中变量，请勿随意修改
ACTION_PATH="$NOW_PATH/AMMF/settings/script/User_START.sh"
NOW_PATH="/data/local/tmp"
MODPATH=${0%/*}
detect_environment() {
    ENVIRONMENT="UNKNOWN"
    BUSYBOX_PATH=""

    if [ -d "/data/adb/magisk" ]; then
        ENVIRONMENT="MAGISK"
        BUSYBOX_PATH="/data/adb/magisk/busybox"
    fi

    if [ -d "/data/adb/ksu" ]; then
        ENVIRONMENT="KERNELSU"
        BUSYBOX_PATH="/data/adb/ksu/bin/busybox"
    fi

    if [ -d "/data/adb/ap" ]; then
        ENVIRONMENT="APATCH"
        BUSYBOX_PATH="/data/adb/ap/bin/busybox"
    fi
    if [ "$ENVIRONMENT" = "UNKNOWN" ]; then
        echo "UNKNOWN ENVIRONMENT"
        exit 1
    fi
    echo "Environment: $ENVIRONMENT"
    echo "BusyBox path: $BUSYBOX_PATH"
}
detect_environment
VERSION=$(grep "version" "$MODPATH/module.prop" | awk -F'=' '{print $2}' | awk 'NR==1')
echo "Module Version: $VERSION"
echo ""
mkdir -p "$NOW_PATH"/AMMF/
cp -r "$MODPATH"/* "$NOW_PATH"/AMMF/
chmod -R 755 "$NOW_PATH"/AMMF/

ASH_STANDALONE=1 $BUSYBOX_PATH sh "$ACTION_PATH" "$MODPATH" "$NOW_PATH/AMMF" "Action"