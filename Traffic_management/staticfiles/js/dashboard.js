// Incident Management System
import '../css/style.css'
import '../css/responsive.css'
import '../css/theme.css'
import '../css/dropdown_fix.css'
document.addEventListener('DOMContentLoaded', function() {
    // Global flag to prevent duplicate initialization
    if (window.dashboardInitialized) {
        console.log("Dashboard already initialized, skipping redundant initialization");
        return;
    }
    
    // Mark as initialized
    window.dashboardInitialized = true;
    
    // Global function to completely reset Chart.js registry
    window.resetChartJsRegistry = function() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available for registry reset');
            return;
        }
        
        console.log('Performing complete Chart.js registry reset');
        
        try {
            // Get all canvas elements
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                try {
                    // Try to get chart instance
                    const chart = Chart.getChart(canvas);
                    if (chart) {
                        // Destroy the chart
                        chart.destroy();
                        console.log(`Destroyed chart on canvas: ${canvas.id || 'unnamed'}`);
                    }
                } catch (err) {
                    console.warn(`Error destroying chart on canvas ${canvas.id || 'unnamed'}:`, err);
                }
                
                // Force any unregistered chart destruction
                if (canvas.chart) {
                    try {
                        canvas.chart.destroy();
                    } catch (e) {
                        console.warn(`Error destroying unregistered chart:`, e);
                    }
                    delete canvas.chart;
                }
            });
            
            // Clear Chart.js registry in different versions
            if (Chart.instances) {
                Object.keys(Chart.instances).forEach(key => {
                    try {
                        Chart.instances[key].destroy();
                    } catch (e) {
                        console.warn(`Could not destroy Chart instance ${key}:`, e);
                    }
                });
            }
            
            // For older Chart.js versions
            if (Chart.helpers && Chart.helpers.canvas) {
                if (Chart.helpers.canvas._chartInstances) {
                    Object.keys(Chart.helpers.canvas._chartInstances).forEach(key => {
                        try {
                            Chart.helpers.canvas._chartInstances[key].destroy();
                        } catch (e) {
                            console.warn(`Could not destroy Chart instance ${key}:`, e);
                        }
                    });
                }
            }
            
            console.log('Chart.js registry reset completed');
        } catch (e) {
            console.error('Error during Chart.js registry reset:', e);
        }
    };
    
    // Ensure existing chart instances are cleared
    function clearExistingCharts() {
        console.log("Clearing existing charts...");
        
        // Reset the Chart.js registry first
        if (window.resetChartJsRegistry) {
            console.log("Calling global Chart.js registry reset");
            window.resetChartJsRegistry();
            return; // The registry reset function is comprehensive, so we can exit early
        }
        
        // Fallback for when the global function isn't available
        try {
            // Chart.js v3+ destroy method
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                try {
                    const chart = Chart.getChart(canvas);
                    if (chart) {
                        chart.destroy();
                        console.log(`Chart on canvas ${canvas.id} destroyed`);
                    }
                } catch (err) {
                    console.warn(`Error destroying chart on canvas ${canvas.id}:`, err);
                }
            });
        } catch (e) {
            console.error("Error clearing existing charts:", e);
        }
    }
    
    // Reset Chart.js registry at startup
    if (typeof Chart !== 'undefined') {
        console.log('Performing initial Chart.js registry reset');
        window.resetChartJsRegistry();
    } else {
        console.log('Chart.js not loaded yet, will reset registry later');
        // Add an event listener for when Chart.js loads
        window.addEventListener('load', function() {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js loaded, performing delayed registry reset');
                window.resetChartJsRegistry();
            }
        });
    }
    
    // Wait a bit to ensure Bootstrap is fully loaded
    setTimeout(() => {
        // Clear any existing charts first
        clearExistingCharts();
        
        // Initialize non-chart components first
        console.log("Initializing non-chart components");
        initIncidentManagement();
        
        // Initialize chart components with significant delays to prevent conflicts
        console.log("Starting chart initialization sequence with delays");
        
        // Sequence the initialization with generous delays
        setTimeout(() => {
            try {
                console.log("Starting home charts initialization");
                initHomeCharts();
                console.log("Home charts initialized successfully");
                
                // Initialize time range selectors after charts are ready
                if (typeof window.initTimeRangeSelectors === 'function') {
                    console.log("Initializing time range selectors");
                    window.initTimeRangeSelectors();
                } else {
                    console.warn("Time range selectors initialization function not available");
                }
                
                // Register a forced chart refresh button if it exists
                const forceInitChartBtn = document.getElementById('forceInitChart');
                if (forceInitChartBtn) {
                    forceInitChartBtn.addEventListener('click', function() {
                        console.log("Force refreshing all charts");
                        clearExistingCharts();
                        setTimeout(() => initHomeCharts(), 300);
                        setTimeout(() => initReportCharts(), 800);
                    });
                }
                
                // Add debug button handler
                const debugChartBtn = document.getElementById('debugChartBtn');
                if (debugChartBtn) {
                    debugChartBtn.addEventListener('click', function() {
                        console.log("Debug traffic chart button clicked");
                        
                        // Show debug info
                        const debugInfo = {
                            "Chart.js loaded": typeof Chart !== 'undefined',
                            "trafficFlowChart exists": typeof window.trafficFlowChart !== 'undefined',
                            "initializeTrafficFlowChart exists": typeof window.initializeTrafficFlowChart === 'function',
                            "fetchTrafficFlowData exists": typeof window.fetchTrafficFlowData === 'function',
                            "canvas exists": !!document.getElementById('trafficFlowChart'),
                            "Chart context": document.getElementById('trafficFlowChart') ? "Available" : "N/A",
                            "Current time range": window.currentTimeRange || "Unknown"
                        };
                        
                        // Log to console
                        console.table(debugInfo);
                        
                        // Create alert with debug info
                        let debugMsg = "Traffic Chart Debug Info:\n\n";
                        Object.entries(debugInfo).forEach(([key, value]) => {
                            debugMsg += `${key}: ${value}\n`;
                        });
                        
                        // Add action
                        debugMsg += "\nReinitializing chart...";
                        alert(debugMsg);
                        
                        // Try to fix chart
                        clearExistingCharts();
                        setTimeout(() => {
                            if (typeof window.initializeTrafficFlowChart === 'function') {
                                window.initializeTrafficFlowChart();
                                
                                setTimeout(() => {
                                    if (typeof window.fetchTrafficFlowData === 'function') {
                                        window.fetchTrafficFlowData(30);
                                    }
                                }, 500);
                            }
                        }, 200);
                    });
                }
            } catch (err) {
                console.error("Error initializing home charts:", err);
            }
            
            // Initialize reports charts much later
            setTimeout(() => {
                try {
                    console.log("Starting report charts initialization");
                    initReportCharts();
                    console.log("Report charts initialized successfully");
                } catch (err) {
                    console.error("Error initializing report charts:", err);
                }
            }, 1000);
        }, 500);
    }, 500);
    
    // View Dashboard button handler
    const viewDashboardBtn = document.getElementById('viewDashboardBtn');
    if (viewDashboardBtn) {
        viewDashboardBtn.addEventListener('click', function() {
            console.log('View Dashboard button clicked');
            
            // Redirect to the traffic dashboard page
            window.location.href = '/traffic-dashboard/';
        });
        console.log('View Dashboard button handler initialized');
    } else {
        console.error('View Dashboard button not found');
    }
    
    // Set up camera refresh button
    const refreshFeedsBtn = document.getElementById('refreshFeeds');
    if (refreshFeedsBtn) {
        refreshFeedsBtn.addEventListener('click', function() {
            console.log('Refresh camera feeds button clicked');
            showToast('Refreshing camera feeds...', 'info');
            
            // Reconnect all cameras
            connectAllCameras();
        });
        console.log('Camera refresh button handler initialized');
    }
    
    // Set up individual camera toggle buttons
    const cameraToggleButtons = document.querySelectorAll('.btn-camera-stream-toggle');
    cameraToggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cameraId = this.getAttribute('data-camera-id');
            console.log(`Toggle camera ${cameraId} button clicked`);
            
            // Get the status indicator for this camera
            const cameraContainer = this.closest('.camera-feed-container');
            if (!cameraContainer) return;
            
            const statusIndicator = cameraContainer.querySelector('.camera-status-indicator');
            if (!statusIndicator) return;
            
            const currentStatus = statusIndicator.getAttribute('data-status');
            
            if (currentStatus === 'online') {
                // Disconnect camera
                statusIndicator.textContent = 'Disconnecting...';
                statusIndicator.classList.remove('bg-success');
                statusIndicator.classList.add('bg-warning', 'text-dark');
                
                setTimeout(() => {
                    statusIndicator.textContent = 'Offline';
                    statusIndicator.classList.remove('bg-warning', 'text-dark');
                    statusIndicator.classList.add('bg-danger');
                    statusIndicator.setAttribute('data-status', 'offline');
                    
                    // Show fallback
                    const fallback = cameraContainer.querySelector('.camera-fallback');
                    if (fallback) {
                        fallback.style.display = 'flex';
                    }
                    
                    // Hide metrics
                    const metrics = cameraContainer.querySelector('.real-time-metrics');
                    if (metrics) {
                        metrics.style.display = 'none';
                    }
                    
                    // Hide status bar
                    const statusBar = cameraContainer.querySelector('.camera-status-bar');
                    if (statusBar) {
                        statusBar.style.display = 'none';
                    }
                    
                    // Hide mini map
                    const miniMap = cameraContainer.querySelector('.mini-map');
                    if (miniMap) {
                        miniMap.style.display = 'none';
                    }
                    
                    // Reset background
                    const cameraStream = cameraContainer.querySelector('.camera-stream');
                    if (cameraStream) {
                        cameraStream.style.backgroundImage = '';
                        cameraStream.style.backgroundColor = '';
                    }
                    
                    showToast(`Camera ${cameraId} disconnected`, 'info');
                    
                    // Update button icon
                    this.innerHTML = '<i class="bi bi-play-fill"></i>';
                }, 1000);
            } else {
                // Connect camera
                simulateCameraConnection(cameraId);
                
                // Update button icon
                this.innerHTML = '<i class="bi bi-stop-fill"></i>';
            }
        });
    });
    
    // Set up camera reconnect buttons inside fallback views
    const reconnectButtons = document.querySelectorAll('.btn-reconnect');
    reconnectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cameraContainer = this.closest('.camera-feed-container');
            if (!cameraContainer) return;
            
            // Find the toggle button and click it
            const toggleButton = cameraContainer.querySelector('.btn-camera-stream-toggle');
            if (toggleButton) {
                toggleButton.click();
            }
        });
    });

    // Add event listener for the Force Chart Refresh button
    console.log("DOM loaded - setting up dashboard event handlers");
    
    // Set up force chart refresh button
    const forceChartRefreshBtn = document.getElementById('forceInitChart');
    if (forceChartRefreshBtn) {
        console.log("Found force chart refresh button");
        forceChartRefreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Force chart refresh button clicked");
            
            // Use the comprehensive refresh function
            forceRefreshAllCharts();
        });
    } else {
        console.warn("Force chart refresh button not found");
    }
    
    // Initialize all charts when the page loads
    try {
        if (typeof initHomeCharts === 'function') {
            // Wait a short while to ensure DOM is fully rendered
            setTimeout(initHomeCharts, 500);
        }
    } catch (e) {
        console.error("Error initializing home charts on page load:", e);
    }
}); // End of document ready handler

