/**
 * Chart Export Functions
 * Handles export functionality for Traffic Flow Analysis and Traffic Reports sections
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[ChartExport] Initializing chart export functions');
    
    // =============================================================
    // Traffic Flow Analysis Export Functionality
    // =============================================================
    
    // Get export buttons from Traffic Flow Analysis section
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportExcelBtn = document.getElementById('exportExcel');
    const exportPDFBtn = document.getElementById('exportPDF');
    
    // Add event listeners for traffic flow analysis export buttons
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic flow data as CSV');
            exportTrafficFlowAsCSV();
        });
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic flow data as Excel');
            exportTrafficFlowAsExcel();
        });
    }
    
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic flow data as PDF');
            exportTrafficFlowAsPDF();
        });
    }
    
    // =============================================================
    // Traffic Reports Export Functionality
    // =============================================================
    
    // Get export buttons from Traffic Reports section
    const exportReportCSVBtn = document.getElementById('exportReportCSV');
    const exportReportExcelBtn = document.getElementById('exportReportExcel');
    const exportReportPDFBtn = document.getElementById('exportReportPDF');
    
    // Add event listeners for traffic reports export buttons
    if (exportReportCSVBtn) {
        exportReportCSVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic report as CSV');
            exportTrafficReportAsCSV();
        });
    }
    
    if (exportReportExcelBtn) {
        exportReportExcelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic report as Excel');
            exportTrafficReportAsExcel();
        });
    }
    
    if (exportReportPDFBtn) {
        exportReportPDFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[ChartExport] Exporting traffic report as PDF');
            exportTrafficReportAsPDF();
        });
    }
});

// =============================================================
// Traffic Flow Analysis Export Functions
// =============================================================

/**
 * Export traffic flow chart data as CSV
 */
function exportTrafficFlowAsCSV() {
    if (!window.trafficFlowChart) {
        console.error("[ChartExport] Traffic flow chart not available");
        showToast("Error: Chart data not available", "error");
        return;
    }
    
    try {
        const chartData = window.trafficFlowChart.data;
        const filename = "traffic_flow_" + getCurrentDate();
        
        // Create CSV content
        let csvContent = "Time,Traffic Flow\n";
        for (let i = 0; i < chartData.labels.length; i++) {
            if (chartData.datasets[0].data[i] !== null) {
                csvContent += chartData.labels[i] + "," + chartData.datasets[0].data[i] + "\n";
            }
        }
        
        // Create and trigger download
        downloadBlob(
            new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
            filename + ".csv"
        );
        
        showToast("Traffic flow data exported as CSV", "success");
    } catch (error) {
        console.error("[ChartExport] CSV export error:", error);
        showToast("Failed to export as CSV: " + error.message, "error");
    }
}

/**
 * Export traffic flow chart data as Excel
 */
function exportTrafficFlowAsExcel() {
    if (!window.trafficFlowChart) {
        console.error("[ChartExport] Traffic flow chart not available");
        showToast("Error: Chart data not available", "error");
        return;
    }
    
    try {
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            showToast("Excel export library not available. Using CSV instead.", "warning");
            exportTrafficFlowAsCSV();
            return;
        }
        
        const chartData = window.trafficFlowChart.data;
        const filename = "traffic_flow_" + getCurrentDate();
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([["Time", "Traffic Flow"]]);
        const data = [];
        
        for (let i = 0; i < chartData.labels.length; i++) {
            if (chartData.datasets[0].data[i] !== null) {
                data.push([chartData.labels[i], chartData.datasets[0].data[i]]);
            }
        }
        
        XLSX.utils.sheet_add_aoa(ws, data, {origin: -1});
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Traffic Flow Data");
        
        // Save file
        XLSX.writeFile(wb, filename + ".xlsx");
        
        showToast("Traffic flow data exported as Excel", "success");
    } catch (error) {
        console.error("[ChartExport] Excel export error:", error);
        showToast("Failed to export as Excel. Using CSV instead.", "warning");
        exportTrafficFlowAsCSV();
    }
}

