/**
 * Incident Export Functions
 * Provides functionality to export incident data in various formats
 */

// Use an IIFE to ensure immediate execution and scope isolation
(function() {
    console.log('[ExportFunctions] Initializing enhanced export functionality');
    
    // Make the showExportDialog function available globally
    window.showExportDialog = showExportDialog;
    
    // Wait for DOM to be ready before initializing
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a short time to ensure Bootstrap is fully initialized
        setTimeout(initExportFunctions, 300);
    });
    
    // Function to initialize export functionality
    function initExportFunctions() {
        console.log('[ExportFunctions] Setting up export button listeners');
        
        // Check if already initialized
        if (document.body.getAttribute('data-export-functions-initialized') === 'true') {
            console.log('[ExportFunctions] Already initialized, skipping');
            return;
        }
        
        // Get all export buttons in both dropdowns with their new IDs
        // Dashboard export buttons
        const dashboardExportPDFBtn = document.getElementById('dashboardExportPDF');
        const dashboardExportCSVBtn = document.getElementById('dashboardExportCSV');
        const dashboardExportExcelBtn = document.getElementById('dashboardExportExcel');
        
        // Incident export buttons
        const incidentExportPDFBtn = document.getElementById('incidentExportPDF');
        const incidentExportCSVBtn = document.getElementById('incidentExportCSV');
        const incidentExportExcelBtn = document.getElementById('incidentExportExcel');
        const incidentExportJSONBtn = document.getElementById('incidentExportJSON');
        
        // Report export buttons
        const reportExportPDFBtn = document.getElementById('exportReportPDF');
        const reportExportCSVBtn = document.getElementById('exportReportCSV');
        const reportExportExcelBtn = document.getElementById('exportReportExcel');
        
        // Set up Dashboard format-specific export buttons
        if (dashboardExportPDFBtn) {
            replaceWithCleanCopy(dashboardExportPDFBtn, () => showExportDialog('pdf', 'dashboard'));
        }
        
        if (dashboardExportCSVBtn) {
            replaceWithCleanCopy(dashboardExportCSVBtn, () => showExportDialog('csv', 'dashboard'));
        }
        
        if (dashboardExportExcelBtn) {
            replaceWithCleanCopy(dashboardExportExcelBtn, () => showExportDialog('excel', 'dashboard'));
        }
        
        // Set up Incident format-specific export buttons
        if (incidentExportPDFBtn) {
            replaceWithCleanCopy(incidentExportPDFBtn, () => showExportDialog('pdf', 'incident'));
        }
        
        if (incidentExportCSVBtn) {
            replaceWithCleanCopy(incidentExportCSVBtn, () => showExportDialog('csv', 'incident'));
        }
        
        if (incidentExportExcelBtn) {
            replaceWithCleanCopy(incidentExportExcelBtn, () => showExportDialog('excel', 'incident'));
        }
        
        if (incidentExportJSONBtn) {
            replaceWithCleanCopy(incidentExportJSONBtn, () => showExportDialog('json', 'incident'));
        }
        
        // Set up Report format-specific export buttons
        if (reportExportPDFBtn) {
            replaceWithCleanCopy(reportExportPDFBtn, () => showExportDialog('pdf', 'report'));
        }
        
        if (reportExportCSVBtn) {
            replaceWithCleanCopy(reportExportCSVBtn, () => showExportDialog('csv', 'report'));
        }
        
        if (reportExportExcelBtn) {
            replaceWithCleanCopy(reportExportExcelBtn, () => showExportDialog('excel', 'report'));
        }
        
        // Don't touch the main export buttons as they're managed by Bootstrap
        ['exportDropdown', 'exportIncidents', 'exportReportDropdown'].forEach(id => {
            const exportBtn = document.getElementById(id);
            if (exportBtn) {
                // Just mark it as initialized but don't add any events
                exportBtn.setAttribute('data-export-initialized', 'true');
            }
        });
        
        // Mark as initialized
        document.body.setAttribute('data-export-functions-initialized', 'true');
        console.log('[ExportFunctions] Export functionality initialized successfully');
    }
    
    // Helper function to safely replace an element with a clean copy and add a click handler
    function replaceWithCleanCopy(element, clickHandler) {
        if (!element || !element.parentNode) return;
        
        // Clone the element
        const clone = element.cloneNode(true);
        
        // Set up the new event listener that won't interfere with dropdowns
        clone.addEventListener('click', function(e) {
            // Allow the event to bubble up to close the dropdown properly
            // and only prevent default when the handler is executed
            setTimeout(() => {
                clickHandler();
            }, 10);
        });
        
        // Replace the original
        element.parentNode.replaceChild(clone, element);
    }
    
    // Function to show the export dialog
    function showExportDialog(defaultFormat = 'pdf', exportType = 'incident') {
        console.log(`[ExportFunctions] Showing ${exportType} export dialog with format:`, defaultFormat);
        
        // Create modal if it doesn't exist
        let exportModal = document.getElementById('incidentExportModal');
        if (!exportModal) {
            exportModal = createExportModal();
            document.body.appendChild(exportModal);
        }
        
        // Set title based on export type
        const modalTitle = exportModal.querySelector('.modal-title');
        if (modalTitle) {
            if (exportType === 'dashboard') {
                modalTitle.innerHTML = '<i class="bi bi-file-earmark-arrow-down me-2"></i>Export Traffic Flow Data';
            } else if (exportType === 'report') {
                modalTitle.innerHTML = '<i class="bi bi-file-earmark-arrow-down me-2"></i>Export Report Data';
            } else {
                modalTitle.innerHTML = '<i class="bi bi-file-earmark-arrow-down me-2"></i>Export Incidents';
            }
        }
        
        // Set the default filename with current date
        const dateInput = document.getElementById('exportFilename');
        if (dateInput) {
            let prefix = 'traffic_incidents';
            if (exportType === 'dashboard') {
                prefix = 'traffic_flow';
            } else if (exportType === 'report') {
                prefix = 'traffic_report';
            }
            dateInput.value = `${prefix}_${getCurrentDate()}`;
        }
        
        // Set the default format if specified
        const formatSelect = document.getElementById('exportFormat');
        if (formatSelect && defaultFormat) {
            formatSelect.value = defaultFormat;
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(exportModal);
        modal.show();
    }
    
    // Create the export modal
    function createExportModal() {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal fade';
        modalDiv.id = 'incidentExportModal';
        modalDiv.setAttribute('tabindex', '-1');
        modalDiv.setAttribute('aria-hidden', 'true');
        
        modalDiv.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-file-earmark-arrow-down me-2"></i>Export Incidents</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="exportFormat" class="form-label">Export Format</label>
                            <select class="form-select" id="exportFormat">
                                <option value="pdf">PDF Document (.pdf)</option>
                                <option value="excel">Excel Spreadsheet (.xlsx)</option>
                                <option value="csv">CSV File (.csv)</option>
                                <option value="json">JSON File (.json)</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Export Options</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportVisible" checked>
                                <label class="form-check-label" for="exportVisible">Export visible incidents only</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportIncludeDetails" checked>
                                <label class="form-check-label" for="exportIncludeDetails">Include full details</label>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="exportFilename" class="form-label">Filename</label>
                            <input type="text" class="form-control" id="exportFilename">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="downloadExportBtn">
                            <i class="bi bi-file-earmark-arrow-down me-2"></i>Export
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners after the modal is created
        setTimeout(() => {
            const downloadBtn = document.getElementById('downloadExportBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', handleExport);
            }
        }, 100);
        
        return modalDiv;
    }
    
    // Handle the export action
    function handleExport() {
        const downloadBtn = this;
        const originalText = downloadBtn.innerHTML;
        
        // Show loading state
        downloadBtn.innerHTML = '<i class="bi bi-arrow-repeat spin me-2"></i>Exporting...';
        downloadBtn.disabled = true;
        
        try {
            // Get export settings
            const format = document.getElementById('exportFormat').value;
            const visibleOnly = document.getElementById('exportVisible').checked;
            const includeDetails = document.getElementById('exportIncludeDetails').checked;
            const filename = document.getElementById('exportFilename').value || `traffic_incidents_${getCurrentDate()}`;
            
            // Get the incidents table
            const incidentsTable = document.querySelector('.incidents-table');
            if (!incidentsTable) {
                throw new Error('Incidents table not found');
            }
            
            // Get rows
            const rows = Array.from(incidentsTable.querySelectorAll('tbody tr'));
            if (rows.length === 0) {
                throw new Error('No incidents to export');
            }
            
            // Filter visible rows if needed
            const rowsToExport = visibleOnly ? rows.filter(row => row.style.display !== 'none') : rows;
            if (rowsToExport.length === 0) {
                throw new Error('No visible incidents to export');
            }
            
            // Extract data
            const data = extractTableData(rowsToExport, includeDetails);
            console.log('Extracted data:', data);
            
            // Hide the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('incidentExportModal'));
            if (modal) modal.hide();
            
            // Perform the export based on format
            switch (format.toLowerCase()) {
                case 'pdf':
                    downloadPDF(data, filename);
                    break;
                case 'excel':
                    downloadExcel(data, filename);
                    break;
                case 'csv':
                    downloadCSV(data, filename);
                    break;
                case 'json':
                    downloadJSON(data, filename);
                    break;
                default:
                    showToast(`Unsupported format: ${format}`, 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast(`Export failed: ${error.message}`, 'error');
        } finally {
            // Reset button state
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }
    
    // Extract data from table rows
    function extractTableData(rows, includeDetails) {
        const data = [];
        
        rows.forEach(row => {
            // Use data-label attributes to get the data
            const dateTimeCell = row.querySelector('td[data-label="Date & Time"]');
            const typeCell = row.querySelector('td[data-label="Type"]');
            const locationCell = row.querySelector('td[data-label="Location"]');
            const severityCell = row.querySelector('td[data-label="Severity"]');
            const statusCell = row.querySelector('td[data-label="Status"]');
            const responseTimeCell = row.querySelector('td[data-label="Response Time"]');
            
            // Basic data object
            const item = {
                'Date & Time': dateTimeCell ? dateTimeCell.textContent.trim() : '-',
                'Type': typeCell ? typeCell.textContent.trim() : '-',
                'Location': locationCell ? locationCell.querySelector('span')?.textContent.trim() : '-',
                'Severity': severityCell ? severityCell.textContent.trim() : '-',
                'Status': statusCell ? statusCell.textContent.trim() : '-',
                'Response Time': responseTimeCell ? responseTimeCell.querySelector('span')?.textContent.trim() : '-'
            };
            
            // Additional details if needed
            if (includeDetails && row.id) {
                item['ID'] = row.id.replace('incident-', '');
            }
            
            data.push(item);
        });
        
        return data;
    }
    
    // Download PDF file
    function downloadPDF(data, filename) {
        // Show toast notification
        showToast('Preparing PDF file...', 'info');
        
        try {
            // Create document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set title
            doc.setFontSize(16);
            doc.text('Traffic Incidents Report', 15, 15);
            
            // Set date
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);
            
            // Create table
            const headers = Object.keys(data[0]);
            const rows = data.map(item => Object.values(item));
            
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: 30,
                margin: { horizontal: 10 },
                styles: { overflow: 'linebreak' },
                columnStyles: { 0: { cellWidth: 30 } }
            });
            
            // Save the PDF
            doc.save(`${filename}.pdf`);
            showToast('PDF file exported successfully', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            showToast(`PDF export failed: ${error.message}`, 'error');
            
            // Try alternative method using dataURL
            try {
                showToast('Trying alternative export method...', 'info');
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Set title
                doc.setFontSize(16);
                doc.text('Traffic Incidents Report', 15, 15);
                
                // Create basic table
                const tableData = [];
                tableData.push(Object.keys(data[0])); // Headers
                
                data.forEach(item => {
                    tableData.push(Object.values(item));
                });
                
                // Draw table
                doc.setFontSize(10);
                let y = 30;
                
                tableData.forEach((row, rowIndex) => {
                    let x = 10;
                    
                    row.forEach((cell, cellIndex) => {
                        doc.text(String(cell).substring(0, 25), x, y);
                        x += 30;
                    });
                    
                    y += 10;
                });
                
                // Generate data URL and create download link
                const pdfDataUrl = doc.output('datauristring');
                
                const link = document.createElement('a');
                link.href = pdfDataUrl;
                link.download = `${filename}.pdf`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showToast('PDF exported using alternative method', 'success');
            } catch (fallbackError) {
                console.error('PDF fallback export error:', fallbackError);
                showToast('PDF export failed. Please try a different format.', 'error');
            }
        }
    }
    
    // Download Excel file
    function downloadExcel(data, filename) {
        showToast('Preparing Excel file...', 'info');
        
        try {
            // Create a new workbook
            const wb = XLSX.utils.book_new();
            
            // Create worksheet from data
            const ws = XLSX.utils.json_to_sheet(data);
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Incidents');
            
            // Generate file and trigger download
            XLSX.writeFile(wb, `${filename}.xlsx`);
            
            showToast('Excel file exported successfully', 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            showToast(`Excel export failed: ${error.message}`, 'error');
        }
    }
    
    // Download CSV file
    function downloadCSV(data, filename) {
        showToast('Preparing CSV file...', 'info');
        
        try {
            // Get headers from first data item
            const headers = Object.keys(data[0]);
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            // Add rows
            data.forEach(item => {
                const row = headers.map(header => {
                    // Get value and escape if needed
                    let value = item[header] || '';
                    
                    // Remove HTML tags if any
                    value = value.replace(/<[^>]*>/g, '').trim();
                    
                    // Escape commas and quotes
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    
                    return value;
                });
                
                csvContent += row.join(',') + '\n';
            });
            
            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showToast('CSV file exported successfully', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showToast(`CSV export failed: ${error.message}`, 'error');
        }
    }
    
    // Download JSON file
    function downloadJSON(data, filename) {
        showToast('Preparing JSON file...', 'info');
        
        try {
            // Convert data to formatted JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.json`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showToast('JSON file exported successfully', 'success');
        } catch (error) {
            console.error('JSON export error:', error);
            showToast(`JSON export failed: ${error.message}`, 'error');
        }
    }
    
    // Helper function to get current date in YYYY-MM-DD format
    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
})(); 