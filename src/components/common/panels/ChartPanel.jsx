import React, { useState, useEffect } from "react";
import BasePanel from "./BasePanel";
import { UIPanel, UISelect } from "../../ui/UIComponent";
import {
  FlowLineChart,
  RosePieChart,
  VisitingPeakChart,
  GrowthRateBarChart,
  StayAnalysisChart,
  FloorConverPieChart,
  SmallFloorConverPieChart,
  FloorArriveBarChart,
  CustomerAttrBarChart,
  CustomerMoodRadarChart,
  OnlineDevicePieChart,
  ForecastFlowLineChart,
  BussinessGaugeChart,
  VisitingPeakLineChart,
  WorkWeekAnalysisLineBarChart,
  HeadMapChart,
  CustomerPortraitCompareBarChart,
  CustomerMoodCompareBarChart,
  CompetitiveAnalysisScatterChart,
  FlowTrendLineChart,
  GrowthRateLineChart,
  FlowTrendBarChart,
  WeatherAnalysisPieChart,
  WeatherAnalysisBarChart,
  AnnualHeatMapChart,
} from "../charts/Chart";
import { RankingTable, DoorRankingTable } from "../tables/Table";
import { Select } from "antd";
import { OnlineDeviceData, BussinessInfo, VisitingPeakInfo, StayAnalysisInfo, CustomerAttrInfo, CustomerMoodInfo, FlowTrendAnalysisInfo, AnnualHeatMapInfo } from "../Attachment";
import { FlowSelect, TimeRadioGroup, NewFlowSelect } from "../../ui/UIComponent";
import { Language } from "../../../language/LocaleContext";

export const FlowLineChartPanel = React.memo(({ extra, ...props }) => {
  return (
    <UIPanel className={props.className} title={props.title} tooltip={props.tooltip} extra={extra} tooltipSize={props.tooltipSize}>
      <FlowLineChart data={props.data} />
    </UIPanel>
  );
});

export const DoorRankingChartPanel = React.memo(({ title, data, className }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.CHURUKOUREDU}
      tooltip="通过分析统计时间内不同出入口的热力差异，识别场地的“黄金动线”与流量咽喉，判断各出入口对整体客流的贡献度。管理者可以科学评估场地布局的冷热区，有效指导高价值广告位的定价、黄金位置的落位选择以及出入口安防力量的精准布控，从而实现流量价值的最大化挖掘。"
      tooltipSize="big">
      <DoorRankingTable data={data && data.ranking}></DoorRankingTable>
      {/* <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{
                    width: '40%',
                    height: '100%',
                }}>
                    <RosePieChart data={data && data.chartData} ></RosePieChart>
                </div>
                <div style={{
                    width: '60%',
                    // maxWidth: '400px',
                    height: '100%',
                }}>
                    <DoorRankingTable data={data && data.ranking} ></DoorRankingTable>
                </div>
            </div> */}
    </UIPanel>
  );
});

export const VisitingPeakChartPanel = React.memo(({ title, data, type, onChange, className }) => {
  let chart = null;
  if (type == 1) {
    if (data?.peakValueDesc) {
      chart = (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>{data && <VisitingPeakInfo data={data} type={type} />}</div>
          <div style={{ flex: 2 }}>
            <VisitingPeakChart data={data} />
          </div>
        </div>
      );
    } else {
      chart = <VisitingPeakChart data={data} />;
    }
  } else if (type == 2) {
    if (data?.peakValueDesc) {
      chart = (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>{data && <VisitingPeakInfo data={data} type={type} />}</div>
          <div style={{ flex: 5 }}>
            <VisitingPeakLineChart data={data} />
          </div>
        </div>
      );
    } else {
      chart = <VisitingPeakLineChart data={data} />;
    }
  }
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.DAOFANGFENGZHI}
      tooltip={
        <>
          通过对统计时间内的客流数据进行24
          小时维度及指定聚合时段维度的客流波动监测，精准定位每日到访的高峰、平峰与低谷时段。准确识别到访峰值时段，确保在客流最密集的区间（如中午或傍晚）投入充足的资源，提升访客体验，避免服务脱节。
          <br />
          <>时区：凌晨(00:00-06:00)、早上(06:00-11:00)、中午(11:00-14:00)、下午(14:00-17:00)、傍晚(17:00-19:00)、夜晚(19:00-24:00)</>
          <br />
          <>小时：展示在24小时下各小时的平均客流分布。</>
        </>
      }
      tooltipSize="biggest"
      extra={<TimeRadioGroup onChange={onChange} />}>
      {chart}
    </UIPanel>
  );
});

