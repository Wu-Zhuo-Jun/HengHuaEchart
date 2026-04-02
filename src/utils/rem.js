class RemAdapter {
  constructor(designWidth = 750) {
    this.designWidth = designWidth;
    this.baseSize = designWidth / 10; // 1rem = 75px (750设计稿)
    this.baseSizePc = 16; // 1rem = 16px (1920设计稿)
    // PC端断点，默认768px（小于等于768px为移动端，大于768px为PC端）
    this.breakpoint = 768;
    // PC端最大宽度限制，超过此宽度后不再放大，默认1920px
    this.pcMaxWidth = 1920;
    this.init();
  }

  /**
   * 通过 User-Agent 判断是否是移动设备
   * @returns {boolean} true表示移动端，false表示PC端
   */
  isMobileByUA() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    if (window.screen.width * 1.5 < window.screen.height) {
      return true;
    }
    return mobileRegex.test(ua);
  }

  /**
   * 综合判断设备类型（优先使用 User-Agent，结合屏幕宽度）
   * @returns {boolean} true表示移动端，false表示PC端
   */
  isMobile() {
    // 优先使用 User-Agent 判断，如果 User-Agent 显示是移动端，则直接返回 true
    if (this.isMobileByUA()) {
      return true;
    }
    return false;
  }

  /**
   * 检测是否是DataView页面
   * DOM元素判断（检查是否存在 data-view-container 元素）
   * @returns {boolean} true表示是DataView页面
   */
  isDataViewPage() {
    const dataViewContainer = document.querySelector(".data-view-container");
    if (dataViewContainer) {
      return true;
    }
    return false;
  }

  setRem() {
    const clientWidth = document.documentElement.clientWidth;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    let remSize;
    let remSizePc;
    let scale;

    // 检测是否是DataView页面
    const isDataViewPage = this.isDataViewPage();

    // 通过设备判断是移动端还是PC端
    if (this.isMobile()) {
      // 如果是DataView页面，使用固定的px形式（1rem = 12px）
      if (isDataViewPage) {
        remSize = 12;
      } else {
        // 移动端：保持原有逻辑不变，按比例缩放，最大2倍
        scale = clientWidth / this.designWidth;
        remSize = this.baseSize * Math.min(scale, 2);
      }
    } else {
      // PC端：设计稿为1920，使用screenWidth计算
      const PcDesignWidth = 1920;
      scale = screenWidth / PcDesignWidth;
      remSize = this.baseSizePc * scale;
    }
    document.documentElement.style.fontSize = remSize + "px";
  }

  init() {
    this.setRem();
    window.addEventListener("resize", () => this.setRem());
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) this.setRem();
    });
  }

  // 手动转换函数：px 转 rem
  px2rem(px) {
    return px / this.baseSize;
  }

  // 获取当前 rem 基准值
  getRemBase() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  // 批量转换px到rem的工具函数（用于样式对象）
  // 用法: style={remAdapter.px2remStyle({ width: 300, height: 200, fontSize: 16 })}
  px2remStyle(styleObj) {
    const result = {};
    for (const key in styleObj) {
      const value = styleObj[key];
      // 如果是数字，转换为rem
      if (typeof value === "number") {
        result[key] = `${this.px2rem(value)}rem`;
      } else if (typeof value === "string" && /^\d+px$/.test(value)) {
        // 如果是 "300px" 格式的字符串，也转换
        const pxValue = parseFloat(value);
        result[key] = `${this.px2rem(pxValue)}rem`;
      } else {
        // 其他情况直接使用原值
        result[key] = value;
      }
    }
    return result;
  }
}

// 初始化
const remAdapter = new RemAdapter(750);
export default remAdapter;