/**
 * Export traffic flow chart data as PDF
 */
function exportTrafficFlowAsPDF() {
    if (!window.trafficFlowChart) {
        console.error("[ChartExport] Traffic flow chart not available");
        showToast("Error: Chart data not available", "error");
        return;
    }
    
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            showToast("PDF export library not available. Using CSV instead.", "warning");
            exportTrafficFlowAsCSV();
            return;
        }
        
        const chartElement = document.getElementById('trafficFlowChart');
        const chartData = window.trafficFlowChart.data;
        const filename = "traffic_flow_" + getCurrentDate();
        
        // Create PDF
        const jsPDFInstance = typeof window.jspdf !== 'undefined' ? window.jspdf.jsPDF : window.jsPDF;
        const pdf = new jsPDFInstance('landscape');
        
        // Add title
        pdf.setFontSize(18);
        pdf.text('Traffic Flow Analysis', 14, 22);
        
        // Add date
        pdf.setFontSize(11);
        pdf.text('Generated: ' + new Date().toLocaleString(), 14, 30);
        
        // Add chart as image if possible
        try {
            const chartImage = chartElement.toDataURL('image/png', 1.0);
            pdf.addImage(chartImage, 'PNG', 14, 40, 270, 100);
        } catch (imageError) {
            console.warn("[ChartExport] Could not add chart image to PDF:", imageError);
        }
        
        // Add data table
        pdf.setFontSize(12);
        pdf.text('Traffic Flow Data Table', 14, 150);
        
        // Convert chart data to table format
        const tableData = [];
        for (let i = 0; i < chartData.labels.length; i++) {
            if (chartData.datasets[0].data[i] !== null) {
                tableData.push([chartData.labels[i], chartData.datasets[0].data[i]]);
            }
        }
        
        // Add auto table if available
        if (pdf.autoTable) {
            pdf.autoTable({
                head: [['Time', 'Traffic Flow']],
                body: tableData,
                startY: 155,
                margin: { horizontal: 14 },
                styles: { overflow: 'linebreak' },
                columnStyles: { 0: { cellWidth: 50 } }
            });
        } else {
            // Fallback to simple table
            pdf.setFontSize(10);
            let y = 155;
            pdf.text('Time', 14, y);
            pdf.text('Traffic Flow', 64, y);
            y += 5;
            
            tableData.slice(0, 20).forEach(row => {
                pdf.text(String(row[0]), 14, y);
                pdf.text(String(row[1]), 64, y);
                y += 5;
            });
            
            if (tableData.length > 20) {
                pdf.text(`... and ${tableData.length - 20} more rows`, 14, y + 5);
            }
        }
        
        // Save the PDF
        pdf.save(filename + ".pdf");
        
        showToast("Traffic flow data exported as PDF", "success");
    } catch (error) {
        console.error("[ChartExport] PDF export error:", error);
        showToast("Failed to export as PDF. Using CSV instead.", "warning");
        exportTrafficFlowAsCSV();
    }
}

// =============================================================
// Traffic Reports Export Functions
// =============================================================

/**
 * Export traffic report data as CSV
 */
function exportTrafficReportAsCSV() {
    try {
        // Get report data
        const reportData = getTrafficReportData();
        const filename = "traffic_report_" + getCurrentDate();
        
        // Create CSV content
        let csvContent = "Metric,Value\n";
        Object.entries(reportData.summary).forEach(([key, value]) => {
            csvContent += `${key},${value}\n`;
        });
        
        csvContent += "\nTraffic Trend\n";
        csvContent += "Time,Volume\n";
        
        for (let i = 0; i < reportData.trend.labels.length; i++) {
            csvContent += `${reportData.trend.labels[i]},${reportData.trend.data[i]}\n`;
        }
        
        csvContent += "\nVehicle Distribution\n";
        csvContent += "Type,Percentage\n";
        
        Object.entries(reportData.distribution).forEach(([key, value]) => {
            csvContent += `${key},${value}\n`;
        });
        
        // Create and trigger download
        downloadBlob(
            new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
            filename + ".csv"
        );
        
        showToast("Traffic report exported as CSV", "success");
    } catch (error) {
        console.error("[ChartExport] CSV report export error:", error);
        showToast("Failed to export report as CSV: " + error.message, "error");
    }
}

