import React, { useContext } from "react";
import BasePanel from "./BasePanel";
import styles from "./KPIPanel.module.css";
import { FlowSelect, UIPanel } from "../../ui/UIComponent";
import { Language } from "../../../language/LocaleContext";

const RateItem = (props) => {
  let icon = null;
  if (props.value > 0) {
    icon = <div className={styles.upIcon}></div>;
  } else if (props.value < 0) {
    icon = <div className={styles.downIcon}></div>;
  }
  return (
    <div className={styles.rateItem}>
      <div className={styles.rateTitle}>{props.title}</div>
      {icon}
      <div className={styles.rateValue}>
        {props.value > 0 && "+"}
        {props.value}%
      </div>
    </div>
  );
};

const KPIContent = (props) => {
  return (
    <div className={styles.kpiContent}>
      <div className={styles.kpiTitleContent}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.date}>{props.date}</div>
      </div>
      <div className={styles.value}>{props.value}</div>
      <div className={styles.kpiRateContent}>
        {props.qoq != null && <RateItem title={Language.HUANBI} value={props.qoq}></RateItem>}
        {props.yoy != null && <RateItem title={Language.TONGBI} value={props.yoy}></RateItem>}
      </div>
    </div>
  );
};

const KPIContents = (data) => {
  return (
    <>
      <div className={styles.kipContetGroup}>
        <KPIContent title={data[0].title} date={data[0].date} value={data[0].value} qoq={data[0].qoq} yoy={data[0].yoy}></KPIContent>
        <KPIContent title={data[1].title} date={data[1].date} value={data[1].value} qoq={data[1].qoq} yoy={data[1].yoy}></KPIContent>
      </div>
      <div className={styles.kipContetGroup}>
        <KPIContent title={data[2].title} date={data[2].date} value={data[2].value} qoq={data[2].qoq} yoy={data[2].yoy}></KPIContent>
        <KPIContent title={data[3].title} date={data[3].date} value={data[3].value} qoq={data[3].qoq} yoy={data[3].yoy}></KPIContent>
      </div>
    </>
  );
};

export const KPIPanel = ({ data, title, extra, tooltip, tooltipSize }) => {
  if (data) {
    data?.map((item, index) => {});
  }
  return (
    <UIPanel title={title} extra={extra} tooltip={tooltip} tooltipSize={tooltipSize}>
      <div className={styles.kpiPanel}>
        {data && KPIContents(data)}
        {/* {props.data &&props.data.map((item, index) => (
                    <KPIContent title={item.title} date={item.date} value={item.value} qoq={item.qoq} yoy={item.yoy} key={index}></KPIContent>
                ))} */}
      </div>
    </UIPanel>
  );
};
