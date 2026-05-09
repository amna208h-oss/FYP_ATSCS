/**
 * Enhanced chart reattachment utility
 * This file provides improved functions for reattaching charts to canvases
 * and prevents automatic fixes from breaking modal charts
 */

console.log('[ChartFix] Loading enhanced chart reattachment utilities');

// Enhanced reattach function that doesn't fail when data is missing
window.reattachChartToCanvas = function(chart, canvas) {
  console.log('Enhanced: Attempting to reattach chart to canvas:', canvas.id);
  
  if (!chart || !canvas) {
    console.error('Cannot reattach chart: chart or canvas is null');
    return false;
  }
  
  try {
    // Backup chart configuration and data
    const chartType = chart.config ? chart.config.type : 'line';
    let chartData = null;
    let chartOptions = null;
    
    try {
      // Try to safely extract data with deep clone
      if (chart.data) {
        chartData = JSON.parse(JSON.stringify(chart.data));
      }
      
      if (chart.options) {
        chartOptions = JSON.parse(JSON.stringify(chart.options));
      }
    } catch (parseError) {
      console.warn('Error parsing chart data/options:', parseError);
      // Continue with null data/options
    }
    
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
    
    // If no options, create default options
    if (!chartOptions) {
      console.warn('No valid chart options found, using default options');
      chartOptions = {
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
    }
    
    // Try to destroy chart but don't fail if this errors
    try {
      chart.destroy();
    } catch (e) {
      console.warn('Error destroying chart during reattachment:', e);
      // Continue despite destroy error
    }
    
    // Create a completely new chart with the same data and options
    let newChart;
    
    // Get chart ID from canvas
    const chartId = canvas.id;
    
    try {
      newChart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: chartOptions
      });
      
      // Store direct reference to canvas
      newChart.canvas = canvas;
      
      // If this is a comparison chart, mark it as such
      if (chartId === 'currentPatternChart' || chartId === 'previousPatternChart') {
        newChart._isComparisonChart = true;
      }
      
      // Update global reference
      window[chartId] = newChart;
      
      console.log('Chart successfully reattached to canvas');
    } catch (chartError) {
      console.error('Error creating new chart:', chartError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to reattach chart to canvas:', error);
    return false;
  }
};

// Override the fixAllChartCanvasMismatches function to be safer with modal charts
const originalFixAllChartCanvasMismatches = window.fixAllChartCanvasMismatches;

window.fixAllChartCanvasMismatches = function() {
  console.log('[ChartFix] Enhanced chart fix - checking for modals first');
  
  // Check if any modals are visible - if so, skip chart fixing entirely
  const visibleModals = document.querySelectorAll('.modal.show');
  if (visibleModals.length > 0) {
    console.log('[ChartFix] Skipping chart fix while modals are visible');
    return { 
      scanned: 0, 
      fixed: 0, 
      recreated: 0, 
      errors: 0, 
      skipped: 2, 
      aborted: true,
      reason: 'Modal is visible'
    };
  }
  
  // Continue with original function if no modal is visible
  return originalFixAllChartCanvasMismatches ? 
    originalFixAllChartCanvasMismatches() : 
    { error: 'Original function not available' };
};

// Add event listeners for modals to protect charts
document.addEventListener('DOMContentLoaded', function() {
  console.log('[ChartFix] Setting up modal chart protection');
  
  // Find comparison modal
  const compareModal = document.getElementById('compareModal');
  if (compareModal) {
    // When modal is shown, mark all charts inside it
    compareModal.addEventListener('shown.bs.modal', function() {
      console.log('[ChartFix] Comparison modal shown, protecting charts');
      
      // Protect current period chart
      if (window.currentPatternChart) {
        window.currentPatternChart._isComparisonChart = true;
        console.log('[ChartFix] Protected currentPatternChart');
      }
      
      // Protect previous period chart
      if (window.previousPatternChart) {
        window.previousPatternChart._isComparisonChart = true;
        console.log('[ChartFix] Protected previousPatternChart');
      }
    });
  }
}); 