import React, { Component } from 'react';
import LineChart from './LineChart';

//making fake data for testing
export const timeIntervels = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
];
export const sensorData= [
20.12,24.4,56,35,68,45.6,24.7,46,47,52,35.6
]
export default class Dashboard extends Component {

    constructor(props){

        super(props);

        this.state = {

            labels:timeIntervels,
            data:sensorData
        }
        this.updateData = this.updateData.bind(this);
    }

    updateData(){
        this.setState({
            
            labels:timeIntervels,
            data:sensorData
        })

    }
    render() {

        const {labels, data } = this.state;

        return (
            <div>

                <h1>Hello World Dashboard</h1>
                <LineChart data = {data} labels={labels}></LineChart>

            </div>
        )
    }
}
