// Add helper function at the top of the file
/**
 * Helper function to check if an element is actually in the DOM
 * More reliable than the previous implementation
 * @param {HTMLElement} element - The element to check
 * @return {boolean} true if the element exists and is in the DOM
 */
function isElementInDOM(element) {
  if (!element) {
    return false;
  }
  
  // Most reliable method - checks if the element is in the document
  return document.body.contains(element);
}

// Make it globally available
window.isElementInDOM = isElementInDOM;

// Current time range tracking
let currentTimeRange = 30; // Default to 30 minutes

// Expose currentTimeRange to window so other scripts can access it
window.currentTimeRange = currentTimeRange;

/**
 * Update traffic statistics on the page based on data
 * @param {Object} data - Traffic flow data 
 */
function updateTrafficStats(data) {
  try {
    if (!data) {
      console.error('No data provided to updateTrafficStats');
      return;
    }
    
    // Get DOM elements for updating
    const avgTrafficElement = document.getElementById('avgTraffic');
    const trafficTrendElement = document.getElementById('trafficTrend');
    const peakTimeElement = document.getElementById('peakTime');
    const peakTrendElement = document.getElementById('peakTrend');
    const totalVehiclesElement = document.getElementById('totalVehicles');
    const totalTrendElement = document.getElementById('totalTrend');
    const statusBadgeElement = document.querySelector('.status-badge');
    const statusTrendElement = document.getElementById('statusTrend');
    
    if (avgTrafficElement) {
      avgTrafficElement.textContent = `${data.average_traffic || 0} vehicles/min`;
    }
    
    if (trafficTrendElement) {
      const trendDirection = data.trend_percentage > 0 ? '↑' : data.trend_percentage < 0 ? '↓' : '↔';
      trafficTrendElement.textContent = `${trendDirection} ${Math.abs(data.trend_percentage || 0)}% vs previous`;
    }
    
    if (peakTimeElement && data.peak_time) {
      peakTimeElement.textContent = data.peak_time;
    }
    
    if (peakTrendElement) {
      // Sample peak time trend text
      const randomShift = Math.floor(Math.random() * 30) - 15;
      const shiftDirection = randomShift > 0 ? 'later' : 'earlier';
      peakTrendElement.textContent = `${Math.abs(randomShift)} min ${shiftDirection} vs previous`;
    }
    
    if (totalVehiclesElement) {
      const formattedTotal = data.total_vehicles ? data.total_vehicles.toLocaleString() : '0';
      totalVehiclesElement.textContent = formattedTotal;
    }
    
    if (totalTrendElement && data.trend_percentage) {
      const trendDirection = data.trend_percentage > 0 ? '↑' : data.trend_percentage < 0 ? '↓' : '↔';
      totalTrendElement.textContent = `${trendDirection} ${Math.abs(data.trend_percentage)}% vs previous`;
    }
    
    // Update traffic status based on average traffic
    if (statusBadgeElement) {
      let status = 'Smooth';
      let badgeClass = 'bg-success';
      
      // Determine traffic status based on average traffic
      const avgTraffic = data.average_traffic || 0;
      if (avgTraffic >= 70) {
        status = 'Heavy';
        badgeClass = 'bg-danger';
      } else if (avgTraffic >= 40) {
        status = 'Moderate';
        badgeClass = 'bg-warning';
        // Make sure text is visible on yellow background
        statusBadgeElement.style.color = '#000';
      } else {
        statusBadgeElement.style.color = ''; // Reset to default
      }
      
      // Update badge text and class
      statusBadgeElement.textContent = status;
      
      // Remove existing background classes and add the new one
      statusBadgeElement.classList.remove('bg-success', 'bg-warning', 'bg-danger');
      statusBadgeElement.classList.add(badgeClass);
    }
    
    if (statusTrendElement) {
      // Calculate congestion trend based on recent data
      const recentData = data.historical_data?.slice(-5) || [];
      const olderData = data.historical_data?.slice(-10, -5) || [];
      
      if (recentData.length > 0 && olderData.length > 0) {
        const recentAvg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
        const olderAvg = olderData.reduce((sum, val) => sum + val, 0) / olderData.length;
        const congestionChange = recentAvg - olderAvg;
        
        if (Math.abs(congestionChange) < 5) {
          statusTrendElement.textContent = 'Stable traffic conditions';
        } else if (congestionChange > 0) {
          statusTrendElement.textContent = `Traffic congestion increasing (${Math.round(congestionChange)} veh/min)`;
        } else {
          statusTrendElement.textContent = `Traffic easing (${Math.round(Math.abs(congestionChange))} veh/min)`;
        }
      } else {
        statusTrendElement.textContent = 'Insufficient data for trend';
      }
    }
    
    console.log('Traffic statistics updated successfully');
  } catch (error) {
    console.error('Error updating traffic statistics:', error);
  }
}

