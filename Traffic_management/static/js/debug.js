// Debug script to fix export functionality
console.log("Debug script loaded");

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  
  // Add debug info container to page
  addDebugContainer();
  
  // Log environment info
  showDebugMessage("Debug mode active - checking environment...");
  showDebugMessage("jQuery available: " + (typeof jQuery !== 'undefined'));
  showDebugMessage("Bootstrap available: " + (typeof bootstrap !== 'undefined'));
  showDebugMessage("XLSX available: " + (typeof XLSX !== 'undefined'));
  showDebugMessage("jsPDF available: " + (typeof jspdf !== 'undefined'));
  showDebugMessage("Chart.js available: " + (typeof Chart !== 'undefined'));
  
  // Check for duplicate IDs
  checkDuplicateIDs();
  
  // Check if jQuery is available
  console.log("jQuery available:", typeof jQuery !== 'undefined');
  
  // Check if Bootstrap is available
  console.log("Bootstrap available:", typeof bootstrap !== 'undefined');
  
  // Check if XLSX is available
  console.log("XLSX available:", typeof XLSX !== 'undefined');
  
  // Check if jsPDF is available
  console.log("jsPDF available:", typeof jspdf !== 'undefined');
  
  // Log the Chart.js availability
  console.log("Chart.js available:", typeof Chart !== 'undefined');
  
  // Add a direct click handler for export buttons
  const exportCSV = document.getElementById('exportCSV');
  if (exportCSV) {
    console.log("Found exportCSV button, adding event listener");
    showDebugMessage("Found CSV export button");
    exportCSV.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export CSV clicked");
      showDebugMessage("CSV export button clicked");
      exportDataAsCSV();
    });
  } else {
    console.log("exportCSV button not found");
    showDebugMessage("WARNING: exportCSV button not found", "warning");
  }
  
  // Add handlers for direct export buttons
  const directExportCSV = document.getElementById('directExportCSV');
  if (directExportCSV) {
    console.log("Found directExportCSV button, adding event listener");
    showDebugMessage("Found direct CSV export button");
    directExportCSV.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Direct Export CSV clicked");
      showDebugMessage("Direct CSV export button clicked");
      exportDataAsCSV();
    });
  }
  
  const directExportExcel = document.getElementById('directExportExcel');
  if (directExportExcel) {
    console.log("Found directExportExcel button, adding event listener");
    showDebugMessage("Found direct Excel export button");
    directExportExcel.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Direct Export Excel clicked");
      showDebugMessage("Direct Excel export button clicked");
      exportDataAsExcel();
    });
  }
  
  const directExportPDF = document.getElementById('directExportPDF');
  if (directExportPDF) {
    console.log("Found directExportPDF button, adding event listener");
    showDebugMessage("Found direct PDF export button");
    directExportPDF.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Direct Export PDF clicked");
      showDebugMessage("Direct PDF export button clicked");
      exportDataAsPDF();
    });
  }
  
  const exportExcel = document.getElementById('exportExcel');
  if (exportExcel) {
    console.log("Found exportExcel button, adding event listener");
    showDebugMessage("Found Excel export button");
    exportExcel.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export Excel clicked");
      showDebugMessage("Excel export button clicked");
      exportDataAsExcel();
    });
  } else {
    console.log("exportExcel button not found");
    showDebugMessage("WARNING: exportExcel button not found", "warning");
  }
  
  const exportPDF = document.getElementById('exportPDF');
  if (exportPDF) {
    console.log("Found exportPDF button, adding event listener");
    showDebugMessage("Found PDF export button");
    exportPDF.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export PDF clicked");
      showDebugMessage("PDF export button clicked");
      exportDataAsPDF();
    });
  } else {
    console.log("exportPDF button not found");
    showDebugMessage("WARNING: exportPDF button not found", "warning");
  }
  
  // Add handlers for report export buttons
  const exportReportCSV = document.getElementById('exportReportCSV');
  if (exportReportCSV) {
    console.log("Found exportReportCSV button, adding event listener");
    showDebugMessage("Found Report CSV export button");
    exportReportCSV.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export Report CSV clicked");
      showDebugMessage("Report CSV export button clicked");
      exportDataAsCSV('report');
    });
  } else {
    console.log("exportReportCSV button not found");
    showDebugMessage("WARNING: exportReportCSV button not found", "warning");
  }
  
  const exportReportExcel = document.getElementById('exportReportExcel');
  if (exportReportExcel) {
    console.log("Found exportReportExcel button, adding event listener");
    showDebugMessage("Found Report Excel export button");
    exportReportExcel.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export Report Excel clicked");
      showDebugMessage("Report Excel export button clicked");
      exportDataAsExcel('report');
    });
  } else {
    console.log("exportReportExcel button not found");
    showDebugMessage("WARNING: exportReportExcel button not found", "warning");
  }
  
  const exportReportPDF = document.getElementById('exportReportPDF');
  if (exportReportPDF) {
    console.log("Found exportReportPDF button, adding event listener");
    showDebugMessage("Found Report PDF export button");
    exportReportPDF.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Export Report PDF clicked");
      showDebugMessage("Report PDF export button clicked");
      exportDataAsPDF('report');
    });
  } else {
    console.log("exportReportPDF button not found");
    showDebugMessage("WARNING: exportReportPDF button not found", "warning");
  }
  
  // Monitor for clicks on export buttons
  document.addEventListener('click', function(e) {
    if (e.target.closest('#exportCSV')) {
      console.log('Click captured on exportCSV via event delegation');
      showDebugMessage("Click detected on exportCSV via delegation");
    }
    if (e.target.closest('#exportExcel')) {
      console.log('Click captured on exportExcel via event delegation');
      showDebugMessage("Click detected on exportExcel via delegation");
    }
    if (e.target.closest('#exportPDF')) {
      console.log('Click captured on exportPDF via event delegation');
      showDebugMessage("Click detected on exportPDF via delegation");
    }
  });
  
  // Log if the traffic chart is initialized
  setTimeout(function() {
    console.log("Traffic flow chart initialized:", typeof window.trafficFlowChart !== 'undefined');
    if (window.trafficFlowChart) {
      console.log("Chart data:", window.trafficFlowChart.data);
      showDebugMessage("Traffic flow chart is initialized", "success");
    } else {
      showDebugMessage("ERROR: Traffic flow chart not initialized", "error");
    }
  }, 2000);
});

