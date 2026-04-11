import { Time } from "@icon-park/react";
import { DateTime, Duration } from "luxon";
import dayjs from "dayjs";

class TimeUtils {
  static getDateTime() {
    return DateTime;
  }

  /**
   * 获取当前时间的DateTime对象
   * @param {*} timeStamp 时间戳
   * @returns
   */
  static getDateTimeFromTs(timeStamp) {
    return DateTime.fromSeconds(timeStamp);
  }

  static getDateTimeFromFromat(dateStr, format = "yyyy-MM-dd HH:mm:ss") {
    return DateTime.fromFormat(dateStr, format);
  }

  /**
   * 获取当前时间的DateTime对象
   * @param {*} dateStr 日期字符串
   * @returns
   */
  static getDateTimeFromDateStr(dateStr) {
    return TimeUtils.getDateTimeFromJSDate(new Date(dateStr));
  }

  /**
   * 获取当前时间的DateTime对象
   * @param {*} jsDate 日期对象
   * @returns
   */
  static getDateTimeFromJSDate(jsDate) {
    return DateTime.fromJSDate(jsDate);
  }

  /**
   * 时间戳转日期字符串
   * @param {*} timeStamp 时间戳
   * @param {*} format 日期格式
   * @returns
   */
  static ts2Date(timeStamp, format = "yyyy-MM-dd") {
    const dateTime = TimeUtils.getDateTimeFromTs(Number(timeStamp));
    return dateTime.toFormat(format);
  }

  static dayjs2Date(dayjsObj, format = "yyyy-MM-dd") {
    return TimeUtils.ts2Date(dayjsObj.valueOf() / 1000, format);
  }

  /**
   * DateTime对象转dayjs对象
   * @param {*} dateTime DateTime对象（luxon）
   * @returns {Object} dayjs对象
   */
  static dateTime2Dayjs(dateTime) {
    if (!dateTime || !dateTime.toJSDate) {
      return null;
    }
    return dayjs(dateTime.toJSDate());
  }

  /**
   * 日期字符串转时间戳
   * @param {*} dateStr 日期字符串
   * @returns
   */
  static date2Ts(dateStr) {
    const dateTime = TimeUtils.getDateTimeFromDateStr(dateStr);
    const seconds = dateTime.toSeconds() | 0;
    return seconds;
  }

  /**
   * 获取当前时间戳
   * @returns
   */
  static now() {
    const now = TimeUtils.getDateTime().now();
    const seconds = now.toSeconds() | 0;
    return seconds;
  }

  static sec2Date(seconds, format) {
    let slots = TimeUtils.getDayTimeSlotsByTs(TimeUtils.now());
    let timeStamp = slots.startTime + seconds;
    return TimeUtils.ts2Date(timeStamp, format);
  }

  /**
   * 获取当前日期字符串
   * @param {*} format 日期格式
   * @returns
   */
  static getNowDate(format) {
    return TimeUtils.ts2Date(TimeUtils.now(), format);
  }

  /**
   *
   * @returns {number} 当前星期几
   */
  static getNowWeekDay() {
    const now = DateTime.now();
    const weekday = now.weekday;
    return weekday;
  }

  /**
   * 获取指定时间戳的日结束日期字符串
   * @param {*} timeStamp
   * @param {*} format
   * @returns
   */
  static getDayDateSlotsByTs(timeStamp, format = "yyyy-MM-dd") {
    const timeSlots = TimeUtils.getDayTimeSlotsByTs(timeStamp);
    const startDate = TimeUtils.ts2Date(timeSlots.startTime, format);
    const endDate = TimeUtils.ts2Date(timeSlots.endTime, format);
    return {
      startDate,
      endDate,
    };
  }