// Expose the function to the window
window.updateTrafficStats = updateTrafficStats;

/**
 * Fetch traffic flow data for the specified time range
 * @param {number} range - Time range in minutes
 */
function fetchTrafficFlowDataImpl(range = currentTimeRange) {
  // Store the range as current
  currentTimeRange = range;
  window.currentTimeRange = range; // Update the global variable too
  
  fetch(`${window.location.origin}/api/traffic-flow/?minutes=${range}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      updateTrafficFlowChartImpl(data, range);
      // Call the updateTrafficStats function from the main page
      if (typeof window.updateTrafficStats === 'function') {
        window.updateTrafficStats(data);
      }
    })
    .catch(error => {
      console.error('Error fetching traffic flow data:', error);
      // Use simulated data as fallback
      const simulatedData = generateSimulatedTrafficDataImpl(range);
      updateTrafficFlowChartImpl(simulatedData, range);
      // Call the updateTrafficStats function from the main page
      if (typeof window.updateTrafficStats === 'function') {
        window.updateTrafficStats(simulatedData);
      }
    });
}

// Expose the function to the window
window.fetchTrafficFlowData = fetchTrafficFlowDataImpl;

/**
 * Generate simulated traffic data for testing
 * @param {number} range - Time range in minutes 
 */
function generateSimulatedTrafficDataImpl(range = 30) {
  // Create appropriate number of data points based on the range
  // For a nice visualization, we'll use:
  // - 30 min: 1 data point per minute
  // - 1 hour: 1 data point per 2 minutes
  // - 3 hours: 1 data point per 6 minutes
  // - 6 hours: 1 data point per 12 minutes
  let dataPointCount = 30;
  let interval = 1; // in minutes
  
  switch(range) {
    case 60: // 1 hour
      dataPointCount = 30;
      interval = 2;
      break;
    case 180: // 3 hours
      dataPointCount = 30;
      interval = 6;
      break;
    case 360: // 6 hours
      dataPointCount = 30;
      interval = 12;
      break;
    default: // 30 minutes or custom
      dataPointCount = range;
      interval = 1;
      break;
  }
  
  const historicalData = Array(dataPointCount).fill(0).map(() => Math.floor(Math.random() * 40) + 20);
  const predictedData = Array(15).fill(0).map((_, i) => {
    const baseValue = historicalData[historicalData.length - 1];
    const variance = Math.floor(Math.random() * 20) - 10;
    return Math.max(5, baseValue + variance);
  });
  
  const peakIndex = historicalData.indexOf(Math.max(...historicalData));
  const peakTime = new Date();
  peakTime.setMinutes(peakTime.getMinutes() - ((dataPointCount - peakIndex) * interval));
  
  return {
    historical_data: historicalData,
    predicted_data: predictedData,
    average_traffic: Math.round(historicalData.reduce((a, b) => a + b, 0) / historicalData.length),
    peak_time: peakTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    total_vehicles: historicalData.reduce((a, b) => a + b, 0),
    trend_percentage: Math.floor(Math.random() * 20) - 10,
    directions: {
      northbound: Math.floor(Math.random() * 40) + 10,
      southbound: Math.floor(Math.random() * 40) + 10
    },
    time_interval: interval
  };
}

// Expose the function to the window
window.generateSimulatedTrafficData = generateSimulatedTrafficDataImpl;

/**
 * Safely update chart without destroying it
 * This prevents the chart from disappearing during updates
 * @param {Object} chart - The chart instance to update
 * @param {Object} newData - New data for the chart
 */
function safeChartUpdate(chart, newData) {
  if (!chart || !chart.data || !chart.data.datasets) {
    console.error("Invalid chart for safe update");
    return false;
  }

  try {
    // Update datasets without recreating the chart
    if (newData.labels) {
      chart.data.labels = newData.labels;
    }
    
    if (newData.datasets && newData.datasets.length > 0) {
      // Update each dataset individually to maintain chart instance
      for (let i = 0; i < Math.min(chart.data.datasets.length, newData.datasets.length); i++) {
        if (newData.datasets[i].data) {
          chart.data.datasets[i].data = newData.datasets[i].data;
        }
        // Optionally update other dataset properties if needed
      }
    }
    
    // Apply updates without recreation
    chart.update('none'); // Use 'none' animation to prevent flicker
    return true;
  } catch (e) {
    console.error("Error in safe chart update:", e);
    return false;
  }
}

/**
 * Explicitly reattach a chart to a canvas
 * Use this when a chart's canvas reference is invalid but the chart instance still exists
 * @param {Object} chart - Chart instance to reattach
 * @param {HTMLElement} canvas - Canvas element to attach to
 * @return {boolean} true if successful, false otherwise
 */
function reattachChartToCanvas(chart, canvas) {
  console.log('Attempting to reattach chart to canvas:', canvas.id);
  
  if (!chart || !canvas) {
    console.error('Cannot reattach chart: chart or canvas is null');
    return false;
  }
  
  try {
    // Backup chart configuration and data
    const chartType = chart.config ? chart.config.type : 'line';
    let chartData = chart.data ? JSON.parse(JSON.stringify(chart.data)) : null;
    let chartOptions = chart.options ? JSON.parse(JSON.stringify(chart.options)) : null;
    
    // If no valid data, create a default structure instead of failing
    if (!chartData) {
      console.warn('No valid chart data found, using default data structure');
      chartData = {
        labels: Array(30).fill('').map((_, i) => {
          const time = new Date();
          time.setMinutes(time.getMinutes() - (30 - i));
          return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }),
        datasets: [
          {
            label: 'Historical Traffic',
            data: Array(30).fill(0),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      };
    }
    
    // Try to destroy chart but don't fail if this errors
    try {
      chart.destroy();
    } catch (e) {
      console.warn('Error destroying chart during reattachment:', e);
      // Continue despite destroy error
    }
    
    // Create a completely new chart with the same data and options
    window.trafficFlowChart = new Chart(canvas, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });
    
    // Store direct reference to canvas
    window.trafficFlowChart.canvas = canvas;
    
    console.log('Chart successfully reattached to canvas');
    return true;
  } catch (error) {
    console.error('Failed to reattach chart to canvas:', error);
    return false;
  }
}

// Expose the function globally
window.reattachChartToCanvas = reattachChartToCanvas;

/**
 * Update the traffic flow chart with new data
 * @param {Object} data - Traffic flow data
 * @param {number} range - Time range in minutes
 */
function updateTrafficFlowChartImpl(data, range = 30) {
  try {
    // Clear check: Make sure we have valid data
    if (!data || !data.historical_data) {
      console.error('Invalid data format provided to updateTrafficFlowChartImpl');
      console.log('Provided data:', data);
      return;
    }

    // CRITICAL FIX: Ensure we're operating on a valid DOM element
    // Double-check that the DOM is fully loaded before proceeding
    if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
      console.warn('Document not ready when updating traffic flow chart - deferring update');
      setTimeout(() => {
        updateTrafficFlowChartImpl(data, range);
      }, 500);
    return;
  }
  
    // Add a loading indicator to show something is happening
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
      console.error('Chart container element not found in the DOM');
      return;
    }

    let loadingIndicator = document.getElementById('chart-loading-indicator');
    
    if (chartContainer && !loadingIndicator) {
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
      loadingIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
      loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><div style="margin-top: 5px;">Updating chart...</div>';
      
      // Add to container but don't hide chart
      chartContainer.style.position = 'relative';
      chartContainer.appendChild(loadingIndicator);
    }

    // Find the canvas element
    let chartElement = document.getElementById('trafficFlowChart');
    
    // CANVAS MISMATCH FIX: Handle the case where we don't have a valid canvas
    if (!chartElement) {
      console.warn('Traffic flow chart canvas element not found - creating a new one');
      
      // Create a new canvas
      chartElement = document.createElement('canvas');
      chartElement.id = 'trafficFlowChart';
      
      // Add to container
      if (chartContainer) {
        // Clear container first to avoid duplicate canvases
        const existingCanvases = chartContainer.querySelectorAll('canvas');
        existingCanvases.forEach(canvas => {
          if (canvas.id === 'trafficFlowChart') {
            canvas.remove();
          }
        });
        
        chartContainer.appendChild(chartElement);
        console.log('Created new trafficFlowChart canvas in container');
      } else {
        console.error('Cannot create canvas - no container found');
        if (loadingIndicator) loadingIndicator.remove();
        return;
      }
    }
    
    // Ensure element is actually in the DOM
    if (!document.body.contains(chartElement)) {
      console.warn('Chart canvas exists but is not attached to the DOM - reattaching');
      
      // Try to add it back to container
      if (chartContainer) {
        // Remove any existing canvases with same ID
        const existingCanvases = chartContainer.querySelectorAll('canvas');
        existingCanvases.forEach(canvas => {
          if (canvas.id === 'trafficFlowChart') {
            canvas.remove();
          }
        });
        
        chartContainer.appendChild(chartElement);
        console.log('Reattached canvas to DOM');
      } else {
        // Create a completely new canvas
        chartElement = document.createElement('canvas');
        chartElement.id = 'trafficFlowChart';
        chartContainer.appendChild(chartElement);
        console.log('Created and attached new canvas');
      }
    }
    
    // CANVAS MISMATCH FIX: Check if chart exists but canvas references don't match
    if (window.trafficFlowChart) {
      // Check for canvas mismatch
      if (!window.trafficFlowChart.canvas || window.trafficFlowChart.canvas !== chartElement) {
        console.warn('Chart canvas mismatch detected - attempting reattachment');
        
        // Try to reattach using our new function
        const reattachSuccess = reattachChartToCanvas(window.trafficFlowChart, chartElement);
        
        // If reattachment failed, set to null to force recreation
        if (!reattachSuccess) {
          console.warn('Chart reattachment failed - will recreate from scratch');
          window.trafficFlowChart = null;
        } else {
          console.log('Chart successfully reattached to canvas');
        }
      }
    }
    
    // Check if we need to create a new chart
    if (!window.trafficFlowChart) {
      console.log('Creating new traffic flow chart');
      
      try {
        // Ensure Chart.js is available
        if (typeof Chart === 'undefined') {
          console.error('Chart.js not loaded - cannot create chart');
          if (loadingIndicator) loadingIndicator.remove();
          return;
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
              data: data.historical_data || Array(30).fill(0),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Predicted Traffic',
              data: data.predicted_data || Array(15).fill(0),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: true
        }
      ]
    };
        
        // Create new chart
        window.trafficFlowChart = new Chart(chartElement, {
          type: 'line',
          data: initialData,
          options: {
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
              },
              animation: {
                duration: 500  // shorter animation
              }
            }
          }
        });
        
        console.log('Traffic flow chart created successfully');
        
        // Remove loading indicator after short delay
        setTimeout(() => {
          if (loadingIndicator) loadingIndicator.remove();
        }, 500);
        
        // Update chart with data immediately
        updateChartData(data, range);
        return;
      } catch (chartCreationError) {
        console.error('Error creating traffic flow chart:', chartCreationError);
        if (loadingIndicator) loadingIndicator.remove();
    return;
      }
    }
    
    // At this point, we have a valid chart so update with data
    updateChartData(data, range);
    
    // Remove loading indicator after short delay
    setTimeout(() => {
      if (loadingIndicator) loadingIndicator.remove();
    }, 500);
    
  } catch (error) {
    console.error('Critical error in updateTrafficFlowChartImpl:', error);
    
    // If we get here, something really went wrong - try to reinitialize chart as a last resort
    if (typeof window.initializeTrafficFlowChart === 'function') {
      setTimeout(window.initializeTrafficFlowChart, 500);
    }
    
    // Always remove the loading indicator in case of error
    const loadingIndicator = document.getElementById('chart-loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
}

// Helper function to update chart data - separated to improve readability
function updateChartData(data, range) {
  try {
  // Determine interval based on range
  let interval = 1; // Default in minutes
  
  switch(range) {
    case 60: // 1 hour
      interval = 2;
      break;
    case 180: // 3 hours
      interval = 6;
      break;
    case 360: // 6 hours
      interval = 12;
      break;
    default: // 30 minutes or custom
      interval = data.time_interval || 1;
      break;
  }
  
    // Prepare chart data
    const chartData = {
      labels: [],
      datasets: [
        {
          data: data.historical_data || [],
          label: 'Historical Traffic'
        },
        {
          data: [],
          label: 'Predicted Traffic'
        }
      ]
    };
    
    // Handle prediction toggle
    const predictionToggle = document.getElementById('predictionToggle');
    const predictionEnabled = predictionToggle && predictionToggle.checked;
      
      // Create time-based labels
      const now = new Date();
      
    // For historical data (past)
    if (data.historical_data && data.historical_data.length > 0) {
      for (let i = data.historical_data.length - 1; i >= 0; i--) {
        const timePoint = new Date(now);
        timePoint.setMinutes(now.getMinutes() - ((i + 1) * interval));
        chartData.labels.push(timePoint.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      }
      }
      
    // For predicted data (future) if enabled
    if (predictionEnabled && data.predicted_data && data.predicted_data.length > 0) {
      // Add prediction labels
      for (let i = 1; i <= data.predicted_data.length; i++) {
        const timePoint = new Date(now);
        timePoint.setMinutes(now.getMinutes() + (i * interval));
        chartData.labels.push(timePoint.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      }
      
      // Set predicted data - important to align properly with labels
      // Historical data comes first, then predictions
      chartData.datasets[0].data = [...data.historical_data, ...Array(data.predicted_data.length).fill(null)];
      chartData.datasets[1].data = [...Array(data.historical_data.length).fill(null), ...data.predicted_data];
    } else {
      // If predictions not enabled, clear the prediction data
      chartData.datasets[1].data = Array(data.historical_data ? data.historical_data.length : 0).fill(null);
    }
    
    // Verify chart is still valid
    if (!window.trafficFlowChart || 
        !window.trafficFlowChart.update || 
        typeof window.trafficFlowChart.update !== 'function') {
      console.error('Chart instance is invalid - cannot update');
      return false;
    }
    
    // Apply updates to chart
    try {
      window.trafficFlowChart.data.labels = chartData.labels;
      window.trafficFlowChart.data.datasets[0].data = chartData.datasets[0].data;
      window.trafficFlowChart.data.datasets[1].data = chartData.datasets[1].data;
      
      // Make sure datasets have proper appearance settings
      window.trafficFlowChart.data.datasets[0].label = 'Historical Traffic';
      window.trafficFlowChart.data.datasets[0].borderColor = 'rgba(54, 162, 235, 1)';
      window.trafficFlowChart.data.datasets[0].backgroundColor = 'rgba(54, 162, 235, 0.2)';
      
      window.trafficFlowChart.data.datasets[1].label = 'Predicted Traffic';
      window.trafficFlowChart.data.datasets[1].borderColor = 'rgba(255, 99, 132, 1)';
      window.trafficFlowChart.data.datasets[1].backgroundColor = 'rgba(255, 99, 132, 0.2)';
      window.trafficFlowChart.data.datasets[1].borderDash = [5, 5];
      
      // Update tooltip settings to explain predictions
      window.trafficFlowChart.options.plugins.tooltip.callbacks = {
        footer: function(tooltipItems) {
          const datasetIndex = tooltipItems[0].datasetIndex;
          if (datasetIndex === 1 && predictionEnabled) {
            return 'This is a predicted value based on historical patterns';
          }
          return '';
        }
      };
      
      // Update with 'none' animation to prevent flicker
      window.trafficFlowChart.update('none');
      console.log('Chart updated successfully with new data', predictionEnabled ? '(predictions enabled)' : '(predictions disabled)');
      return true;
    } catch (updateError) {
      console.error('Error updating chart:', updateError);
      return false;
    }
  } catch (error) {
    console.error('Error in updateChartData:', error);
    return false;
  }
}

// Expose the function to the window
window.updateTrafficFlowChart = updateTrafficFlowChartImpl;

/**
 * Initialize the time range selectors
 */
function initTimeRangeSelectors() {
  // Handle time range selection
  document.querySelectorAll('[data-range]').forEach(button => {
    button.addEventListener('click', function() {
      const range = parseInt(this.getAttribute('data-range'), 10);
      
      // Update button active states
      document.querySelectorAll('[data-range]').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Handle custom range button differently
      if (isNaN(range)) {
        // Show custom range selector if needed
        if (this.getAttribute('data-range') === 'custom' || this.id === 'customRangeBtn') {
    // Initialize datetime inputs with reasonable defaults
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 2); // Default to last 2 hours
    
          // Format dates for datetime-local input
          const formatDatetimeLocal = (date) => {
            return date.getFullYear().toString() + '-' + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                  date.getDate().toString().padStart(2, '0') + 'T' + 
                  date.getHours().toString().padStart(2, '0') + ':' +
                  date.getMinutes().toString().padStart(2, '0');
          };
          
          // Set default values
          if (document.getElementById('startDate')) {
    document.getElementById('startDate').value = formatDatetimeLocal(startDate);
          }
          if (document.getElementById('endDate')) {
    document.getElementById('endDate').value = formatDatetimeLocal(endDate);
          }
    
    // Show modal
          const customRangeModal = document.getElementById('customRangeModal');
          if (customRangeModal && typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(customRangeModal);
            modal.show();
          }
        }
      } else {
        console.log(`Time range changed to ${range} minutes`);
        // Fetch data for the selected range
        fetchTrafficFlowDataImpl(range);
      }
    });
  });
  
  // Set up apply custom range handler
  const applyCustomRangeBtn = document.getElementById('applyCustomRange');
  if (applyCustomRangeBtn) {
    applyCustomRangeBtn.addEventListener('click', function() {
      const startDateInput = document.getElementById('startDate');
      const endDateInput = document.getElementById('endDate');
      
      if (!startDateInput || !endDateInput) {
        console.error('Custom range inputs not found');
        return;
      }
      
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date inputs');
        if (typeof showToast === 'function') {
          showToast('Please enter valid date and time values', 'warning');
        }
      return;
    }
    
    if (endDate <= startDate) {
        console.error('End date must be after start date');
        if (typeof showToast === 'function') {
      showToast('End date must be after start date', 'warning');
        }
      return;
    }
    
      // Calculate custom range in minutes
      const diffMinutes = Math.round((endDate - startDate) / 60000);
      console.log(`Custom time range: ${diffMinutes} minutes`);
    
    // Close modal
      const customRangeModal = document.getElementById('customRangeModal');
      if (customRangeModal && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(customRangeModal);
        if (modal) modal.hide();
      }
      
      // Apply the custom range
    fetchTrafficFlowDataImpl(diffMinutes);
    
      // Set the custom button to active
      document.querySelectorAll('[data-range]').forEach(btn => {
        btn.classList.remove('active');
      });
      const customBtn = document.getElementById('customRangeBtn');
      if (customBtn) customBtn.classList.add('active');
    });
  }
  
  // Initialize with default range of 30 minutes after a short delay
  setTimeout(function() {
    console.log("Initializing traffic flow chart with default 30 minute range");
    fetchTrafficFlowDataImpl(30);
  }, 800); // Delay to ensure chart is fully initialized
}

/**
 * Helper function to format datetime for datetime-local input
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string for datetime-local input
 */
function formatDatetimeLocal(date) {
  return date.getFullYear().toString() + '-' + 
         (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
         date.getDate().toString().padStart(2, '0') + 'T' + 
         date.getHours().toString().padStart(2, '0') + ':' +
         date.getMinutes().toString().padStart(2, '0');
}

/**
 * Initialize the traffic flow chart
 * This function creates a new Chart instance if one doesn't exist
 */
function initializeTrafficFlowChart() {
  console.log("Initializing traffic flow chart");
  
  // Show loading indicator
  const chartContainer = document.querySelector('.chart-container');
  let loadingIndicator = document.getElementById('chart-loading-indicator');
  
  if (chartContainer && !loadingIndicator) {
    loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'chart-loading-indicator';
    loadingIndicator.style.position = 'absolute';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingIndicator.style.padding = '15px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><div style="margin-top: 10px; font-weight: bold;">Initializing chart...</div>';
    
    // Add to container but don't hide chart
    chartContainer.style.position = 'relative';
    chartContainer.appendChild(loadingIndicator);
  }
  
  try {
  // If chart already exists, check validity and reset if corrupted
  if (window.trafficFlowChart) {
    try {
      // Test chart access to ensure it's valid
      if (window.trafficFlowChart.data && 
          window.trafficFlowChart.data.datasets && 
          window.trafficFlowChart.data.datasets.length > 0) {
          console.log("Chart already exists and looks valid, updating with new data");
          
          // Check if chart canvas is intact
          const chartElement = document.getElementById('trafficFlowChart');
          if (chartElement && isElementInDOM(chartElement) && 
              window.trafficFlowChart.canvas === chartElement) {
            console.log("Chart canvas is valid, using existing chart instance");
            
            // Instead of returning, update existing chart with fresh data
            try {
              // Generate some sample data
              const simulatedData = generateSimulatedTrafficDataImpl(30);
              updateTrafficFlowChartImpl(simulatedData, 30);
              
              // Remove loading indicator
              if (loadingIndicator) loadingIndicator.remove();
        return;
            } catch (updateError) {
              console.error("Error updating existing chart, will re-initialize:", updateError);
              // Continue to re-initialization below, but don't destroy existing chart yet
            }
          } else {
            console.warn("Chart's canvas reference is invalid, needs re-initialization");
            // Don't destroy chart yet, continue to re-initialize
          }
      } else {
        console.warn("Existing chart is corrupted, will re-initialize");
        // Don't return, continue to re-initialize
      }
    } catch (e) {
      console.error("Error checking existing chart, will re-initialize:", e);
      // Don't return, continue to re-initialize
    }
  }
  
  // Get chart context
    let chartElement = document.getElementById('trafficFlowChart');
    
    // If chartElement doesn't exist, try to create it
  if (!chartElement) {
      console.warn("Chart element not found in the DOM - attempting to create it");
      
      // Try to find the container
      const container = document.querySelector('.chart-container');
      if (container) {
        console.log("Found chart container, creating new canvas element");
        // Create a new canvas element
        chartElement = document.createElement('canvas');
        chartElement.id = 'trafficFlowChart';
        chartElement.width = container.clientWidth || 300;
        chartElement.height = container.clientHeight || 200;
        
        // Clear container and add canvas
        container.innerHTML = '';
        container.appendChild(chartElement);
        console.log("Created new canvas element with id 'trafficFlowChart'");
      } else {
        console.error("Chart container not found, cannot create canvas element");
        // Set up a retry mechanism
        setTimeout(() => {
          console.log("Retrying chart initialization...");
          initializeTrafficFlowChart();
        }, 500);
        return;
      }
    }
    
    // Verify the element is in the DOM
    if (!isElementInDOM(chartElement)) {
      console.error("Chart element exists but is not in the DOM");
      // Set up a retry mechanism
      setTimeout(() => {
        console.log("Retrying chart initialization...");
        initializeTrafficFlowChart();
      }, 500);
    return;
  }
  
  try {
    // Make sure Chart.js is available
    if (typeof Chart === 'undefined') {
      console.error("Chart.js library not available");
        // Remove loading indicator
        if (loadingIndicator) loadingIndicator.remove();
      return;
    }
    
      // Try to get context - with error handling
      let ctx;
      try {
        ctx = chartElement.getContext('2d');
      } catch (e) {
        console.error("Error getting 2d context:", e);
        // Try to recreate the canvas element
        const parent = chartElement.parentNode;
        if (parent) {
          const newCanvas = document.createElement('canvas');
          newCanvas.id = 'trafficFlowChart';
          newCanvas.width = chartElement.width || 300;
          newCanvas.height = chartElement.height || 200;
          newCanvas.className = chartElement.className;
          parent.removeChild(chartElement);
          parent.appendChild(newCanvas);
          
          // Try again with the new canvas
          chartElement = newCanvas;
          try {
            ctx = chartElement.getContext('2d');
          } catch (e2) {
            console.error("Failed to get context even with recreated canvas:", e2);
            // Remove loading indicator
            if (loadingIndicator) loadingIndicator.remove();
            return;
          }
        } else {
          console.error("Cannot recreate canvas - no parent element found");
          // Remove loading indicator
          if (loadingIndicator) loadingIndicator.remove();
          return;
        }
      }
      
    if (!ctx) {
      console.error("Failed to get chart context from canvas element");
        // Remove loading indicator
        if (loadingIndicator) loadingIndicator.remove();
      return;
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
          data: Array(30).fill(null),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Predicted Traffic',
          data: Array(30).fill(null),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: true
        }
      ]
    };
    
      // Only destroy existing chart instance if we absolutely must
      // Check if the canvas has changed or there's a serious chart issue
    if (window.trafficFlowChart) {
      try {
          const oldCanvas = window.trafficFlowChart.canvas;
          if (oldCanvas !== chartElement || 
             !window.trafficFlowChart.data || 
             !window.trafficFlowChart.data.datasets) {
            console.log("Canvas changed or chart corrupted - destroying old instance");
            // Only destroy if absolutely necessary
        if (typeof window.trafficFlowChart.destroy === 'function') {
          window.trafficFlowChart.destroy();
        } else {
          console.log("Chart instance doesn't have destroy method, resetting directly");
        }
            window.trafficFlowChart = null;
          } else {
            console.log("Preserving existing chart instance with same canvas");
            // Update the chart content instead of recreating
            safeChartUpdate(window.trafficFlowChart, initialData);
            console.log("Updated existing chart instance");
            
            // Generate some sample data for initial display
            try {
              const simulatedData = generateSimulatedTrafficDataImpl(30);
              updateTrafficFlowChartImpl(simulatedData, 30);
      } catch (e) {
              console.error("Error updating chart with initial data:", e);
            }
            
            // Remove loading indicator
            if (loadingIndicator) loadingIndicator.remove();
            return;
          }
        } catch (e) {
          console.error("Error checking existing chart:", e);
          // Destroy the existing chart as a fallback if checking failed
          if (window.trafficFlowChart && typeof window.trafficFlowChart.destroy === 'function') {
            try {
              window.trafficFlowChart.destroy();
            } catch (destroyError) {
              console.error("Error destroying chart:", destroyError);
            }
      }
      window.trafficFlowChart = null;
        }
    }
    
    // Create new chart instance with error handling
    try {
        // Clear the canvas manually to ensure a clean slate
        ctx.clearRect(0, 0, chartElement.width, chartElement.height);
      
        // Create new chart instance using the canvas element directly instead of context
        // This helps avoid certain Chart.js issues
        window.trafficFlowChart = new Chart(chartElement, {
        type: 'line',
        data: initialData,
        options: {
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
              },
              // Add animation configuration to make transitions smoother
              animation: {
                duration: 500,  // shorter animation
                easing: 'easeOutQuad'
            }
          }
        }
      });
      
      console.log("Traffic flow chart initialized successfully");
      
      // Verify the chart was created properly
      if (!window.trafficFlowChart || !window.trafficFlowChart.data || !window.trafficFlowChart.data.datasets) {
        console.error("Chart initialization verification failed");
          // Remove loading indicator
          if (loadingIndicator) loadingIndicator.remove();
        return;
      }
      
        // Generate some sample data for initial display - but wrap in try/catch
      try {
          const simulatedData = generateSimulatedTrafficDataImpl(30);
        updateTrafficFlowChartImpl(simulatedData, 30);
      } catch (e) {
        console.error("Error updating chart with initial data:", e);
          // Failed to update, but initialization succeeded - chart will just be empty initially
      }
    } catch (error) {
      console.error("Failed to create chart instance:", error);
        // Remove loading indicator
        if (loadingIndicator) loadingIndicator.remove();
    }
  } catch (error) {
    console.error("Error initializing traffic flow chart:", error);
      // Remove loading indicator
      if (loadingIndicator) loadingIndicator.remove();
    }
  } catch (finalError) {
    console.error("Critical error during chart initialization:", finalError);
    // Remove loading indicator
    if (loadingIndicator) loadingIndicator.remove();
  } finally {
    // Ensure loading indicator is removed in all cases
    setTimeout(() => {
      const indicator = document.getElementById('chart-loading-indicator');
      if (indicator) indicator.remove();
    }, 1000);
  }
}

// Expose initializeTrafficFlowChart to the window
window.initializeTrafficFlowChart = initializeTrafficFlowChart;

// Expose initTimeRangeSelectors to the window
window.initTimeRangeSelectors = initTimeRangeSelectors;

// Initialize immediately - add a delay to ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded in time_range_chart.js");
  
  // Define a function to verify chart container is ready
  function checkChartContainerAndInitialize() {
    const chartElement = document.getElementById('trafficFlowChart');
    const chartContainer = document.querySelector('.chart-container');
    
    if (!chartElement && !chartContainer) {
      console.warn("Chart element and container not found, retrying in 500ms...");
      setTimeout(checkChartContainerAndInitialize, 500);
      return false;
    }
    
    console.log("Chart container is ready, proceeding with initialization");
    return true;
  }

  // Create a sequential initialization process with proper delays
  function sequentialInit() {
    // First check if elements exist
    if (!checkChartContainerAndInitialize()) {
      // Will retry automatically
        return;
      }
      
    // Step 1: Initialize the chart with a slight delay
    setTimeout(() => {
      try {
        console.log("Starting chart initialization...");
        initializeTrafficFlowChart();
        console.log("Traffic flow chart initialized on page load");
        
        // Step 2: Initialize time range selectors after chart is ready
        setTimeout(() => {
          try {
            initTimeRangeSelectors();
            console.log("Time range selectors initialized");
            
            // Step 3: Fetch initial data after everything is set up
            setTimeout(() => {
              try {
                fetchTrafficFlowDataImpl(30); // Default to 30 minutes
                console.log("Initial traffic flow data fetched");
              } catch (dataError) {
                console.error("Error fetching initial data:", dataError);
              }
            }, 300);
          } catch (selectorError) {
            console.error("Error initializing time range selectors:", selectorError);
          }
        }, 300);
      } catch (chartError) {
        console.error("Error during chart initialization:", chartError);
      }
    }, 300);
  }
  
  // Start the sequential initialization process with a delay to ensure DOM is fully loaded
  setTimeout(sequentialInit, 500);
}); 