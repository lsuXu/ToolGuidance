// QR code library
const qrScript = document.createElement('script');
qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
document.head.appendChild(qrScript);

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
    qrOutput.innerHTML = '';
    QRCode.toCanvas(qrOutput, text, { width: 256 }, (error) => {
        if (error) console.error(error);
    });
}

function scanQRCode(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                qrScanResult.textContent = `识别结果: ${code.data}`;
            } else {
                qrScanResult.textContent = '未能识别二维码';
            }
        };
        img.src = e.target.result;
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