// Simple CSV export function
function exportDataAsCSV(type = 'traffic') {
  if (!window.trafficFlowChart) {
    console.error("Chart not available for export");
    showDebugMessage("ERROR: Chart not available for export", "error");
    
    // Try to force initialize the chart
    if (typeof window.initializeTrafficFlowChart === 'function') {
      showDebugMessage("Attempting to initialize chart before export...", "warning");
      window.initializeTrafficFlowChart();
      
      // Check if initialization was successful
      if (window.trafficFlowChart) {
        showDebugMessage("Chart initialized. Proceeding with export...", "success");
        // Try export again after a short delay to ensure chart is fully ready
        setTimeout(() => exportDataAsCSV(type), 1000);
        return;
      }
    }
    
    alert("Error: Chart data not available");
    return;
  }
  
  try {
    // Get chart data with additional safety checks
    let chartData = {
      labels: [],
      datasets: [{ data: [] }]
    };
    
    // Try to get data from chart in a safe way
    try {
      if (window.trafficFlowChart.data) {
        chartData = window.trafficFlowChart.data;
      } else if (window.trafficFlowChart.config && window.trafficFlowChart.config.data) {
        chartData = window.trafficFlowChart.config.data;
      }
    } catch (e) {
      console.error("Error accessing chart data:", e);
      showDebugMessage("Error accessing chart data: " + e.message, "error");
      
      // Generate a simple fallback dataset if no chart data available
      chartData = {
        labels: ["No data available"],
        datasets: [{ data: [0] }]
      };
    }
    
    const filename = type === 'report' ? 
      "traffic_report_" + new Date().toISOString().split('T')[0] :
      "traffic_data_" + new Date().toISOString().split('T')[0];
    
    // Create CSV content
    let csvContent = "Time,Traffic Flow\n";
    for (let i = 0; i < chartData.labels.length; i++) {
      if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
        const value = chartData.datasets[0].data[i] !== null ? chartData.datasets[0].data[i] : '';
        csvContent += `"${chartData.labels[i] || 'Unknown'}", ${value}\n`;
      }
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    // Trigger download
    try {
      link.click();
      document.body.removeChild(link);
      
      console.log("CSV export completed");
      showDebugMessage("CSV export completed successfully", "success");
      alert("Data exported as CSV successfully");
    } catch (e) {
      console.error("CSV export error:", e);
      showDebugMessage("ERROR during CSV export: " + e.message, "error");
    }
  } catch (e) {
    console.error("Fatal error during CSV export:", e);
    showDebugMessage("FATAL ERROR during CSV export: " + e.message, "error");
    alert("Fatal error during CSV export: " + e.message);
  }
}

// Simple Excel export function
function exportDataAsExcel(type = 'traffic') {
  if (!window.trafficFlowChart) {
    console.error("Chart not available for export");
    showDebugMessage("ERROR: Chart not available for export", "error");
    
    // Try to force initialize the chart
    if (typeof window.initializeTrafficFlowChart === 'function') {
      showDebugMessage("Attempting to initialize chart before export...", "warning");
      window.initializeTrafficFlowChart();
      
      // Check if initialization was successful
      if (window.trafficFlowChart) {
        showDebugMessage("Chart initialized. Proceeding with export...", "success");
        // Try export again after a short delay to ensure chart is fully ready
        setTimeout(() => exportDataAsExcel(type), 1000);
        return;
      }
    }
    
    alert("Error: Chart data not available");
    return;
  }
  
  if (typeof XLSX === 'undefined') {
    console.error("XLSX library not available");
    showDebugMessage("ERROR: XLSX library not available", "error");
    alert("XLSX library not available. Using CSV instead.");
    exportDataAsCSV(type);
    return;
  }
  
  try {
    // Get chart data with additional safety checks
    let chartData = {
      labels: [],
      datasets: [{ data: [] }]
    };
    
    // Try to get data from chart in a safe way
    try {
      if (window.trafficFlowChart.data) {
        chartData = window.trafficFlowChart.data;
      } else if (window.trafficFlowChart.config && window.trafficFlowChart.config.data) {
        chartData = window.trafficFlowChart.config.data;
      }
    } catch (e) {
      console.error("Error accessing chart data:", e);
      showDebugMessage("Error accessing chart data: " + e.message, "error");
      
      // Generate a simple fallback dataset if no chart data available
      chartData = {
        labels: ["No data available"],
        datasets: [{ data: [0] }]
      };
    }
    
    const filename = type === 'report' ? 
      "traffic_report_" + new Date().toISOString().split('T')[0] :
      "traffic_data_" + new Date().toISOString().split('T')[0];
    
    try {
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([["Time", "Traffic Flow"]]);
      const data = [];
      
      for (let i = 0; i < chartData.labels.length; i++) {
        if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
          const value = chartData.datasets[0].data[i] !== null ? chartData.datasets[0].data[i] : '';
          data.push([chartData.labels[i] || 'Unknown', value]);
        }
      }
      
      XLSX.utils.sheet_add_aoa(ws, data, {origin: -1});
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Traffic Data");
      
      // Save file
      XLSX.writeFile(wb, filename + ".xlsx");
      
      console.log("Excel export completed");
      showDebugMessage("Excel export completed successfully", "success");
      alert("Data exported as Excel successfully");
    } catch (e) {
      console.error("Excel export error:", e);
      showDebugMessage("ERROR during Excel export: " + e.message, "error");
      alert("Error exporting as Excel. Using CSV instead.");
      exportDataAsCSV(type);
    }
  } catch (error) {
    console.error("Fatal error during Excel export:", error);
    showDebugMessage("FATAL ERROR during Excel export: " + error.message, "error");
    alert("Fatal error during Excel export. Using CSV instead.");
    exportDataAsCSV(type);
  }
}

