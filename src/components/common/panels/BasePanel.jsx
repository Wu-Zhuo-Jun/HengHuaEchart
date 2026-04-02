import React from "react";
// import { FlowLineChart } from "../charts/Chart";
import styles from "./BasePanel.module.css";
import { Card } from "antd";

function BasePanel(props) {
  var bodyStyle = {};
  if (props.bodyStyle) {
    bodyStyle = props.bodyStyle;
  }
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.titleBar}>
          <div className={styles.titleIcon}></div>
          <div className={styles.title}>{props.title}</div>
        </div>
        <div>{props.extra}</div>
      </div>
      <div className={styles.panelBody} style={bodyStyle}>
        {props.children}
      </div>
    </div>
  );
}

// const Title = (props) => {
//     return(
//        <div className={styles.titleBar}>
//             <div className={styles.titleIcon}></div>
//             <div className={styles.title}>{props.title}</div>
//         </div>
//     )
// }

// export const BasePanel = (props) => {
//      return(
//         <Card title={<Title title={props.title} />} extra={props.extra}  style={{width: '100%',height: '100%'}} loading={props.loading}>
//                 {props.children}
//         </Card>
//     )
// }

export default BasePanel;
