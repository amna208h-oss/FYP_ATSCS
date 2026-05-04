/**
 * Chart Reset and Initialization Utility
 * 
 * This script helps with common issues where Chart.js charts might not render
 * properly or fail to initialize. It provides functions to safely reset and 
 * recreate chart canvases and instances.
 */

// Global registry for tracking chart instances
window.chartRegistry = window.chartRegistry || {};

// Reset all Chart.js instances and prepare fresh canvases
function resetChartJsRegistry() {
  console.log("[ChartReset] Resetting Chart.js registry");
  
  try {
    // First, try to destroy all existing Chart.js instances using Chart.js registry
    if (window.Chart && typeof window.Chart.getChart === 'function') {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        try {
          const chart = window.Chart.getChart(canvas);
          if (chart) {
            console.log(`[ChartReset] Destroying chart on canvas: ${canvas.id || 'unnamed'}`);
            chart.destroy();
          }
        } catch (e) {
          console.warn(`[ChartReset] Error destroying chart on canvas: ${canvas.id || 'unnamed'}`, e);
        }
      });
    }
    
    // Also clear our custom registry
    if (window.chartInstances) {
      Object.keys(window.chartInstances).forEach(key => {
        try {
          const chart = window.chartInstances[key];
          if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
          }
        } catch (e) {
          console.warn(`[ChartReset] Error destroying chart in registry: ${key}`, e);
        }
      });
      
      // Reset registry
      window.chartInstances = {};
    }
    
    // Clear our own registry
    window.chartRegistry = {};
    
    console.log("[ChartReset] Chart.js registry cleared");
    return true;
  } catch (e) {
    console.error("[ChartReset] Error resetting Chart.js registry:", e);
    return false;
  }
}

// Helper function to recreate a specific canvas element
function recreateCanvas(canvasId) {
  console.log(`[ChartReset] Recreating canvas: ${canvasId}`);
  
  // Find existing canvas and its container
  const existingCanvas = document.getElementById(canvasId);
  if (!existingCanvas) {
    console.error(`[ChartReset] Canvas with ID ${canvasId} not found`);
    return null;
  }
  
  // Get parent and canvas properties
  const parent = existingCanvas.parentElement;
  if (!parent) {
    console.error(`[ChartReset] Canvas (${canvasId}) has no parent element`);
    return null;
  }
  
  // Backup properties
  const width = existingCanvas.width || existingCanvas.clientWidth || 300;
  const height = existingCanvas.height || existingCanvas.clientHeight || 200;
  const className = existingCanvas.className;
  const style = existingCanvas.style.cssText;
  
  // Create a new canvas element
  const newCanvas = document.createElement('canvas');
  newCanvas.id = canvasId;
  newCanvas.width = width;
  newCanvas.height = height;
  if (className) newCanvas.className = className;
  if (style) newCanvas.style.cssText = style;
  
  // Replace old canvas with new one
  parent.replaceChild(newCanvas, existingCanvas);
  
  console.log(`[ChartReset] Canvas ${canvasId} recreated successfully`);
  return newCanvas;
}

// Initialize a chart using standardized method
function initializeChart(canvasId, chartType, data, options) {
  console.log(`[ChartReset] Initializing chart on canvas: ${canvasId}`);
  
  try {
    // First recreate the canvas if it exists
    let canvas = document.getElementById(canvasId);
    if (canvas) {
      canvas = recreateCanvas(canvasId);
    } else {
      console.warn(`[ChartReset] Canvas with ID ${canvasId} not found, cannot initialize chart`);
      return null;
    }
    
    // Verify canvas recreation was successful
    if (!canvas) {
      console.error(`[ChartReset] Failed to recreate canvas: ${canvasId}`);
      return null;
    }
    
    // Make sure Chart.js is available
    if (typeof Chart === 'undefined') {
      console.error(`[ChartReset] Chart.js library not available`);
      return null;
    }
    
    // Create chart instance
    const chart = new Chart(canvas, {
      type: chartType,
      data: data,
      options: options
    });
    
    // Store in our registry
    window.chartRegistry[canvasId] = chart;
    
    console.log(`[ChartReset] Chart successfully initialized on canvas: ${canvasId}`);
    return chart;
  } catch (e) {
    console.error(`[ChartReset] Error initializing chart on canvas: ${canvasId}`, e);
    return null;
  }
}