  /**
   * 获取指定时间戳的日起始结束时间戳
   * @param {*} timeStamp
   * @returns
   */
  static getDayTimeSlotsByTs(timeStamp) {
    const dateTime = TimeUtils.getDateTimeFromTs(timeStamp);
    const startOfDay = dateTime.startOf("day");
    const endOfDay = dateTime.endOf("day");
    const timeSlots = {
      startTime: startOfDay.toSeconds() | 0,
      endTime: endOfDay.toSeconds() | 0,
    };
    return timeSlots;
  }

  /**
   * 获取指定日期字符串的周起始日期
   * @param {*} dateStr 日期字符串
   * @param {*} format
   * @returns
   */
  static getWeekDateSlotsFromDateStr(dateStr, format = "yyyy-MM-dd") {
    const dateTime = TimeUtils.getDateTimeFromDateStr(dateStr);
    const startOfWeek = dateTime.startOf("week");
    const endOfWeek = dateTime.endOf("week");
    const slots = {
      startDate: startOfWeek.toFormat(format),
      endDate: endOfWeek.toFormat(format),
    };
    return slots;
  }

  /**
   * 获取指定日期字符串的周起始时间戳
   * @param {*} dateStr
   * @returns
   */
  static getWeekTimeSlotsFromDateStr(dateStr) {
    const slots = TimeUtils.getWeekDateSlotsFromDateStr(dateStr);
    return {
      startTime: TimeUtils.date2Ts(slots.startDate),
      endTime: TimeUtils.date2Ts(slots.endDate),
    };
  }

  /**
   * 获取指定时间戳的周起始日期字符串
   * @param {*} timeStamp
   * @param {*} format
   * @returns
   */
  static getWeekDateSlotsByTs(timeStamp, format = "yyyy-MM-dd") {
    const timeSlots = TimeUtils.getWeekTimeSlotsByTs(timeStamp);
    const startDate = TimeUtils.ts2Date(timeSlots.startTime, format);
    const endDate = TimeUtils.ts2Date(timeSlots.endTime, format);
    return {
      startDate,
      endDate,
    };
  }

  static getWeekTimeSlotsByTs(timeStamp) {
    const dateTime = DateTime.fromSeconds(timeStamp);
    const startOfWeek = dateTime.startOf("week");
    const endOfWeek = dateTime.endOf("week");
    const timeSlots = {
      startTime: startOfWeek.toSeconds() | 0,
      endTime: endOfWeek.toSeconds() | 0,
    };
    return timeSlots;
  }

  static getMonthDateSlotsFromDateStr(dateStr, format = "yyyy-MM-dd") {
    const dateTime = TimeUtils.getDateTimeFromDateStr(dateStr);
    const startOfMonth = dateTime.startOf("month");
    const endOfMonth = dateTime.endOf("month");
    const slots = {
      startDate: startOfMonth.toFormat(format),
      endDate: endOfMonth.toFormat(format),
    };
    return slots;
  }

  static getMonthTimeSlotsFromDateStr(dateStr) {
    const slots = TimeUtils.getMonthDateSlotsFromDateStr(dateStr);
    return {
      startTime: TimeUtils.date2Ts(slots.startDate),
      endTime: TimeUtils.date2Ts(slots.endDate),
    };
  }

  static getMonthTimeSlotsByTs(timeStamp) {
    const dateTime = TimeUtils.getDateTimeFromTs(timeStamp);
    const startOfMonth = dateTime.startOf("month");
    const endOfMonth = dateTime.endOf("month");
    const timeSlots = {
      startTime: startOfMonth.toSeconds() | 0,
      endTime: endOfMonth.toSeconds() | 0,
    };
    return timeSlots;
  }

  static getMonthDateSlotsByTs(timeStamp, format = "yyyy-MM-dd") {
    const timeSlots = TimeUtils.getMonthTimeSlotsByTs(timeStamp);
    const startDate = TimeUtils.ts2Date(timeSlots.startTime, format);
    const endDate = TimeUtils.ts2Date(timeSlots.endTime, format);
    return {
      startDate,
      endDate,
    };
  }

