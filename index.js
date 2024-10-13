export default {
    async fetch(request, env) {
        // 检查请求方法
        if (request.method === "POST") {
            // 处理POST请求
            const formData = await request.formData();
            const prompt = formData.get('prompt');
            const model = formData.get('model'); // 获取用户选择的模型

            // 使用用户输入的prompt
            const inputs = {
                prompt: prompt || 'cyberpunk cat', // 如果用户没有输入,使用默认值
            };

            // 根据用户选择的模型调用相应的AI
            let response;
            let contentType = 'image/png';
            switch (model) {
                case 'lightning':
                    response = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', inputs);
                    break;
                case 'dreamshaper':
                    response = await env.AI.run('@cf/lykon/dreamshaper-8-lcm', inputs);
                    break;
                case 'flux':
                    const fluxResponse = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', inputs);
                    // fluxResponse 已经是一个对象，直接使用它
                    response = base64ToArrayBuffer(fluxResponse.image);
                    break;
                default:
                    response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);
            }

            // 返回生成的图像数据
            return new Response(response, {
                headers: {
                    'content-type': contentType,
                },
            });
        } else {
            // 对于GET请求,返回HTML页面
            return new Response(generateHTML(), {
                headers: {
                    'content-type': 'text/html',
                },
            });
        }
    },
};