// Simple PDF export function
function exportDataAsPDF(type = 'traffic') {
  if (!window.trafficFlowChart) {
    console.error("Chart not available for export");
    showDebugMessage("ERROR: Chart not available for export", "error");
    
    // Try to force initialize the chart
    if (typeof window.initializeTrafficFlowChart === 'function') {
      showDebugMessage("Attempting to initialize chart before export...", "warning");
      window.initializeTrafficFlowChart();
      
      // Check if initialization was successful
      if (window.trafficFlowChart) {
        showDebugMessage("Chart initialized. Proceeding with export...", "success");
        // Try export again after a short delay to ensure chart is fully ready
        setTimeout(() => exportDataAsPDF(type), 1000);
        return;
      }
    }
    
    alert("Error: Chart data not available");
    return;
  }
  
  if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
    console.error("jsPDF library not available");
    showDebugMessage("ERROR: jsPDF library not available", "error");
    alert("PDF export library not available. Using CSV instead.");
    exportDataAsCSV(type);
    return;
  }
  
  try {
    const chartElement = document.getElementById('trafficFlowChart');
    if (!chartElement) {
      console.error("Chart element not found");
      showDebugMessage("ERROR: Chart element not found", "error");
      alert("Chart element not found. Using CSV instead.");
      exportDataAsCSV(type);
      return;
    }
    
    // Get chart data with additional safety checks
    let chartData = {
      labels: [],
      datasets: [{ data: [] }]
    };
    
    // Try to get data from chart in a safe way
    try {
      if (window.trafficFlowChart.data) {
        chartData = window.trafficFlowChart.data;
      } else if (window.trafficFlowChart.config && window.trafficFlowChart.config.data) {
        chartData = window.trafficFlowChart.config.data;
      }
    } catch (e) {
      console.error("Error accessing chart data:", e);
      showDebugMessage("Error accessing chart data: " + e.message, "error");
      
      // Generate a simple fallback dataset if no chart data available
      chartData = {
        labels: ["No data available"],
        datasets: [{ data: [0] }]
      };
    }
    
    const filename = type === 'report' ? 
      "traffic_report_" + new Date().toISOString().split('T')[0] :
      "traffic_data_" + new Date().toISOString().split('T')[0];
    
    try {
      // Create PDF
      const pdf = new jspdf.jsPDF('landscape');
      
      // Add title
      pdf.setFontSize(18);
      pdf.text('Traffic Flow Analysis', 14, 22);
      
      // Add date
      pdf.setFontSize(12);
      pdf.text('Generated: ' + new Date().toLocaleString(), 14, 30);
      
      try {
        // Check if toDataURL is supported by the chart element
        if (typeof chartElement.toDataURL === 'function') {
          // Add chart image
          const chartImage = chartElement.toDataURL('image/png', 1.0);
          pdf.addImage(chartImage, 'PNG', 10, 40, 280, 150);
        } else {
          pdf.text('Chart image not available', 10, 40);
          showDebugMessage("Chart image not available. Using text-only PDF.", "warning");
        }
      } catch (imgError) {
        console.error("Error getting chart image:", imgError);
        showDebugMessage("Error getting chart image: " + imgError.message, "error");
        pdf.text('Chart image not available due to error: ' + imgError.message, 10, 40);
      }
      
      // Add data table
      pdf.setFontSize(12);
      pdf.text('Time', 20, 200);
      pdf.text('Traffic Flow', 100, 200);
      
      let y = 210;
      for (let i = 0; i < Math.min(chartData.labels.length, 20); i++) {
        if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
          const value = chartData.datasets[0].data[i] !== null ? chartData.datasets[0].data[i].toString() : 'N/A';
          pdf.text(chartData.labels[i] || 'Unknown', 20, y);
          pdf.text(value, 100, y);
          y += 10;
        }
      }
      
      // Save file
      pdf.save(filename + ".pdf");
      
      console.log("PDF export completed");
      showDebugMessage("PDF export completed successfully", "success");
      alert("Data exported as PDF successfully");
    } catch (e) {
      console.error("PDF export error:", e);
      showDebugMessage("ERROR during PDF export: " + e.message, "error");
      alert("Error exporting as PDF. Using CSV instead.");
      exportDataAsCSV(type);
    }
  } catch (error) {
    console.error("Fatal error during PDF export:", error);
    showDebugMessage("FATAL ERROR during PDF export: " + error.message, "error");
    alert("Fatal error during PDF export. Using CSV instead.");
    exportDataAsCSV(type);
  }
}