/**
 * Export traffic report data as Excel
 */
function exportTrafficReportAsExcel() {
    try {
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            showToast("Excel export library not available. Using CSV instead.", "warning");
            exportTrafficReportAsCSV();
            return;
        }
        
        // Get report data
        const reportData = getTrafficReportData();
        const filename = "traffic_report_" + getCurrentDate();
        
        // Create summary worksheet
        const summaryWS = XLSX.utils.aoa_to_sheet([["Metric", "Value"]]);
        const summaryData = Object.entries(reportData.summary).map(([key, value]) => [key, value]);
        XLSX.utils.sheet_add_aoa(summaryWS, summaryData, {origin: -1});
        
        // Create trend worksheet
        const trendWS = XLSX.utils.aoa_to_sheet([["Time", "Volume"]]);
        const trendData = reportData.trend.labels.map((label, index) => [
            label, reportData.trend.data[index]
        ]);
        XLSX.utils.sheet_add_aoa(trendWS, trendData, {origin: -1});
        
        // Create distribution worksheet
        const distributionWS = XLSX.utils.aoa_to_sheet([["Vehicle Type", "Percentage"]]);
        const distributionData = Object.entries(reportData.distribution).map(([key, value]) => [key, value]);
        XLSX.utils.sheet_add_aoa(distributionWS, distributionData, {origin: -1});
        
        // Create workbook and add sheets
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
        XLSX.utils.book_append_sheet(wb, trendWS, "Traffic Trend");
        XLSX.utils.book_append_sheet(wb, distributionWS, "Vehicle Distribution");
        
        // Save file
        XLSX.writeFile(wb, filename + ".xlsx");
        
        showToast("Traffic report exported as Excel", "success");
    } catch (error) {
        console.error("[ChartExport] Excel report export error:", error);
        showToast("Failed to export report as Excel. Using CSV instead.", "warning");
        exportTrafficReportAsCSV();
    }
}

/**
 * Export traffic report data as PDF
 */