export const VisitingPeakChartPanelByOffSence = React.memo(({ title, data, type, onChange, className }) => {
  let chart = null;

  const VisitingPeakInfoByOffSence = ({ data }) => {
    return (
      <div className="visiting-peak-info" style={{ textAlign: "left" }}>
        <div className="font-style-2-14">{data && data.peakTimeDesc ? data.peakTimeDesc : Language.ZANWUSHUJU}</div>
        <div className="font-style-2-14">{data && data.peakValueDesc ? data.peakValueDesc : Language.ZANWUSHUJU}</div>
      </div>
    );
  };
  chart = (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>{data && <VisitingPeakInfoByOffSence data={data} />}</div>
      <div style={{ flex: 6 }}>
        <VisitingPeakLineChart data={data} />
      </div>
    </div>
  );

  return (
    <UIPanel
      className={className}
      title={title ? title : Language.DAOFANGFENGZHI}
      tooltip={
        <>
          通过对统计时间内的客流数据进行24
          小时维度及指定聚合时段维度的客流波动监测，精准定位每日到访的高峰、平峰与低谷时段。准确识别到访峰值时段，确保在客流最密集的区间（如中午或傍晚）投入充足的资源，提升访客体验，避免服务脱节。
          <br />
          <>时区：凌晨(00:00-06:00)、早上(06:00-11:00)、中午(11:00-14:00)、下午(14:00-17:00)、傍晚(17:00-19:00)、夜晚(19:00-24:00)</>
          <br />
          <>小时：展示在24小时下各小时的平均客流分布。</>
        </>
      }
      tooltipSize="biggest"
      extra={<> </>}>
      {chart}
    </UIPanel>
  );
});

export const GrowthRateChartPanel = React.memo(({ title, data, onChange, className, extra }) => {
  let chart = <div></div>;
  if (data) {
    chart = data?.type == "line" ? <GrowthRateLineChart data={data} onChange={onChange} /> : <GrowthRateBarChart data={data} onChange={onChange} />;
  }
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.DINGJIZENGZHANGLV}
      extra={extra}
      tooltip={
        <>
          <>定基增长率 = (统计时间内日客流量 - 基期平均客流量) ÷ 基期平均客流量 × 100%，反映统计时间内每日客流规模的相对增减幅度。 </>
          <br />
          <span style={{ fontSize: "12px" }}>
            注： 基期客流量对标过去7日、14日或30日（或月）的平均水平。该指标用于量化客流的动态变化趋势，正值代表增长，负值代表回落，能直观评估营销活动效果或预警流量下滑风险。
          </span>
        </>
      }
      tooltipSize="biggest">
      {data && chart}
    </UIPanel>
  );
});

export const StayAnalysisChartPanel = React.memo(({ title, data, className }) => {
  if (data?.peakValue > 0) {
    return (
      <UIPanel className={className} title={title ? title : Language.TINGLIUFENXI}>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>{data && <StayAnalysisInfo data={data} />}</div>
          <div style={{ flex: 10 }}>{data && <StayAnalysisChart data={data} />}</div>
        </div>
      </UIPanel>
    );
  } else {
    return (
      <UIPanel className={className} title={title ? title : Language.TINGLIUFENXI}>
        {data && <StayAnalysisChart data={data} />}
      </UIPanel>
    );
  }
});

