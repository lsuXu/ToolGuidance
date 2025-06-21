// 页面导航
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 更新按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 切换页面
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(button.dataset.page + '-page').classList.add('active');
    });
});

// 格式化日期时间为input所需格式
function formatDateTime(date) {
    return date.toISOString().slice(0, 16);
}

// 自动填充当前时间
function fillCurrentDateTime() {
    const dateInput = document.getElementById('dateInput');
    dateInput.value = formatDateTime(new Date());
}

// 初始化时填充当前时间
fillCurrentDateTime();

// 点击包装器时触发日期时间选择
document.getElementById('dateInputWrapper').addEventListener('click', function(e) {
    document.getElementById('dateInput').showPicker();
});

// 更新当前时间和时间戳
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString();
    document.getElementById('currentTimestamp').textContent = Math.floor(now.getTime() / 1000);
}

// 每秒更新当前时间
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// 验证时间戳
function validateTimestamp(value) {
    if (!value) return { isValid: false, message: '请输入时间戳' };
    if (!/^\d+$/.test(value)) return { isValid: false, message: '时间戳只能包含数字' };
    
    const length = value.length;
    if (length !== 10 && length !== 13) {
        return { 
            isValid: false, 
            message: `当前输入长度: ${length}位 (需要10位或13位时间戳)`
        };
    }
    
    const timestamp = parseInt(value);
    const date = new Date(length === 13 ? timestamp : timestamp * 1000);
    if (isNaN(date.getTime())) {
        return { isValid: false, message: '无效的时间戳' };
    }

    return { 
        isValid: true, 
        message: `有效的${length}位时间戳` 
    };
}

// 转换时间戳为日期时间
function convertTimestamp() {
    const timestampInput = document.getElementById('timestampInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    const validation = validateTimestamp(timestampInput);
    if (!validation.isValid) {
        resultDiv.innerHTML = `<span style="color: red;">${validation.message}</span>`;
        return;
    }

    try {
        let timestamp = parseInt(timestampInput);
        if (String(timestamp).length === 13) {
            timestamp = Math.floor(timestamp / 1000);
        }

        const date = new Date(timestamp * 1000);
        resultDiv.innerHTML = `
            <strong>转换结果：</strong><br>
            本地时间：${date.toLocaleString()}<br>
            UTC时间：${date.toUTCString()}<br>
            ISO格式：${date.toISOString()}
        `;
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: red;">转换出错: ${error.message}</span>`;
    }
}

// 转换日期时间为时间戳
function convertToTimestamp() {
    const dateInput = document.getElementById('dateInput').value;
    const resultDiv = document.getElementById('timestampResult');
    
    if (!dateInput) {
        resultDiv.innerHTML = '<span style="color: red;">请选择日期时间</span>';
        return;
    }

    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
            throw new Error('无效的日期时间');
        }

        const timestamp = Math.floor(date.getTime() / 1000);
        resultDiv.innerHTML = `
            <strong>转换结果：</strong><br>
            10位时间戳：${timestamp}<br>
            13位时间戳：${timestamp}000
        `;
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: red;">${error.message}</span>`;
    }
}

// 实时验证和提示
document.getElementById('timestampInput').addEventListener('input', function(e) {
    const value = e.target.value.trim();
    const hintDiv = document.getElementById('timestampHint');
    const validation = validateTimestamp(value);
    
    // 更新输入框样式
    this.classList.toggle('invalid', !validation.isValid);
    
    // 更新提示信息样式和内容
    hintDiv.className = 'input-hint ' + (validation.isValid ? 'valid' : 'invalid');
    hintDiv.textContent = validation.message;
});

// 生成二维码
function generateQR() {
    const input = document.getElementById('qrInput').value.trim();
    const display = document.getElementById('qrResult');
    
    if (!input) {
        display.innerHTML = '<p style="color: red;">请输入要生成二维码的内容</p>';
        return;
    }
    
    display.innerHTML = ''; // 清除之前的内容
    
    try {
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, input, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: 'H'
        }, function (error) {
            if (error) {
                display.innerHTML = '<p style="color: red;">生成二维码失败: ' + error.message + '</p>';
                return;
            }
            display.appendChild(canvas);
        });
    } catch (error) {
        display.innerHTML = '<p style="color: red;">生成二维码失败: ' + error.message + '</p>';
    }
}

// 扫描二维码
function scanQR() {
    const fileInput = document.getElementById('qrFile');
    const resultDiv = document.getElementById('scanResult');
    
    if (!fileInput.files || !fileInput.files[0]) {
        resultDiv.innerHTML = '<p style="color: red;">请先选择图片文件</p>';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                resultDiv.innerHTML = `
                    <strong>识别结果：</strong><br>
                    <div style="word-break: break-all;">${code.data}</div>
                `;
            } else {
                resultDiv.innerHTML = '<p style="color: red;">未能识别二维码</p>';
            }
        };
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        resultDiv.innerHTML = '<p style="color: red;">读取文件失败</p>';
    };
    
    reader.readAsDataURL(file);
}