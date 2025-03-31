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
import DownloadMenu from "./DownloadMenu";

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

  // Function to reset zoom
  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom(); // Call resetZoom() on the Chart.js instance
    }
  };

  // funtion to download chart data as csv
  const downloadCSV = () => {
    const { labels, datasets } = chartData;

    if (!labels.length || !datasets[0].data.length) {
      alert("no data avalible to download.");
      return;
    }

    let csvContent = "Timestamp,Temprature\n";

    // Combining timestamp and data point
    labels.forEach((timestamp, index) => {
      // Fix: Use new Date() instead of new DataTransfer()
      const date = new Date(timestamp);
      const formattedDate = date.toISOString();
      const value = datasets[0].data[index];
      csvContent += `${formattedDate},${value}\n`;
    });

    //Creating a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "temprature-data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //funtion to download PDF
  const downloadPDF = () => {
    if (!chartRef || !chartRef.current) {
      alert("Chart is not available");
      return;
    }

    // getting canvas for the chat
    const canvas = chartRef.current.canvas;

    // converting chart tio image
    const image = canvas.toDataURL("image/png");

    // Create a new jsPDF instance using dynamic import
    import("jspdf")
      .then((jsPDF) => {
        const pdf = new jsPDF.default();

        // Add title
        pdf.text("Temperature Data Chart", 20, 20);

        // Add the image to the PDF
        pdf.addImage(image, "PNG", 15, 30, 180, 100);

        // Save the PDF
        pdf.save("temperature-chart.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please make sure jspdf is installed.");
      });
  };

  return (
    <div className="chart-container" style={{ position: "relative" }}>
      <div className="chart-header" style={styles.header}>
        <h3 style={styles.title}>Temperature Data</h3>
        <div className="chart-controls" style={styles.controls}>
          <button onClick={resetZoom} style={styles.resetButton}>
            Reset Zoom
          </button>
          <DownloadMenu onExportCSV={downloadCSV} onExportPDF={downloadPDF} />
        </div>
      </div>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
// Inline styles
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
  },
  controls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  resetButton: {
    padding: "8px 15px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default LineChart;