  static getYearDateSlotsFromTs(timeStamp, format = "yyyy-MM-dd") {
    const timeSlots = TimeUtils.getYearTimeSlotsFromTs(timeStamp);
    const startDate = TimeUtils.ts2Date(timeSlots.startTime, format);
    const endDate = TimeUtils.ts2Date(timeSlots.endTime, format);
    return {
      startDate,
      endDate,
    };
  }

  static getYearTimeSlotsFromTs(timeStamp) {
    const dateTime = TimeUtils.getDateTimeFromTs(timeStamp);
    const startOfYear = dateTime.startOf("year");
    const endOfYear = dateTime.endOf("year");
    const timeSlots = {
      startTime: startOfYear.toSeconds() | 0,
      endTime: endOfYear.toSeconds() | 0,
    };
    return timeSlots;
  }

  static getYearDateRangeFromDateStr(dateStr, format = "yyyy-MM-dd") {
    const dateTime = TimeUtils.getDateTimeFromDateStr(dateStr);
    const year = dateTime.year;
    const startTime = TimeUtils.date2Ts(`${year}-01-01`);
    const endTime = TimeUtils.date2Ts(`${year}-12-31`);
    return TimeUtils.getDateRangeByTs(startTime, endTime, 86400, format);
  }

  /**
   * 获取指定时间段内的小时时间戳
   * @param {*} startTime 开始时间戳
   * @param {*} endTime 结束时间戳
   * @param {*} format
   * @returns
   */
  static getTsHourRangeByTs(startTime, endTime) {
    const startDate = TimeUtils.ts2Date(startTime, "yyyy-MM-dd HH");
    const endDate = TimeUtils.ts2Date(endTime, "yyyy-MM-dd HH");
    startTime = TimeUtils.date2Ts(`${startDate}:00:00`);
    endTime = TimeUtils.date2Ts(`${endDate}:00:00`);
    return TimeUtils.getTsRangeByTs(startTime, endTime, 3600);
  }

  static getTs5MinuteRangeByTs(startTime, endTime) {
    const startDate = TimeUtils.ts2Date(startTime, "yyyy-MM-dd HH");
    const endDate = TimeUtils.ts2Date(endTime, "yyyy-MM-dd HH");
    startTime = TimeUtils.date2Ts(`${startDate}:00:00`);
    endTime = TimeUtils.date2Ts(`${endDate}:00:00`);
    return TimeUtils.getTsRangeByTs(startTime, endTime + 3300, 300);
  }

  static getDayRangeByTs(startTime, endTime, format = "yyyy-MM-dd") {
    let range = [];
    let tsRange = TimeUtils.getTsDayRangeByTs(startTime, endTime);
    for (let i = 0; i < tsRange.length; i++) {
      range.push(TimeUtils.ts2Date(tsRange[i], format));
    }
    return range;
  }

  /**
   * 获取指定时间段内的日时间戳
   * @param {*} startTime 开始时间戳
   * @param {*} endTime 结束时间戳
   * @param {*} format 格式
   * @returns
   */
  static getTsDayRangeByTs(startTime, endTime) {
    const startDate = TimeUtils.ts2Date(startTime, "yyyy-MM-dd");
    const endDate = TimeUtils.ts2Date(endTime, "yyyy-MM-dd");
    startTime = TimeUtils.date2Ts(`${startDate} 00:00:00`);
    endTime = TimeUtils.date2Ts(`${endDate} 00:00:00`);
    return TimeUtils.getTsRangeByTs(startTime, endTime, 86400);
  }

  static getMonthRangeByTs(startTime, endTime, format = "yyyy-MM-dd") {
    let range = [];
    let tsRange = TimeUtils.getTsMonthRangeByTs(startTime, endTime);
    for (let i = 0; i < tsRange.length; i++) {
      range.push(TimeUtils.ts2Date(tsRange[i], format));
    }
    return range;
  }