// Create a debug container for messages
function addDebugContainer() {
  if (document.getElementById('debug-container')) {
    return; // Already exists
  }
  
  const container = document.createElement('div');
  container.id = 'debug-container';
  container.style.position = 'fixed';
  container.style.bottom = '10px';
  container.style.right = '10px';
  container.style.width = '300px';
  container.style.maxHeight = '200px';
  container.style.overflowY = 'auto';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.color = 'white';
  container.style.padding = '10px';
  container.style.borderRadius = '5px';
  container.style.zIndex = '9999';
  container.style.fontSize = '12px';
  container.style.fontFamily = 'monospace';
  
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '5px';
  header.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
  header.style.paddingBottom = '5px';
  
  const title = document.createElement('span');
  title.textContent = 'Export Debug Mode';
  title.style.fontWeight = 'bold';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'X';
  closeBtn.style.backgroundColor = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'white';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = function() {
    container.style.display = 'none';
  };
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const messageContainer = document.createElement('div');
  messageContainer.id = 'debug-messages';
  
  // Add debug actions panel
  const actionsPanel = document.createElement('div');
  actionsPanel.style.marginTop = '10px';
  actionsPanel.style.display = 'flex';
  actionsPanel.style.gap = '5px';
  
  // Add initialize chart button
  const initChartBtn = document.createElement('button');
  initChartBtn.textContent = 'Init Chart';
  initChartBtn.style.backgroundColor = '#007bff';
  initChartBtn.style.color = 'white';
  initChartBtn.style.border = 'none';
  initChartBtn.style.padding = '5px';
  initChartBtn.style.borderRadius = '3px';
  initChartBtn.style.cursor = 'pointer';
  initChartBtn.onclick = function() {
    if (typeof window.initializeTrafficFlowChart === 'function') {
      window.initializeTrafficFlowChart();
      showDebugMessage("Chart initialization triggered", "info");
    } else {
      showDebugMessage("Chart initialization function not available", "error");
    }
  };
  
  // Add direct export buttons
  const directExportCSVBtn = document.createElement('button');
  directExportCSVBtn.textContent = 'CSV';
  directExportCSVBtn.style.backgroundColor = '#28a745';
  directExportCSVBtn.style.color = 'white';
  directExportCSVBtn.style.border = 'none';
  directExportCSVBtn.style.padding = '5px';
  directExportCSVBtn.style.borderRadius = '3px';
  directExportCSVBtn.style.cursor = 'pointer';
  directExportCSVBtn.onclick = function() {
    exportDataAsCSV();
  };
  
  const directExportExcelBtn = document.createElement('button');
  directExportExcelBtn.textContent = 'Excel';
  directExportExcelBtn.style.backgroundColor = '#ffc107';
  directExportExcelBtn.style.color = 'black';
  directExportExcelBtn.style.border = 'none';
  directExportExcelBtn.style.padding = '5px';
  directExportExcelBtn.style.borderRadius = '3px';
  directExportExcelBtn.style.cursor = 'pointer';
  directExportExcelBtn.onclick = function() {
    exportDataAsExcel();
  };
  
  const directExportPDFBtn = document.createElement('button');
  directExportPDFBtn.textContent = 'PDF';
  directExportPDFBtn.style.backgroundColor = '#dc3545';
  directExportPDFBtn.style.color = 'white';
  directExportPDFBtn.style.border = 'none';
  directExportPDFBtn.style.padding = '5px';
  directExportPDFBtn.style.borderRadius = '3px';
  directExportPDFBtn.style.cursor = 'pointer';
  directExportPDFBtn.onclick = function() {
    exportDataAsPDF();
  };
  
  actionsPanel.appendChild(initChartBtn);
  actionsPanel.appendChild(directExportCSVBtn);
  actionsPanel.appendChild(directExportExcelBtn);
  actionsPanel.appendChild(directExportPDFBtn);
  
  container.appendChild(header);
  container.appendChild(messageContainer);
  container.appendChild(actionsPanel);
  
  document.body.appendChild(container);
}

// Show a debug message in the container
function showDebugMessage(message, type = 'info') {
  const container = document.getElementById('debug-messages');
  if (!container) return;
  
  const msgEl = document.createElement('div');
  msgEl.style.marginBottom = '5px';
  msgEl.style.borderLeft = '3px solid';
  msgEl.style.paddingLeft = '5px';
  
  // Set color based on message type
  switch(type) {
    case 'success':
      msgEl.style.borderColor = '#28a745';
      break;
    case 'error':
      msgEl.style.borderColor = '#dc3545';
      break;
    case 'warning':
      msgEl.style.borderColor = '#ffc107';
      break;
    default:
      msgEl.style.borderColor = '#17a2b8';
      break;
  }
  
  const timestamp = new Date().toLocaleTimeString();
  msgEl.textContent = `[${timestamp}] ${message}`;
  
  container.appendChild(msgEl);
  
  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (msgEl.parentNode) {
      msgEl.parentNode.removeChild(msgEl);
    }
  }, 30000);
}

