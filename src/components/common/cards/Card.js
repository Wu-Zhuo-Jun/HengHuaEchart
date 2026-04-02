import React from 'react';
import { FlowLineChart } from '../charts/Chart';
import './Card.css';


function Card(props) {

    return (
        <div className="card">
            <div className="card-head-bar">
                <div className="card-title-content">
                    <div className="card-title-icon"></div>
                    <div className="card-title">{props.title}</div>
                </div>
                <div className='card-setting-content'></div>
            </div>
            <div className="card-body">
                {props.body}
            </div>
        </div>
    );
}
export { Card };

const FlowLineChartCard = (props) => {
    return (
        <Card title={props.title} body={
            <FlowLineChart data={props.data} />
        }>
        </Card>
    );
}
export { FlowLineChartCard };