  /**
   * 获取指定时间段内的月时间戳
   * @param {*} startTime 开始时间戳
   * @param {*} endTime 结束时间戳
   * @param {*} format 格式
   * @returns
   */
  static getTsMonthRangeByTs(startTime, endTime) {
    if (endTime < startTime) {
      return [];
    }
    let startDate = TimeUtils.ts2Date(startTime, "yyyy-MM-01");
    let endDate = TimeUtils.ts2Date(endTime, "yyyy-MM-01");
    startTime = TimeUtils.date2Ts(`${startDate} 00:00:00`);
    endTime = TimeUtils.date2Ts(`${endDate} 00:00:00`);
    let start_dtime = TimeUtils.getDateTimeFromTs(startTime);
    let end_dtime = TimeUtils.getDateTimeFromTs(endTime);
    let range = [];
    while ((start_dtime.toSeconds() | 0) <= (end_dtime.toSeconds() | 0)) {
      range.push(start_dtime.toSeconds() | 0);
      start_dtime = start_dtime.plus({ months: 1 });
    }
    return range;
  }

  static getTsRangeByTs(startTime, endTime, interval) {
    if (endTime < startTime) {
      return [];
    }
    let range = [];
    for (let time = startTime; time <= endTime; time += interval) {
      range.push(time);
    }
    return range;
  }

  static getDateRangeByTs(startTime, endTime, interval, format = "yyyy-MM-dd HH:mm:ss") {
    if (endTime < startTime) {
      return [];
    }
    // let transFormat = 'yyyy-mm-dd HH';
    // let startDate = TimeUtils.timeStamp2DateTime(startTime,transFormat);
    // let endDate = TimeUtils.timeStamp2DateTime(endTime,transFormat);
    // let startDateTime = TimeUtils.getDateTimeByDateStr(startDate.toString(),transFormat);
    // let endDateTime = TimeUtils.getDateTimeByDateStr(endDate.toString(),transFormat);
    // startTime = startDateTime.toSeconds();
    // endTime = endDateTime.toSeconds();
    let range = [];
    for (let time = startTime; time <= endTime; time += interval) {
      range.push(TimeUtils.ts2Date(time, format));
    }
    // while(startTime <= endTime){
    //     range.push(TimeUtils.ts2Date(startTime,format));
    //     startTime += interval;
    // }
    return range;
  }

  static getDaysDiffByTs(startTime, endTime) {
    const startDateTime = TimeUtils.getDateTimeFromTs(startTime);
    const endDateTime = TimeUtils.getDateTimeFromTs(endTime);
    const duration = endDateTime.diff(startDateTime, "days");
    const days = duration.days | 0;
    return days;
  }

  /**
   * 获取两个dayjs对象之间的时间段（以日为单位）
   * @param {Object} startDayjs 开始日期的dayjs对象
   * @param {Object} endDayjs 结束日期的dayjs对象
   * @returns {Object} 包含startTime和endTime的对象，时间戳以秒为单位
   */
  static getDayRangeByDayjs(startDayjs, endDayjs) {
    // 获取开始日期的0点
    const startOfDay = startDayjs.startOf("day");
    // 获取结束日期的下一天的0点
    const endOfNextDay = endDayjs.add(1, "day").startOf("day");
    return {
      startTime: startOfDay.unix(),
      endTime: endOfNextDay.unix(),
    };
  }

  /**
   * 获取指定日期当天每个小时的时间段unix时间戳数组
   * @param {Object} dayjsObj dayjs对象
   * @returns {Array} 包含每个小时时间段的数组，每个元素包含startTime和endTime
   */
  static getHourlyTimeSlotsByDayjs(dayjsObj) {
    const startOfDay = dayjsObj.startOf("day");
    const hourlySlots = [];

    // 24个小时的时间段
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = startOfDay.add(hour, "hour");
      const hourEnd = hourStart.add(1, "hour");

      hourlySlots.push({
        startTime: hourStart.unix(),
        endTime: hourEnd.unix(),
        hour: hour, // 可选：添加小时数便于调试
        startTimeStr: hourStart.format("HH:mm"),
        endTimeStr: hourEnd.format("HH:mm"),
        dateStr: hourStart.format("HH:mm") + "-" + hourEnd.format("HH:mm"),
      });
    }