export const FloorTransformChartPanel = React.memo(({ title, data, onChange, className, extra }) => {
  const dataLength = data?.arriveData?.data?.length || 0;
  const calculatedHeight = dataLength * 50;
  // 确保最小高度，避免内容被截断
  const minHeight = 250;
  const height = Math.max(calculatedHeight, minHeight);
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.LOUCENGZHUANHUA}
      extra={extra}
      tooltip={
        <>
          <>
            通过分析统计时间内不同楼层的客流量，衡量各楼层对整体流量的截获能力与层间拉动效果。管理者可以精准诊断高楼层的“流量衰减”问题，从而科学调整垂直交通动线（如电梯导向）、策划跨楼层间的运营策略，打破“冷区”僵局，实现全楼层商业价值的均衡开发。
          </>
          <br />
          <>客流比率=楼层客流量÷各楼层进场人次总和*100%</>
          <br />
          <>楼层抵达率=楼层客流量÷场地总客流量*100%</>
        </>
      }
      tooltipSize="biggest">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
        <div style={{ width: "50%", height: "100%" }}>{data && <FloorConverPieChart data={data.converData} />}</div>
        <div style={{ width: "50%", height: "100%", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "#eeeeee transparent" }}>
          <div style={{ width: "100%", minHeight: "100%", height: `${height}px` }}>{data && <FloorArriveBarChart data={data.arriveData} />}</div>
        </div>
      </div>
    </UIPanel>
  );
});

export const SmallFloorTransformChartPanel = React.memo(({ title, data, onChange, className, extra }) => {
  const dataLength = data?.arriveData?.data?.length || 0;
  const calculatedHeight = dataLength * 50;
  const minHeight = 250;
  const height = Math.max(calculatedHeight, minHeight);

  return (
    <UIPanel
      className={className}
      title={title ? title : Language.LOUCENGZHUANHUA}
      extra={extra}
      tooltip={
        <>
          <>
            通过分析统计时间内不同楼层的客流量，衡量各楼层对整体流量的截获能力与层间拉动效果。管理者可以精准诊断高楼层的“流量衰减”问题，从而科学调整垂直交通动线（如电梯导向）、策划跨楼层间的运营策略，打破“冷区”僵局，实现全楼层商业价值的均衡开发。
          </>
          <br />
          <>客流比率=楼层客流量÷各楼层进场人次总和*100%</>
          <br />
          <>楼层抵达率=楼层客流量÷场地总客流量*100%</>
        </>
      }
      tooltipSize="biggest">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <div style={{ width: "50%", height: "100%" }}>{data && <SmallFloorConverPieChart data={data.converData} />}</div>
        <div style={{ width: "50%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ width: "100%", minHeight: "100%", height: `${height}px` }}>{data && <FloorArriveBarChart data={data.arriveData} />}</div>
        </div>
      </div>
    </UIPanel>
  );
});

export const CustomerAttrBarChartPanel = React.memo(({ title, data, className }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.KEQUNSHUXING}
      bodyStyle={{ paddingTop: "0px" }}
      tooltip={
        <>
          通过识别统计时间内核心客群的年龄层级与性别特征，构建清晰的客群画像，辅助管理者验证目标市场定位是否准确，制定精准的营销推广策略，并据此优化服务设施（如增设亲子区或休息区），调整业态布局，制定针对性营销活动，挖掘潜在消费需求的关键依据，有助于提升客流转化率，实现精细化运营。
          <br />
          性别属性：男、女
          <br />
          年龄属性：婴儿、儿童、青年、壮年、中老年
        </>
      }
      tooltipSize="biggest">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: "5px" }}>
          <CustomerAttrInfo data={data} />
        </div>
        <div style={{ flex: 2 }}>{data && <CustomerAttrBarChart data={data} />}</div>
      </div>
    </UIPanel>
  );
});

export const CustomerMoodRadarChartPanel = React.memo(({ title, data, className }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.XINQINGDONGCHA}
      bodyStyle={{ paddingTop: "0px" }}
      tooltip={
        <>
          识别统计时间内访客在游逛过程中的情感表达（如高兴、平静、困惑等），以此衡量场地的服务满意度与环境舒适度，辅助管理者评估场地美陈布置、互动装置或营销活动的吸引力，验证空间场景能否激发访客的情绪共鸣。
          <br />
          心情属性：愤怒、悲伤、厌恶、害怕、惊讶、平静、高兴、困惑
        </>
      }
      tooltipSize="biggest">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 2 }}>{data && <CustomerMoodRadarChart data={data} />}</div>
        <div style={{ flex: 1 }}>
          <CustomerMoodInfo data={data} />
        </div>
      </div>
    </UIPanel>
  );
});

