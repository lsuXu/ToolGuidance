// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    function switchSection(sectionId) {
        // 隐藏所有section
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // 移除所有导航链接的active状态
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // 显示目标section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 激活对应的导航链接
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 绑定导航点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
                // 更新URL hash
                window.location.hash = `#${sectionId}`;
            }
        });
    });
    
    // 根据URL hash初始化页面
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
        switchSection(hash);
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.slice(1);
        if (newHash && document.getElementById(newHash)) {
            switchSection(newHash);
        }
    });
}

// 初始化导航
initNavigation();

// QR code library - 已在HTML中直接引用
// const qrScript = document.createElement('script');
// qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
// document.head.appendChild(qrScript);

// QR code scanner library
const jsQRScript = document.createElement('script');
jsQRScript.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
document.head.appendChild(jsQRScript);

// DOM Elements for timestamp
const timestampInput = document.getElementById('timestamp-input');
const datetimeInput = document.getElementById('datetime-input');
const digitCount = document.getElementById('digit-count');
const timestampResult = document.getElementById('timestamp-result');
const datetimeResult = document.getElementById('datetime-result');
const currentTimeDisplay = document.getElementById('current-time');

// DOM Elements for QR code
const qrTextInput = document.getElementById('qr-text-input');
const generateQrBtn = document.getElementById('generate-qr');
const qrOutput = document.getElementById('qr-output');
const qrFileInput = document.getElementById('qr-file-input');
const qrScanResult = document.getElementById('qr-scan-result');

// DOM Elements for JSON
const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const parseJsonBtn = document.getElementById('parse-json');
const formatJsonBtn = document.getElementById('format-json');
const minifyJsonBtn = document.getElementById('minify-json');
const copyJsonBtn = document.getElementById('copy-json');

// Update current time
function updateCurrentTime() {
    const now = new Date();
    currentTimeDisplay.textContent = now.toLocaleString('zh-CN');
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Set current datetime in input
function setCurrentDatetime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}
setCurrentDatetime();
datetimeInput.addEventListener('click', () => datetimeInput.showPicker());

// Timestamp conversion functions
function validateTimestamp(timestamp) {
    const length = timestamp.toString().length;
    return length === 10 || length === 13;
}

function convertTimestamp(timestamp) {
    if (!timestamp) return '';
    const length = timestamp.toString().length;
    let ts = parseInt(timestamp);
    if (length === 10) ts *= 1000;
    return new Date(ts).toLocaleString('zh-CN');
}

// Event listeners for timestamp conversion
timestampInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    const length = value.length;
    digitCount.textContent = `当前输入: ${length}位`;
    
    if (!value) {
        timestampResult.textContent = '';
        return;
    }

    if (validateTimestamp(value)) {
        timestampResult.textContent = convertTimestamp(value);
        digitCount.style.color = '#28a745';
    } else {
        timestampResult.textContent = '请输入有效的10位或13位时间戳';
        digitCount.style.color = '#dc3545';
    }
});

datetimeInput.addEventListener('input', () => {
    const date = new Date(datetimeInput.value);
    if (isNaN(date.getTime())) {
        datetimeResult.textContent = '请选择有效的日期时间';
        return;
    }
    const timestamp10 = Math.floor(date.getTime() / 1000);
    const timestamp13 = date.getTime();
    datetimeResult.textContent = `10位时间戳: ${timestamp10}\n13位时间戳: ${timestamp13}`;
});

// QR code functions
function generateQRCode(text) {
    if (!text) {
        alert('请输入要生成二维码的文本');
        return;
    }
    
    const qrOutput = document.getElementById('qr-output');
    qrOutput.innerHTML = '<p class="loading">正在生成二维码...</p>';
    
    try {
        if (typeof QRCode === 'undefined') {
            qrOutput.innerHTML = '<p class="error">QRCode库未加载，请检查网络</p>';
            return;
        }
        
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, text, {
            width: 256,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }).then(() => {
            qrOutput.innerHTML = '';
            qrOutput.appendChild(canvas);
            
            // 添加下载按钮
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = '下载二维码';
            downloadBtn.className = 'qr-download-btn';
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL();
                link.click();
            };
            qrOutput.appendChild(downloadBtn);
        }).catch((error) => {
            qrOutput.innerHTML = '<p class="error">生成二维码失败: ' + error.message + '</p>';
        });
    } catch (error) {
        qrOutput.innerHTML = '<p class="error">生成二维码失败: ' + error.message + '</p>';
        console.error('QR Code generation error:', error);
    }
}

function scanQRCode(file) {
    const qrScanResult = document.getElementById('qr-scan-result');
    qrScanResult.innerHTML = '<p class="loading">正在识别二维码...</p>';
    qrScanResult.className = 'qr-scan-result';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    qrScanResult.className = 'qr-scan-result success';
                    qrScanResult.innerHTML = `
                        <div>
                            <div class="result-label">识别结果:</div>
                            <div class="result-text">${code.data}</div>
                        </div>
                    `;
                } else {
                    qrScanResult.className = 'qr-scan-result error';
                    qrScanResult.innerHTML = '<p class="error">未能识别二维码，请确保图片中包含清晰的二维码</p>';
                }
            } catch (error) {
                qrScanResult.className = 'qr-scan-result error';
                qrScanResult.innerHTML = '<p class="error">识别二维码时出错: ' + error.message + '</p>';
                console.error('QR Code scanning error:', error);
            }
        };
        
        img.onerror = () => {
            qrScanResult.className = 'qr-scan-result error';
            qrScanResult.innerHTML = '<p class="error">图片加载失败</p>';
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = () => {
        qrScanResult.className = 'qr-scan-result error';
        qrScanResult.innerHTML = '<p class="error">读取文件失败</p>';
    };
    
    reader.readAsDataURL(file);
}

