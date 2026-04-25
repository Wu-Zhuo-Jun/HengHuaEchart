import "./index.less";
import { Select, DatePicker, message } from "antd";
import { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle, memo } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Language, text } from "@/language/LocaleContext";
// import zhCN from "antd/locale/zh_CN";
// import "dayjs/locale/zh-cn";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// 预设时间范围
const rangePresets = [
  {
    label: "今天",
    value: [dayjs(), dayjs()],
  },
  {
    label: "昨天",
    value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
  },
  {
    label: "本周",
    value: [dayjs().startOf("week"), dayjs().endOf("week")],
  },
  {
    label: "上周",
    value: [dayjs().subtract(1, "week").startOf("week"), dayjs().subtract(1, "week").endOf("week")],
  },
  {
    label: "本月",
    value: [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "上月",
    value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")],
  },
  {
    label: "本年",
    value: [dayjs().startOf("year"), dayjs().endOf("year")],
  },
  {
    label: "去年",
    value: [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")],
  },
  { label: "过去7天", value: [dayjs().add(-7, "d"), dayjs()] },
  { label: "过去14天", value: [dayjs().add(-14, "d"), dayjs()] },
  { label: "过去30天", value: [dayjs().add(-30, "d"), dayjs()] },
  { label: "过去60天", value: [dayjs().add(-60, "d"), dayjs()] },
  { label: "过去90天", value: [dayjs().add(-90, "d"), dayjs()] },
  { label: "过去180天", value: [dayjs().add(-180, "d"), dayjs()] },
];

/**颗粒时间选择控件 */
const TimeGranulePickerComponent = forwardRef((props, ref) => {
  const { onTimeChange } = props;
  const TimeGranulePickerRef = useRef(null);
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]);

  // 时间范围变化处理
  const timeRageoOnChange = useCallback(
    (dates) => {
      setTimeRange(dates);
      // 通知父组件时间变化
      if (onTimeChange) {
        onTimeChange(dates);
      }
    },
    [onTimeChange]
  );

  // 暴露给父组件的方法和状态
  useImperativeHandle(
    ref,
    () => ({
      // 获取当前时间范围
      getTimeRange: () => timeRange,
      setTimeRange: (dates) => {
        setTimeRange(dates);
        if (onTimeChange) {
          onTimeChange(dates);
        }
      },
      // 重置为默认值
      reset: () => {
        setTimeRange([dayjs(), dayjs()]);
      },
    }),
    [timeRange, onTimeChange]
  );

  return (
    <div className="timeGranulePicker" ref={TimeGranulePickerRef}>
      <RangePicker
        presets={rangePresets}
        size="default"
        value={timeRange}
        suffixIcon={null}
        separator={Language?.ZHI || "至"}
        prefix={<CalendarOutlined />}
        onChange={timeRageoOnChange}
        getPopupContainer={() => TimeGranulePickerRef.current}
      />
    </div>
  );
});

export const TimeGranulePicker = memo(TimeGranulePickerComponent);