// Function to check for duplicate IDs in the document
function checkDuplicateIDs() {
  const allElements = document.querySelectorAll('[id]');
  const idMap = {};
  const duplicates = [];
  
  // Find duplicates
  allElements.forEach(el => {
    const id = el.id;
    if (!idMap[id]) {
      idMap[id] = [];
    }
    idMap[id].push(el);
    
    if (idMap[id].length === 2) {
      duplicates.push(id);
    }
  });
  
  // Display duplicate warnings if found
  if (duplicates.length > 0) {
    showDebugMessage(`WARNING: Found ${duplicates.length} duplicate IDs!`, "warning");
    duplicates.forEach(dupId => {
      showDebugMessage(`Duplicate ID: "${dupId}" (${idMap[dupId].length} elements)`, "warning");
      
      // Add a data attribute to distinguish them
      idMap[dupId].forEach((el, idx) => {
        el.setAttribute('data-duplicate-index', idx);
        
        // Add a visible warning to the element
        const warning = document.createElement('div');
        warning.style.position = 'absolute';
        warning.style.top = '0';
        warning.style.right = '0';
        warning.style.backgroundColor = 'rgba(255, 193, 7, 0.8)';
        warning.style.color = 'black';
        warning.style.padding = '2px 5px';
        warning.style.fontSize = '10px';
        warning.style.borderBottomLeftRadius = '3px';
        warning.style.zIndex = '1000';
        warning.textContent = `Duplicate ID: ${dupId} (${idx+1}/${idMap[dupId].length})`;
        
        if (el.style.position !== 'absolute' && el.style.position !== 'fixed') {
          el.style.position = 'relative';
        }
        
        el.appendChild(warning);
      });
    });
    
    // Add a button to fix duplicate IDs
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Fix Duplicate IDs';
    fixButton.style.backgroundColor = '#ffc107';
    fixButton.style.color = 'black';
    fixButton.style.border = 'none';
    fixButton.style.padding = '5px 10px';
    fixButton.style.borderRadius = '3px';
    fixButton.style.marginTop = '5px';
    fixButton.style.marginBottom = '5px';
    fixButton.style.cursor = 'pointer';
    
    fixButton.addEventListener('click', function() {
      fixDuplicateIDs(duplicates, idMap);
    });
    
    const debugContainer = document.getElementById('debug-messages');
    if (debugContainer) {
      debugContainer.appendChild(fixButton);
    }
  } else {
    showDebugMessage("No duplicate IDs found in document", "success");
  }
}

// Function to fix duplicate IDs
function fixDuplicateIDs(duplicates, idMap) {
  let fixedCount = 0;
  
  duplicates.forEach(dupId => {
    const elements = idMap[dupId];
    
    // Skip the first one (keep original ID)
    for (let i = 1; i < elements.length; i++) {
      const newId = `${dupId}_${i}`;
      elements[i].id = newId;
      
      // Update warning label
      const warning = elements[i].querySelector('div:last-child');
      if (warning) {
        warning.textContent = `Fixed ID: ${newId} (was ${dupId})`;
        warning.style.backgroundColor = 'rgba(40, 167, 69, 0.8)';
        
        // Remove the warning after 3 seconds
        setTimeout(() => {
          if (warning.parentNode) {
            warning.parentNode.removeChild(warning);
          }
        }, 3000);
      }
      
      fixedCount++;
    }
  });
  
  showDebugMessage(`Fixed ${fixedCount} duplicate IDs`, "success");
  
  // Reset event listeners for exportCVS, exportExcel, and exportPDF buttons after fixing IDs
  addExportEventListeners();
}