// Initialize the main traffic flow chart
function initializeMainTrafficFlowChart() {
  console.log("[ChartReset] Initializing main traffic flow chart");
  
  try {
    // First make sure we recreate the canvas
    const canvas = recreateCanvas('trafficFlowChart');
    if (!canvas) {
      console.error("[ChartReset] Failed to recreate traffic flow chart canvas");
      return null;
    }
    
    // Create initial data structure
    const initialData = {
      labels: Array(30).fill('').map((_, i) => {
        const time = new Date();
        time.setMinutes(time.getMinutes() - (30 - i));
        return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }),
      datasets: [
        {
          label: 'Historical Traffic',
          data: Array(30).fill(0).map(() => Math.floor(Math.random() * 80) + 20), // Sample data
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Predicted Traffic',
          data: Array(30).fill(0).map(() => Math.floor(Math.random() * 80) + 20), // Sample data
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    // Chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Traffic Flow (vehicles/minute)'
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 10
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: true
        },
        legend: {
          position: 'top'
        }
      }
    };
    
    // Create chart
    const chart = new Chart(canvas, {
      type: 'line',
      data: initialData,
      options: options
    });
    
    // Store in our registry and globally for compatibility
    window.chartRegistry['trafficFlowChart'] = chart;
    window.trafficFlowChart = chart;
    
    console.log("[ChartReset] Main traffic flow chart initialized successfully");
    return chart;
  } catch (e) {
    console.error("[ChartReset] Error initializing main traffic flow chart:", e);
    return null;
  }
}

// Add these new functions for distribution and hourly pattern charts

/**
 * Initialize the distribution chart with proper error handling
 * @returns {Object|null} Chart instance or null if failed
 */
