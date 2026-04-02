/**
 * 防抖工具函数
 * 用于限制函数的执行频率，在指定时间内只执行最后一次调用
 */
class DebounceUtils {
  /**
   * 防抖函数
   * @param {Function} func 需要防抖的函数
   * @param {number} wait 延迟时间（毫秒），默认300ms
   * @param {boolean} immediate 是否立即执行，默认false
   * @returns {Function} 防抖后的函数
   *
   * @example
   * // 基本用法
   * const debouncedSearch = DebounceUtils.debounce((keyword) => {
   *   console.log('搜索:', keyword);
   * }, 500);
   *
   * // 在输入框中使用
   * input.addEventListener('input', (e) => {
   *   debouncedSearch(e.target.value);
   * });
   *
   * // 立即执行版本
   * const debouncedClick = DebounceUtils.debounce(() => {
   *   console.log('点击');
   * }, 300, true);
   */
  static debounce(func, wait = 300, immediate = false) {
    let timeout = null;

    return function executedFunction(...args) {
      const context = this;

      const later = () => {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
  }

  /**
   * 节流函数
   * 在指定时间内，函数最多执行一次
   * @param {Function} func 需要节流的函数
   * @param {number} wait 间隔时间（毫秒），默认300ms
   * @returns {Function} 节流后的函数
   *
   * @example
   * // 滚动事件节流
   * const throttledScroll = DebounceUtils.throttle(() => {
   *   console.log('滚动');
   * }, 200);
   *
   * window.addEventListener('scroll', throttledScroll);
   */
  static throttle(func, wait = 300) {
    let timeout = null;
    let previous = 0;

    return function executedFunction(...args) {
      const context = this;
      const now = Date.now();
      const remaining = wait - (now - previous);

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(context, args);
        }, remaining);
      }
    };
  }

  /**
   * 取消防抖/节流
   * 用于清理防抖或节流函数的定时器
   * @param {Function} debouncedFunc 防抖或节流后的函数
   * @returns {Function} 带取消功能的函数包装器
   *
   * @example
   * const debouncedFunc = DebounceUtils.debounce(() => {
   *   console.log('执行');
   * }, 500);
   *
   * const cancelableFunc = DebounceUtils.cancelable(debouncedFunc);
   *
   * // 使用
   * cancelableFunc();
   *
   * // 取消
   * cancelableFunc.cancel();
   */
  static cancelable(func) {
    let timeout = null;
    const wrappedFunc = function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, 0);
    };

    wrappedFunc.cancel = () => {
      clearTimeout(timeout);
      timeout = null;
    };

    return wrappedFunc;
  }
}

export default DebounceUtils;