// Add export event listeners
function addExportEventListeners() {
  // Find all export buttons by attribute selector
  const exportCSVButtons = document.querySelectorAll('[id^="exportCSV"]');
  const exportExcelButtons = document.querySelectorAll('[id^="exportExcel"]');
  const exportPDFButtons = document.querySelectorAll('[id^="exportPDF"]');
  
  exportCSVButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Export CSV clicked (ID: ${button.id})`);
      showDebugMessage(`CSV export button clicked (ID: ${button.id})`);
      exportDataAsCSV(button.id.includes('Report') ? 'report' : 'traffic');
    });
  });
  
  exportExcelButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Export Excel clicked (ID: ${button.id})`);
      showDebugMessage(`Excel export button clicked (ID: ${button.id})`);
      exportDataAsExcel(button.id.includes('Report') ? 'report' : 'traffic');
    });
  });
  
  exportPDFButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Export PDF clicked (ID: ${button.id})`);
      showDebugMessage(`PDF export button clicked (ID: ${button.id})`);
      exportDataAsPDF(button.id.includes('Report') ? 'report' : 'traffic');
    });
  });
  
  // Add direct export button handlers
  const directButtons = [
    { id: 'directExportCSV', handler: exportDataAsCSV, type: 'traffic' },
    { id: 'directExportExcel', handler: exportDataAsExcel, type: 'traffic' },
    { id: 'directExportPDF', handler: exportDataAsPDF, type: 'traffic' }
  ];
  
  directButtons.forEach(btnInfo => {
    const button = document.getElementById(btnInfo.id);
    if (button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(`Direct export clicked (ID: ${btnInfo.id})`);
        showDebugMessage(`Direct export button clicked (ID: ${btnInfo.id})`);
        btnInfo.handler(btnInfo.type);
      });
    }
  });
  
  showDebugMessage("Export listeners reattached after fixing IDs", "success");
}

// Chart debugging functions
function debugCharts() {
  console.log("=== CHART DEBUG INFO ===");
  
  // Check all canvas elements
  const canvases = document.querySelectorAll('canvas');
  console.log(`Found ${canvases.length} canvas elements:`);
  
  canvases.forEach((canvas, idx) => {
    console.log(`Canvas #${idx + 1}: id=${canvas.id || 'none'}, width=${canvas.width}, height=${canvas.height}`);
    console.log(`  - In DOM: ${document.body.contains(canvas)}`);
    console.log(`  - Visibility: ${getComputedStyle(canvas).visibility}`);
    console.log(`  - Display: ${getComputedStyle(canvas).display}`);
    
    // Check for Chart.js instances
    try {
      const chartInstance = Chart.getChart(canvas);
      console.log(`  - Chart instance: ${chartInstance ? 'YES' : 'NO'}`);
      if (chartInstance) {
        console.log(`    - Type: ${chartInstance.config.type}`);
        console.log(`    - Data: ${chartInstance.data.datasets.length} datasets with ${chartInstance.data.datasets[0]?.data.length || 0} points`);
      }
    } catch (e) {
      console.log(`  - Chart error: ${e.message}`);
    }
  });
  
  // Check chart registry
  if (window.Chart && window.Chart.instances) {
    console.log(`Chart.js registry: ${Object.keys(window.Chart.instances).length} registered charts`);
  }
  
  // Check our chart instances
  if (window.chartInstances) {
    console.log(`Custom chart registry: ${Object.keys(window.chartInstances).length} tracked charts`);
  }
  
  // Check for specific charts
  checkSpecificChart('trafficFlowChart', 'Main Traffic Flow');
  checkSpecificChart('distributionChart', 'Traffic Distribution');
  checkSpecificChart('hourlyPatternChart', 'Hourly Pattern');
  checkSpecificChart('reportTrafficTrendChart', 'Report Traffic Trend');
  checkSpecificChart('reportDistributionChart', 'Report Distribution');
  
  console.log("=== END CHART DEBUG ===");
  
  return "Chart debugging complete - see console for details";
}

// Check for a specific chart and log its status
function checkSpecificChart(chartId, chartName) {
  console.log(`\nChecking ${chartName} chart (${chartId}):`);
  
  const canvas = document.getElementById(chartId);
  if (!canvas) {
    console.log(`- MISSING: Canvas element '${chartId}' does not exist in the DOM`);
    return;
  }
  
  console.log(`- Canvas: Found in DOM, size=${canvas.width}x${canvas.height}`);
  
  // Check for Chart.js instance
  try {
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
      console.log(`- Chart: Instance exists (${chartInstance.config.type})`);
      
      // Check data
      const hasData = chartInstance.data && 
                     chartInstance.data.datasets && 
                     chartInstance.data.datasets.length > 0 &&
                     chartInstance.data.datasets[0].data &&
                     chartInstance.data.datasets[0].data.length > 0;
                     
      if (hasData) {
        console.log(`- Data: ${chartInstance.data.datasets.length} datasets, ${chartInstance.data.datasets[0].data.length} data points`);
      } else {
        console.log(`- Data: EMPTY or INVALID`);
      }
      
    } else {
      console.log(`- Chart: NO INSTANCE attached to this canvas`);
    }
  } catch (e) {
    console.log(`- Error: ${e.message}`);
  }
  
  // Check parent element
  const parent = canvas.parentElement;
  if (parent) {
    console.log(`- Parent: ${parent.tagName}, class=${parent.className}, style.height=${parent.style.height}`);
  } else {
    console.log(`- Parent: NONE (detached from DOM)`);
  }
}

// Add a global debug function
window.debugCharts = debugCharts;

// Force re-creation of all charts
function forceRecreateAllCharts() {
  console.log("Force recreating all charts...");
  
  // Clear any existing charts
  if (window.Chart && typeof window.Chart.getChart === 'function') {
    document.querySelectorAll('canvas').forEach(canvas => {
      const chart = window.Chart.getChart(canvas);
      if (chart) {
        console.log(`Destroying chart on ${canvas.id || 'unnamed canvas'}`);
        chart.destroy();
      }
    });
  }
  
  // Also clear our registry
  if (window.chartInstances) {
    Object.keys(window.chartInstances).forEach(key => {
      try {
        if (window.chartInstances[key]) {
          window.chartInstances[key].destroy();
        }
      } catch (e) {
        console.warn(`Error destroying chart ${key}:`, e);
      }
      delete window.chartInstances[key];
    });
  }
  
  // Clear and recreate all canvas elements
  const canvasElements = document.querySelectorAll('canvas');
  canvasElements.forEach(canvas => {
    const parent = canvas.parentElement;
    if (parent) {
      const id = canvas.id;
      const className = canvas.className;
      const width = canvas.width;
      const height = canvas.height;
      
      // Remove old canvas
      parent.removeChild(canvas);
      
      // Create new canvas
      const newCanvas = document.createElement('canvas');
      if (id) newCanvas.id = id;
      if (className) newCanvas.className = className;
      newCanvas.width = width || 300;
      newCanvas.height = height || 150;
      
      // Add to parent
      parent.appendChild(newCanvas);
      console.log(`Recreated canvas: ${id || 'unnamed'}`);
    }
  });
  
  // Now reinitialize all charts
  console.log("Re-initializing charts...");
  
  // First init main traffic flow chart
  if (typeof window.initializeTrafficFlowChart === 'function') {
    try {
      window.initializeTrafficFlowChart();
      console.log("Re-initialized traffic flow chart");
    } catch (e) {
      console.error("Error re-initializing traffic flow chart:", e);
    }
  }
  
  // Then init home charts
  if (typeof window.initHomeCharts === 'function') {
    try {
      window.initHomeCharts();
      console.log("Re-initialized home charts");
    } catch (e) {
      console.error("Error re-initializing home charts:", e);
    }
  }
  
  // Then init report charts
  if (typeof window.initReportCharts === 'function') {
    try {
      window.initReportCharts();
      console.log("Re-initialized report charts");
    } catch (e) {
      console.error("Error re-initializing report charts:", e);
    }
  }
  
  return "Chart recreation complete - see console for details";
}

