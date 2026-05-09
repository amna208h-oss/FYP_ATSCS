/**
 * Settings Handler
 * Manages saving and applying settings
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the save settings button
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
      saveAllSettings();
    });
  }
  
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', function() {
      resetAllSettings();
    });
  }
  
  /**
   * Save all settings from the forms
   */
  function saveAllSettings() {
    // Save traffic settings
    const trafficSettings = getFormValues('trafficSettings');
    localStorage.setItem('trafficSettings', JSON.stringify(trafficSettings));
    
    // Save camera settings
    const cameraSettings = getFormValues('cameraSettings');
    localStorage.setItem('cameraSettings', JSON.stringify(cameraSettings));
    
    // Save alert settings
    const alertSettings = getFormValues('alertSettings');
    localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
    
    // Save system settings
    const systemSettings = getFormValues('systemSettings');
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    
    // Apply system settings like theme immediately
    applySystemSettings(systemSettings);
    
    // Show success message
    if (typeof showToast === 'function') {
      showToast('Settings saved successfully', 'success');
    } else {
      alert('Settings saved successfully');
    }
  }
  
  /**
   * Reset all settings to defaults
   */
  function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Clear settings from localStorage
      localStorage.removeItem('trafficSettings');
      localStorage.removeItem('cameraSettings');
      localStorage.removeItem('alertSettings');
      localStorage.removeItem('systemSettings');
      localStorage.removeItem('dashboardTheme');
      
      // Reset form values
      document.getElementById('trafficSettings')?.reset();
      document.getElementById('cameraSettings')?.reset();
      document.getElementById('alertSettings')?.reset();
      document.getElementById('systemSettings')?.reset();
      
      // Reset theme to light
      if (document.getElementById('theme')) {
        document.getElementById('theme').value = 'light';
        
        // Apply light theme
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        
        // Call preserve original styling function if it exists
        if (typeof preserveOriginalCardStyling === 'function') {
          preserveOriginalCardStyling();
        } else {
          // Ensure card backgrounds stay with their original styling
          document.querySelectorAll('.dashboard-card, .card, .settings-card').forEach(card => {
            card.style.backgroundColor = '';
          });
          
          // Ensure stat cards keep their original styling
          document.querySelectorAll('.stat-card').forEach(stat => {
            stat.style.backgroundColor = '';
            stat.style.color = '';
          });
        }
      }
      
      // Show success message
      if (typeof showToast === 'function') {
        showToast('Settings reset to defaults', 'info');
      } else {
        alert('Settings reset to defaults');
      }
    }
  }
  
  /**
   * Get all form values as an object
   */
  function getFormValues(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const values = {};
    
    formData.forEach((value, key) => {
      if (form.elements[key].type === 'checkbox') {
        values[key] = form.elements[key].checked;
      } else {
        values[key] = value;
      }
    });
    
    // Handle checkboxes that might not be in formData when unchecked
    Array.from(form.elements).forEach(element => {
      if (element.type === 'checkbox' && !formData.has(element.name)) {
        values[element.name] = false;
      }
    });
    
    return values;
  }
  
  /**
   * Apply system settings immediately
   */
  function applySystemSettings(settings) {
    // Apply theme if it exists in settings
    if (settings.theme) {
      // The theme_switcher.js will handle the actual theme application
      // Just make sure the dropdown is set to the right value
      const themeDropdown = document.getElementById('theme');
      if (themeDropdown) {
        themeDropdown.value = settings.theme;
        
        // Trigger change event to apply theme
        const event = new Event('change');
        themeDropdown.dispatchEvent(event);
      }
    }
    
    // Apply refresh rate if it exists
    if (settings.refreshRate) {
      // Implement refresh rate changes
      console.log(`Setting refresh rate to ${settings.refreshRate} seconds`);
      
      // Example: Set a global refresh interval
      if (window.dataRefreshInterval) {
        clearInterval(window.dataRefreshInterval);
      }
      
      window.dataRefreshInterval = setInterval(function() {
        // Refresh data here
        console.log('Refreshing data...');
        // Add actual refresh logic
      }, parseInt(settings.refreshRate) * 1000);
    }
    
    // Apply other display settings
    if (settings.showGrid !== undefined) {
      document.documentElement.style.setProperty('--grid-display', settings.showGrid ? 'block' : 'none');
    }
    
    if (settings.showLabels !== undefined) {
      document.documentElement.style.setProperty('--labels-display', settings.showLabels ? 'block' : 'none');
    }
    
    if (settings.showTooltips !== undefined) {
      document.documentElement.style.setProperty('--tooltips-display', settings.showTooltips ? 'block' : 'none');
    }
  }
  
  // Load saved settings on page load
  function loadSavedSettings() {
    try {
      // Load traffic settings
      const trafficSettings = JSON.parse(localStorage.getItem('trafficSettings'));
      if (trafficSettings) applyFormValues('trafficSettings', trafficSettings);
      
      // Load camera settings
      const cameraSettings = JSON.parse(localStorage.getItem('cameraSettings'));
      if (cameraSettings) applyFormValues('cameraSettings', cameraSettings);
      
      // Load alert settings
      const alertSettings = JSON.parse(localStorage.getItem('alertSettings'));
      if (alertSettings) applyFormValues('alertSettings', alertSettings);
      
      // Load system settings
      const systemSettings = JSON.parse(localStorage.getItem('systemSettings'));
      if (systemSettings) {
        applyFormValues('systemSettings', systemSettings);
        applySystemSettings(systemSettings);
      }
    } catch (e) {
      console.error('Error loading saved settings:', e);
    }
  }
  
  /**
   * Apply values to a form
   */
  function applyFormValues(formId, values) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    for (const [key, value] of Object.entries(values)) {
      const element = form.elements[key];
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    }
  }
  
  // Load saved settings on startup
  loadSavedSettings();
}); 