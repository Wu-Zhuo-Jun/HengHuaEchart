import React from "react";
import { Language, text } from "../../language/LocaleContext";
import { Badge, Flex, Popover } from "antd";
import ChartsOptHelper from "./charts/utils/ChartsOptHelper";
import { UITooltipQuestion } from "../ui/UIComponent";
import StringUtils from "@/utils/StringUtils";
import "./Attachment.css";
import { FontSize } from "@icon-park/react";

export const OnlineDeviceData = ({ data }) => {
  return (
    <div className="online-device-info">
      <div>
        <Badge color="#3867D6" classNames={{ indicator: "badge-dot" }} text={<span className="online-device-title">{Language.ZAIXIANSHEBEISHULIANG}</span>} />
        <div className="online-device-content">
          <div className="online-device-count">{text(Language.PARAM_TAI, { value: data.onlineCount })}</div>
          <div className="online-device-rate">{text(Language.PARAM_ZHANBI, { value: Math.floor(data?.onlineRate) })}</div>
        </div>
      </div>
      <div>
        <Badge color="#F9A231" classNames={{ indicator: "badge-dot" }} text={<span className="online-device-title">{Language.LIXIANSHEBEISHULIANG}</span>} />
        <div className="online-device-content">
          <div className="online-device-count" style={{ color: "#F9A231" }}>
            {text(Language.PARAM_TAI, { value: data.offlineCount })}
          </div>
          <div className="online-device-rate">{text(Language.PARAM_ZHANBI, { value: Math.floor(data?.offlineRate) })}</div>
        </div>
      </div>
    </div>
  );
};

export const BussinessInfo = ({ data }) => {
  return (
    <div className="bussiness-info">
      <div className="bussiness-info-month-count">{text(Language.PARAM_YUEMUBIAORENCI, { month: data.month, value: data.monthCount })}</div>
      <div>
        {text(Language.PARAM_YUEYIDACHENG, { month: data.month })}
        <span style={{ color: ChartsOptHelper.Colors.ColorListLine[0] }}>{data.monthRate}%</span>
      </div>
      <br />
      <div>{text(Language.PARAM_BENNIANMUBIAORENCI, { value: data.yearCount })}</div>
      <div>
        {Language.BENNIANYIDACHENG}
        <span style={{ color: ChartsOptHelper.Colors.ColorListLine[2] }}>{data.yearRate}%</span>
      </div>
    </div>
  );
};

export const VisitingPeakInfo = ({ data }) => {
  return (
    <div className="visiting-peak-info">
      <div className="font-style-2-14">{data && data.peakTimeDesc ? data.peakTimeDesc : Language.ZANWUSHUJU}</div>
      <div className="font-style-2-14">{data && data.peakValueDesc ? data.peakValueDesc : Language.ZANWUSHUJU}</div>
    </div>
  );
};

export const StayAnalysisInfo = ({ data }) => {
  if (data?.peakValue > 0) {
    return (
      <div className="stay-analysis-info">
        <div className="font-style-2-14" style={{ textAlign: "left", fontWeight: "bold" }}>
          {text(Language.PARAM_GUKETINGLIUGAOFENGSHIJIANZAI, {
            value: data && data.peakTimeDesc ? data.peakTimeDesc : "",
          })}
        </div>
        <div className="font-style-2-14" style={{ textAlign: "left", fontWeight: "bold" }}>
          {text(Language.PARAM_TINGLIUFENGZHIRENCI, {
            value: data && data.peakValue ? data.peakValue : 0,
          })}
        </div>
      </div>
    );
  }
};

