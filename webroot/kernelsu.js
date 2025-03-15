// KernelSU API 接口
(function() {
    // 检查是否在 Android WebView 环境中
    const isAndroidWebView = typeof AndroidInterface !== 'undefined';
    
    window.KernelSU = {
        // 执行shell命令
        exec: async function(command) {
            if (isAndroidWebView) {
                try {
                    // 调用 Android 端提供的接口
                    const result = AndroidInterface.execCommand(command);
                    // 解析返回的 JSON 结果
                    const parsedResult = JSON.parse(result);
                    return {
                        errno: parsedResult.exitCode || 0,
                        stdout: parsedResult.stdout || '',
                        stderr: parsedResult.stderr || ''
                    };
                } catch (error) {
                    console.error('执行命令失败:', error);
                    return {
                        errno: -1,
                        stdout: '',
                        stderr: error.toString()
                    };
                }
            } else {
                // 模拟模式，用于开发测试
                console.log('模拟执行命令:', command);
                return {
                    errno: 0,
                    stdout: '# 模拟的settings.sh内容\n# print_languages: 显示语言\n# Display Language\nprint_languages="zh"\n# enable_feature1: 功能1\n# Feature 1\nenable_feature1=true\n# enable_feature2: 功能2\n# Feature 2\nenable_feature2=false\n',
                    stderr: ''
                };
            }
        },
        
        // 显示toast消息
        toast: function(message) {
            if (isAndroidWebView) {
                try {
                    // 调用 Android 端提供的 toast 接口
                    AndroidInterface.showToast(message);
                } catch (error) {
                    console.error('显示Toast失败:', error);
                }
            }
            
            // 同时在网页上显示 toast
            console.log('Toast消息:', message);
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        }
    };
})();