    return hourlySlots;
  }

  /**
   * 获取两个dayjs对象之间每天的时间段unix时间戳数组
   * @param {Object} startDayjs 开始日期的dayjs对象
   * @param {Object} endDayjs 结束日期的dayjs对象
   * @returns {Array} 包含每天时间段的数组，每个元素包含startTime和endTime
   */
  static getDailyTimeSlotsByDayjs(startDayjs, endDayjs) {
    const startOfStartDay = startDayjs.startOf("day");
    const endOfEndDay = endDayjs.endOf("day");
    const dailySlots = [];

    // 计算天数差
    const daysDiff = endOfEndDay.diff(startOfStartDay, "day") + 1;

    // 生成每天的时间段
    for (let day = 0; day < daysDiff; day++) {
      const dayStart = startOfStartDay.add(day, "day");
      const dayEnd = dayStart.endOf("day");

      dailySlots.push({
        startTime: dayStart.unix(),
        endTime: dayEnd.unix(),
        day: day,
        startTimeStr: dayStart.format("YYYY-MM-DD"),
        endTimeStr: dayEnd.format("YYYY-MM-DD"),
        dateStr: dayStart.format("YYYY-MM-DD"),
      });
    }

    return dailySlots;
  }

  static getDaysDiffByDate(startDate, endDate) {
    const startTime = TimeUtils.date2Ts(startDate);
    const endTime = TimeUtils.date2Ts(endDate);
    return TimeUtils.getDaysDiffByTs(startTime, endTime);
  }

  static getWeekByTs(time) {
    const dateTime = TimeUtils.getDateTimeFromTs(time);
    return dateTime.weekday;
  }

  /**
   * 将各种时间类型统一转换为秒级时间戳
   * @param {*} time - 可以是dayjs对象、Date对象、时间戳(秒或毫秒)
   * @returns {number} 秒级时间戳
   */
  static normalizeToTimestamp(time) {
    if (!time) {
      return null;
    }

    // 如果是dayjs对象
    if (typeof time === "object" && time.unix && typeof time.unix === "function") {
      return time.unix();
    }

    // 如果是Date对象
    if (time instanceof Date) {
      return TimeUtils.getDateTimeFromJSDate(time).toSeconds() | 0;
    }

    // 如果是数字（时间戳）
    if (typeof time === "number") {
      // 如果时间戳大于10^10，说明是毫秒级，需要除以1000
      if (time > 10000000000) {
        return Math.floor(time / 1000);
      }
      return time;
    }

    return null;
  }

  /**
   * 判断给定时间是否大于当前时间（在未来）
   * @param {*} time - 可以是dayjs对象、Date对象、时间戳(秒或毫秒)
   * @returns {boolean} 如果时间大于当前时间返回true，否则返回false
   */
  static isAfterNow(time) {
    const timeStamp = TimeUtils.normalizeToTimestamp(time);
    if (timeStamp === null) {
      return false;
    }
    const now = TimeUtils.now();
    return timeStamp >= now;
  }

  /**
   * 判断给定时间是否不是当天
   * @param {*} time - 可以是dayjs对象、Date对象、时间戳(秒或毫秒)
   * @returns {boolean} 如果时间不是当天返回true，否则返回false
   */
  static isToday(time) {
    const timeStamp = TimeUtils.normalizeToTimestamp(time);
    if (timeStamp === null) {
      return true;
    }
    const now = TimeUtils.now();
    // 获取给定时间的日期字符串（年月日）
    const timeDate = TimeUtils.ts2Date(timeStamp, "yyyy-MM-dd");
    // 获取当前时间的日期字符串（年月日）
    const nowDate = TimeUtils.ts2Date(now, "yyyy-MM-dd");
    // 比较日期字符串，如果不相同则不是当天
    return timeDate === nowDate;
  }

  // 前7天的字符串
  static getLast7DaysRange() {
    const today = new Date();
    const endDateObj = new Date(today - 1 * 24 * 60 * 60 * 1000);
    const end = endDateObj.toISOString().slice(0, 10);
    const startDateObj = new Date(endDateObj - 6 * 24 * 60 * 60 * 1000);
    const start = startDateObj.toISOString().slice(0, 10);
    return [end, start];
  }

  // 获取近7天每天的日期和星期信息（用于区分工作日和周末）
  static getLast7DaysWithWeekday() {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today - i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      days.push({
        date: date.toISOString().slice(0, 10),
        dayOfWeek, // 0=周日, 1=周一, ..., 6=周六
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return days;
  }

  // 最近12个月的日期范围，endDate 根据今天动态计算，startDate 为12个月前的那个月的1号
  static getLast12MonthsRange() {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    // 计算12个月前的那个月的1号
    const startDateObj = new Date(today);
    startDateObj.setMonth(startDateObj.getMonth() - 11); // 减去11个月，加上当前月共12个月
    startDateObj.setDate(1); // 设置为该月的1号
    const year = startDateObj.getFullYear();
    const month = String(startDateObj.getMonth() + 1).padStart(2, "0");
    const start = `${year}-${month}-01`;
    return [end, start];
  }

  // 返回最近12个月每个月的头天和尾天数组，例如 [{end:'2026-04-30',start:'2026-04-01'}, {end:'2026-03-31',start:'2026-03-01'}, ...]
  static getLast12MonthsRangeArray() {
    const result = [];
    let current = dayjs();

    for (let i = 0; i < 12; i++) {
      const start = current.startOf("month").format("YYYY-MM-DD");
      const end = current.endOf("month").format("YYYY-MM-DD");
      result.push({ start, end });
      current = current.subtract(1, "month");
    }
    return result;
  }

  /**
   * 判断两个dayjs对象是否在同一年
   * @param {Object} dayjs1 第一个dayjs对象
   * @param {Object} dayjs2 第二个dayjs对象
   * @returns {boolean} 如果两个dayjs对象在同一年返回true，否则返回false
   */
  static isSameYearByDayjs(dayjs1, dayjs2) {
    if (!dayjs1 || !dayjs2) {
      return false;
    }
    return dayjs1.year() === dayjs2.year();
  }

  /**
   * 计算传入时间戳减去当前时间后的剩余天数
   * @param {number} timestamp 时间戳（秒级）
   * @returns {number} 剩余天数，如果为负数则返回 -1
   */
  static getRemainingDays(timestamp) {
    if (!timestamp) {
      return -1;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000); // 当前时间戳（秒级）
    const diffSeconds = timestamp - currentTimestamp; // 差值（秒）

    if (diffSeconds < 0) {
      return -1;
    }

    const days = Math.floor(diffSeconds / 86400); // 86400秒 = 1天
    return days;
  }

  /**
   * 获取某年7月1日到9月30日的日期范围
   * @param {number} year 年份
   * @returns {Object} 包含 start 和 end 的对象
   */
  static getJulyToSeptemberRange(year) {
    return {
      start: `${year}-07-01`,
      end: `${year}-09-30`,
    };
  }

  /**
   * 获取某年1月1日到2月底的日期范围（自动处理闰年）
   * @param {number} year 年份
   * @returns {Object} 包含 start 和 end 的对象
   */
  static getJanuaryToFebruaryRange(year) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return {
      start: `${year}-01-01`,
      end: `${year}-02-${isLeapYear ? 29 : 28}`,
    };
  }
}

export default TimeUtils;