function exportTrafficReportAsPDF() {
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            showToast("PDF export library not available. Using CSV instead.", "warning");
            exportTrafficReportAsCSV();
            return;
        }
        
        // Get report data
        const reportData = getTrafficReportData();
        const filename = "traffic_report_" + getCurrentDate();
        
        // Get chart elements
        const trendChartElement = document.getElementById('reportTrafficTrendChart');
        const distributionChartElement = document.getElementById('reportDistributionChart');
        
        // Create PDF
        const jsPDFInstance = typeof window.jspdf !== 'undefined' ? window.jspdf.jsPDF : window.jsPDF;
        const pdf = new jsPDFInstance();
        
        // Add title
        pdf.setFontSize(18);
        pdf.text('Traffic Report', 14, 22);
        
        // Add date
        pdf.setFontSize(11);
        pdf.text('Generated: ' + new Date().toLocaleString(), 14, 30);
        
        // Add summary section
        pdf.setFontSize(14);
        pdf.text('Summary', 14, 40);
        
        // Add summary data
        pdf.setFontSize(10);
        let y = 50;
        Object.entries(reportData.summary).forEach(([key, value]) => {
            pdf.text(`${key}: ${value}`, 14, y);
            y += 7;
        });
        
        // Add trend chart if possible
        if (trendChartElement) {
            try {
                pdf.setFontSize(14);
                pdf.text('Traffic Trend', 14, y + 10);
                const trendImage = trendChartElement.toDataURL('image/png', 1.0);
                pdf.addImage(trendImage, 'PNG', 14, y + 15, 180, 80);
                y += 105;
            } catch (imageError) {
                console.warn("[ChartExport] Could not add trend chart image to PDF:", imageError);
                y += 20;
            }
        }
        
        // Add distribution chart if possible
        if (distributionChartElement) {
            try {
                pdf.setFontSize(14);
                pdf.text('Vehicle Distribution', 14, y);
                const distImage = distributionChartElement.toDataURL('image/png', 1.0);
                pdf.addImage(distImage, 'PNG', 14, y + 5, 100, 80);
                y += 90;
            } catch (imageError) {
                console.warn("[ChartExport] Could not add distribution chart image to PDF:", imageError);
                y += 20;
            }
        }
        
        // Add distribution data as a table
        pdf.setFontSize(12);
        pdf.text('Vehicle Distribution Data', 14, y);
        
        // Convert distribution data to table
        const distData = Object.entries(reportData.distribution).map(([key, value]) => [key, value]);
        
        // Add auto table if available
        if (pdf.autoTable) {
            pdf.autoTable({
                head: [['Vehicle Type', 'Percentage']],
                body: distData,
                startY: y + 5,
                margin: { horizontal: 14 },
                styles: { overflow: 'linebreak' }
            });
        } else {
            // Fallback to simple table
            pdf.setFontSize(10);
            y += 10;
            pdf.text('Vehicle Type', 14, y);
            pdf.text('Percentage', 80, y);
            y += 5;
            
            distData.forEach(row => {
                pdf.text(String(row[0]), 14, y);
                pdf.text(String(row[1]), 80, y);
                y += 7;
            });
        }
        
        // Save the PDF
        pdf.save(filename + ".pdf");
        
        showToast("Traffic report exported as PDF", "success");
    } catch (error) {
        console.error("[ChartExport] PDF report export error:", error);
        showToast("Failed to export report as PDF. Using CSV instead.", "warning");
        exportTrafficReportAsCSV();
    }
}

// =============================================================
// Helper Functions
// =============================================================

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Download blob as a file
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get traffic report data from the UI
 */
function getTrafficReportData() {
    // Default data structure
    const reportData = {
        summary: {
            'Total Traffic Volume': document.getElementById('reportTotalVolume')?.textContent || '28,452',
            'Average Traffic Flow': document.getElementById('reportAvgFlow')?.textContent || '47 vehicles/min',
            'Peak Traffic Hours': document.getElementById('reportPeakHours')?.textContent || '17:00',
            'Incidents Recorded': document.getElementById('reportIncidents')?.textContent || '5'
        },
        trend: {
            labels: [],
            data: []
        },
        distribution: {
            'Cars': '65%',
            'Trucks': '15%',
            'Motorcycles': '12%',
            'Buses': '8%'
        }
    };
    
    // Try to get data from the chart if available
    try {
        const trendChart = Chart.getChart('reportTrafficTrendChart');
        if (trendChart) {
            reportData.trend.labels = trendChart.data.labels;
            reportData.trend.data = trendChart.data.datasets[0].data;
        }
        
        const distChart = Chart.getChart('reportDistributionChart');
        if (distChart) {
            const labels = distChart.data.labels;
            const data = distChart.data.datasets[0].data;
            
            // Convert to percentage
            const total = data.reduce((sum, val) => sum + val, 0);
            labels.forEach((label, i) => {
                const percentage = total > 0 ? ((data[i] / total) * 100).toFixed(1) + '%' : '0%';
                reportData.distribution[label] = percentage;
            });
        }
    } catch (error) {
        console.warn("[ChartExport] Could not get chart data:", error);
    }
    
    // Try to get direction distribution data
    try {
        const northbound = document.getElementById('reportNorthbound')?.textContent || '45%';
        const southbound = document.getElementById('reportSouthbound')?.textContent || '55%';
        
        reportData.distribution['Northbound'] = northbound;
        reportData.distribution['Southbound'] = southbound;
    } catch (error) {
        console.warn("[ChartExport] Could not get direction data:", error);
    }
    
    return reportData;
} 