// Initialize traffic flow analysis section charts (distribution and hourly pattern)
function initHomeCharts() {    console.log("Initializing home section charts...");        // Use our new chart reset utility if available    if (window.initializeAllCharts) {        console.log("Using improved chart initialization utility");        try {            // This will reset and initialize all charts            window.initializeAllCharts();                        // Fetch data for the chart after a delay to ensure chart is ready            setTimeout(() => {                if (typeof window.fetchTrafficFlowData === 'function') {                    window.fetchTrafficFlowData(30); // Default to 30 minutes                    console.log("Traffic flow data fetched for newly initialized chart");                } else {                    console.error("fetchTrafficFlowData function not available");                }            }, 500);                        return; // Exit early since all charts are now initialized        } catch (error) {            console.error("Error using improved chart initialization:", error);            console.log("Falling back to legacy chart initialization");            // Continue with legacy initialization below        }    }        // Legacy chart initialization (fallback)    // Reset Chart.js registry first to avoid Canvas already in use errors    if (window.resetChartJsRegistry) {        console.log("Resetting Chart.js registry before home charts initialization");        window.resetChartJsRegistry();    }        // Initialize Traffic Flow Chart first    if (typeof window.initializeTrafficFlowChart === 'function') {        console.log("Initializing main traffic flow chart...");        try {            window.initializeTrafficFlowChart();                        // Fetch data for the chart after a delay to ensure chart is ready            setTimeout(() => {                if (typeof window.fetchTrafficFlowData === 'function') {                    window.fetchTrafficFlowData(30); // Default to 30 minutes                    console.log("Traffic flow data fetched for newly initialized chart");                } else {                    console.error("fetchTrafficFlowData function not available");                }            }, 500);        } catch (error) {            console.error("Error initializing traffic flow chart:", error);        }    } else {        console.error("Traffic flow chart initialization function not available");    }
    
    // Add event listener for the force init chart button
    const forceInitChartBtn = document.getElementById('forceInitChart');
    if (forceInitChartBtn) {
        console.log("Found force init chart button");
        forceInitChartBtn.addEventListener('click', function() {
            console.log("Force initialize charts button clicked");
            clearExistingCharts();
            
            // Reset registry on force refresh for thoroughness
            if (window.resetChartJsRegistry) {
                window.resetChartJsRegistry();
            }
            
            // Reinitialize with slight delays to avoid conflicts
            setTimeout(initHomeCharts, 100);
            setTimeout(initReportCharts, 300);
        });
    }
    
    // Traffic Distribution Chart - Use canvas replacement approach
    let distCanvas = document.getElementById('distributionChart');
    if (distCanvas) {
        console.log("Found distribution chart element");
        
        // Add loading indicator
        const distParent = distCanvas.parentNode;
        if (distParent) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'dist-chart-loading';
            loadingIndicator.style.position = 'absolute';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.zIndex = '1000';
            loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            loadingIndicator.style.padding = '10px';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"></div><div style="margin-top: 5px;">Loading chart...</div>';
            
            // Set relative positioning on parent to position the loading indicator
            distParent.style.position = 'relative';
            distParent.appendChild(loadingIndicator);
        }
        
        // Only replace the canvas if necessary
        let needNewCanvas = false;
        try {
            // Check if the canvas is corrupted or already in use
            const ctx = distCanvas.getContext('2d');
            if (!ctx) {
                console.log("Distribution chart canvas context unavailable - need replacement");
                needNewCanvas = true;
            }
        } catch (e) {
            console.error("Error checking distribution chart canvas:", e);
            needNewCanvas = true;
        }
        
        // Replace the canvas with a fresh element if needed
        if (needNewCanvas) {
        try {
            const parent = distCanvas.parentNode;
            if (parent) {
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'distributionChart';
                newCanvas.className = distCanvas.className;
                newCanvas.style.cssText = distCanvas.style.cssText;
                    newCanvas.width = distCanvas.width || distCanvas.clientWidth || 200;
                    newCanvas.height = distCanvas.height || distCanvas.clientHeight || 150;
                
                parent.replaceChild(newCanvas, distCanvas);
                console.log("Distribution chart canvas replaced with fresh element");
                distCanvas = newCanvas;
            }
        } catch (e) {
            console.error("Error replacing distribution chart canvas:", e);
            }
        }
        
        try {
            // Check for existing chart on this canvas
            let existingChart;
            
            try {
                // For Chart.js v3+
                existingChart = Chart.getChart(distCanvas);
                if (existingChart) {
                    console.log("Found existing distribution chart - destroying it");
                    existingChart.destroy();
                }
            } catch (destroyError) {
                console.warn("Error checking/destroying existing distribution chart:", destroyError);
            }
            
            // Check for global reference
            if (window.distributionChart && window.distributionChart.ctx && window.distributionChart.ctx.canvas === distCanvas) {
                try {
                    console.log("Destroying old distribution chart from global reference");
                    window.distributionChart.destroy();
                } catch (globalDestroyError) {
                    console.warn("Error destroying distribution chart from global ref:", globalDestroyError);
                }
            }
            
            // Sample data for traffic distribution
            const distData = {
                labels: ['Cars', 'Trucks', 'Buses', 'Motorcycles', 'Other'],
                datasets: [{
                    data: [65, 15, 12, 5, 3],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            };
            
            // Make sure Chart.js is available
            if (typeof Chart === 'undefined') {
                console.error("Chart.js not loaded - can't create distribution chart");
                return;
            }
                    
                    // Create new chart
            console.log("Creating new distribution chart");
                    window.distributionChart = new Chart(distCanvas, {
                        type: 'pie',
                        data: distData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        boxWidth: 15,
                                        padding: 10
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.parsed || 0;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return `${label}: ${percentage}%`;
                                        }
                                    }
                                }
                    },
                    animation: {
                        duration: 500 // shorter animation to avoid flicker
                            }
                        }
                    });
            
                    console.log("Distribution chart initialized successfully");
            
            // Remove loading indicator
            const loadingIndicator = document.getElementById('dist-chart-loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Update stats
            document.getElementById('northboundStats').textContent = '42%';
            document.getElementById('southboundStats').textContent = '58%';
            document.getElementById('peakDirection').textContent = 'Southbound';
            
        } catch (error) {
            console.error("Error initializing distribution chart:", error);
            
            // Remove loading indicator on error
            const loadingIndicator = document.getElementById('dist-chart-loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Show error message in place of chart
            try {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger';
                errorMsg.style.margin = '0';
                errorMsg.style.position = 'absolute';
                errorMsg.style.top = '50%';
                errorMsg.style.left = '50%';
                errorMsg.style.transform = 'translate(-50%, -50%)';
                errorMsg.style.width = '80%';
                errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error loading chart';
                
                const parent = distCanvas.parentNode;
                if (parent) {
                    parent.style.position = 'relative';
                    parent.appendChild(errorMsg);
                }
            } catch (displayError) {
                console.error("Error displaying chart error message:", displayError);
            }
        }
    } else {
        console.error("Distribution chart element not found");
    }
    
    // Hourly Pattern Chart - Use canvas replacement approach
    let hourlyCanvas = document.getElementById('hourlyPatternChart');
    if (hourlyCanvas) {
        console.log("Found hourly pattern chart element");
        
        // Add loading indicator
        const hourlyParent = hourlyCanvas.parentNode;
        if (hourlyParent) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'hourly-chart-loading';
            loadingIndicator.style.position = 'absolute';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.zIndex = '1000';
            loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            loadingIndicator.style.padding = '10px';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"></div><div style="margin-top: 5px;">Loading chart...</div>';
            
            // Set relative positioning on parent to position the loading indicator
            hourlyParent.style.position = 'relative';
            hourlyParent.appendChild(loadingIndicator);
        }
        
        // Only replace the canvas if necessary
        let needNewCanvas = false;
        try {
            // Check if the canvas is corrupted or already in use
            const ctx = hourlyCanvas.getContext('2d');
            if (!ctx) {
                console.log("Hourly pattern chart canvas context unavailable - need replacement");
                needNewCanvas = true;
            }
        } catch (e) {
            console.error("Error checking hourly pattern chart canvas:", e);
            needNewCanvas = true;
        }
        
        // Replace the canvas with a fresh element if needed
        if (needNewCanvas) {
        try {
            const parent = hourlyCanvas.parentNode;
            if (parent) {
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'hourlyPatternChart';
                newCanvas.className = hourlyCanvas.className;
                newCanvas.style.cssText = hourlyCanvas.style.cssText;
                    newCanvas.width = hourlyCanvas.width || hourlyCanvas.clientWidth || 200;
                    newCanvas.height = hourlyCanvas.height || hourlyCanvas.clientHeight || 150;
                
                parent.replaceChild(newCanvas, hourlyCanvas);
                console.log("Hourly pattern chart canvas replaced with fresh element");
                hourlyCanvas = newCanvas;
            }
        } catch (e) {
            console.error("Error replacing hourly pattern chart canvas:", e);
            }
        }
        
        try {
            // Check for existing chart on this canvas
            let existingChart;
            
            try {
                // For Chart.js v3+
                existingChart = Chart.getChart(hourlyCanvas);
                if (existingChart) {
                    console.log("Found existing hourly pattern chart - destroying it");
                    existingChart.destroy();
                }
            } catch (destroyError) {
                console.warn("Error checking/destroying existing hourly pattern chart:", destroyError);
            }
            
            // Check for global reference
            if (window.hourlyPatternChart && window.hourlyPatternChart.ctx && window.hourlyPatternChart.ctx.canvas === hourlyCanvas) {
                try {
                    console.log("Destroying old hourly pattern chart from global reference");
                    window.hourlyPatternChart.destroy();
                } catch (globalDestroyError) {
                    console.warn("Error destroying hourly pattern chart from global ref:", globalDestroyError);
                }
            }
            
            // Sample data for hourly pattern
            const hours = [...Array(24).keys()];
            const hourLabels = hours.map(h => `${h}:00`);
            
            // Traffic pattern with morning and evening peaks
            const trafficPattern = hours.map(hour => {
                if (hour >= 7 && hour <= 9) {
                    // Morning peak
                    return 70 + Math.random() * 20;
                } else if (hour >= 16 && hour <= 18) {
                    // Evening peak
                    return 80 + Math.random() * 20;
                } else if (hour >= 11 && hour <= 14) {
                    // Lunch time medium traffic
                    return 50 + Math.random() * 15;
                } else if (hour >= 22 || hour <= 5) {
                    // Night low traffic
                    return 10 + Math.random() * 15;
                } else {
                    // Regular daytime traffic
                    return 30 + Math.random() * 15;
                }
            });
            
            const data = {
                labels: hourLabels,
                datasets: [{
                    label: 'Average Traffic Volume',
                    data: trafficPattern,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            };
            
            // Make sure Chart.js is available
            if (typeof Chart === 'undefined') {
                console.error("Chart.js not loaded - can't create hourly pattern chart");
                return;
            }
            
            // Create new chart directly (no setTimeout)
            console.log("Creating new hourly pattern chart");
                    window.hourlyPatternChart = new Chart(hourlyCanvas, {
                        type: 'line',
                        data: data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Traffic Volume'
                                    }
                                },
                                x: {
                                    ticks: {
                                        autoSkip: true,
                                        maxTicksLimit: 12
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    callbacks: {
                                        title: function(context) {
                                            return context[0].label + ' hour';
                                        }
                                    }
                                }
                    },
                    animation: {
                        duration: 500 // shorter animation to avoid flicker
                            }
                        }
                    });
            
                    console.log("Hourly pattern chart initialized successfully");
            
            // Remove loading indicator
            const loadingIndicator = document.getElementById('hourly-chart-loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Update traffic statistics (leave this unchanged)
            document.getElementById('avgTraffic').textContent = '47 vehicles/min';
            document.getElementById('trafficTrend').textContent = '↑ 12% vs yesterday';
            document.getElementById('peakTime').textContent = '17:00 - 18:00';
            document.getElementById('peakTrend').textContent = '↑ 15 min earlier vs yesterday';
            document.getElementById('totalVehicles').textContent = '28,452';
            document.getElementById('totalTrend').textContent = '↑ 8% vs yesterday';
            
        } catch (error) {
            console.error("Error initializing hourly pattern chart:", error);
            
            // Remove loading indicator on error
            const loadingIndicator = document.getElementById('hourly-chart-loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Show error message in place of chart
            try {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger';
                errorMsg.style.margin = '0';
                errorMsg.style.position = 'absolute';
                errorMsg.style.top = '50%';
                errorMsg.style.left = '50%';
                errorMsg.style.transform = 'translate(-50%, -50%)';
                errorMsg.style.width = '80%';
                errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error loading chart';
                
                const parent = hourlyCanvas.parentNode;
                if (parent) {
                    parent.style.position = 'relative';
                    parent.appendChild(errorMsg);
                }
            } catch (displayError) {
                console.error("Error displaying chart error message:", displayError);
            }
        }
    } else {
        console.error("Hourly pattern chart element not found");
    }
}

