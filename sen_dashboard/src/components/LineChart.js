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
import DateFilter from "./DateFilter";

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
  // state for the original data (all data from the CSV)
  const [originalData, setOriginalData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  
  // state for the filtered data this is based on the data range
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  
  // min and max dates from the data
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  
  // filter that is currently applied 
  const [activeDateFilter, setActiveDateFilter] = useState({
    startDate: null,
    endDate: null,
  });

  // Flag to indicate if a filter is currently active
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Ref to access the chart instance if needed
  const chartRef = useRef(null);

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
          const timestamps = result.data.map((row) => Date.parse(row[0])); // Timestamps from the first column
          const dataValues = result.data.map((row) => parseFloat(row[1])); // Values from the second column, convert to numbers

          // Set min and max dates
          setMinDate(Math.min(...timestamps));
          setMaxDate(Math.max(...timestamps));

          // Create data object
          const data = {
            labels: timestamps,
            datasets: [
              {
                label: "Sample Temperature Data with anomalies",
                data: dataValues,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                pointRadius: 0,
              },
            ],
          };

          // Store both original and current chart data
          setOriginalData(data);
          setChartData(data);
        }
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
      }
    };
    fetchData();
  }, []);

  // Apply date filter to the data
  const applyDateFilter = (startDate, endDate) => {
    // Update the active filter state
    setActiveDateFilter({
      startDate,
      endDate,
    });

    // Check if filter is active
    setIsFilterActive(!!(startDate || endDate));

    // If no filter is applied, use original data
    if (!startDate && !endDate) {
      setChartData(originalData);
      return;
    }

    // Filter the data based on date range
    const { labels, datasets } = originalData;
    
    const filteredIndices = labels.map((timestamp, index) => {
      // Check if timestamp is within range
      const isAfterStart = !startDate || timestamp >= startDate;
      const isBeforeEnd = !endDate || timestamp <= endDate;
      
      // Return the index if within range, otherwise null
      return (isAfterStart && isBeforeEnd) ? index : null;
    }).filter(index => index !== null);

    // Create filtered datasets
    const filteredDatasets = datasets.map(dataset => {
      const filteredData = filteredIndices.map(index => dataset.data[index]);
      
      return {
        ...dataset,
        data: filteredData,
      };
    });

    // Create filtered labels
    const filteredLabels = filteredIndices.map(index => labels[index]);

    // Set the filtered chart data
    setChartData({
      labels: filteredLabels,
      datasets: filteredDatasets,
    });
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Allow custom aspect ratio
    aspectRatio: 2, // Width:height ratio
    plugins: {
      title: {
        display: true,
        text: "Chart.js Line Chart Test",
      },
      zoom: {
        pan: {
          enabled: true, // Enable panning
          mode: "xy", // Pan on both axes
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zoom with mouse wheel
          },
          pinch: {
            enabled: true, // Enable zoom with pinch gesture on touch devices
          },
          mode: "xy", // Zoom on both axes
        },
      },
      legend: {
        position: 'top',
        align: 'center',
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

  // Function to reset date filter
  const resetDateFilter = () => {
    applyDateFilter(null, null);
  };

  // Function to download chart data as csv
  const downloadCSV = () => {
    const { labels, datasets } = chartData;

    if (!labels.length || !datasets[0].data.length) {
      alert("No data available to download.");
      return;
    }

    let csvContent = "Timestamp,Temperature\n";

    // Combining timestamp and data point
    labels.forEach((timestamp, index) => {
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
    link.setAttribute("download", "temperature-data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //Function to download PDF
  const downloadPDF = () => {
    if (!chartRef || !chartRef.current) {
      alert("Chart is not available");
      return;
    }

    // Getting canvas for the chart
    const canvas = chartRef.current.canvas;

    // Converting chart to image
    const image = canvas.toDataURL("image/png");

    // Create a new jsPDF instance using dynamic import
    import("jspdf")
      .then((jsPDF) => {
        const pdf = new jsPDF.default();

        // Add title
        pdf.text("Temperature Data Chart", 20, 20);

        // Add date range information if filter is active
        if (activeDateFilter.startDate || activeDateFilter.endDate) {
          const startStr = activeDateFilter.startDate 
            ? new Date(activeDateFilter.startDate).toLocaleDateString() 
            : "Start";
          const endStr = activeDateFilter.endDate 
            ? new Date(activeDateFilter.endDate).toLocaleDateString() 
            : "End";
          pdf.text(`Date Range: ${startStr} to ${endStr}`, 20, 30);
          // Adjust image position if date range is included
          pdf.addImage(image, "PNG", 15, 40, 180, 100);
        } else {
          pdf.addImage(image, "PNG", 15, 30, 180, 100);
        }

        // Save the PDF
        pdf.save("temperature-chart.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please make sure jspdf is installed.");
      });
  };

  // Count data points before and after filtering
  const totalDataPoints = originalData.labels ? originalData.labels.length : 0;
  const filteredDataPoints = chartData.labels ? chartData.labels.length : 0;

  return (
    <div className="chart-container" style={{ position: "relative", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#fafafa", maxWidth: "900px", margin: "0 auto" }}>
      <div className="chart-header" style={styles.header}>
        <h3 style={styles.title}>Temperature Data</h3>
        <div className="chart-controls" style={styles.controls}>
          <button onClick={resetZoom} style={styles.resetButton}>
            Reset Zoom
          </button>
          <DownloadMenu onExportCSV={downloadCSV} onExportPDF={downloadPDF} />
        </div>
      </div>

      <div style={styles.instructions}>
        <p>Select a date range below to filter the temperature data.</p>
      </div>

      {minDate && maxDate && (
        <div>
          <DateFilter
            minDate={minDate}
            maxDate={maxDate}
            onDateChange={(startDate, endDate) => applyDateFilter(startDate, endDate)}
          />
          
          {isFilterActive && (
            <div style={styles.filterIndicator}>
              <div style={styles.filterInfo}>
                <span style={styles.filterLabel}>Active Filter:</span> 
                <span>{formatDate(activeDateFilter.startDate)} to {formatDate(activeDateFilter.endDate)}</span>
                <span style={styles.dataCount}>
                  Showing {filteredDataPoints} of {totalDataPoints} data points
                </span>
              </div>
              <button 
                onClick={resetDateFilter} 
                style={styles.clearFilterButton}
                title="Clear date filter and show all data"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}

      <div className="chart-wrapper" style={styles.chartWrapper}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      <div style={styles.zoomInstructions}>
        <p><strong>Tip:</strong> Use mouse wheel to zoom in/out, and click and drag to pan across the chart</p>
      </div>
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
  instructions: {
    marginBottom: "10px",
    fontSize: "14px",
    color: "#555",
  },
  filterIndicator: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
    marginTop: "10px",
    marginBottom: "15px",
    border: "1px solid #bbdefb",
  },
  filterInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontWeight: "bold",
    color: "#0d47a1",
  },
  dataCount: {
    marginLeft: "15px",
    fontSize: "13px",
    color: "#555",
    backgroundColor: "#fff",
    padding: "3px 8px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },
  clearFilterButton: {
    padding: "5px 10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  chartWrapper: {
    maxWidth: "100%",
    height: "400px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    marginTop: "20px",
    marginBottom: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  zoomInstructions: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
};

export default LineChart;