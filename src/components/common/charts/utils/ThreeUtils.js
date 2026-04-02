import * as THREE from "three";

/**
 * 解析颜色字符串，返回RGB对象
 * @param {string} color 颜色字符串（hex/rgb/rgba）
 * @returns {object} {red, green, blue}
 */
export function getColor(color) {
  if (!color) return { red: 0, green: 0, blue: 0 };

  // 移除空格
  color = color.trim();

  // HEX格式 #RRGGBB
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { red: r, green: g, blue: b };
  }

  // RGB格式 rgb(r, g, b)
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return {
        red: parseInt(matches[0]),
        green: parseInt(matches[1]),
        blue: parseInt(matches[2]),
      };
    }
  }

  return { red: 0, green: 0, blue: 0 };
}

/**
 * 获取暗色向渐变颜色
 * @param {string} color 基础颜色
 * @param {number} step  数量
 * @returns {array} list 颜色数组
 */
export function getShadowColor(color, step) {
  let c = getColor(color);
  let { red, blue, green } = c;

  const s = 0.8;
  const r = parseInt(red * s),
    g = parseInt(green * s),
    b = parseInt(blue * s);

  const rr = (r - red) / step,
    gg = (g - green) / step,
    bb = (b - blue) / step;

  let list = [];
  for (let i = 0; i < step; i++) {
    list.push(`rgb(${parseInt(red + i * rr)},${parseInt(green + i * gg)},${parseInt(blue + i * bb)})`);
  }
  return list;
}

/**
 * 获取高对比度渐变色（用于环形图）
 * @param {string} color 基础颜色
 * @param {number} step 渐变步数
 * @returns {array} 高对比度颜色数组 [上盖(亮), 外圈(中暗), 内圈(暗), 下盖(最暗), 侧面(中)]
 */
export function getHighContrastColors(color, step) {
  let c = getColor(color);
  let { red, blue, green } = c;

  // 上盖：更亮（增加30%亮度）
  const brightFactor = 1;
  const brightR = Math.min(255, parseInt(red * brightFactor));
  const brightG = Math.min(255, parseInt(green * brightFactor));
  const brightB = Math.min(255, parseInt(blue * brightFactor));

  // 外圈：中等暗度（80%）
  const midDarkFactor = 0.75;
  const midDarkR = parseInt(red * midDarkFactor);
  const midDarkG = parseInt(green * midDarkFactor);
  const midDarkB = parseInt(blue * midDarkFactor);

  // 内圈：较暗（60%）
  const darkFactor = 0.6;
  const darkR = parseInt(red * darkFactor);
  const darkG = parseInt(green * darkFactor);
  const darkB = parseInt(blue * darkFactor);

  // 下盖：最暗（40%）
  const darkestFactor = 0.4;
  const darkestR = parseInt(red * darkestFactor);
  const darkestG = parseInt(green * darkestFactor);
  const darkestB = parseInt(blue * darkestFactor);

  // 侧面：中等（70%）
  const sideFactor = 0.7;
  const sideR = parseInt(red * sideFactor);
  const sideG = parseInt(green * sideFactor);
  const sideB = parseInt(blue * sideFactor);

  return [
    `rgb(${brightR},${brightG},${brightB})`, // 上盖 - 最亮
    `rgb(${midDarkR},${midDarkG},${midDarkB})`, // 外圈 - 中等暗
    `rgb(${darkR},${darkG},${darkB})`, // 内圈 - 较暗
    `rgb(${darkestR},${darkestG},${darkestB})`, // 下盖 - 最暗
    `rgb(${sideR},${sideG},${sideB})`, // 侧面 - 中等
  ];
}

/**
 * 获取渐变色数组（从亮到暗）
 * @param {array} colors 基础颜色数组
 * @param {number} step 渐变步数
 * @param {boolean} highContrast 是否使用高对比度模式
 * @returns {array} 渐变色数组
 */
export function getDrawColors(colors, step, highContrast = false) {
  if (!colors || colors.length === 0) {
    return [];
  }

  if (highContrast) {
    return colors.map((color) => {
      return getHighContrastColors(color, step);
    });
  }

  return colors.map((color) => {
    return getShadowColor(color, step);
  });
}

/**
 * 创建基础材质
 * @param {object} THREE Three.js对象
 * @param {string} color 颜色字符串
 * @returns {THREE.MeshBasicMaterial} 材质对象
 */
export function getBasicMaterial(THREE, color) {
  return new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
}

/**
 * 创建文本精灵数组
 * @param {object} THREE Three.js对象
 * @param {array} textList 文本数组 [{text, color}, ...]
 * @param {number} fontSize 字体大小
 * @returns {object} {mesh: THREE.Group}
 */
export function getTextArraySprite(THREE, textList, fontSize = 10) {
  const group = new THREE.Group();

  if (!textList || textList.length === 0) {
    return { mesh: group };
  }

  // 创建canvas绘制文本
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // 设置canvas尺寸
  canvas.width = 256;
  canvas.height = textList.length * (fontSize + 10);

  // 设置字体
  context.font = `bold ${fontSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // 绘制文本
  textList.forEach((item, index) => {
    const y = (index + 0.5) * (fontSize + 10);
    context.fillStyle = item.color || "#ffffff";
    context.fillText(item.text, canvas.width / 2, y);
  });

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 创建精灵材质
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
  });

  // 创建精灵
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(canvas.width * 0.01, canvas.height * 0.01, 1);

  group.add(sprite);

  return { mesh: group };
}
