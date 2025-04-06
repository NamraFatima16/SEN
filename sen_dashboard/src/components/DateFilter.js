import { useState, useEffect } from "react";

const DateFilter = ({ minDate, maxDate, onDateChange }) => {
  //state for start and end date
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // the months are 0 based and YYYY-MM-DD for input fields
  const formatDateInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // when the mininum date or maximum date changes, the date field is updated
  useEffect(() => {
    if (minDate) {
      setStartDate(formatDateInput(minDate));
    }
    if (maxDate) {
      setEndDate(formatDateInput(maxDate));
    }
  }, [minDate, maxDate]);

  //start date change
  const handleStartDate = (e) => {
    setStartDate(e.target.value);
  };

  // end date change
  const handleEndDate = (e) => {
    setEndDate(e.target.value);
  };

  // Apply the date filter
  const dateFilter = () => {
    //this converts string dates to time stamps
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate
      ? new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1)
      : null;


      onDateChange(start, end);
  };

  // Reset the date filter
  const resetFilter = () => {
    setStartDate(formatDateInput(minDate));
    setEndDate(formatDateInput(maxDate));
    onDateChange(null, null);
  };


  return (
    <div style={styles.container}>
      <div style={styles.dateInputs}>
        <div style={styles.inputGroup}>
          <label htmlFor="start-date" style={styles.label}>Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDate}
            min={formatDateInput(minDate)}
            max={endDate || formatDateInput(maxDate)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label htmlFor="end-date" style={styles.label}>End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDate}
            min={startDate || formatDateInput(minDate)}
            max={formatDateInput(maxDate)}
            style={styles.input}
          />
        </div>
      </div>
      
      <div style={styles.buttonGroup}>
        <button onClick={dateFilter} style={styles.applyButton}>
          Apply
        </button>
        <button onClick={resetFilter} style={styles.resetButton}>
          Reset
        </button>
      </div>
    </div>
  );
};


//styling
const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "10px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      marginBottom: "15px"
    },
    dateInputs: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "5px"
    },
    label: {
      fontSize: "14px",
      fontWeight: "500"
    },
    input: {
      padding: "6px 10px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "14px"
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "5px"
    },
    applyButton: {
      padding: "6px 15px",
      backgroundColor: "#0d6efd",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px"
    },
    resetButton: {
      padding: "6px 15px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px"
    }
  };
  
export default DateFilter;
