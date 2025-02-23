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

        new Chart(context, {

            type: 'line',
            data: {

                labels: labels,
                datasets: [
                    {
                        label: 'Months',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: '#000000',

                    }

                ]

            },

            options: {
                //chart will adjust accordiing to the screen size 
                responsive : true,
                //streching or no streching 
                maintainAspectRatio: true


            }


        })
    }

    render() {


        return (

            <canvas ref = {this.reactRef}></canvas>
        )
    }
}