export const CustomerAttrInfo = ({ data, vertical = false }) => {
  var maleWidth = 50;
  var femaleWidth = 50;
  var maleRate = 0;
  var maleRateDetail = 0;
  var femaleRate = 0;
  var femaleRateDetail = 0;
  if (data) {
    maleRate = StringUtils.toFixed(data.maleRate, 0);
    femaleRate = 100 - maleRate;
    maleRateDetail = data.maleRateDetail || StringUtils.toFixed(data.maleRate, 2);
    femaleRateDetail = data.femaleRateDetail || StringUtils.toFixed(data.femaleRate, 2);
  }
  if (maleRate > 0 || femaleRate > 0) {
    maleWidth = maleRate;
    femaleWidth = femaleRate;
  }

  // 男性别浮框
  const contentMale = (
    <div className="gender-rate-bar-male-popover">
      <div className="gender-rate-bar-male-popover-rock"></div>
      <div>男</div>
      <div>{data?.maleTotal || 0}</div>
      <div>({maleRateDetail}%)</div>
    </div>
  );
  // 女性别浮框
  const contentFemale = (
    <div className="gender-rate-bar-female-popover">
      <div className="gender-rate-bar-female-popover-rock"></div>
      <div>女</div>
      <div>{data?.femaleTotal || 0}</div>
      <div>({femaleRateDetail}%)</div>
    </div>
  );

  const maleStyle = maleWidth > 0 ? { width: `${maleWidth}%` } : { width: `${maleWidth}%`, border: "none" };
  const femaleStyle = femaleWidth > 0 ? { width: `${femaleWidth}%` } : { width: `${femaleWidth}%`, border: "none" };
  // 垂直
  if (vertical) {
    return (
      <div className="customer-attr-info-vertical">
        <div className="customer-attr-max">
          <div>{Language.ZHULIQUNTI}</div>
          <div>{data?.maleMaxDesc ? data.maleMaxDesc : Language.ZANWU}</div>
          <div>{data?.femaleMaxDesc ? data.femaleMaxDesc : Language.ZANWU}</div>
        </div>
        <div className="gender-rate">
          <div className="gender-rate-bar">
            <Popover content={contentMale} trigger="hover" placement="top">
              <div className="gender-rate-bar-male" style={maleStyle}></div>
            </Popover>
            <Popover content={contentFemale} trigger="hover" placement="top">
              <div className="gender-rate-bar-female" style={femaleStyle}></div>
            </Popover>
          </div>
          <div className="gender-rate-bar-info">
            <div className="male">{maleRate}%</div>
            <div className="female">{femaleRate}%</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="customer-attr-info">
      <div className="gender-rate">
        <div className="gender-rate-bar">
          <Popover content={contentMale} trigger="hover" placement="top">
            <div className="gender-rate-bar-male" style={maleStyle}></div>
          </Popover>
          <Popover content={contentFemale} trigger="hover" placement="top">
            <div className="gender-rate-bar-female" style={femaleStyle}></div>
          </Popover>
        </div>
        <div className="gender-rate-bar-info">
          <div className="male">{maleRate}%</div>
          <div className="female">{femaleRate}%</div>
        </div>
      </div>
      <div className="customer-attr-max">
        <div>{Language.ZHULIQUNTI}</div>
        <div>{data?.maleMaxDesc ? data.maleMaxDesc : Language.ZANWU}</div>
        <div>{data?.femaleMaxDesc ? data.femaleMaxDesc : Language.ZANWU}</div>
      </div>
    </div>
  );
};

export const CustomerMoodInfo = ({ data }) => {
  return (
    <div className="customer-mood-info">
      <div className="font-style-2-16">{Language.ZHUYAOXINQING}</div>
      <div className="font-style-2-16">{data?.maleMaxDesc ? data.maleMaxDesc : Language.ZANWU}</div>
      <div className="font-style-2-16">{data?.femaleMaxDesc ? data.femaleMaxDesc : Language.ZANWU}</div>
    </div>
  );
};

export const FlowTrendAnalysisInfo = ({ data }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        rowGap: "10px",
      }}>
      <div className="flow-trend-analysis-info-date">
        <div className="font-style-2-14">{data?.date}</div>
        <div>{data?.weather || ""}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "11px" }}>
        <div className="flow-trend-analysis-info-value-content flow-trend-analysis-info-peak-img">
          <div>
            {Language.FENGZHI}
            <UITooltipQuestion
              tooltipSize="big"
              title={
                <>
                  峰值 = 统计时间内客流量的最大值，反映统计时间内的最高客流量及其时间点。
                  <br />
                  <span style={{ fontSize: "12px" }}>注：峰值可帮助评估场地最大压力，规划极限容量、精准资源配置，合理安排峰值时段人力资源、评估营销活动影响力，验证营销效果。</span>
                </>
              }
            />
          </div>
          <div>{data?.peakValueDesc}</div>
          <div>
            {Language.FENGZHISHIJIAN}: {data?.peakTime}
          </div>
        </div>
        <div className="flow-trend-analysis-info-value-content flow-trend-analysis-info-avg-img">
          <div>
            {Language.KELIUPINGJUNZHI}
            <UITooltipQuestion
              tooltipSize="big"
              title={
                <>
                  客流平均值 = (场地营业时间内所有时段客流量总和) ÷ 时段总数，反映场地营业时间内的平均客流水平。
                  <br />
                  <span style={{ fontSize: "12px" }}>注：平均值反映了场地整体长期的繁忙程度，是进行客流量预测，资源估算的核心指标，能辅助判断整体客流长期的增长或衰退趋势。</span>
                </>
              }
            />
          </div>
          <div>{data?.avgDesc}</div>
          <div>
            {Language.KELIUZHONGWEISHU}{" "}
            <UITooltipQuestion
              marginRight="6px"
              tooltipSize="big"
              fontSize="12px"
              title={
                <>
                  客流中位数 = 将场地营业时间内各时段客流量按大小排序后处于中间位置的数值，反映场地最常态下的客流规模。
                  <br />
                  <span style={{ fontSize: "12px" }}>
                    注： 中位数能有效剔除节假日活动暴涨或恶劣天气暴跌等极端数据（噪点）的干扰，还原出最真实的“日常运营状态”，是评估常规服务能力是否匹配的最佳参考。
                  </span>
                </>
              }
            />
            : {data?.medianDesc}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnnualHeatMapInfo = ({ data }) => {
  return (
    <div className="annual-heat-map-info">
      <div className="font-style-2-16">{Language.KELIUFENGZHI}:</div>
      <Flex style={{ marginTop: "10px" }}>
        <div className="annual-heat-map-info-value">{data?.peakValue}</div>
        <div className="annual-heat-map-info-unit font-style-2-16">{data?.unit}</div>
      </Flex>
      <div className="font-style-2-16" style={{ marginTop: "31px" }}>
        {Language.FENGZHISHIJIAN}:
      </div>
      <div style={{ marginTop: "10px" }} className="annual-heat-map-info-date font-style-2-16">
        {data?.peakDate}
      </div>
    </div>
  );
};