export const OnlineDevicePieChartPanel = React.memo(({ title, data, className }) => {
  return (
    <UIPanel className={className} title={title} tooltip="实时监控设备状态，保障数据采集稳定性。">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 1 }}>{data && <OnlineDevicePieChart data={data} />}</div>
        <div style={{ flex: 1 }}>{data && <OnlineDeviceData data={data} />}</div>
      </div>
    </UIPanel>
  );
});

export const ForecastFlowLineChartPanel = React.memo(({ title, data, className }) => {
  return (
    <UIPanel
      className={className}
      title={title}
      tooltipSize="big"
      tooltip="基于历史客流走势及特定影响因子（如天气、节假日），对未来特定周期的客流变化进行前瞻性估算。通过预判未来客流的峰谷走势，管理者可以提前锁定高负荷风险点，科学制定运营策略、人力排班预案，在降低运营不确定性的同时，确保服务承载力始终与到访需求精准匹配。">
      {data && <ForecastFlowLineChart data={data} />}
    </UIPanel>
  );
});

export const BussinessGaugeChartPanel = React.memo(({ title, data, className, extra }) => {
  return (
    <UIPanel className={className} title={title} extra={extra}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>{data && <BussinessGaugeChart data={data} />}</div>
        <div style={{ flex: 1 }}>{data && <BussinessInfo data={data} />}</div>
      </div>
    </UIPanel>
  );
});

export const GroupFlowCompareLineChartPanel = React.memo(({ title, data, onChange, mainGroupList, targetGroupList, className, ...props }) => {
  return (
    <UIPanel {...props} className={className} title={title ? title : Language.KELIUDUIBI} extra={<FlowSelect onChange={onChange} />} bodyStyle={{ paddingTop: "0px" }}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", columnGap: "10px", paddingLeft: "15px" }}>
          <UISelect options={mainGroupList} placeholder={Language.QINGXUANZEZHIDINGJITUAN} style={{ width: "225px" }} />
          <div style={{ color: "#3867D6", fontWeight: "bold" }}>VS</div>className
          <UISelect options={targetGroupList} placeholder={Language.QINGXUANZEDUIBIJITUAN} style={{ width: "225px" }} />
        </div>
        {data && <FlowLineChart data={data} />}
      </div>
    </UIPanel>
  );
});

export const WeekWorkAnalysisLineBarChartPanel = React.memo(({ title, data, onChange, className }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.GONGZUORIZHOUMODUIBIFENXI}
      tooltip="通过分析统计时间内工作日和周末的客流分布，判断不同时段的客流场景差异。通过掌握双休日与工作日的流量波动律，管理者可以精准实施“差异化运营”——如在周末策划高互动的营销活动以提升转化，在工作日推出针对性促销以“填补低谷”，从而实现全周期资源的最优配置与利润最大化。"
      tooltipSize="biggest">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", paddingLeft: "18px", rowGap: "20px" }}>
        <div style={{ textAlign: "left", color: "#888888", fontSize: "14px" }}>{Language.ZHIDINGSHIJIANNEIDEGONGZUORIZHOUMOKELIUFENXI}</div>
        <div style={{ flex: 1 }}>
          <WorkWeekAnalysisLineBarChart data={data} onChange={onChange} />
        </div>
      </div>
    </UIPanel>
  );
});

export const SiteHeatMapChartPanel = React.memo(({ title, data, onChange, className }) => {
  return (
    <UIPanel className={className} title={title ? title : Language.CHANGDIKELIURELI}>
      <HeadMapChart data={data} />
    </UIPanel>
  );
});