// Base64 转换为 ArrayBuffer 的辅助函数
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// 生成HTML页面的函数
function generateHTML() {
    return `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI图像生成</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎨</text></svg>">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                color: #333;
            }

            form {
                display: flex;
                flex-direction: column;
                gap: 20px;
                background: rgba(255, 255, 255, 0.9);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                margin-bottom: 40px; /* 增加表单底部的间距 */
            }

            input[type="text"], select {
                width: calc(100% - 24px); /* 调整宽度，考虑padding */
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: all 0.3s ease;
                background-color: #f9f9f9;
            }

            #imageContainer { 
                display: flex; 
                flex-wrap: wrap; 
                justify-content: space-between;
                gap: 20px;
                margin-top: 40px; /* 增加与表单之间的间距 */
            }

            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
                font-size: 2.5em;
            }
            label {
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            input[type="text"]:focus, select:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.25);
            }
            #compareSwitch {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            #compare {
                appearance: none;
                width: 50px;
                height: 26px;
                background: #e0e0e0;
                border-radius: 13px;
                position: relative;
                cursor: pointer;
                transition: background 0.3s;
            }
            #compare::before {
                content: '';
                position: absolute;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                background: white;
                transition: 0.3s;
            }
            #compare:checked {
                background: #3498db;
            }
            #compare:checked::before {
                left: 26px;
            }
            #modelSelection {
                margin-bottom: 15px;
            }
            select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 10px center;
                background-size: 16px;
                padding-right: 40px;
            }
            input[type="submit"] {
                cursor: pointer;
                padding: 12px 24px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            input[type="submit"]:hover {
                background: linear-gradient(135deg, #2980b9, #3498db);
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
            }
            .imageWrapper { 
                width: calc(50% - 10px); /* 调整宽度，考虑间隔 */
                margin-bottom: 20px; 
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                box-sizing: border-box; /* 确保padding不会增加总宽度 */
            }
            .imageWrapper:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .generatedImage { 
                width: 100%; 
                height: auto; 
                display: none; 
                border-radius: 5px;
                opacity: 0; /* 初始设置为透明 */
                transition: opacity 1s ease-in-out; /* 将过渡时间从 0.5s 增加到 1s */
            }
            .loading { 
                display: none; 
                color: #7f8c8d;
                text-align: center;
                font-style: italic;
                position: relative;
                padding-top: 50px; /* 为加载动画腾出空间 */
            }
            .loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: translate(-50%, 0) rotate(0deg); }
                100% { transform: translate(-50%, 0) rotate(360deg); }
            }
            /* 其余样式保持不变 */
        </style>
    </head>
    <body>
        <h1>🎨 AI图像生成魔法师</h1>
        <form id="promptForm">
            <label for="prompt">✨ 输入你的创意提示词:</label>
            <input type="text" id="prompt" name="prompt" required placeholder="例如：赛博朋克风格的猫咪">
            <div id="compareSwitch">
                <input type="checkbox" id="compare" name="compare">
                <label for="compare">🔄 对比模式</label>
            </div>
            <div id="modelSelection">
                <label for="model">🤖 选择AI模型:</label>
                <select id="model" name="model">
                    <option value="base">🖼️ Stable Diffusion XL Base</option>
                    <option value="lightning">⚡ Stable Diffusion XL Lightning</option>
                    <option value="dreamshaper">💫 Dreamshaper 8 LCM</option>
                    <option value="flux">🌊 Flux 1 Schnell</option>
                </select>
            </div>
            <input type="submit" value="🚀 生成图像">
        </form>
        <div id="imageContainer">
            <div class="imageWrapper" style="display: block; width: 100%;">
                <h3 id="currentModel">🖼️ Stable Diffusion XL Base</h3>
                <img class="generatedImage" alt="生成的图像">
                <p class="loading">🔮 正在施展魔法，请稍候...</p>
            </div>
            <div class="imageWrapper" style="display: none;">
                <h3>⚡ Stable Diffusion XL Lightning</h3>
                <img class="generatedImage" alt="Stable Diffusion XL Lightning">
                <p class="loading">🔮 正在施展魔法，请稍候...</p>
            </div>
            <div class="imageWrapper" style="display: none;">
                <h3>💫 Dreamshaper 8 LCM</h3>
                <img class="generatedImage" alt="Dreamshaper 8 LCM">
                <p class="loading">🔮 正在施展魔法，请稍候...</p>
            </div>
            <div class="imageWrapper" style="display: none;">
                <h3>🌊 Flux 1 Schnell</h3>
                <img class="generatedImage" alt="Flux 1 Schnell">
                <p class="loading">🔮 正在施展魔法，请稍候...</p>
            </div>
        </div>
        <script>
            const compareSwitch = document.getElementById('compare');
            const modelSelection = document.getElementById('modelSelection');
            const imageWrappers = document.querySelectorAll('.imageWrapper');
            const currentModelTitle = document.getElementById('currentModel');
            const modelSelect = document.getElementById('model');

            // 更新显示的图像
            function updateDisplayedImage() {
                const selectedModel = modelSelect.value;
                const modelIndex = ['base', 'lightning', 'dreamshaper', 'flux'].indexOf(selectedModel);
                imageWrappers.forEach((wrapper, index) => {
                    if (compareSwitch.checked) {
                        wrapper.style.display = 'block';
                        wrapper.style.width = 'calc(50% - 10px)'; // 在对比模式下使用新的宽度
                    } else {
                        wrapper.style.display = index === modelIndex ? 'block' : 'none';
                        wrapper.style.width = '100%';
                    }
                });
                currentModelTitle.textContent = modelSelect.options[modelSelect.selectedIndex].text;
            }

            // 更新模型选择时的处理
            modelSelect.addEventListener('change', updateDisplayedImage);

            compareSwitch.addEventListener('change', () => {
                modelSelection.style.display = compareSwitch.checked ? 'none' : 'block';
                updateDisplayedImage();
            });

            document.getElementById('promptForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const prompt = document.getElementById('prompt').value;
                const isCompareMode = compareSwitch.checked;
                const selectedModel = modelSelect.value;
                const loadings = document.querySelectorAll('.loading');
                const generatedImages = document.querySelectorAll('.generatedImage');
                
                // 重置显示状态
                loadings.forEach(loading => loading.style.display = 'none');
                generatedImages.forEach(img => {
                    img.style.display = 'none';
                    img.style.opacity = '0'; // 重置透明度
                });
                
                if (isCompareMode) {
                    // 对比模式：生成所有模型的图像
                    const models = ['base', 'lightning', 'dreamshaper', 'flux'];
                    loadings.forEach(loading => loading.style.display = 'block');
                    const promises = models.map(model => generateImage(prompt, model));
                    const results = await Promise.all(promises);
                    results.forEach((imageUrl, index) => {
                        if (imageUrl) {
                            generatedImages[index].src = imageUrl;
                            generatedImages[index].style.display = 'block';
                            // 增加延迟时间，从 50ms 增加到 100ms
                            setTimeout(() => {
                                generatedImages[index].style.opacity = '1';
                            }, 100);
                        }
                        loadings[index].style.display = 'none';
                    });
                } else {
                    // 单一模型模式
                    const modelIndex = ['base', 'lightning', 'dreamshaper', 'flux'].indexOf(selectedModel);
                    loadings[modelIndex].style.display = 'block';
                    const imageUrl = await generateImage(prompt, selectedModel);
                    if (imageUrl) {
                        generatedImages[modelIndex].src = imageUrl;
                        generatedImages[modelIndex].style.display = 'block';
                        // 增加延迟时间，从 50ms 增加到 100ms
                        setTimeout(() => {
                            generatedImages[modelIndex].style.opacity = '1';
                        }, 100);
                    }
                    loadings[modelIndex].style.display = 'none';
                }
                updateDisplayedImage();
            });

            async function generateImage(prompt, model) {
                try {
                    const formData = new FormData();
                    formData.append('prompt', prompt);
                    formData.append('model', model);
                    const response = await fetch('', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        return URL.createObjectURL(blob);
                    } else {
                        console.error('图像生成失败');
                        return null;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    return null;
                }
            }

            // 初始化页面显示
            updateDisplayedImage();
        </script>
    </body>
    </html>
    `;
}
