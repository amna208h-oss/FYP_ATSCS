/**
 * Minimal Bootstrap Dropdown Fix
 * A non-intrusive fix that ensures dropdowns work properly
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[MinimalFix] Initializing dropdown fix');
    
    // CRITICAL: Remove any previous dropdown handlers that might be causing conflicts
    // by removing data-bs-toggle attributes and then restoring them
    function fixDropdowns() {
        // Get all dropdown toggles
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            // Remove any event listeners by cloning the element
            const parent = toggle.parentNode;
            const clone = toggle.cloneNode(true);
            
            // Make sure the toggle has the correct attributes
            if (!clone.hasAttribute('data-bs-toggle')) {
                clone.setAttribute('data-bs-toggle', 'dropdown');
            }
            
            // Replace the original toggle with the clone
            if (parent) {
                parent.replaceChild(clone, toggle);
            }
            
            // Re-initialize with Bootstrap
            if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                new bootstrap.Dropdown(clone);
            }
        });
        
        console.log('[MinimalFix] Fixed', dropdownToggles.length, 'dropdown toggles');
    }
    
    // Wait a short time to ensure Bootstrap is loaded
    setTimeout(fixDropdowns, 500);
}); 