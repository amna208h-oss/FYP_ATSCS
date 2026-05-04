/**
 * Fix for recursive function call issue in the time range chart functionality
 * This script should be included after time_range_chart.js
 */
(function() {
  console.log("Applying recursion safety wrapper...");
  
  // Check if fetchTrafficFlowData is already defined
  if (typeof window.fetchTrafficFlowData === 'function') {
    // Store a reference to the original function
    var origFetchTrafficFlowData = window.fetchTrafficFlowData;
    
    // Replace with a version that uses setTimeout to break call stack
    window.fetchTrafficFlowData = function(range) {
      console.log("Safe fetchTrafficFlowData called with range:", range);
      setTimeout(function() {
        // Call the original function directly
        origFetchTrafficFlowData(range);
      }, 0);
    };
    
    console.log("Recursion safety wrapper applied");
  } else {
    console.warn("fetchTrafficFlowData not found, safety wrapper not applied");
  }
})(); 