/**
 * Theme Switcher
 * Handles theme switching functionality for the dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Select the theme dropdown
  const themeSelector = document.getElementById('theme');
  
  if (!themeSelector) {
    console.error('Theme selector not found');
    return;
  }
  
  // Set up theme switching
  initTheme();
  
  // Add event listener for theme changes
  themeSelector.addEventListener('change', function() {
    const selectedTheme = this.value;
    setTheme(selectedTheme);
    
    // Show toast notification
    if (typeof showToast === 'function') {
      showToast(`Theme changed to ${selectedTheme}`, 'success');
    }
  });
  
  /**
   * Initialize theme based on localStorage or system preference
   */
  function initTheme() {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('dashboardTheme') || 'light';
    
    // Set the dropdown to the saved theme
    themeSelector.value = savedTheme;
    
    // Apply the theme
    setTheme(savedTheme);
  }
  
  /**
   * Set the theme on the document and save to localStorage
   */
  function setTheme(mode) {
    // Validate theme mode
    if (!['light', 'dark', 'auto'].includes(mode)) {
      console.error(`Invalid theme mode: ${mode}. Defaulting to light.`);
      mode = 'light';
    }
    
    // Remove existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    if (mode === 'auto') {
      // Check system preference for dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Only apply the theme to body, not modifying card colors
      if (prefersDark) {
        document.body.classList.add('theme-dark');
        preserveOriginalCardStyling();
      } else {
        document.body.classList.add('theme-light');
        preserveOriginalCardStyling();
      }
      
      // Set up listener for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(e.matches ? 'theme-dark' : 'theme-light');
        preserveOriginalCardStyling();
      });
    } else {
      // Apply theme class directly to body only
      document.body.classList.add(`theme-${mode}`);
      preserveOriginalCardStyling();
    }
    
    // Save theme preference
    localStorage.setItem('dashboardTheme', mode);
  }
  
  /**
   * Ensure cards, stats and other elements keep their original styling
   * even when the theme changes
   */
  function preserveOriginalCardStyling() {
    // Ensure card backgrounds stay with their original styling
    document.querySelectorAll('.dashboard-card, .card, .settings-card').forEach(card => {
      // Remove any theme-specific background colors that might have been applied
      card.style.backgroundColor = '';
    });
    
    // Ensure stat cards keep their original styling
    document.querySelectorAll('.stat-card').forEach(stat => {
      stat.style.backgroundColor = '';
      stat.style.color = '';
    });
    
    // Ensure stat values keep their original styling
    document.querySelectorAll('.stat-value').forEach(value => {
      value.style.color = '';
    });
    
    // Ensure form controls keep their original background
    document.querySelectorAll('.form-control, .form-select').forEach(formControl => {
      formControl.style.backgroundColor = '';
    });
    
    // Ensure dropdown menus keep their original background
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
      dropdown.style.backgroundColor = '';
    });
    
    // Ensure modal contents keep their original background
    document.querySelectorAll('.modal-content').forEach(modal => {
      modal.style.backgroundColor = '';
    });
    
    // Apply dark mode styles for predictions label, but don't reset normal styling
    if (document.body.classList.contains('theme-dark')) {
      console.log("Applying dark theme styles to prediction label");
      document.querySelectorAll('.predict-color').forEach(label => {
        label.style.color = '#000000';
      });
    } else {
      document.querySelectorAll('.predict-color').forEach(label => {
        label.style.color = '#4CAF50';
      });
    }
  }
}); 