// Initialize report section charts
function initReportCharts() {
    console.log("Initializing report charts...");
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded. Cannot initialize charts.");
        return;
    }
    
    // Force clear all Chart.js instances from registry
    try {
        if (Chart.instances) {
            Object.keys(Chart.instances).forEach(function(key) {
                Chart.instances[key].destroy();
            });
        }
        
        // For Chart.js versions that use different registries
        if (Chart.helpers && Chart.helpers.canvas && Chart.helpers.canvas._chartInstances) {
            Object.keys(Chart.helpers.canvas._chartInstances).forEach(function(key) {
                Chart.helpers.canvas._chartInstances[key].destroy();
            });
        }
    } catch (e) {
        console.warn("Error clearing Chart.js registry:", e);
    }
    
    // Reset Chart.js registry first to avoid Canvas already in use errors
    if (window.resetChartJsRegistry) {
        console.log("Resetting Chart.js registry before report charts initialization");
        window.resetChartJsRegistry();
    }
    
    // Clear global references first
    window.reportTrafficTrendChart = null;
    window.reportDistributionChart = null;
    
    // Use longer delays for chart initialization sequence
    console.log("Starting delayed initialization sequence for report charts");
    
    // Initialize first chart after a significant delay
    setTimeout(() => {
        initReportTrafficTrendChart();
        
        // Only start the second chart after the first is complete - much longer delay
        setTimeout(() => {
            initReportDistributionChart();
            
            // After all charts are initialized, update report data
            setTimeout(() => {
                updateReportSummaryValues();
            }, 500);
        }, 750); // Extra long delay between chart initializations
    }, 500);
    
    // Function to initialize the Traffic Trend Chart
    function initReportTrafficTrendChart() {
        console.log("Initializing report traffic trend chart");
        const trendCanvas = document.getElementById('reportTrafficTrendChart');
        
        if (!trendCanvas) {
            console.error("Traffic trend chart canvas not found");
            return;
        }
        
        try {
            // Regenerate the canvas from scratch
            const parent = trendCanvas.parentNode;
            if (parent) {
                // Remove existing canvas
                parent.removeChild(trendCanvas);
                
                // Create a completely new canvas with the same properties
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'reportTrafficTrendChart';
                newCanvas.className = trendCanvas.className || '';
                newCanvas.style.cssText = trendCanvas.style.cssText || '';
                
                // Add the new canvas to the DOM
                parent.appendChild(newCanvas);
                console.log("Traffic trend chart canvas completely recreated");
            }
            
            // Get the fresh canvas
            const freshCanvas = document.getElementById('reportTrafficTrendChart');
            
            // Wait a bit more before creating chart on fresh canvas
            setTimeout(() => {
                // Create traffic trend chart data
                const trendDataConfig = {
                    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                    datasets: [
                        {
                            label: 'Current Period',
                            data: [65, 72, 86, 81, 56, 55, 70],
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Previous Period',
                            data: [62, 69, 79, 75, 60, 58, 65],
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderDash: [5, 5],
                            tension: 0.4,
                            fill: false
                        }
                    ]
                };
                
                // Create new chart instance
                window.reportTrafficTrendChart = new Chart(freshCanvas, {
                    type: 'line',
                    data: trendDataConfig,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Traffic Volume'
                                }
                            }
                        }
                    }
                });
                console.log("Traffic trend chart created successfully");
            }, 200);
        } catch (error) {
            console.error("Error initializing traffic trend chart:", error);
        }
    }
    
    // Function to initialize the Distribution Chart
    function initReportDistributionChart() {
        console.log("Initializing report distribution chart");
        const distCanvas = document.getElementById('reportDistributionChart');
        
        if (!distCanvas) {
            console.error("Distribution chart canvas not found");
            return;
        }
        
        try {
            // Regenerate the canvas from scratch
            const parent = distCanvas.parentNode;
            if (parent) {
                // Remove existing canvas
                parent.removeChild(distCanvas);
                
                // Create a completely new canvas with the same properties
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'reportDistributionChart';
                newCanvas.className = distCanvas.className || '';
                newCanvas.style.cssText = distCanvas.style.cssText || '';
                
                // Add the new canvas to the DOM
                parent.appendChild(newCanvas);
                console.log("Distribution chart canvas completely recreated");
            }
            
            // Get the fresh canvas
            const freshCanvas = document.getElementById('reportDistributionChart');
            
            // Wait a bit more before creating chart on fresh canvas
            setTimeout(() => {
                // Distribution data
                const distributionData = {
                    labels: ['Cars', 'Trucks', 'Buses', 'Motorcycles', 'Others'],
                    datasets: [{
                        data: [55, 20, 10, 12, 3],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ],
                        borderWidth: 1
                    }]
                };
                
                window.reportDistributionChart = new Chart(freshCanvas, {
                    type: 'pie',
                    data: distributionData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 15,
                                    padding: 10
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        return `${label}: ${percentage}%`;
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Distribution chart created successfully");
            }, 200);
        } catch (error) {
            console.error("Error initializing distribution chart:", error);
        }
    }
    
    // Update report summary values
    function updateReportSummaryValues() {
        // Update report summary cards with mock data
        document.getElementById('reportTotalVolume').textContent = '143,672';
        document.getElementById('volumeTrend').textContent = '↑ 7.2% vs previous period';
        document.getElementById('reportAvgFlow').textContent = '42 vehicles/min';
        document.getElementById('flowTrend').textContent = '↑ 3.5% vs previous period';
        document.getElementById('reportPeakHours').textContent = '8:00 - 9:30, 17:00 - 18:30';
        document.getElementById('peakTrend').textContent = 'Consistent with previous period';
        document.getElementById('reportIncidents').textContent = '24';
        document.getElementById('incidentTrend').textContent = '↓ 12% vs previous period';
        
        // Update direction distribution data
        document.getElementById('reportNorthbound').textContent = '45%';
        document.getElementById('reportSouthbound').textContent = '55%';
        document.getElementById('reportNorthboundBar').style.width = '45%';
        document.getElementById('reportSouthboundBar').style.width = '55%';
        
        console.log("Report summary values updated");
    }
}

