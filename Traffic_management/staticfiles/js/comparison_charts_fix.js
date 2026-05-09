/**
 * Comparison Charts Fix
 * 
 * This file provides a complete solution for the comparison charts functionality.
 * It overrides the prepareComparisonCharts function to ensure charts are properly 
 * created and displayed without disappearing.
 */

console.log('[ComparisonChartsFix] Loading complete comparison charts fix');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('[ComparisonChartsFix] Initializing');
  
  // Store a reference to any existing implementation
  const originalPrepareComparisonCharts = window.prepareComparisonCharts;
  
  // Completely replace the function with our robust implementation
  window.prepareComparisonCharts = function() {
    console.log('[ComparisonChartsFix] Executing fixed comparison charts implementation');
    
    // Ensure we have chart data
    if (!window.trafficFlowChart || !window.trafficFlowChart.data) {
      console.error("[ComparisonChartsFix] Main traffic flow chart not initialized");
      showToast("Please wait for the traffic flow chart to load first", "warning");
      return;
    }
    
    // Clone the current data
    const currentData = JSON.parse(JSON.stringify(window.trafficFlowChart.data));
    
    // Create previous period data with slight variations
    const previousData = {
      labels: [...currentData.labels],
      datasets: [{
        ...currentData.datasets[0],
        label: 'Previous Period',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        data: currentData.datasets[0].data.map(value => {
          const variation = Math.random() * 20 - 10; // -10 to +10
          return Math.max(0, Math.round((value || 0) + variation));
        })
      }]
    };
    
    // Customize current data appearance
    if (currentData.datasets && currentData.datasets[0]) {
      currentData.datasets[0].label = 'Current Period';
      currentData.datasets[0].borderColor = 'rgba(54, 162, 235, 1)';
      currentData.datasets[0].backgroundColor = 'rgba(54, 162, 235, 0.2)';
    }
    
    // Show notification
    showToast("Opening comparison view...", "info");
    
    // Get modal element
    const compareModal = document.getElementById('compareModal');
    if (!compareModal) {
      console.error('[ComparisonChartsFix] Compare modal not found');
      showToast("Error: Comparison view not available", "error");
      return;
    }
    
    // Set up protection flag to prevent chart destruction
    window._chartsProtected = true;
    
    // Create and show modal
    let modalInstance;
    try {
      modalInstance = new bootstrap.Modal(compareModal);
      modalInstance.show();
    } catch (error) {
      console.error("[ComparisonChartsFix] Error creating modal:", error);
      showToast("Error showing comparison view", "error");
      window._chartsProtected = false;
      return;
    }
    
    // Create charts when modal is fully shown
    compareModal.addEventListener('shown.bs.modal', function modalShownHandler() {
      console.log('[ComparisonChartsFix] Modal shown, creating charts');
      
      // Remove this event listener to prevent multiple executions
      compareModal.removeEventListener('shown.bs.modal', modalShownHandler);
      
      // Create both charts
      createBothCharts();
      
      // Set up interval to check chart existence
      const chartCheckInterval = setInterval(() => {
        if (!window._chartsProtected) {
          clearInterval(chartCheckInterval);
          return;
        }
        
        // Check both charts
        const currentChart = window.currentPatternChart;
        const previousChart = window.previousPatternChart;
        const currentCanvas = document.getElementById('currentPatternChart');
        const previousCanvas = document.getElementById('previousPatternChart');
        
        if (!currentCanvas || !previousCanvas || !currentChart || !previousChart) {
          console.warn('[ComparisonChartsFix] Charts missing, recreating');
          createBothCharts();
        }
      }, 100);
      
      // Store interval for cleanup
      window._chartCheckInterval = chartCheckInterval;
    });
    
    // Clean up when modal is closed
    compareModal.addEventListener('hidden.bs.modal', function() {
      console.log('[ComparisonChartsFix] Modal hidden, cleaning up');
      
      // Allow charts to be destroyed
      window._chartsProtected = false;
      
      // Clear check interval
      if (window._chartCheckInterval) {
        clearInterval(window._chartCheckInterval);
        window._chartCheckInterval = null;
      }
    });
    
    // Function to create both charts
    function createBothCharts() {
      console.log('[ComparisonChartsFix] Creating both charts');
      
      // First, destroy any existing charts
      ['currentPatternChart', 'previousPatternChart'].forEach(chartId => {
        if (window[chartId]) {
          try {
            window[chartId].destroy();
          } catch (e) {
            console.warn(`[ComparisonChartsFix] Error destroying ${chartId}:`, e);
          }
          window[chartId] = null;
        }
      });
      
      // Completely remove and recreate canvas elements
      ['currentPatternChart', 'previousPatternChart'].forEach(chartId => {
        const containerId = chartId === 'currentPatternChart' ? 'currentChartContainer' : 'previousChartContainer';
        const container = document.getElementById(containerId);
        
        if (container) {
          // Clear container
          container.innerHTML = '';
          
          // Create fresh canvas
          const canvas = document.createElement('canvas');
          canvas.id = chartId;
          canvas.style.cssText = 'display: block; visibility: visible; width: 100%; height: 100%;';
          container.appendChild(canvas);
          
          console.log(`[ComparisonChartsFix] Recreated canvas for ${chartId}`);
        } else {
          console.error(`[ComparisonChartsFix] Container ${containerId} not found`);
        }
      });
      
      // Create chart configurations
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Disable animations for better performance
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
              maxTicksLimit: 8
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: true
          },
          legend: {
            display: true,
            position: 'top'
          }
        }
      };
      
      // Create current period chart
      try {
        const currentCanvas = document.getElementById('currentPatternChart');
        if (currentCanvas) {
          window.currentPatternChart = new Chart(currentCanvas, {
            type: 'line',
            data: currentData,
            options: chartOptions
          });
          console.log('[ComparisonChartsFix] Created current period chart');
        }
      } catch (e) {
        console.error('[ComparisonChartsFix] Error creating current chart:', e);
      }
      
      // Create previous period chart
      try {
        const previousCanvas = document.getElementById('previousPatternChart');
        if (previousCanvas) {
          window.previousPatternChart = new Chart(previousCanvas, {
            type: 'line',
            data: previousData,
            options: chartOptions
          });
          console.log('[ComparisonChartsFix] Created previous period chart');
        }
      } catch (e) {
        console.error('[ComparisonChartsFix] Error creating previous chart:', e);
      }
      
      // Generate analysis text
      generateAnalysisText(currentData, previousData);
    }
    
    // Function to generate analysis text
    function generateAnalysisText(currentData, previousData) {
      const analysisElement = document.getElementById('patternAnalysis');
      if (!analysisElement) return;
      
      try {
        // Calculate averages
        const getCurrentAvg = arr => arr.length ? 
          (arr.reduce((a, b) => a + (b || 0), 0) / arr.length).toFixed(1) : 0;
        
        const currentChartData = currentData.datasets[0].data;
        const previousChartData = previousData.datasets[0].data;
        
        const currentAvg = getCurrentAvg(currentChartData);
        const previousAvg = getCurrentAvg(previousChartData);
        
        // Calculate percent change
        const percentChange = previousAvg > 0 ? 
          (((currentAvg - previousAvg) / previousAvg) * 100).toFixed(1) : 0;
        
        // Get max values
        const currentMax = Math.max(...currentChartData.map(v => v || 0));
        const previousMax = Math.max(...previousChartData.map(v => v || 0));
        
        // Determine trend description
        let trendDescription, recommendationText;
        
        if (percentChange > 5) {
          trendDescription = `<span class="text-danger">increased by ${percentChange}%</span>`;
          recommendationText = "Consider adjusting signal timing to accommodate higher traffic volume.";
        } else if (percentChange < -5) {
          trendDescription = `<span class="text-success">decreased by ${Math.abs(percentChange)}%</span>`;
          recommendationText = "Current signal timing may be optimized for higher traffic volume.";
        } else {
          trendDescription = `<span class="text-info">remained stable</span> (${percentChange}% change)`;
          recommendationText = "Current traffic management approach is suitable for consistent flow patterns.";
        }
        
        // Find peak times
        const getCurrentMaxIndex = arr => arr.indexOf(Math.max(...arr));
        const timeLabels = currentData.labels || [];
        const currentPeakTime = timeLabels[getCurrentMaxIndex(currentChartData)] || 'N/A';
        const previousPeakTime = timeLabels[getCurrentMaxIndex(previousChartData)] || 'N/A';
        
        // Generate analysis HTML
        analysisElement.innerHTML = `
          <p><strong>Traffic Trend Analysis:</strong> Average traffic flow has ${trendDescription} compared to the previous period. 
          Peak volume is currently ${currentMax} vehicles/minute (previously ${previousMax}).</p>
          
          <p><strong>Peak Time Shift:</strong> Current peak traffic occurs at ${currentPeakTime}, 
          ${currentPeakTime === previousPeakTime ? 
            'consistent with the previous period.' : 
            `while previously it occurred at ${previousPeakTime}.`}</p>
          
          <p><strong>Recommendations:</strong> ${recommendationText}</p>
        `;
      } catch (e) {
        console.error('[ComparisonChartsFix] Error generating analysis:', e);
        analysisElement.innerHTML = '<p class="text-danger">Error generating traffic analysis.</p>';
      }
    }
  };
  
  // Add global helper function to fix charts
  window.fixComparisonCharts = function() {
    console.log('[ComparisonChartsFix] Manual fix requested');
    
    // Check if modal is open
    const compareModal = document.getElementById('compareModal');
    if (!compareModal || !compareModal.classList.contains('show')) {
      showToast('Cannot fix charts - comparison view is not open', 'warning');
      return;
    }
    
    // Force recreation of charts
    window._chartsProtected = true;
    
    // Dispatch shown event to trigger chart recreation
    const event = new Event('shown.bs.modal');
    compareModal.dispatchEvent(event);
    
    showToast('Comparison charts refreshed', 'success');
  };
  
  // Add debug function
  window.debugComparisonCharts = function() {
    console.log('[ComparisonChartsFix] Debug info:');
    
    // Check modal
    const compareModal = document.getElementById('compareModal');
    console.log('Modal exists:', !!compareModal);
    console.log('Modal is shown:', compareModal ? compareModal.classList.contains('show') : false);
    
    // Check containers
    const currentContainer = document.getElementById('currentChartContainer');
    const previousContainer = document.getElementById('previousChartContainer');
    console.log('Current container exists:', !!currentContainer);
    console.log('Previous container exists:', !!previousContainer);
    
    // Check canvases
    const currentCanvas = document.getElementById('currentPatternChart');
    const previousCanvas = document.getElementById('previousPatternChart');
    console.log('Current canvas exists:', !!currentCanvas);
    console.log('Previous canvas exists:', !!previousCanvas);
    
    // Check chart instances
    console.log('Current chart instance exists:', !!window.currentPatternChart);
    console.log('Previous chart instance exists:', !!window.previousPatternChart);
    
    // Check protection status
    console.log('Charts protected:', !!window._chartsProtected);
    
    return 'Debug info logged to console';
  };
  
  console.log('[ComparisonChartsFix] Ready');
}); 