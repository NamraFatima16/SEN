import { useState, useRef, useEffect } from "react";

const DownloadMenu = ({ onExportCSV, onExportPDF }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="download-menu-container" ref={menuRef} style={styles.container}>
      <button 
        onClick={toggleMenu} 
        style={styles.button}
      >
        Download Data ▼
      </button>
      
      {isOpen && (
        <div style={styles.dropdown}>
          <button 
            onClick={() => {
              onExportCSV();
              setIsOpen(false);
            }}
            style={styles.menuItem}
          >
            Download as CSV
          </button>
          <button 
            onClick={() => {
              onExportPDF();
              setIsOpen(false);
            }}
            style={styles.menuItem}
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    position: "relative",
    display: "inline-block"
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    backgroundColor: "#f9f9f9",
    minWidth: "160px",
    boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
    zIndex: 1,
    borderRadius: "4px",
    marginTop: "5px"
  },
  menuItem: {
    width: "100%",
    color: "black",
    padding: "10px 15px",
    textDecoration: "none",
    display: "block",
    textAlign: "left",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px"
  }
};

export default DownloadMenu;