// Update report data based on selected period
function updateReportData(period, customDateRange) {
    console.log("Updating report data for period:", period);
    
    // Sample data for different periods
    let trendLabels, trendData, prevTrendData;
    
    if (period === 'daily') {
        trendLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        trendData = [25, 20, 35, 85, 65, 75, 90, 45];
        prevTrendData = [20, 15, 30, 80, 60, 70, 85, 40];
        
        document.getElementById('reportTotalVolume').textContent = '8,650';
        document.getElementById('reportAvgFlow').textContent = '60 vehicles/min';
        document.getElementById('reportPeakHours').textContent = '08:00 - 09:00';
        document.getElementById('reportIncidents').textContent = '5';
    } 
    else if (period === 'weekly') {
        trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        trendData = [1200, 1350, 1460, 1390, 1600, 950, 850];
        prevTrendData = [1150, 1300, 1400, 1350, 1550, 900, 800];
        
        document.getElementById('reportTotalVolume').textContent = '58,240';
        document.getElementById('reportAvgFlow').textContent = '57 vehicles/min';
        document.getElementById('reportPeakHours').textContent = 'Fri 17:00 - 18:00';
        document.getElementById('reportIncidents').textContent = '23';
    }
    else if (period === 'monthly') {
        trendLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        trendData = [58240, 61350, 59800, 62500];
        prevTrendData = [57000, 59500, 58200, 60100];
        
        document.getElementById('reportTotalVolume').textContent = '241,890';
        document.getElementById('reportAvgFlow').textContent = '56 vehicles/min';
        document.getElementById('reportPeakHours').textContent = 'Weekdays 17:00 - 18:00';
        document.getElementById('reportIncidents').textContent = '87';
    }
    else if (period === 'custom' && customDateRange) {
        // Handle custom date range
        console.log("Custom date range:", customDateRange);
        const startDate = customDateRange.startDate;
        const endDate = customDateRange.endDate;
        
        // Format date range for display
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        
        // Generate labels based on number of days
        const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        trendLabels = [];
        trendData = [];
        prevTrendData = [];
        
        let currentDate = new Date(startDate);
        for (let i = 0; i < days; i++) {
            trendLabels.push(formatDate(currentDate));
            // Generate some random data for this example
            trendData.push(Math.floor(Math.random() * 2000) + 1000);
            prevTrendData.push(Math.floor(Math.random() * 1800) + 900);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        document.getElementById('reportTotalVolume').textContent = '195,430';
        document.getElementById('reportAvgFlow').textContent = '54 vehicles/min';
        document.getElementById('reportPeakHours').textContent = 'Varies';
        document.getElementById('reportIncidents').textContent = '63';
    }
    
    // Update direction distribution (just for demonstration)
    if (period === 'daily') {
        document.getElementById('reportNorthbound').textContent = '45%';
        document.getElementById('reportSouthbound').textContent = '55%';
        document.getElementById('reportNorthboundBar').style.width = '45%';
        document.getElementById('reportSouthboundBar').style.width = '55%';
    } else if (period === 'weekly') {
        document.getElementById('reportNorthbound').textContent = '48%';
        document.getElementById('reportSouthbound').textContent = '52%';
        document.getElementById('reportNorthboundBar').style.width = '48%';
        document.getElementById('reportSouthboundBar').style.width = '52%';
    } else if (period === 'monthly') {
        document.getElementById('reportNorthbound').textContent = '51%';
        document.getElementById('reportSouthbound').textContent = '49%';
        document.getElementById('reportNorthboundBar').style.width = '51%';
        document.getElementById('reportSouthboundBar').style.width = '49%';
    } else if (period === 'custom') {
        document.getElementById('reportNorthbound').textContent = '50%';
        document.getElementById('reportSouthbound').textContent = '50%';
        document.getElementById('reportNorthboundBar').style.width = '50%';
        document.getElementById('reportSouthboundBar').style.width = '50%';
    }
    
    // Update traffic trend chart
    const trendCtx = document.getElementById('reportTrafficTrendChart');
    if (trendCtx) {
        try {
            // First check if there's an existing chart on this canvas
            let existingChart = null;
            try {
                existingChart = Chart.getChart(trendCtx);
                if (existingChart) {
                    console.log("Destroying existing trend chart for update");
                    existingChart.destroy();
                }
            } catch (e) {
                console.warn("Error while checking for existing chart:", e);
            }
            
            // Check global reference too
            if (window.reportTrafficTrendChart && !existingChart) {
                try {
                    console.log("Destroying chart via global reference");
                    window.reportTrafficTrendChart.destroy();
                } catch (e) {
                    console.warn("Error destroying chart via global reference:", e);
                }
            }
            
            // Create new chart instance
            const trendDataConfig = {
                labels: trendLabels,
                datasets: [
                    {
                        label: 'Current Period',
                        data: trendData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Previous Period',
                        data: prevTrendData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    }
                ]
            };
            console.log("Canvas element:", trendCtx.canvas);

            
            try {
                if (window.reportTrafficTrendChart) {
                    try {
                        window.reportTrafficTrendChart.destroy();
                        console.log("Destroyed existing traffic trend chart");
                    } catch (e) {
                        console.warn("Error destroying traffic trend chart:", e);
                    }
                }
            
                window.reportTrafficTrendChart = new Chart(trendCtx, {
                    type: 'line',
                    data: trendDataConfig,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Traffic Volume'
                                }
                            }
                        }
                    }
                });
            
                console.log("Traffic trend chart updated successfully");
            } catch (error) {
                console.error("Error updating traffic trend chart:", error);
            }
            
        } catch (error) {
            console.error("Error updating traffic trend chart:", error);
        }
    }
}

