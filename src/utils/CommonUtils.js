import StringUtils from "./StringUtils";
import TimeUtils from "./TimeUtils";
import dayjs from "dayjs";

class CommonUtils {
  /**
   * 根据时间范围dayjs对象和粒度生成x轴数据(自然周、自然月)
   * @param {Array} timeRange
   * @param {string} timeGranule
   * @param {string} type 自定义类型type normal、customerInsight
   * @returns
   */
  static generateXAxisFromTimeRange = (timeRange, timeGranule, type = "normal") => {
    if (!timeRange || !timeRange[0] || !timeRange[1] || !timeGranule) {
      return [];
    }

    // 获取清0时间
    const clearTimeValue = sessionStorage.getItem("clearTime") <= 24 && sessionStorage.getItem("clearTime") >= 0 ? sessionStorage.getItem("clearTime") : 0;
    const nowTime = dayjs();
    const clearTime = dayjs().hour(clearTimeValue).startOf("hour");
    const isAfterClearTime = nowTime.isAfter(clearTime);

    const [startTime, endTime] = timeRange;
    // 如果没有结束时间，使用开始时间作为结束时间
    let actualEndTime = endTime || startTime;
    const xAxis = [];
    const xAxisTooltips = [];
    const xAxisTime = [];
    let current = startTime.clone();

    switch (timeGranule) {
      case "mintue":
        // 5分钟粒度
        current = current.startOf("day").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = current.add(1, "d").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + current.add(5, "minute").format("HH:mm"));
          xAxisTime.push(current);
          current = current.add(5, "minute");
        }
        break;
      case "halfHour":
        // 半小时粒度
        current = current.startOf("day").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("day")
          .add(1, "d")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + current.add(30, "minute").format("HH:mm"));
          xAxisTime.push(current);
          current = current.add(30, "minute");
        }
        break;
      case "hour":
        // 小时粒度
        current = current.startOf("day").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("day")
          .add(1, "d")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + (current.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : current.add(1, "hour").format("HH:mm")));
          if (type === "customerInsight") {
            xAxisTooltips.pop();
            xAxisTooltips.push(current.format("HH:mm") + "-" + (current.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : current.add(1, "hour").format("HH:mm")));
          }
          xAxisTime.push(current);
          current = current.add(1, "hour");
        }
        break;
      case "day":
        // 天粒度
        current = current.startOf("day").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("day")
          .add(1, "d")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("MM-DD"));
          xAxisTooltips.push(current.format("YYYY-MM-DD"));
          xAxisTime.push(current);
          current = current.add(1, "day");
        }
        break;
      case "week":
        // 周粒度
        current = current.startOf("week").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("week")
          .add(1, "week")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("MM-DD") + "当周");
          xAxisTooltips.push(`${current.format("YYYY-MM-DD")}  当周`);
          xAxisTime.push(current);
          current = current.add(1, "week");
        }
        break;
      case "month":
        // 月粒度
        current = current.startOf("month").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("month")
          .add(1, "month")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("YYYY-MM"));
          xAxisTooltips.push(current.format("YYYY-MM"));
          xAxisTime.push(current);
          current = current.add(1, "month");
        }
        break;
      default:
        // 默认按小时处理
        current = current.startOf("day").add(isAfterClearTime ? clearTimeValue : 0, "hour");
        actualEndTime = actualEndTime
          .startOf("day")
          .add(1, "d")
          .add(isAfterClearTime ? clearTimeValue : 0, "hour");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("YYYY-MM-DD HH:mm"));
          xAxisTime.push(current);
          current = current.add(1, "hour");
        }
        break;
    }

    // 标签无需最后一位
    xAxisTooltips.pop();
    xAxis.pop();
    return { xAxis, xAxisTime, xAxisTooltips };
  };

  // 热力图x轴数据生成(和generateXAxisFromTimeRange区别为表现形式不一样)
  static generateXAxisFromTimeRangeForHeatMap = (timeRange, timeGranule) => {
    if (!timeRange || !timeRange[0] || !timeRange[1] || !timeGranule) {
      return [];
    }

    const [startTime, endTime] = timeRange;
    // 如果没有结束时间，使用开始时间作为结束时间
    let actualEndTime = endTime || startTime;
    const xAxis = [];
    const xAxisTooltips = [];
    const xAxisTime = [];
    let current = startTime.clone();
    let _startTime = startTime.clone();
    let _endTime = endTime.clone();

    switch (timeGranule) {
      case "mintue":
        // 5分钟粒度
        current = current.startOf("day");
        actualEndTime = current.add(1, "d");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + current.add(5, "minute").format("HH:mm"));
          xAxisTime.push(current);
          current = current.add(5, "minute");
        }
        break;
      case "halfHour":
        // 半小时粒度
        current = current.startOf("day");
        actualEndTime = actualEndTime.startOf("day").add(1, "d");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + current.add(30, "minute").format("HH:mm"));
          xAxisTime.push(current);
          current = current.add(30, "minute");
        }
        break;
      case "hour":
        // 小时粒度
        current = current.startOf("day");
        actualEndTime = actualEndTime.startOf("day").add(1, "d");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));

          xAxisTooltips.push(current.format("MM-DD HH:mm") + "-" + (current.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : current.add(1, "hour").format("HH:mm")));
          xAxisTime.push(current);
          current = current.add(1, "hour");
        }
        xAxisTooltips.unshift(`${_startTime.startOf("day").format("YYYY-MM-DD")} (合计)`);
        break;
      case "day":
        // 天粒度
        current = current.startOf("day");
        actualEndTime = actualEndTime.startOf("day").add(1, "d");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("MM-DD"));
          xAxisTooltips.push(current.format("YYYY-MM-DD"));
          xAxisTime.push(current);
          current = current.add(1, "day");
        }
        xAxisTooltips.unshift(`${_startTime.startOf("day").format("YYYY-MM-DD")} - ${_endTime.startOf("day").format("YYYY-MM-DD")} (合计)`);
        break;
      case "week":
        // 周粒度
        current = current.startOf("week");
        actualEndTime = actualEndTime.startOf("week").add(1, "week");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("MM-DD") + "当周");
          xAxisTooltips.push(`${current.format("YYYY-MM-DD")}  当周`);
          xAxisTime.push(current);
          current = current.add(1, "week");
        }
        xAxisTooltips.unshift(`${_startTime.startOf("week").format("YYYY-MM-DD")}当周 - ${_endTime.startOf("day").format("YYYY-MM-DD")}当周 (合计)`);

        break;
      case "month":
        // 月粒度
        current = current.startOf("month");
        actualEndTime = actualEndTime.startOf("month").add(1, "month");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("YYYY-MM"));
          xAxisTooltips.push(current.format("YYYY-MM"));
          xAxisTime.push(current);
          current = current.add(1, "month");
        }
        xAxisTooltips.unshift(`${_startTime.format("YYYY-MM")} - ${_endTime.startOf("day").format("YYYY-MM")} (合计)`);
        break;
      default:
        // 默认按小时处理
        current = current.startOf("day");
        actualEndTime = actualEndTime.startOf("day").add(1, "d");
        while (current.isBefore(actualEndTime) || current.isSame(actualEndTime)) {
          xAxis.push(current.format("HH:mm"));
          xAxisTooltips.push(current.format("YYYY-MM-DD HH:mm"));
          xAxisTime.push(current);
          current = current.add(1, "hour");
        }
        break;
    }

    // 标签无需最后一位
    xAxisTooltips.pop();
    xAxis.pop();
    return { xAxis, xAxisTime, xAxisTooltips };
  };

  // dayjs范围转时间戳
  static getTimeSlotByIndex = (startTime, endTime) => {
    return {
      startTime: startTime.unix(),
      endTime: endTime.unix(),
    };
  };

  // 根据索引求和
  /** 用法
   * const genderArrs = [
   *   { title: "男", data: [446, 50] },
   *   { title: "女", data: [408, 29] },
   *   { title: "未知", data: [0, 0] },
   * ];
   * const res = sumByIndex(genderArrs); // [854, 79]
   */
  static sumByIndex = (arr) => {
    const maxLen = Math.max(0, ...arr.map((v) => v.data?.length || 0));
    return Array.from({ length: maxLen }, (_, i) => arr.reduce((sum, cur) => sum + (Number(cur.data?.[i]) || 0), 0));
  };

  // 根据索引计算百分比（相对于各下标总和），返回数值与文本两种形式
  /** 用法
   * const genderArrs = [
   *   { title: "男", data: [446, 50] },
   *   { title: "女", data: [408, 29] },
   *   { title: "未知", data: [0, 0] },
   * ];
   * const result = CommonUtils.percentByIndex(genderArrs);
   * // result = [
   * //   { title: '男', percent: [52.22, 63.29], percentText: ['52.22%', '63.29%'] },
   * //   { title: '女', percent: [47.78, 36.71], percentText: ['47.78%', '36.71%'] },
   * //   { title: '未知', percent: [0, 0], percentText: ['0.00%', '0.00%'] },
   * // ]
   */
  static percentByIndex = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const sums = CommonUtils.sumByIndex(arr);
    return arr.map(({ title, data = [] }) => {
      const percent = data.map((v, i) => StringUtils.toFixed(sums[i] ? (Number(v) / sums[i]) * 100 : 0, 2));
      // const percentText = percent.map((p) => `${Number.isFinite(p) ? p.toFixed(fractionDigits) : (0).toFixed(fractionDigits)}%`);
      return { title, percent };
    });
  };

  /**
   * 将数值转换成万、千万并保留两位小数
   * @param {Number} value 要转换的数值
   * @returns {Object} 包含数值、单位和完整文本的对象 {value: string, unit: string, fullText: string}
   */
  static formatNumberToUnit = (value) => {
    const num = Number(value);
    if (isNaN(num)) {
      return { value: value, unit: "", fullText: String(value) };
    }

    if (num >= 10000000) {
      // 转换为千万，保留两位小数
      const formattedValue = (num / 10000000).toFixed(2);
      return {
        value: formattedValue,
        unit: "千万",
        fullText: formattedValue + "千万",
      };
    } else if (num >= 10000) {
      // 转换为万，保留两位小数
      const formattedValue = (num / 10000).toFixed(2);
      return {
        value: formattedValue,
        unit: "万",
        fullText: formattedValue + "万",
      };
    }
    // 小于10000，返回原数值
    const formattedValue = num.toLocaleString("en-US");
    return {
      value: formattedValue,
      unit: "",
      fullText: formattedValue,
    };
  };

  /**
   * 判断是否需要清空Array尾部处理（主要处理平均数和中位数处理）
   * @param {*} time - 可以是dayjs对象、Date对象、时间戳(秒或毫秒)
   * @returns {boolean} 返回true of false
   */
  static needToClearTailZero = (time) => {
    if (time == null) return false;
    const isAfterNow = TimeUtils.isAfterNow(time);
    const isToday = TimeUtils.isToday(time);
    return isAfterNow || isToday;
  };

  // dayjs范围转时间戳
  static getTimeSlotByIndex = (startTime, endTime) => {
    return {
      startTime: startTime.unix(),
      endTime: endTime.unix(),
    };
  };
}

export default CommonUtils;