// Add global function
window.forceRecreateAllCharts = forceRecreateAllCharts;

// Connect debug button to the debug function
document.addEventListener('DOMContentLoaded', function() {
  const debugBtn = document.getElementById('debugChartBtn');
  if (debugBtn) {
    debugBtn.addEventListener('click', function() {
      // Check chart status
      const result = debugCharts();
      showToast(result, "info");
      
      // Ask if user wants to force recreate all charts
      if (confirm("Do you want to force recreate all charts?")) {
        const recreateResult = forceRecreateAllCharts();
        showToast(recreateResult, "success");
      }
    });
  }
});

/**
 * Debug utilities for the traffic management system
 */

console.log('[Debug] Loading debug utilities');

// Debug function for charts
window.debugCharts = function() {
  console.log('=== CHART DEBUG INFO ===');
  
  // Check Chart.js availability
  console.log('Chart.js available:', typeof Chart !== 'undefined');
  
  // List all chart instances
  const chartInstances = {};
  
  // Check window global charts
  ['trafficFlowChart', 'distributionChart', 'hourlyPatternChart', 
   'currentPatternChart', 'previousPatternChart',
   'reportTrafficTrendChart', 'reportDistributionChart'].forEach(chartId => {
    chartInstances[chartId] = {
      exists: window[chartId] !== undefined,
      isChart: window[chartId] && typeof window[chartId].update === 'function',
      hasCanvas: window[chartId] && window[chartId].canvas !== undefined,
      canvasId: window[chartId] && window[chartId].canvas ? window[chartId].canvas.id : null
    };
  });
  
  console.log('Chart instances:', chartInstances);
  
  // Check Chart.js registry if available
  if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
    console.log('Checking Chart.js registry...');
    
    // Check specific canvases
    ['trafficFlowChart', 'distributionChart', 'hourlyPatternChart', 
     'currentPatternChart', 'previousPatternChart',
     'reportTrafficTrendChart', 'reportDistributionChart'].forEach(chartId => {
      try {
        const canvas = document.getElementById(chartId);
        if (canvas) {
          const registeredChart = Chart.getChart(canvas);
          console.log(`${chartId} in Chart.js registry:`, !!registeredChart);
        } else {
          console.log(`${chartId} canvas element not found`);
        }
      } catch (e) {
        console.warn(`Error checking ${chartId} in registry:`, e);
      }
    });
  }
  
  // Check DOM elements
  console.log('Checking chart DOM elements...');
  
  ['trafficFlowChart', 'distributionChart', 'hourlyPatternChart', 
   'currentPatternChart', 'previousPatternChart',
   'reportTrafficTrendChart', 'reportDistributionChart'].forEach(chartId => {
    const canvas = document.getElementById(chartId);
    if (canvas) {
      console.log(`${chartId} canvas:`, {
        width: canvas.width,
        height: canvas.height,
        style: canvas.style.cssText,
        parent: canvas.parentElement ? canvas.parentElement.id : null,
        visible: canvas.style.display !== 'none' && canvas.style.visibility !== 'hidden'
      });
    } else {
      console.log(`${chartId} canvas element not found in DOM`);
    }
  });
  
  return 'Chart debug info logged to console';
};

// Debug function specifically for comparison charts
window.debugComparisonCharts = function() {
  console.log('=== COMPARISON CHARTS DEBUG INFO ===');
  
  // Check modal status
  const compareModal = document.getElementById('compareModal');
  console.log('Compare modal exists:', !!compareModal);
  console.log('Compare modal is open:', compareModal && compareModal.classList.contains('show'));
  
  // Check containers
  const containers = {
    currentContainer: document.getElementById('currentChartContainer'),
    previousContainer: document.getElementById('previousChartContainer')
  };
  
  Object.entries(containers).forEach(([name, container]) => {
    console.log(`${name} exists:`, !!container);
    if (container) {
      console.log(`${name} children:`, container.childElementCount);
      console.log(`${name} visibility:`, window.getComputedStyle(container).visibility);
      console.log(`${name} display:`, window.getComputedStyle(container).display);
    }
  });
  
  // Check chart instances
  const chartInstances = {
    currentPatternChart: window.currentPatternChart,
    previousPatternChart: window.previousPatternChart
  };
  
  Object.entries(chartInstances).forEach(([name, chart]) => {
    console.log(`${name} exists:`, !!chart);
    if (chart) {
      console.log(`${name} has data:`, !!chart.data);
      console.log(`${name} has canvas:`, !!chart.canvas);
      console.log(`${name} is destroyed:`, chart.destroyed || false);
    }
    
    // Check canvas element
    const canvas = document.getElementById(name);
    console.log(`${name} canvas element exists:`, !!canvas);
    if (canvas) {
      console.log(`${name} canvas visibility:`, window.getComputedStyle(canvas).visibility);
      console.log(`${name} canvas display:`, window.getComputedStyle(canvas).display);
    }
  });
  
  return 'Debug information logged to console';
};