// QR code event listeners
generateQrBtn.addEventListener('click', () => {
    generateQRCode(qrTextInput.value.trim());
});

qrFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        scanQRCode(file);
    }
});

// JSON syntax highlighting function
function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Parse JSON function
function parseJSON(input, format = true) {
    try {
        const parsed = JSON.parse(input);
        const formatted = format ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
        jsonOutput.innerHTML = syntaxHighlight(formatted);
        jsonOutput.classList.remove('json-error');
    } catch (e) {
        jsonOutput.textContent = `错误: ${e.message}`;
        jsonOutput.classList.add('json-error');
    }
}

// Auto-parse JSON on input
let typingTimer;
jsonInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const input = jsonInput.value.trim();
        if (input) {
            parseJSON(input);
        } else {
            jsonOutput.textContent = '';
        }
    }, 500);
});

// Manual parse button
parseJsonBtn.addEventListener('click', () => {
    const input = jsonInput.value.trim();
    if (input) {
        parseJSON(input);
    }
});

// Format JSON button
formatJsonBtn.addEventListener('click', () => {
    const input = jsonInput.value.trim();
    if (input) {
        try {
            const parsed = JSON.parse(input);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            parseJSON(jsonInput.value);
        } catch (e) {
            jsonOutput.textContent = `错误: ${e.message}`;
            jsonOutput.classList.add('json-error');
        }
    }
});

// Minify JSON button
minifyJsonBtn.addEventListener('click', () => {
    const input = jsonInput.value.trim();
    if (input) {
        try {
            const parsed = JSON.parse(input);
            jsonInput.value = JSON.stringify(parsed);
            parseJSON(jsonInput.value, false);
        } catch (e) {
            jsonOutput.textContent = `错误: ${e.message}`;
            jsonOutput.classList.add('json-error');
        }
    }
});

// Copy JSON button
copyJsonBtn.addEventListener('click', () => {
    const textToCopy = jsonOutput.classList.contains('json-error') ? 
        jsonOutput.textContent : 
        jsonInput.value.trim();
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const originalText = copyJsonBtn.textContent;
                copyJsonBtn.textContent = '已复制';
                setTimeout(() => {
                    copyJsonBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
            });
    }
});

// Quick time functionality
function initQuickTime() {
    const quickTimeButtons = document.querySelectorAll('.quick-time-btn');
    const quickTimeResult = document.getElementById('quick-time-result');
    
    function formatTimeDiff(minutes) {
        if (minutes < 60) {
            return `${minutes}分钟`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours}小时`;
            } else {
                return `${hours}小时${remainingMinutes}分钟`;
            }
        } else {
            const days = Math.floor(minutes / 1440);
            const remainingHours = Math.floor((minutes % 1440) / 60);
            if (remainingHours === 0) {
                return `${days}天`;
            } else {
                return `${days}天${remainingHours}小时`;
            }
        }
    }
    
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    
    function calculateQuickTime(minutes) {
        const now = new Date();
        const futureTime = new Date(now.getTime() + minutes * 60 * 1000);
        
        const timestamp10 = Math.floor(futureTime.getTime() / 1000);
        const timestamp13 = futureTime.getTime();
        
        const timeDiff = formatTimeDiff(minutes);
        const formattedTime = formatDateTime(futureTime);
        
        quickTimeResult.className = 'quick-time-result success';
        quickTimeResult.innerHTML = `
            <div class="time-info">
                <div class="time-display">${formattedTime}</div>
                <div class="time-diff">当前时间 + ${timeDiff}</div>
                <div class="timestamp-display">
                    <div class="timestamp-item">
                        <strong>10位时间戳:</strong> ${timestamp10}
                        <button class="copy-btn small" onclick="copyTimestamp('${timestamp10}')">
                            复制
                        </button>
                    </div>
                    <div class="timestamp-item">
                        <strong>13位时间戳:</strong> ${timestamp13}
                        <button class="copy-btn small" onclick="copyTimestamp('${timestamp13}')">
                            复制
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 绑定按钮点击事件
    quickTimeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const minutes = parseInt(button.getAttribute('data-minutes'));
            calculateQuickTime(minutes);
        });
    });
}

// 复制单个时间戳
function copyTimestamp(timestamp) {
    navigator.clipboard.writeText(timestamp)
        .then(() => {
            // 找到被点击的按钮
            const copyBtn = event.target;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('复制失败:', err);
            // 降级方案：使用传统复制方法
            const textArea = document.createElement('textarea');
            textArea.value = timestamp;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const copyBtn = event.target;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        });
}

// 初始化快捷时间功能
initQuickTime();