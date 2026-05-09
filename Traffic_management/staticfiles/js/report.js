/**
 * Report and Incident Management JS
 * Handles functionality for incident filtering, exporting, and refreshing
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const filterBtn = document.getElementById('filterIncidents');
    const exportBtn = document.getElementById('exportIncidents');
    const refreshBtn = document.getElementById('refreshIncidents');
    const incidentsTable = document.querySelector('.incidents-table');
    
    if (!filterBtn || !exportBtn || !refreshBtn || !incidentsTable) {
        console.warn('Some incident management elements not found');
        return;
    }
    
    // ===== FILTER FUNCTIONALITY =====
    filterBtn.addEventListener('click', function() {
        showToast('Opening incident filter options', 'info');
        
        // Create filter modal dynamically if it doesn't exist
        let filterModal = document.getElementById('incidentFilterModal');
        if (!filterModal) {
            filterModal = document.createElement('div');
            filterModal.className = 'modal fade';
            filterModal.id = 'incidentFilterModal';
            filterModal.setAttribute('tabindex', '-1');
            filterModal.setAttribute('aria-hidden', 'true');
            
            filterModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="bi bi-funnel me-2"></i>Filter Incidents</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="incidentFilterForm">
                                <div class="mb-3">
                                    <label class="form-label">Incident Type</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterAccident" checked>
                                        <label class="form-check-label" for="filterAccident">Accidents</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterCongestion" checked>
                                        <label class="form-check-label" for="filterCongestion">Congestion</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterSignal" checked>
                                        <label class="form-check-label" for="filterSignal">Signal Malfunction</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterOther" checked>
                                        <label class="form-check-label" for="filterOther">Other</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterActive" checked>
                                        <label class="form-check-label" for="filterActive">Active</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterResolved" checked>
                                        <label class="form-check-label" for="filterResolved">Resolved</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Severity</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterHigh" checked>
                                        <label class="form-check-label" for="filterHigh">High</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterMedium" checked>
                                        <label class="form-check-label" for="filterMedium">Medium</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="filterLow" checked>
                                        <label class="form-check-label" for="filterLow">Low</label>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="filterDateFrom" class="form-label">Date Range</label>
                                    <div class="row g-2">
                                        <div class="col">
                                            <input type="date" class="form-control" id="filterDateFrom" placeholder="From">
                                        </div>
                                        <div class="col">
                                            <input type="date" class="form-control" id="filterDateTo" placeholder="To">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-outline-secondary" id="resetFilters">Reset</button>
                            <button type="button" class="btn btn-primary" id="applyFilters">Apply Filters</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(filterModal);
            
            // Initialize the modal
            const modal = new bootstrap.Modal(filterModal);
            
            // Reset filters button
            document.getElementById('resetFilters').addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('#incidentFilterForm input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = true);
                
                document.getElementById('filterDateFrom').value = '';
                document.getElementById('filterDateTo').value = '';
            });
            
            // Apply filters button
            document.getElementById('applyFilters').addEventListener('click', function() {
                applyIncidentFilters();
                modal.hide();
            });
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(filterModal);
        modal.show();
    });
    
    // Apply incident filters based on form selections
    function applyIncidentFilters() {
        // Get filter values
        const filterTypeAccident = document.getElementById('filterAccident').checked;
        const filterTypeCongestion = document.getElementById('filterCongestion').checked;
        const filterTypeSignal = document.getElementById('filterSignal').checked;
        const filterTypeOther = document.getElementById('filterOther').checked;
        
        const filterStatusActive = document.getElementById('filterActive').checked;
        const filterStatusResolved = document.getElementById('filterResolved').checked;
        
        const filterSeverityHigh = document.getElementById('filterHigh').checked;
        const filterSeverityMedium = document.getElementById('filterMedium').checked;
        const filterSeverityLow = document.getElementById('filterLow').checked;
        
        const filterDateFrom = document.getElementById('filterDateFrom').value;
        const filterDateTo = document.getElementById('filterDateTo').value;
        
        // Get all rows except header
        const rows = Array.from(incidentsTable.querySelectorAll('tbody tr'));
        
        // Filter rows
        rows.forEach(row => {
            let showRow = true;
            
            // Type filtering
            const rowType = row.querySelector('td:nth-child(2) .badge').textContent.trim();
            if (
                (rowType.includes('Accident') && !filterTypeAccident) ||
                (rowType.includes('Congestion') && !filterTypeCongestion) ||
                (rowType.includes('Signal') && !filterTypeSignal) ||
                (!rowType.includes('Accident') && !rowType.includes('Congestion') && !rowType.includes('Signal') && !filterTypeOther)
            ) {
                showRow = false;
            }
            
            // Status filtering
            if (showRow) {
                const rowStatus = row.querySelector('td:nth-child(5) .badge').textContent.trim();
                if (
                    ((rowStatus.includes('Progress') || rowStatus.includes('Active')) && !filterStatusActive) ||
                    (rowStatus.includes('Resolved') && !filterStatusResolved)
                ) {
                    showRow = false;
                }
            }
            
            // Severity filtering
            if (showRow) {
                const rowSeverity = row.querySelector('td:nth-child(4) .badge').textContent.trim();
                if (
                    (rowSeverity === 'High' && !filterSeverityHigh) ||
                    (rowSeverity === 'Medium' && !filterSeverityMedium) ||
                    (rowSeverity === 'Low' && !filterSeverityLow)
                ) {
                    showRow = false;
                }
            }
            
            // Date filtering
            if (showRow && (filterDateFrom || filterDateTo)) {
                const rowDateText = row.querySelector('td:nth-child(1) span').textContent.trim();
                const rowDate = new Date(rowDateText);
                
                if (filterDateFrom && new Date(filterDateFrom) > rowDate) {
                    showRow = false;
                }
                
                if (filterDateTo && new Date(filterDateTo) < rowDate) {
                    showRow = false;
                }
            }
            
            // Show or hide row
            row.style.display = showRow ? '' : 'none';
        });
        
        // Show toast notification
        const visibleRows = rows.filter(row => row.style.display !== 'none').length;
        showToast(`Showing ${visibleRows} of ${rows.length} incidents`, 'success');
    }
    
    // ===== EXPORT FUNCTIONALITY =====
    // We're letting export_functions.js handle the exports, so we should not add any additional event listeners
    // to the exportBtn that might interfere with the dropdown functionality
    if (exportBtn) {
        console.log('[Report] Export button found, ensuring it works with dropdown functionality');
        
        // Ensure the export button has the right attributes for Bootstrap dropdown
        if (!exportBtn.hasAttribute('data-bs-toggle')) {
            exportBtn.setAttribute('data-bs-toggle', 'dropdown');
        }
        
        // Mark it as seen by this script to avoid duplicate handlers
        exportBtn.setAttribute('data-report-processed', 'true');
        
        // Note: We're NOT adding any click handlers as Bootstrap will manage the dropdown functionality
    }
    
    // Fallback export dialog in case export_functions.js isn't loaded - only called from elsewhere
    function showExportFallbackDialog() {
        showToast('Opening export options', 'info');
        
        // Create a simple fallback export modal if needed
        let exportModal = document.getElementById('simpleFallbackExportModal');
        if (!exportModal) {
            exportModal = document.createElement('div');
            exportModal.className = 'modal fade';
            exportModal.id = 'simpleFallbackExportModal';
            
            exportModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="bi bi-file-earmark-arrow-down me-2"></i>Export Incidents</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>This is a fallback export dialog. For full export functionality, ensure export_functions.js is loaded.</p>
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>Export functionality will be available in a future update.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(exportModal);
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(exportModal);
        modal.show();
    }
    
    // ===== REFRESH FUNCTIONALITY =====
    refreshBtn.addEventListener('click', function() {
        showToast('Refreshing incident data...', 'info');
        
        // Simulate loading spinner on the button
        refreshBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1 spin"></i>Refreshing';
        refreshBtn.disabled = true;
        
        // Simulate data fetch
        setTimeout(() => {
            // Restore button
            refreshBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Refresh';
            refreshBtn.disabled = false;
            
            // Update timestamp display in the table
            updateIncidentTimestamps();
            
            showToast('Incident data refreshed successfully', 'success');
        }, 1500);
    });
    
    // Update relative timestamps for incidents
    function updateIncidentTimestamps() {
        // Get timestamp elements
        const timestamps = document.querySelectorAll('.incidents-table tbody tr td:first-child small');
        timestamps.forEach(timestamp => {
            // For this demo, we'll just randomize the timestamps
            const randomTimes = ['just now', '1 minute ago', '5 minutes ago', '10 minutes ago', '30 minutes ago', '1 hour ago'];
            const randomIndex = Math.floor(Math.random() * randomTimes.length);
            timestamp.textContent = randomTimes[randomIndex];
        });
    }
    
    // Debug helper for incidents table
    function debugIncidentsTable() {
        console.group('Incidents Table Debug');
        
        try {
            if (!incidentsTable) {
                console.error('Incidents table not found');
                return;
            }
            
            const rows = Array.from(incidentsTable.querySelectorAll('tbody tr'));
            console.log(`Found ${rows.length} rows in table`);
            
            const headerRow = incidentsTable.querySelector('thead tr');
            const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim()) : [];
            console.log('Table headers:', headers);
            
            if (rows.length > 0) {
                const firstRow = rows[0];
                console.log('First row HTML structure:', firstRow.outerHTML);
                
                const cells = Array.from(firstRow.querySelectorAll('td'));
                console.log(`First row has ${cells.length} cells`);
                
                cells.forEach((cell, i) => {
                    console.log(`Cell ${i + 1} content:`, cell.innerHTML);
                });
                
                // Test extraction from first row
                const testData = extractTableData([firstRow]);
                console.log('Extracted data from first row:', testData[0]);
            }
        } catch (err) {
            console.error('Debug error:', err);
        }
        
        console.groupEnd();
    }
    
    // Add some CSS for the spinner
    const style = document.createElement('style');
    style.textContent = `
        .spin {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}); 