function initIncidentManagement() {
    console.log("Initializing incident management system...");
    
    // DOM elements
    const addIncidentBtn = document.getElementById('addIncidentBtn');
    const saveIncidentBtn = document.getElementById('saveIncidentBtn');
    const incidentForm = document.getElementById('incidentForm');
    const customIncidentsTable = document.getElementById('customIncidentsTable');
    const noCustomIncidents = document.getElementById('noCustomIncidents');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Check if key elements exist
    if (!addIncidentBtn) {
        console.error("Add incident button not found!");
    } else {
        console.log("Add incident button found");
    }
    
    if (!document.getElementById('incidentModal')) {
        console.error("Incident modal not found!");
        return;
    }
    
    // Initialize Bootstrap modals
    let incidentModal, deleteConfirmModal;
    
    try {
        incidentModal = new bootstrap.Modal(document.getElementById('incidentModal'));
        deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        console.log("Bootstrap modals initialized successfully");
    } catch (error) {
        console.error("Error initializing Bootstrap modals:", error);
        
        // Check if Bootstrap is available
        if (typeof bootstrap === 'undefined') {
            console.error("Bootstrap is not loaded!");
            
            // Add Bootstrap dynamically if not available
            const bootstrapScript = document.createElement('script');
            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js';
            document.head.appendChild(bootstrapScript);
            
            bootstrapScript.onload = function() {
                console.log("Bootstrap loaded dynamically");
                // Try again after Bootstrap is loaded
                setTimeout(initIncidentManagement, 500);
            };
            
            return;
        }
    }
    
    // Load incidents from localStorage
    let incidents = JSON.parse(localStorage.getItem('trafficIncidents')) || [];
    
    // Initialize the table
    renderIncidentsTable();
    
    // Event: Add Incident button click
    if (addIncidentBtn) {
        addIncidentBtn.addEventListener('click', function() {
            console.log("Add incident button clicked");
            
            // Reset form for a new incident
            if (incidentForm) {
                incidentForm.reset();
                document.getElementById('incidentId').value = '';
                document.getElementById('incidentModalLabel').textContent = 'Add New Incident';
                
                // Set default date and time to current
                const now = new Date();
                const nowStr = now.toISOString().slice(0, 16);
                document.getElementById('incidentDateTime').value = nowStr;
                
                // Show modal
                try {
                    incidentModal.show();
                    console.log("Modal shown successfully");
                } catch (e) {
                    console.error("Error showing modal:", e);
                    showToast("Error showing incident form. Please refresh the page.", "error");
                }
            } else {
                console.error("Incident form not found!");
                showToast("Error: Incident form not found", "error");
            }
        });
    }
    
    // Event: Edit incident buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-incident-btn')) {
            const button = e.target.closest('.edit-incident-btn');
            const incidentId = button.dataset.id;
            editIncident(incidentId);
        }
    });
    
    // Event: Delete incident buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-incident-btn')) {
            const button = e.target.closest('.delete-incident-btn');
            const incidentId = button.dataset.id;
            document.getElementById('deleteIncidentId').value = incidentId;
            deleteConfirmModal.show();
        }
    });
    
    // Event: Save incident
    if (saveIncidentBtn) {
        saveIncidentBtn.addEventListener('click', function() {
            if (!validateIncidentForm()) {
                showToast('Please fill in all required fields', 'warning');
                return;
            }
            
            const incidentId = document.getElementById('incidentId').value;
            const incident = {
                id: incidentId || Date.now().toString(),
                type: document.getElementById('incidentType').value,
                location: document.getElementById('incidentLocation').value,
                description: document.getElementById('incidentDescription').value,
                severity: document.getElementById('incidentSeverity').value,
                dateTime: document.getElementById('incidentDateTime').value,
                timestamp: Date.now()
            };
            
            // Add or update incident
            if (incidentId) {
                // Update existing incident
                const index = incidents.findIndex(inc => inc.id === incidentId);
                if (index !== -1) {
                    incidents[index] = incident;
                    showToast('Incident updated successfully', 'success');
                }
            } else {
                // Add new incident
                incidents.push(incident);
                showToast('New incident added successfully', 'success');
            }
            
            // Save to localStorage
            saveIncidents();
            
            // Update UI
            renderIncidentsTable();
            
            // Close modal
            incidentModal.hide();
        });
    }
    
    // Event: Confirm delete
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const incidentId = document.getElementById('deleteIncidentId').value;
            deleteIncident(incidentId);
            deleteConfirmModal.hide();
        });
    }
    
    // Function: Validate form
    function validateIncidentForm() {
        return incidentForm.checkValidity();
    }
    
    // Function: Edit incident
    function editIncident(incidentId) {
        const incident = incidents.find(inc => inc.id === incidentId);
        if (!incident) return;
        
        // Fill form with incident data
        document.getElementById('incidentId').value = incident.id;
        document.getElementById('incidentType').value = incident.type;
        document.getElementById('incidentLocation').value = incident.location;
        document.getElementById('incidentDescription').value = incident.description;
        document.getElementById('incidentSeverity').value = incident.severity;
        document.getElementById('incidentDateTime').value = incident.dateTime;
        
        // Update modal title
        document.getElementById('incidentModalLabel').textContent = 'Edit Incident';
        
        // Show modal
        incidentModal.show();
    }
    
    // Function: Delete incident
    function deleteIncident(incidentId) {
        incidents = incidents.filter(inc => inc.id !== incidentId);
        saveIncidents();
        renderIncidentsTable();
        showToast('Incident deleted successfully', 'success');
    }
    
    // Function: Save incidents to localStorage
    function saveIncidents() {
        localStorage.setItem('trafficIncidents', JSON.stringify(incidents));
    }
    
    // Function: Render incidents table
    function renderIncidentsTable() {
        if (!customIncidentsTable) return;
        
        // Show/hide empty state message
        if (incidents.length === 0) {
            customIncidentsTable.innerHTML = '';
            if (noCustomIncidents) noCustomIncidents.style.display = 'block';
            return;
        }
        
        if (noCustomIncidents) noCustomIncidents.style.display = 'none';
        
        // Sort incidents by timestamp (newest first)
        const sortedIncidents = [...incidents].sort((a, b) => b.timestamp - a.timestamp);
        
        // Clear and rebuild table
        customIncidentsTable.innerHTML = '';
        
        sortedIncidents.forEach(incident => {
            const row = document.createElement('tr');
            
            // Create severity badge
            let badgeClass = 'bg-info';
            if (incident.severity === 'High') badgeClass = 'bg-warning text-dark';
            if (incident.severity === 'Critical') badgeClass = 'bg-danger';
            
            // Format date for display
            const dateObj = new Date(incident.dateTime);
            const formattedDate = dateObj.toLocaleString();
            
            row.innerHTML = `
                <td><span class="badge ${badgeClass}">${incident.type}</span></td>
                <td>${incident.location}</td>
                <td>${incident.description}</td>
                <td>${incident.severity}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary edit-incident-btn" data-id="${incident.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-incident-btn" data-id="${incident.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            customIncidentsTable.appendChild(row);
        });
    }
}

// Traffic flow chart refresh function
function refreshTrafficFlowChart() {
    console.log("Refreshing traffic flow chart");
    
    // Create a loading indicator for user feedback
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        // Add loading indicator if not already present
        let loadingIndicator = document.getElementById('chart-loading-indicator');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'chart-loading-indicator';
            loadingIndicator.style.position = 'absolute';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.zIndex = '1000';
            loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            loadingIndicator.style.padding = '10px';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"></div><div style="margin-top: 5px;">Refreshing chart...</div>';
            
            // Set relative positioning on parent
            chartContainer.style.position = 'relative';
            chartContainer.appendChild(loadingIndicator);
        }
    }
    
    // Try using the new chart utility first (from reset_charts.js)
    if (typeof window.initializeAllCharts === 'function') {
        console.log("Using improved chart initialization utility");
        try {
            // This utility handles canvas recreation and chart initialization
            window.initializeAllCharts();
            
            // Fetch new data with a slight delay to let charts render
                setTimeout(() => {
                if (typeof window.fetchTrafficFlowData === 'function') {
                    const range = window.currentTimeRange || 30;
                    window.fetchTrafficFlowData(range);
                    console.log(`Traffic flow data fetched for range: ${range} minutes`);
                    
                    // Show success message
                    if (typeof window.showToast === 'function') {
                        window.showToast('Charts refreshed successfully', 'success');
                    }
                }
                
                // Remove loading indicator
                const loadingIndicator = document.getElementById('chart-loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
            }, 500);
            
            return; // Exit early since all charts are refreshed
        } catch (error) {
            console.error("Error using chart reset utility:", error);
            // Fall back to individual chart refreshes below
        }
    }
    
    // Individual chart refresh as fallback
    try {
        // Refresh main traffic flow chart
        if (typeof window.initializeTrafficFlowChart === 'function') {
            window.initializeTrafficFlowChart();
            console.log("Main traffic flow chart refreshed");
        }
        
        // Refresh distribution chart
        if (typeof window.initializeDistributionChart === 'function') {
            window.initializeDistributionChart();
            console.log("Distribution chart refreshed");
        }
        
        // Refresh hourly pattern chart
        if (typeof window.initializeHourlyPatternChart === 'function') {
            window.initializeHourlyPatternChart();
            console.log("Hourly pattern chart refreshed");
        }
        
        // Fetch new data after a delay
        setTimeout(() => {
            if (typeof window.fetchTrafficFlowData === 'function') {
                const range = window.currentTimeRange || 30;
                window.fetchTrafficFlowData(range);
                console.log(`Traffic flow data fetched for range: ${range} minutes`);
            }
            
            // Show success message
            if (typeof window.showToast === 'function') {
                window.showToast('Charts refreshed successfully', 'success');
            }
            
            // Remove loading indicator
            const loadingIndicator = document.getElementById('chart-loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }, 500);
    } catch (e) {
        console.error("Error in refreshTrafficFlowChart:", e);
        
        // Show error message
        if (typeof window.showToast === 'function') {
            window.showToast('Error refreshing charts', 'error');
        }
        
        // Remove loading indicator on error
        const loadingIndicator = document.getElementById('chart-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
}

// Function to simulate camera connection
function simulateCameraConnection(cameraId) {
    console.log(`Simulating connection to camera: ${cameraId}`);
    
    // Find camera container
    const cameraContainer = document.querySelector(`.camera-feed-container ${cameraId === 'main' ? '.main-camera' : ''}`);
    if (!cameraContainer) {
        console.error(`Camera container for ${cameraId} not found`);
        return;
    }
    
    // Get the status indicator
    const statusIndicator = cameraContainer.querySelector('.camera-status-indicator');
    if (statusIndicator) {
        // Show connecting status
        statusIndicator.textContent = 'Connecting...';
        statusIndicator.classList.remove('bg-danger', 'bg-success');
        statusIndicator.classList.add('bg-warning', 'text-dark');
        
        // Simulate connection delay
        setTimeout(() => {
            // Update status to connected
            statusIndicator.textContent = 'Connected';
            statusIndicator.classList.remove('bg-warning', 'text-dark', 'bg-danger');
            statusIndicator.classList.add('bg-success');
            statusIndicator.setAttribute('data-status', 'online');
            
            // Hide fallback and show stream content
            const fallback = cameraContainer.querySelector('.camera-fallback');
            if (fallback) {
                fallback.style.display = 'none';
            }
            
            // Show real-time metrics or camera status bar
            if (cameraId === 'main') {
                const metrics = cameraContainer.querySelector('.real-time-metrics');
                if (metrics) {
                    metrics.style.display = 'block';
                }
                
                // Update vehicle count with random value
                const vehicleCount = cameraContainer.querySelector('.vehicle-count');
                if (vehicleCount) {
                    vehicleCount.textContent = Math.floor(Math.random() * 50) + 20;
                }
                
                // Update average speed
                const avgSpeed = cameraContainer.querySelector('.avg-speed');
                if (avgSpeed) {
                    avgSpeed.textContent = Math.floor(Math.random() * 30) + 35;
                }
            } else {
                const statusBar = cameraContainer.querySelector('.camera-status-bar');
                if (statusBar) {
                    statusBar.style.display = 'block';
                }
            }
            
            // Add a background image to simulate camera feed
            const cameraStream = cameraContainer.querySelector('.camera-stream');
            if (cameraStream) {
                cameraStream.style.backgroundImage = `url('/static/images/${cameraId}_traffic.jpg')`;
                cameraStream.style.backgroundSize = 'cover';
                cameraStream.style.backgroundPosition = 'center';
                
                // Add a fallback if image fails to load
                cameraStream.style.backgroundColor = '#111';
            }
            
            // Show mini-map for main camera
            if (cameraId === 'main') {
                const miniMap = cameraContainer.querySelector('.mini-map');
                if (miniMap) {
                    miniMap.style.display = 'block';
                }
            }
            
            showToast(`Camera ${cameraId} connected successfully`, 'success');
        }, 1500);
    }
}

// Function to connect all cameras
function connectAllCameras() {
    const cameraIds = ['main', 'north', 'south', 'east', 'west'];
    
    // Stagger the connections to make it look realistic
    cameraIds.forEach((id, index) => {
        setTimeout(() => {
            simulateCameraConnection(id);
        }, index * 800);
    });
}

// Function to initialize the dashboard data and charts
function initDashboardData() {
    console.log('Initializing dashboard data');
    
    // Update dashboard metrics with random data
    updateDashboardMetrics();
    
    // Initialize dashboard flow chart
    initDashboardFlowChart();
    
    // Set up refresh button
    const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
    if (refreshDashboardBtn) {
        // Remove any existing event listeners
        const newRefreshBtn = refreshDashboardBtn.cloneNode(true);
        refreshDashboardBtn.parentNode.replaceChild(newRefreshBtn, refreshDashboardBtn);
        
        // Add click event listener
        newRefreshBtn.addEventListener('click', function() {
            console.log('Refresh dashboard button clicked');
            showToast('Refreshing dashboard data...', 'info');
            
            // Simulate loading
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
            
            // Update data after a short delay
            setTimeout(() => {
                updateDashboardMetrics();
                updateDashboardFlowChart();
                
                // Update timestamp
                document.getElementById('dashboardUpdateTime').textContent = 'Just now';
                
                // Reset button
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Refresh Data';
                
                showToast('Dashboard data refreshed successfully', 'success');
            }, 1200);
        });
    }
    
    // Set up time period buttons
    const timeButtons = document.querySelectorAll('#dashboardHourlyBtn, #dashboardLiveBtn, #dashboardDailyBtn');
    timeButtons.forEach(button => {
        // Remove any existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click event listener
        newButton.addEventListener('click', function() {
            // Update active state
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update chart based on selected time period
            const period = this.id.replace('dashboard', '').replace('Btn', '').toLowerCase();
            updateDashboardFlowChart(period);
        });
    });
}

// Function to update dashboard metrics with fresh data
function updateDashboardMetrics() {
    // Total traffic - random value between 25,000 and 35,000
    const totalTraffic = Math.floor(Math.random() * 10000) + 25000;
    document.getElementById('dashboardTotalTraffic').textContent = totalTraffic.toLocaleString();
    
    // Current flow - random value between 30 and 65
    const currentFlow = Math.floor(Math.random() * 35) + 30;
    document.getElementById('dashboardCurrentFlow').textContent = currentFlow;
    
    // Keep peak time the same or adjust slightly
    const peakHour = Math.floor(Math.random() * 3) + 16; // 16, 17, or 18 (4pm-6pm)
    const peakMinute = Math.random() > 0.5 ? '00' : '30';
    document.getElementById('dashboardPeakTime').textContent = `${peakHour}:${peakMinute}`;
    
    // Incidents - random value between 2 and 7
    const incidents = Math.floor(Math.random() * 6) + 2;
    const active = Math.min(Math.floor(incidents * 0.7), incidents); 
    const resolved = incidents - active;
    document.getElementById('dashboardIncidents').textContent = incidents;
    
    // Update the incidents description
    const incidentElement = document.getElementById('dashboardIncidents');
    if (incidentElement && incidentElement.nextElementSibling) {
        incidentElement.nextElementSibling.textContent = `${active} active, ${resolved} resolved`;
    }
    
    // Update table data randomly
    updateIncidentTableTimes();
}

// Function to initialize the dashboard flow chart
function initDashboardFlowChart() {
    const chartCanvas = document.getElementById('dashboardFlowChart');
    if (!chartCanvas) {
        console.error('Dashboard flow chart canvas not found');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Generate random data
    const liveData = generateFlowChartData('live');
    
    // Create the chart - first check if there's an existing chart and properly destroy it
    try {
        if (window.dashboardFlowChart && typeof window.dashboardFlowChart.destroy === 'function') {
            window.dashboardFlowChart.destroy();
            window.dashboardFlowChart = null;
        }
    } catch (err) {
        console.error('Error destroying existing chart:', err);
        // Reset the variable to avoid future issues
        window.dashboardFlowChart = null;
    }
    
    try {
        // Create a new chart instance
        window.dashboardFlowChart = new Chart(chartCanvas, {
            type: 'line',
            data: liveData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Vehicles per Minute'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 3
                    },
                    line: {
                        tension: 0.4
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
        
        console.log('Dashboard flow chart initialized');
    } catch (err) {
        console.error('Error creating flow chart:', err);
        showToast('Error creating dashboard chart', 'error');
    }
}

// Function to update the dashboard flow chart
function updateDashboardFlowChart(period = 'live') {
    if (!window.dashboardFlowChart || typeof window.dashboardFlowChart.update !== 'function') {
        console.error('Dashboard flow chart not initialized properly');
        // Try to initialize it again
        initDashboardFlowChart();
        return;
    }
    
    try {
        // Generate new data based on selected period
        const newData = generateFlowChartData(period);
        
        // Update the chart
        window.dashboardFlowChart.data = newData;
        window.dashboardFlowChart.update();
        
        console.log(`Dashboard flow chart updated with ${period} data`);
    } catch (err) {
        console.error('Error updating dashboard chart:', err);
        showToast('Error updating chart data', 'error');
        
        // Try to recreate the chart
        setTimeout(() => {
            initDashboardFlowChart();
        }, 100);
    }
}

// Function to generate data for the flow chart based on period
function generateFlowChartData(period) {
    let labels, data1, data2;
    
    // Generate appropriate data based on the period
    if (period === 'live') {
        // Last 30 minutes in 2-minute intervals
        labels = Array.from({length: 15}, (_, i) => {
            const minutes = i * 2;
            return minutes === 0 ? 'Now' : `${minutes} min ago`;
        }).reverse();
        
        // Generate random flow data with some patterns
        data1 = Array.from({length: 15}, () => Math.floor(Math.random() * 20) + 30);
        data2 = Array.from({length: 15}, (_, i) => {
            // Make the second line similar but with some variation
            const base = data1[i] + (Math.random() * 10 - 5);
            return Math.max(0, Math.floor(base));
        });
    } 
    else if (period === 'hourly') {
        // 24 hours of the day
        labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        // Traffic pattern with morning and evening peaks
        data1 = labels.map((_, hour) => {
            if (hour >= 7 && hour <= 9) {
                // Morning peak
                return Math.floor(Math.random() * 15) + 45;
            } else if (hour >= 16 && hour <= 18) {
                // Evening peak
                return Math.floor(Math.random() * 20) + 50;
            } else if (hour >= 10 && hour <= 15) {
                // Midday
                return Math.floor(Math.random() * 15) + 30;
            } else if (hour >= 22 || hour <= 5) {
                // Night
                return Math.floor(Math.random() * 10) + 10;
            } else {
                // Other times
                return Math.floor(Math.random() * 15) + 25;
            }
        });
        
        // Previous day data - slightly different
        data2 = data1.map(value => {
            const variation = Math.random() * 10 - 5;
            return Math.max(0, Math.floor(value + variation));
        });
    }
    else if (period === 'daily') {
        // Days of the week
        labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Weekly pattern with weekday peaks and weekend dips
        data1 = [
            Math.floor(Math.random() * 10) + 45, // Monday
            Math.floor(Math.random() * 10) + 40, // Tuesday
            Math.floor(Math.random() * 10) + 50, // Wednesday
            Math.floor(Math.random() * 10) + 45, // Thursday
            Math.floor(Math.random() * 10) + 55, // Friday
            Math.floor(Math.random() * 10) + 35, // Saturday
            Math.floor(Math.random() * 10) + 30, // Sunday
        ];
        
        // Previous week data
        data2 = data1.map(value => {
            const variation = Math.random() * 8 - 4;
            return Math.max(0, Math.floor(value + variation));
        });
    }
    
    return {
        labels: labels,
        datasets: [
            {
                label: 'Current Traffic',
                data: data1,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true
            },
            {
                label: 'Previous Period',
                data: data2,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderDash: [5, 5],
                fill: false
            }
        ]
    };
}

// Function to update incident table times randomly
function updateIncidentTableTimes() {
    // Find all time cells in the active incidents table
    const timeCells = document.querySelectorAll('#dashboardViewModal table tbody tr td:nth-child(4)');
    
    timeCells.forEach((cell, index) => {
        let timeText;
        
        // Generate different time texts based on row
        if (index === 0) {
            // First row - recent incident
            const minutes = Math.floor(Math.random() * 15) + 1;
            timeText = `Started ${minutes} min ago`;
        } else if (index === 1) {
            // Second row - slightly older
            const minutes = Math.floor(Math.random() * 30) + 15;
            timeText = `Started ${minutes} min ago`;
        } else {
            // Other rows - hours
            const hours = Math.floor(Math.random() * 5) + 1;
            timeText = `Started ${hours} hrs ago`;
        }
        
        cell.textContent = timeText;
    });
} 

// Add a new force refresh function to completely reinitialize all charts
function forceRefreshAllCharts() {
    console.log("Force refreshing all charts");
    
    // Show toast notification
    if (typeof window.showToast === 'function') {
        window.showToast("Completely refreshing all charts...", "info");
    }
    
    // Fix any chart-canvas mismatches first if our new function exists
    if (typeof window.fixAllChartCanvasMismatches === 'function') {
        console.log("Fixing chart-canvas mismatches before refresh");
        const fixStats = window.fixAllChartCanvasMismatches();
        console.log("Chart fix stats:", fixStats);
    }
    
    // Step 1: Try to find all chart canvases and recreate them
    const chartCanvases = [
        'trafficFlowChart',
        'distributionChart',
        'hourlyPatternChart',
        'reportTrafficTrendChart',
        'reportDistributionChart',
        'dashboardFlowChart',
        'currentPatternChart',
        'previousPatternChart'
    ];
    
    // Function to recreate a canvas
    function recreateCanvas(id) {
        const canvas = document.getElementById(id);
        if (!canvas) {
            console.log(`Canvas ${id} not found, skipping recreation`);
            return null;
        }
        
        // Get parent element
        const parent = canvas.parentNode;
        if (!parent) {
            console.log(`Canvas ${id} has no parent, skipping recreation`);
            return null;
        }
        
        // Save canvas properties
        const width = canvas.width;
        const height = canvas.height;
        const className = canvas.className;
        const style = canvas.style.cssText;
        
        // Remove old canvas
        let chart = null;
        
        // Try to get existing chart
        try {
            if (Chart.getChart) {
                chart = Chart.getChart(canvas);
                if (chart) {
                    console.log(`Found Chart.js chart for ${id}, destroying`);
                    chart.destroy();
                }
            }
        } catch (e) {
            console.warn(`Error accessing Chart.js registry for ${id}:`, e);
        }
        
        // Also check global chart reference
        try {
            if (window[id] && typeof window[id].destroy === 'function') {
                console.log(`Found global chart reference for ${id}, destroying`);
                window[id].destroy();
                window[id] = null;
            }
        } catch (e) {
            console.warn(`Error destroying global chart for ${id}:`, e);
        }
        
        // Remove from DOM
        parent.removeChild(canvas);
        
        // Create new canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.id = id;
        newCanvas.width = width || 300; 
        newCanvas.height = height || 200;
        newCanvas.className = className || '';
        newCanvas.style.cssText = style || '';
        
        // Add to DOM
        parent.appendChild(newCanvas);
        console.log(`Canvas ${id} recreated successfully`);
        
        return newCanvas;
    }
    
    // First recreate all canvases
    chartCanvases.forEach(id => {
        console.log(`Recreating canvas for ${id}`);
        recreateCanvas(id);
    });
    
    // Use specialized chart initializers if available
    
    // Traffic flow chart
    if (typeof window.initializeTrafficFlowChart === 'function') {
        console.log("Reinitializing main traffic flow chart");
        setTimeout(() => {
            window.initializeTrafficFlowChart();
            
            // Once chart is initialized, update with fresh data
            setTimeout(() => {
                if (typeof window.fetchTrafficFlowData === 'function') {
                    window.fetchTrafficFlowData(window.currentTimeRange || 30);
                }
            }, 300);
        }, 100);
    }
    
    // Distribution chart
    if (typeof window.initializeDistributionChart === 'function') {
        console.log("Reinitializing distribution chart");
        setTimeout(() => {
            window.initializeDistributionChart();
        }, 200);
    }
    
    // Hourly pattern chart
    if (typeof window.initializeHourlyPatternChart === 'function') {
        console.log("Reinitializing hourly pattern chart");
        setTimeout(() => {
            window.initializeHourlyPatternChart();
        }, 300);
    }
    
    // Report charts
    if (typeof window.initReportCharts === 'function') {
        console.log("Reinitializing report charts");
        setTimeout(() => {
            window.initReportCharts();
        }, 400);
    }
    
    // Final verification that all charts have correct canvas references
    setTimeout(() => {
        if (typeof window.fixAllChartCanvasMismatches === 'function') {
            console.log("Performing final verification of chart-canvas references");
            const verificationStats = window.fixAllChartCanvasMismatches();
            console.log("Verification results:", verificationStats);
            
            if (verificationStats.fixed > 0 || verificationStats.recreated > 0) {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Charts fixed: ${verificationStats.fixed}, recreated: ${verificationStats.recreated}`, "success");
                }
            }
        }
    }, 1000);
    
    if (typeof window.showToast === 'function') {
        window.showToast("All charts refreshed successfully", "success");
    }
}

// Ensure charts are properly initialized when the page loads
// Wait until the DOM is completely loaded and visible
function initChartsWhenReady() {
    if (document.readyState === 'complete') {
        console.log("Document fully loaded, initializing charts");
        
        // Initialize with a short delay to ensure DOM is fully rendered
        setTimeout(() => {
            try {
                if (typeof initHomeCharts === 'function') {
                    initHomeCharts();
                    console.log("Home charts initialized on page load");
                }
                
                // Fetch initial traffic data after charts are ready
                setTimeout(() => {
                    if (typeof window.fetchTrafficFlowData === 'function') {
                        window.fetchTrafficFlowData(30); // Default to 30 minutes
                    }
                }, 500);
            } catch (e) {
                console.error("Error initializing charts on page load:", e);
                
                // Show error message
                if (typeof window.showToast === 'function') {
                    window.showToast("Error initializing charts", "error");
                }
                
                // Try a forced refresh as a fallback
                setTimeout(forceRefreshAllCharts, 1000);
            }
        }, 300);
    } else {
        // Wait a bit longer and check again
        setTimeout(initChartsWhenReady, 200);
    }
}

// Start checking if DOM is ready
initChartsWhenReady(); 