export const CustomerPortraitCompareBarChartPanel = React.memo(({ title, data, onChange, className }) => {
  return (
    <UIPanel
      className={className}
      title={title}
      bodyStyle={{ paddingTop: "12px" }}
      tooltip={
        <>
          通过洞察不同楼层人群画像的独特性，判断楼层业态与目标受众的匹配精度。帮助管理者精准诊断“错位经营”风险，为楼层间的品牌结构调整、垂直动线上的分众引导，及针对不同楼层特征实施“分层分众”的差异化营销活动提供科学依据，从而最大化空间商业转化潜能。
        </>
      }
      tooltipSize="biggest">
      <div style={{ textAlign: "left", color: "#888888", fontSize: "14px" }}>对比选定时间内不同场地的客流情况</div>
      <CustomerPortraitCompareBarChart data={data} />
    </UIPanel>
  );
});

export const CustomerMoodCompareBarChartPanel = React.memo(({ title, data, onChange, className }) => {
  return (
    <UIPanel
      className={className}
      title={title}
      bodyStyle={{ paddingTop: "12px" }}
      tooltip={
        <>
          通过洞察不同楼层的访客心情的独特性，诊断垂直空间的经营压力与环境舒适度。帮助管理者识别引起访客焦虑或疲劳的“高压楼层”（如导视混乱、排队过长的区域），从而针对性地调整，例如增设休憩节点或优化服务人力配置，通过营造高愉悦度的“情绪场”，延长访客在特定楼层的驻留时间并激发消费冲动。
        </>
      }
      tooltipSize="biggest">
      <div style={{ textAlign: "left", color: "#888888", fontSize: "14px" }}>对比选定时间内不同场地的客流情况</div>
      <CustomerMoodCompareBarChart data={data} />
    </UIPanel>
  );
});

export const CompetitiveAnalysisScatterChartPanel = React.memo(({ title, data, onChange, className, ...props }) => {
  return (
    <UIPanel className={className} {...props} title={title ? title : Language.JINGZHENGLIFENXI}>
      <CompetitiveAnalysisScatterChart data={[]} />
    </UIPanel>
  );
});

export const FlowTrendAnalysisPanelChartPanel = React.memo(({ type, title, data, extra, className }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.QUSHIFENXI}
      extra={extra}
      tooltip="分析在统计时间内的场地客流数据的变化走势。通过与历史数据进行对比，了解客流量波动趋势，优化运营，提升服务效率"
      tooltipSize="normal">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "240px", height: "100%" }}>
          <FlowTrendAnalysisInfo data={data?.info} />
        </div>
        <div style={{ flex: 1, flexGrow: 1 }}>
          {data?.type == 1 && <FlowTrendLineChart data={data?.chartData} />}
          {data?.type == 2 && <FlowTrendBarChart data={data?.chartData} />}
        </div>
      </div>
    </UIPanel>
  );
});

export const WeatherAnalysisChartPanel = React.memo(({ title, data, onChange, className }) => {
  return (
    <UIPanel className={className} title={title ? title : Language.TIANQIFENXI} extra={<FlowSelect onChange={onChange} />}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 1 }}>{data && <WeatherAnalysisPieChart data={data?.pieData} />}</div>
        <div style={{ flex: 1 }}>{data && <WeatherAnalysisBarChart data={data?.barData} />}</div>
      </div>
    </UIPanel>
  );
});

export const AnnualHeatMapChartPanel = React.memo(({ title, data, onChange, className, extra }) => {
  return (
    <UIPanel
      className={className}
      title={title ? title : Language.NIANDUKELIURELI}
      extra={extra}
      tooltip="通过分析全年度的客流量分布，捕捉经营周期的“大环境规律”与异常节点，识别全年的旺季周期、节假日效应及淡季规律。通过长周期的热力透视，管理者可以精准复盘重大营销活动的长效拉动力，辅助制定年度规划及跨季节的运营策略，确保在年度维度上实现资源储备与市场节奏的高度同步。"
      tooltipSize="big">
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", columnGap: "32px" }}>
        <div>
          <AnnualHeatMapInfo data={data?.info} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <AnnualHeatMapChart data={data?.chartData} />
        </div>
      </div>
    </UIPanel>
  );
});