function initializeDistributionChart() {
    console.log("Initializing distribution chart with chart utility...");
    try {
        // Get canvas element
        const canvas = document.getElementById('distributionChart');
        if (!canvas) {
            console.error("Distribution chart canvas not found");
            return null;
        }
        
        // Check for existing chart and destroy it
        try {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing distribution chart");
                existingChart.destroy();
            }
        } catch (e) {
            console.warn("Error checking for existing distribution chart:", e);
        }
        
        // Create fresh canvas
        const parent = canvas.parentNode;
        if (parent) {
            // Create new canvas
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'distributionChart';
            newCanvas.className = canvas.className;
            newCanvas.width = canvas.width || canvas.clientWidth || 200;
            newCanvas.height = canvas.height || canvas.clientHeight || 150;
            
            // Replace old canvas
            parent.replaceChild(newCanvas, canvas);
            console.log("Replaced distribution chart canvas with fresh element");
            
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
            
            // Create chart
            window.distributionChart = new Chart(newCanvas, {
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
            return window.distributionChart;
        }
    } catch (error) {
        console.error("Error initializing distribution chart:", error);
        return null;
    }
    
    return null;
}

/**
 * Initialize the hourly pattern chart with proper error handling
 * @returns {Object|null} Chart instance or null if failed
 */
function initializeHourlyPatternChart() {
    console.log("Initializing hourly pattern chart with chart utility...");
    try {
        // Get canvas element
        const canvas = document.getElementById('hourlyPatternChart');
        if (!canvas) {
            console.error("Hourly pattern chart canvas not found");
            return null;
        }
        
        // Check for existing chart and destroy it
        try {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing hourly pattern chart");
                existingChart.destroy();
            }
        } catch (e) {
            console.warn("Error checking for existing hourly pattern chart:", e);
        }
        
        // Create fresh canvas
        const parent = canvas.parentNode;
        if (parent) {
            // Create new canvas
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'hourlyPatternChart';
            newCanvas.className = canvas.className;
            newCanvas.width = canvas.width || canvas.clientWidth || 200;
            newCanvas.height = canvas.height || canvas.clientHeight || 150;
            
            // Replace old canvas
            parent.replaceChild(newCanvas, canvas);
            console.log("Replaced hourly pattern chart canvas with fresh element");
            
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
            
            // Create chart
            window.hourlyPatternChart = new Chart(newCanvas, {
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
            return window.hourlyPatternChart;
        }
    } catch (error) {
        console.error("Error initializing hourly pattern chart:", error);
        return null;
    }
    
    return null;
}

// Initialize all dashboard charts
function initializeAllCharts() {
  console.log("[ChartReset] Initializing all dashboard charts");
  
  // Reset all charts first
  resetChartJsRegistry();
  
  // Initialize main traffic flow chart
  const mainChart = initializeMainTrafficFlowChart();
  
  // Initialize distribution chart
  const distributionData = {
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
  
  const distributionOptions = {
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
  };
  
  initializeChart('distributionChart', 'pie', distributionData, distributionOptions);
  
  // Initialize hourly pattern chart
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
  
  const hourlyData = {
    labels: hourLabels,
    datasets: [{
      label: 'Traffic Volume',
      data: trafficPattern,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };
  
  const hourlyOptions = {
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
          maxTicksLimit: 12,
          callback: function(value, index, values) {
            return hourLabels[index];
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };
  
  initializeChart('hourlyPatternChart', 'line', hourlyData, hourlyOptions);
  
  console.log("[ChartReset] All charts initialized successfully");
  return true;
}

// Export functions to window
window.resetChartJsRegistry = resetChartJsRegistry;
window.recreateCanvas = recreateCanvas;
window.initializeChart = initializeChart;
window.initializeMainTrafficFlowChart = initializeMainTrafficFlowChart;
window.initializeAllCharts = initializeAllCharts;

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
  console.log("[ChartReset] Document loaded, initializing charts with delay");
  
  // Initialize with a delay to ensure DOM is ready
  setTimeout(() => {
    try {
      initializeAllCharts();
    } catch (e) {
      console.error("[ChartReset] Error during automatic chart initialization:", e);
    }
  }, 500);
  
  // Add click handler for force init chart button
  const forceInitBtn = document.getElementById('forceInitChart');
  if (forceInitBtn) {
    forceInitBtn.addEventListener('click', function() {
      console.log("[ChartReset] Force init chart button clicked");
      try {
        const result = initializeAllCharts();
        if (result && typeof showToast === 'function') {
          showToast("Charts have been refreshed successfully", "success");
        }
      } catch (e) {
        console.error("[ChartReset] Error during force chart initialization:", e);
        if (typeof showToast === 'function') {
          showToast("Error refreshing charts. See console for details.", "error");
        }
      }
    });
  }
});

/** 
 * Fix all chart-canvas mismatches in the application
 * This function scans all charts and ensures they're correctly attached to their canvases
 * @return {Object} Stats about fixed charts 
 */
function fixAllChartCanvasMismatches() {  
  console.log('[ChartFix] Scanning for chart-canvas mismatches...');
  
  // Track stats  
  const stats = {
    scanned: 0,
    fixed: 0,
    recreated: 0,
    errors: 0,
    skipped: 0
  };
  
  try {
    // Check for Chart.js
    if (typeof Chart === 'undefined') {
      console.error('[ChartFix] Chart.js not available');
      return stats;
    }
    
    // Scan known chart instances first
    const knownCharts = {
      'trafficFlowChart': window.trafficFlowChart,
      'distributionChart': window.distributionChart,
      'hourlyPatternChart': window.hourlyPatternChart,
      'reportTrafficTrendChart': window.reportTrafficTrendChart,
      'reportDistributionChart': window.reportDistributionChart,
      'dashboardFlowChart': window.dashboardFlowChart,
      'currentPatternChart': window.currentPatternChart,
      'previousPatternChart': window.previousPatternChart
    };
    
    // Scan Chart.js registry for any charts we missed
    let registryCharts = {};
    if (Chart.getChart) {
      try {
        // Scan all canvas elements to find charts in registry
        document.querySelectorAll('canvas').forEach(canvas => {
          if (canvas.id) {
            const chart = Chart.getChart(canvas);
            if (chart && !knownCharts[canvas.id]) {
              registryCharts[canvas.id] = chart;
            }
          }
        });
      } catch (e) {
        console.warn('[ChartFix] Error scanning Chart.js registry:', e);
      }
    }
    
    // Combine all found charts
    const allCharts = { ...knownCharts, ...registryCharts };
    
    // Check each chart
    Object.entries(allCharts).forEach(([chartId, chart]) => {
      stats.scanned++;
      
      if (!chart) {
        console.log(`[ChartFix] Chart ${chartId} exists in registry but is null, skipping`);
        return;
      }
      
      // Skip charts that are explicitly marked as comparison charts
      if (chart._isComparisonChart) {
        console.log(`[ChartFix] Skipping comparison chart ${chartId}`);
        stats.skipped++;
        return;
      }
      
      // Skip the comparison chart IDs completely
      if (chartId === 'currentPatternChart' || chartId === 'previousPatternChart') {
        console.log(`[ChartFix] Skipping known comparison chart ${chartId}`);
        stats.skipped++;
        return;
      }
      
      // Skip any chart in a modal
      const canvas = document.getElementById(chartId);
      if (canvas) {
        let element = canvas;
        while (element) {
          if (element.classList && 
              (element.classList.contains('modal') ||
               element.classList.contains('modal-content') ||
               element.classList.contains('modal-body'))) {
            console.log(`[ChartFix] Skipping chart ${chartId} in modal`);
            stats.skipped++;
            return;
          }
          element = element.parentElement;
        }
      }
      
      // Find the canvas element for this chart
      const canvasElement = document.getElementById(chartId);
      
      // Check if canvas exists
      if (!canvasElement) {
        console.warn(`[ChartFix] Canvas for chart ${chartId} not found in DOM`);
        return;
      }
      
      // Check if chart has the correct canvas reference
      if (chart.canvas !== canvasElement) {
        console.warn(`[ChartFix] Mismatch detected for chart ${chartId}`);
        
        try {
          // Try to reattach if we have that function
          if (typeof window.reattachChartToCanvas === 'function') {
            const success = window.reattachChartToCanvas(chart, canvasElement);
            if (success) {
              console.log(`[ChartFix] Successfully reattached chart ${chartId}`);
              stats.fixed++;
              return;
            }
          }
          
          // If reattach function doesn't exist or failed, try recreation
          console.log(`[ChartFix] Recreating chart ${chartId}`);
          
          // Backup chart data and options
          const chartType = chart.config ? chart.config.type : 'line';
          const chartData = chart.data ? JSON.parse(JSON.stringify(chart.data)) : null;
          const chartOptions = chart.options ? JSON.parse(JSON.stringify(chart.options)) : null;
          
          // Try to destroy old chart
          try {
            chart.destroy();
          } catch (e) {
            console.warn(`[ChartFix] Error destroying chart ${chartId}:`, e);
          }
          
          // Create new chart with same data
          if (chartData) {
            const newChart = new Chart(canvasElement, {
              type: chartType,
              data: chartData,
              options: chartOptions
            });
            
            // Update global reference
            window[chartId] = newChart;
            
            // Ensure direct canvas reference is set
            newChart.canvas = canvasElement;
            
            stats.recreated++;
          }
        } catch (e) {
          console.error(`[ChartFix] Error fixing chart ${chartId}:`, e);
          stats.errors++;
        }
      } else {
        console.log(`[ChartFix] Chart ${chartId} has correct canvas reference`);
      }
    });
    
    console.log('[ChartFix] Chart canvas check complete:', stats);
    
    // Return stats
    return stats;
  } catch (error) {
    console.error('[ChartFix] Critical error scanning charts:', error);
    return stats;
  }
}

// Expose function globally
window.fixAllChartCanvasMismatches = fixAllChartCanvasMismatches;

// Add auto-fix on window load to catch initial mismatches
window.addEventListener('load', function() {
  // Run after a short delay to ensure charts are initialized first
  setTimeout(fixAllChartCanvasMismatches, 1000);
});

// Add periodic checking to fix issues that occur during runtime
// Run every 30 seconds to catch new mismatches
setInterval(fixAllChartCanvasMismatches, 30000); 