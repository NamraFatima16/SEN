import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import Papa from "papaparse";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

const LineChart = () => {
  const [chartData, setChartData] = useState({
    // Initialize chartData to an empty but valid data object
    labels: [], // Empty labels array initially
    datasets: [
      {
        // Empty datasets array initially
        data: [], // Empty data array initially
      },
    ],
  });
  const chartRef = useRef(null); // Ref to access the chart instance if needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/test.csv"); // Fetch the CSV file from the public folder
      
        const text = await response.text();

        const result = Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
        });

        if (result.data && result.data.length > 0) {
          const labels = result.data.map((row) => Date.parse(row[0])); // Timestamps from the first column
          const dataValues = result.data.map((row) => parseFloat(row[1])); // Values from the second column, convert to numbers

          // Data for chart
          setChartData({
            labels: labels,
            datasets: [
              {
                label: "Sample Temperature Data with anomalies",
                data: dataValues,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                pointRadius: 0,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
      }
    };
    fetchData();
  }, []);
  
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Chart.js Line Chart Test",
      },
      zoom: {
        pan: {
          enabled: true, // Enable panning
          mode: "xy", // Pan only on the x-axis
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zoom with mouse wheel
          },
          pinch: {
            enabled: true, // Enable zoom with pinch gesture on touch devices
          },
          mode: "xy", // Zoom only on the x-axis
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM d",
            hour: "h:mm a",
            minute: "h:mm:ss a",
          },
          tooltipFormat: "MMM d, yyyy, h:mm:ss a",
        },
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature sensor data",
        },
        beginAtZero: false,
      },
    },
  };
//   const data = {
//     labels: ["January", "February", "March", "April", "May", "June"],
//     datasets: [
//       {
//         label: "Sample Data",
//         data: [65, 59, 80, 81, 56, 55],
//         borderColor: "rgb(255, 99, 132)",
//         backgroundColor: "rgba(255, 99, 132, 0.5)",
//       },
//     ],
//   };
const resetChart = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom(); // Call resetZoom() on the Chart.js instance
    }
  };

  return (
    <div>
      <Line ref={chartRef} data={chartData} options={options} />
      <button onClick={resetChart}>Reset Zoom</button>
    </div>
  );
};

export default LineChart;