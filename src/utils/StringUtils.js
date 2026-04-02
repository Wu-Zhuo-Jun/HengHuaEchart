class StringUtils {
  /**
   * 切割url路径为数组
   * @param {string} path
   * @returns array
   */
  static urlPathToArray(path) {
    return path.split("/").filter((item) => item !== "");
  }

  /**
   * 匹配中文字字母数字长度
   * @param {string} str 字符串
   * @param {int} len 长度
   * @returns
   */
  static isMatchLength(str, len) {
    let regex = new RegExp(`^[\\u4e00-\\u9fa5a-zA-Z0-9]{1,${len.toString()}}$`);
    return regex.test(str);
  }

  /**
   * 是否空字符串
   * @param {string} str
   * @returns boolean
   */
  static isNullorspace(str) {
    if (str == null || str == "" || !str.search(new RegExp("/^s+$/"))) {
      return true;
    }
    return false;
  }

  /**
   * 截取小数部分长度
   * @param {Number} num
   * @param {Number} fractionDigits
   * @returns {Number}
   */
  static toFixed(num, fractionDigits) {
    if (Number(num) % 1 !== 0 || fractionDigits === 0) {
      return Number(num.toFixed(fractionDigits));
    }
    return num;
  }

  /**
   * 将 Unicode 转义序列字符串转换为中文字符串
   * 支持格式: "u5ba2u6d41..." 或 "\u5ba2\u6d41..."
   * @param {string} str 需要转换的字符串
   * @returns {string} 转换后的中文字符串
   */
  static unicodeToString(str) {
    if (typeof str !== "string") return str;

    // 处理 "u5ba2u6d41..." 格式（没有反斜杠）
    if (/^u[0-9a-fA-F]{4}/.test(str)) {
      return str.replace(/u([0-9a-fA-F]{4})/g, (match, code) => {
        return String.fromCharCode(parseInt(code, 16));
      });
    }

    // 处理 "\u5ba2\u6d41..." 格式（有反斜杠，JSON 格式）
    if (/\\u[0-9a-fA-F]{4}/.test(str)) {
      try {
        return JSON.parse(`"${str}"`);
      } catch (error) {
        // 如果解析失败，尝试直接替换
        return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
          return String.fromCharCode(parseInt(code, 16));
        });
      }
    }

    return str;
  }
}

export default StringUtils;
