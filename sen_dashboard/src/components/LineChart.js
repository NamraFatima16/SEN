import React, { Component } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


export default class LineChart extends Component {

    reactRef = React.createRef();


    //to execute the funtion 
    componentDidMount() {

        this.buildChart();
    }

    componentDidUpdate() {
        this.buildChart();
    }

    //this stores data and funtanality 
    buildChart = () => {

        //getting the data and properties that are passed to the bar chart from the dashboard 
        const { data, labels } = this.props;

        const context = this.reactRef.current.getContext('2d')

        var chart = new Chart(context, {

            type: 'line',
            data: {

                labels: labels,
                datasets: [
                    {
                        label: 'Months',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',

                    }

                ]

            }


        })
    }

    render() {


        return (

            <canvas ref = {this.reactRef}></canvas>
        )
    }
}
