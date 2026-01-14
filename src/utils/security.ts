/**
 * 安全防护工具
 * 提供基本的前端安全防护功能
 */

// 版权信息
const COPYRIGHT = {
  name: '智能图片压缩转换器',
  version: '1.0.0',
  year: '2025',
  author: '智能图片压缩转换器团队',
};

/**
 * 初始化安全防护
 */
export function initSecurity() {
  // 1. 添加版权声明到控制台
  addConsoleCopyright();

  // 2. 添加完整性检查
  checkIntegrity();

  // 3. 监听开发者工具（可选，不影响正常使用）
  if (import.meta.env.PROD) {
    detectDevTools();
  }
}

/**
 * 在控制台显示版权信息
 */
function addConsoleCopyright() {
  const styles = [
    'color: #2196F3',
    'font-size: 16px',
    'font-weight: bold',
    'text-shadow: 1px 1px 2px rgba(0,0,0,0.1)',
  ].join(';');

  const infoStyles = [
    'color: #666',
    'font-size: 12px',
  ].join(';');

  console.log(`%c${COPYRIGHT.name}`, styles);
  console.log(
    `%c版本: ${COPYRIGHT.version} | © ${COPYRIGHT.year} ${COPYRIGHT.author}`,
    infoStyles
  );
  console.log(
    '%c⚠️ 警告：未经授权的代码复制和商业使用是被禁止的',
    'color: #ff9800; font-size: 12px; font-weight: bold;'
  );
  console.log(
    '%c本应用所有图片处理均在浏览器本地完成，保护您的隐私安全',
    'color: #4caf50; font-size: 12px;'
  );
}

/**
 * 完整性检查
 */
function checkIntegrity() {
  // 检查关键对象是否被篡改
  const checks = [
    typeof window !== 'undefined',
    typeof document !== 'undefined',
    typeof localStorage !== 'undefined',
    typeof URL !== 'undefined',
    typeof Blob !== 'undefined',
  ];

  if (!checks.every(Boolean)) {
    console.error('检测到异常环境，部分功能可能无法正常使用');
  }
}

/**
 * 检测开发者工具（温和提示，不阻止使用）
 */
function detectDevTools() {
  let devtoolsOpen = false;

  // 使用 console.log 的时间差检测
  const checkDevTools = () => {
    const threshold = 100;
    const start = performance.now();
    // biome-ignore lint/suspicious/noConsole: 用于检测开发者工具
    console.log('%c', 'font-size: 0px;');
    const end = performance.now();

    if (end - start > threshold && !devtoolsOpen) {
      devtoolsOpen = true;
      console.log(
        '%c👋 您好，开发者！',
        'color: #2196F3; font-size: 14px; font-weight: bold;'
      );
      console.log(
        '%c如果您对本项目感兴趣，欢迎交流学习！',
        'color: #666; font-size: 12px;'
      );
      console.log(
        '%c但请注意：未经授权的商业使用和代码复制是不被允许的。',
        'color: #ff9800; font-size: 12px;'
      );
    }
  };

  // 定期检查（不频繁，避免影响性能）
  setInterval(checkDevTools, 3000);
}

/**
 * 获取版权信息
 */
export function getCopyright() {
  return COPYRIGHT;
}

/**
 * 添加水印到处理后的图片（可选功能）
 */
export async function addWatermark(
  imageBlob: Blob,
  text?: string
): Promise<Blob> {
  // 如果不需要水印，直接返回原图
  if (!text) {
    return imageBlob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(imageBlob);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 添加水印
        const fontSize = Math.max(12, Math.min(img.width, img.height) / 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // 在右下角添加水印
        const padding = 10;
        ctx.fillText(text, img.width - padding, img.height - padding);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              resolve(imageBlob);
            }
          },
          imageBlob.type,
          0.95
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        console.error('添加水印失败:', error);
        resolve(imageBlob);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/**
 * 防止调试（可选，默认不启用）
 */
export function preventDebug(enable = false) {
  if (!enable || !import.meta.env.PROD) {
    return;
  }

  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 禁用特定快捷键
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 禁用文本选择（影响用户体验，不推荐）
  // document.addEventListener('selectstart', (e) => {
  //   e.preventDefault();
  //   return false;
  // });
}