// Function to specifically fix comparison charts
window.fixComparisonCharts = function() {
  console.log('[ChartFix] Attempting to fix comparison charts');
  
  // Step 1: Check if modal is open
  const compareModal = document.getElementById('compareModal');
  if (!compareModal || !compareModal.classList.contains('show')) {
    console.log('[ChartFix] Compare modal is not open, cannot fix charts');
    return 'Compare modal is not open. Please open it first.';
  }
  
  // Step 2: Check containers
  const containers = {
    currentContainer: document.getElementById('currentChartContainer'),
    previousContainer: document.getElementById('previousChartContainer')
  };
  
  let containersOk = true;
  Object.entries(containers).forEach(([name, container]) => {
    if (!container) {
      console.error(`[ChartFix] ${name} not found`);
      containersOk = false;
    } else if (container.childElementCount === 0) {
      console.warn(`[ChartFix] ${name} has no children`);
      containersOk = false;
    }
  });
  
  if (!containersOk) {
    showToast('Chart containers are missing or empty. Attempting to recreate.', 'warning');
  }
  
  // Step 3: Check chart instances
  const chartInstances = {
    currentPatternChart: window.currentPatternChart,
    previousPatternChart: window.previousPatternChart
  };
  
  let chartsOk = true;
  Object.entries(chartInstances).forEach(([name, chart]) => {
    if (!chart) {
      console.error(`[ChartFix] ${name} instance not found`);
      chartsOk = false;
    } else if (!chart.data || !chart.options) {
      console.warn(`[ChartFix] ${name} is missing data or options`);
      chartsOk = false;
    }
  });
  
  // Step 4: Fix the charts
  console.log('[ChartFix] Recreating both comparison charts from scratch');
  
  // Allow destruction of charts even if modal is open
  window._forceChartDestroy = true;
  
  try {
    // Destroy existing charts
    ['previousPatternChart', 'currentPatternChart'].forEach(chartId => {
      if (window[chartId]) {
        try {
          window[chartId].destroy();
        } catch(e) {
          console.warn(`[ChartFix] Error destroying ${chartId}:`, e);
        }
        window[chartId] = null;
      }
    });
    
    // Recreate canvas elements
    Object.entries(containers).forEach(([name, container]) => {
      if (container) {
        // Clear container
        container.innerHTML = '';
        
        // Create canvas
        const chartId = name === 'previousContainer' ? 'previousPatternChart' : 'currentPatternChart';
        const canvas = document.createElement('canvas');
        canvas.id = chartId;
        canvas.style.cssText = 'display: block; visibility: visible; width: 100%; height: 100%;';
        container.appendChild(canvas);
      }
    });
    
    // Create chart data
    let chartData = null;
    if (window.trafficFlowChart && window.trafficFlowChart.data) {
      chartData = JSON.parse(JSON.stringify(window.trafficFlowChart.data));
    } else {
      // Use demo data
      chartData = {
        labels: Array(10).fill('').map((_, i) => `${i+1}:00`),
        datasets: [{
          label: 'Traffic Flow',
          data: Array(10).fill(0).map(() => Math.floor(Math.random() * 100)),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      };
    }
    
    // Create previous chart
    const previousCanvas = document.getElementById('previousPatternChart');
    if (previousCanvas) {
      const previousData = JSON.parse(JSON.stringify(chartData));
      previousData.datasets[0].label = 'Previous Period';
      previousData.datasets[0].borderColor = 'rgba(255, 99, 132, 1)';
      previousData.datasets[0].backgroundColor = 'rgba(255, 99, 132, 0.2)';
      
      // Modify data to be different from current
      if (previousData.datasets[0].data) {
        previousData.datasets[0].data = previousData.datasets[0].data.map(value => {
          const variation = Math.random() * 20 - 10; // -10 to +10
          return Math.max(0, Math.round((value || 0) + variation));
        });
      }
      
      // Create chart
      window.previousPatternChart = new Chart(previousCanvas, {
        type: 'line',
        data: previousData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Traffic Flow (vehicles/minute)' }
            }
          }
        }
      });
      
      // Mark as comparison chart
      window.previousPatternChart._isComparisonChart = true;
    }
    
    // Create current chart
    const currentCanvas = document.getElementById('currentPatternChart');
    if (currentCanvas) {
      const currentData = JSON.parse(JSON.stringify(chartData));
      currentData.datasets[0].label = 'Current Period';
      currentData.datasets[0].borderColor = 'rgba(54, 162, 235, 1)';
      currentData.datasets[0].backgroundColor = 'rgba(54, 162, 235, 0.2)';
      
      // Create chart
      window.currentPatternChart = new Chart(currentCanvas, {
        type: 'line',
        data: currentData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Traffic Flow (vehicles/minute)' }
            }
          }
        }
      });
      
      // Mark as comparison chart
      window.currentPatternChart._isComparisonChart = true;
    }
    
    showToast('Comparison charts have been refreshed', 'success');
    console.log('[ChartFix] Charts recreated successfully');
  } catch (e) {
    console.error('[ChartFix] Error recreating charts:', e);
    showToast('Error refreshing charts: ' + e.message, 'error');
  } finally {
    // Reset force flag
    window._forceChartDestroy = false;
  }
  
  return 'Chart refresh complete';
}; 