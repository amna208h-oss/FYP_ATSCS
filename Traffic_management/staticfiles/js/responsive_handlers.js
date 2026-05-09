/**
 * Smart Traffic Management System
 * Responsive Behavior Handlers
 */

// Helper function to debug column layout issues
// Function disabled as the buttons have been removed
/*
function debugColumnLayout() {
  console.log('--- Column Layout Debug ---');
  
  const mainCamera = document.querySelector('.main-camera');
  if (mainCamera) {
    const mainCameraCol = mainCamera.closest('.col-md-8') || mainCamera.closest('.col-md-12');
    console.log('Main camera column:', mainCameraCol);
    console.log('  - order:', mainCameraCol.style.order);
    console.log('  - classes:', mainCameraCol.className);
    console.log('  - computed order:', window.getComputedStyle(mainCameraCol).order);
  } else {
    console.log('Main camera not found');
  }
  
  const directionalCameras = document.querySelectorAll('.col-md-4');
  console.log('Side cameras found:', directionalCameras.length);
  directionalCameras.forEach((cam, index) => {
    console.log(`Side camera ${index}:`);
    console.log('  - order:', cam.style.order);
    console.log('  - classes:', cam.className);
    console.log('  - computed order:', window.getComputedStyle(cam).order);
  });
  
  console.log('------------------------');
}
*/

// Handle toggle for main intersection view position
// Function disabled as the position button has been removed
/*
function setupMainIntersectionToggle() {
  // Get the toggle button for intersection position
  const toggleButton = document.getElementById('intersectionToggleBtn');
  // Get the main intersection container
  const mainIntersectionContainer = document.querySelector('.main-camera');
  const mainIntersectionCol = document.querySelector('.col-md-8');
  
  // Variable to track the current position state
  let isOriginalPosition = true;
  
  if (toggleButton && mainIntersectionContainer) {
    toggleButton.addEventListener('click', function(e) {
      // Toggle the position state
      isOriginalPosition = !isOriginalPosition;
      
      // Log initial state for debugging
      console.log('Before position toggle - State:', isOriginalPosition ? 'original' : 'moved');
      debugColumnLayout();
      
      if (isOriginalPosition) {
        // Move back to original position (top)
        mainIntersectionCol.style.order = '0'; // Use explicit '0' instead of empty string
        
        // Force redraw to ensure the style change is applied
        void mainIntersectionCol.offsetWidth;
        
        // Update button icon to indicate current state
        toggleButton.querySelector('i').classList.remove('bi-arrow-up');
        toggleButton.querySelector('i').classList.add('bi-arrow-down-up');
        
        // Update tooltip
        toggleButton.setAttribute('title', 'Move intersection view down');
        
        // Show toast notification
        if (typeof showToast === 'function') {
          showToast('Main intersection view restored to original position', 'info');
        }
        
        console.log('Main intersection moved back to original position, order set to:', mainIntersectionCol.style.order);
      } else {
        // Move to downward position (below other cameras)
        mainIntersectionCol.style.order = '1';
        
        // Force redraw to ensure the style change is applied
        void mainIntersectionCol.offsetWidth;
        
        // Update button icon to indicate current state
        toggleButton.querySelector('i').classList.remove('bi-arrow-down-up');
        toggleButton.querySelector('i').classList.add('bi-arrow-up');
        
        // Update tooltip
        toggleButton.setAttribute('title', 'Move intersection view back to top');
        
        // Show toast notification
        if (typeof showToast === 'function') {
          showToast('Main intersection view moved down', 'info');
        }
        
        console.log('Main intersection moved down, order set to:', mainIntersectionCol.style.order);
      }
      
      // Log final state for debugging
      setTimeout(() => {
        console.log('After position toggle - State:', isOriginalPosition ? 'original' : 'moved');
        debugColumnLayout();
      }, 100);
    });
    
    console.log('Main intersection toggle functionality initialized');
    debugColumnLayout(); // Initial debug output
  } else {
    console.warn('Main intersection toggle elements not found');
  }
}
*/

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all Bootstrap components
  function initBootstrapComponents() {
    if (typeof bootstrap !== 'undefined') {
      // Initialize tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
      
      // Initialize popovers
      const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
      popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
      });
      
      // Initialize dropdowns explicitly
      const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
      dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
      });
      
      // Explicitly initialize the navbar collapse
      const navbarCollapseElement = document.querySelector('.navbar-collapse');
      if (navbarCollapseElement) {
        const bsNavbarCollapse = new bootstrap.Collapse(navbarCollapseElement, {
          toggle: false
        });
        
        // Store it for reference
        window.bsNavbarCollapse = bsNavbarCollapse;
      }
    } else {
      console.warn('Bootstrap JavaScript is not available. Some UI components may not function properly.');
    }
  }
  initBootstrapComponents();
  
  // Handle responsive camera grid layout
  // This function is no longer needed as the button was removed
  /*
  const cameraGridToggle = document.getElementById('cameraGridToggle');
  const monitoringSection = document.getElementById('monitoring');
  
  if (cameraGridToggle && monitoringSection) {
    // Initial state
    let isGridView = window.innerWidth >= 768;
    updateCameraLayout(isGridView);
    
    // Toggle grid view when button is clicked
    cameraGridToggle.addEventListener('click', function() {
      isGridView = !isGridView;
      updateCameraLayout(isGridView);
      
      // Update button icon
      cameraGridToggle.innerHTML = isGridView 
        ? '<i class="bi bi-layout-split"></i>' 
        : '<i class="bi bi-grid-3x3"></i>';
      
      // Show toast
      if (typeof showToast === 'function') {
        showToast(`Switched to ${isGridView ? 'grid' : 'list'} view`, 'info');
      }
    });
    
    // Also update on window resize
    window.addEventListener('resize', function() {
      // Auto-switch to list view on small screens and grid view on larger screens
      if (window.innerWidth < 768 && isGridView) {
        isGridView = false;
        updateCameraLayout(isGridView);
        cameraGridToggle.innerHTML = '<i class="bi bi-grid-3x3"></i>';
      }
    });
  }
  */
  
  // Apply default grid layout once at load
  const monitoringSection = document.getElementById('monitoring');
  if (monitoringSection) {
    const isGridView = window.innerWidth >= 768;
    updateCameraLayout(isGridView);
    
    // Also update on resize
    window.addEventListener('resize', function() {
      const isGridView = window.innerWidth >= 768;
      updateCameraLayout(isGridView);
    });
  }
  
  // Function to update camera layout based on view mode
  function updateCameraLayout(isGridView) {
    const mainCamera = monitoringSection.querySelector('.main-camera');
    const directionalCameras = monitoringSection.querySelectorAll('.col-md-3, .col-md-4');
    
    if (isGridView) {
      // Grid layout
      if (mainCamera) {
        const mainCameraCol = mainCamera.closest('.col-md-8');
        // Keep default order (0)
        mainCameraCol.classList.remove('col-md-12');
        mainCameraCol.classList.add('col-md-8');
      }
      
      directionalCameras.forEach(cam => {
        cam.style.display = '';
      });
    } else {
      // List/stack layout
      if (mainCamera) {
        const mainCameraCol = mainCamera.closest('.col-md-8');
        mainCameraCol.classList.remove('col-md-8');
        mainCameraCol.classList.add('col-md-12');
      }
      
      if (window.innerWidth < 768) {
        directionalCameras.forEach(cam => {
          cam.style.display = 'block';
          cam.classList.remove('col-md-3', 'col-md-4');
          cam.classList.add('col-12', 'mb-3');
        });
      }
    }
  }
  
  // Fix navbar alignment with main-container
  function alignNavbarWithContainer() {
    const navbar = document.querySelector('.navbar');
    const mainContainer = document.querySelector('.main-container');
    
    if (navbar && mainContainer) {
      // Function to synchronize navbar and container widths
      const syncWidths = function() {
        // Get the computed styles
        const containerStyles = window.getComputedStyle(mainContainer);
        
        // On mobile screens, ensure the navbar has the same padding as main container
        if (window.innerWidth < 992) {
          // Calculate the width of the body element
          const bodyWidth = document.body.clientWidth;
          
          // Apply the same width constraints and padding to both elements
          navbar.style.width = bodyWidth + 'px';
          navbar.style.maxWidth = '100%';
          navbar.style.boxSizing = 'border-box';
          
          // Get the container's padding and apply to navbar
          const containerPaddingLeft = containerStyles.paddingLeft;
          const containerPaddingRight = containerStyles.paddingRight;
          
          // Apply to navbar container-fluid
          const navbarContainer = navbar.querySelector('.container-fluid');
          if (navbarContainer) {
            navbarContainer.style.paddingLeft = containerPaddingLeft;
            navbarContainer.style.paddingRight = containerPaddingRight;
            navbarContainer.style.maxWidth = 'none'; // Remove any max-width to fit full width
            navbarContainer.style.overflow = 'visible !important';
          }
          
          // Handle right side overflow issue
          navbar.style.marginRight = '0';
          navbar.style.paddingRight = containerPaddingRight;
          navbar.style.paddingLeft = containerPaddingLeft;
          navbar.style.overflow = 'visible';
          
          // Ensure no scrollbars on navbar 
          navbar.style.overflowX = 'visible';
          navbar.style.overflowY = 'visible';
        } else {
          // Reset for desktop view
          navbar.style.width = '';
          navbar.style.maxWidth = '';
          navbar.style.paddingLeft = '';
          navbar.style.paddingRight = '';
          
          // Ensure no scrollbars on desktop
          navbar.style.overflow = 'visible';
          navbar.style.overflowX = 'visible';
          navbar.style.overflowY = 'visible';
          
          const navbarContainer = navbar.querySelector('.container-fluid');
          if (navbarContainer) {
            navbarContainer.style.paddingLeft = '';
            navbarContainer.style.paddingRight = '';
            navbarContainer.style.maxWidth = '1400px'; // Match main-container max-width
            navbarContainer.style.overflow = 'visible';
          }
        }

        // Now fix any dropdown menus that are causing issues
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => {
          menu.style.overflow = 'visible';
          menu.style.maxHeight = 'none';
          menu.style.height = 'auto';
          
          // If menu is shown, make sure positioning is absolute
          if (menu.classList.contains('show')) {
            menu.style.position = 'absolute';
          }
        });

        // Fix navbar collapse
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse) {
          navbarCollapse.style.overflow = 'visible';
          navbarCollapse.style.maxHeight = 'none';
        }
      };
      
      // Initial sync
      syncWidths();
      
      // Sync on resize
      window.addEventListener('resize', syncWidths);
    }
  }
  alignNavbarWithContainer();
  
  // Responsive navbar handler
  function setupResponsiveNavbar() {
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    if (navbar && navbarToggler && navbarCollapse) {
      // Fix user dropdown behavior on larger screens
      const userDropdown = document.getElementById('userDropdown');
      if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
          // Only need custom handling on larger screens, let Bootstrap handle mobile
          if (window.innerWidth >= 992) {
            e.stopPropagation(); // Prevent event from bubbling up to navbar
            
            // Find dropdown menu
            const dropdownMenu = this.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
              // Toggle show class
              if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
                this.setAttribute('aria-expanded', 'false');
              } else {
                // Close any other open dropdowns first
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                  if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                    const toggle = menu.previousElementSibling;
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                  }
                });
                
                // Open this dropdown
                dropdownMenu.classList.add('show');
                this.setAttribute('aria-expanded', 'true');
                
                // Position the dropdown properly
                const rect = this.getBoundingClientRect();
                dropdownMenu.style.top = rect.bottom + 'px';
                dropdownMenu.style.left = rect.left + 'px';
                
                // Close dropdown when clicking outside
                const clickOutsideHandler = function(event) {
                  if (!dropdownMenu.contains(event.target) && event.target !== userDropdown) {
                    dropdownMenu.classList.remove('show');
                    userDropdown.setAttribute('aria-expanded', 'false');
                    document.removeEventListener('click', clickOutsideHandler);
                  }
                };
                
                // Add the click outside listener with a slight delay
                setTimeout(() => {
                  document.addEventListener('click', clickOutsideHandler);
                }, 10);
              }
            }
          }
        });
      }
      
      // Ensure Bootstrap's collapse functionality works properly
      if (typeof bootstrap !== 'undefined') {
        // Initialize the collapse element properly
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          toggle: false
        });
        
        // Handle toggler click manually to ensure it works on all screen sizes
        navbarToggler.addEventListener('click', function(e) {
          e.preventDefault();
          if (navbarCollapse.classList.contains('show')) {
            bsCollapse.hide();
          } else {
            bsCollapse.show();
          }
          navbarToggler.classList.toggle('collapsed', !navbarCollapse.classList.contains('show'));
        });
      } else {
        // Fallback for when Bootstrap JS isn't loaded
        navbarToggler.addEventListener('click', function(e) {
          e.preventDefault();
          navbarCollapse.classList.toggle('show');
          navbarToggler.classList.toggle('collapsed');
        });
      }
      
      // Setup custom navbar toggler icon
      if (!navbarToggler.querySelector('.toggler-icon')) {
        // Clear any existing content
        navbarToggler.innerHTML = '';
        
        // Add custom icon spans
        for (let i = 1; i <= 4; i++) {
          const span = document.createElement('span');
          span.className = 'toggler-icon';
          navbarToggler.appendChild(span);
        }
        
        // Initial state - make sure it's collapsed if navbar isn't shown
        if (!navbarCollapse.classList.contains('show')) {
          navbarToggler.classList.add('collapsed');
        } else {
          navbarToggler.classList.remove('collapsed');
        }
      }
      
      // Close navbar collapse on link click on mobile
      navbar.querySelectorAll('.nav-link').forEach(link => {
        if (!link.classList.contains('dropdown-toggle')) {
          link.addEventListener('click', function() {
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
              if (typeof bootstrap !== 'undefined') {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
              } else {
                navbarCollapse.classList.remove('show');
                navbarToggler.classList.add('collapsed');
              }
            }
          });
        }
      });
      
      // Prevent dropdown menus from causing scrollbars
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        // Set all dropdown menus to have explicit visible overflow and no max-height
        menu.style.overflow = 'visible !important';
        menu.style.maxHeight = 'none !important';
        menu.style.height = 'auto !important';
        
        menu.addEventListener('mouseenter', function() {
          this.style.overflow = 'visible';
          this.style.maxHeight = 'none';
          this.style.height = 'auto';
        });
        
        // Also apply on parent dropdown activation
        const dropdownToggle = menu.previousElementSibling;
        if (dropdownToggle && dropdownToggle.classList.contains('dropdown-toggle')) {
          dropdownToggle.addEventListener('click', function() {
            setTimeout(() => {
              menu.style.overflow = 'visible';
              menu.style.maxHeight = 'none';
              menu.style.height = 'auto';
            }, 10);
          });
        }
      });
      
      // Specific fix for user dropdown
      const userDropdownMenu = document.querySelector('#userDropdown + .dropdown-menu');
      if (userDropdownMenu) {
        userDropdownMenu.style.overflow = 'visible !important';
        userDropdownMenu.style.maxHeight = 'none !important';
        userDropdownMenu.style.height = 'auto !important';
      }
    }
  }
  setupResponsiveNavbar();
  
  // Responsive footer handler
  function setupResponsiveFooter() {
    const footer = document.querySelector('footer');
    
    if (footer) {
      // Collapse footer sections on small screens
      const footerHeaders = footer.querySelectorAll('.footer-header');
      
      if (window.innerWidth < 576) {
        footerHeaders.forEach((header, index) => {
          if (index > 0) {
            const contentSection = header.nextElementSibling;
            if (contentSection) {
              // Initially collapse all but first section
              contentSection.style.display = 'none';
              header.classList.add('collapsed');
              
              // Toggle on click
              header.addEventListener('click', function() {
                contentSection.style.display = contentSection.style.display === 'none' ? 'block' : 'none';
                header.classList.toggle('collapsed');
              });
            }
          }
        });
      }
      
      // Apply responsive utility classes on window resize
      const applyResponsiveClasses = function() {
        const isMobile = window.innerWidth < 768;
        
        // Apply utility classes based on screen size
        document.querySelectorAll('[data-mobile-class]').forEach(el => {
          const classes = el.getAttribute('data-mobile-class').split(' ');
          if (isMobile) {
            classes.forEach(cls => el.classList.add(cls));
          } else {
            classes.forEach(cls => el.classList.remove(cls));
          }
        });
      };
      
      // Initial application and listen for resize
      applyResponsiveClasses();
      window.addEventListener('resize', applyResponsiveClasses);
    }
  }
  setupResponsiveFooter();
  
  // Responsive table handler
  function setupResponsiveTables() {
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
      if (!table.closest('.table-responsive')) {
        // Wrap table in responsive wrapper if not already wrapped
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }
  setupResponsiveTables();
  
  // Responsive chart handling
  function setupResponsiveCharts() {
    window.addEventListener('resize', function() {
      // Trigger chart resize if Chart.js is used
      if (window.Chart && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
          chart.resize();
        });
      }
    });
  }
  setupResponsiveCharts();
  
  // Adjust video controls for touch devices
  function setupTouchControls() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      // Make controls larger and always visible on touch devices
      const videoControls = document.querySelectorAll('.video-controls');
      videoControls.forEach(control => {
        control.style.opacity = '1';
        control.style.padding = '0.5rem';
        
        const buttons = control.querySelectorAll('.btn');
        buttons.forEach(button => {
          button.classList.remove('btn-sm');
          button.style.padding = '0.4rem 0.6rem';
        });
      });
    }
  }
  setupTouchControls();
  
  // Call all setup functions
  initBootstrapComponents();
  alignNavbarWithContainer();
  setupResponsiveNavbar();
  setupResponsiveFooter();
  setupResponsiveTables();
  setupResponsiveCharts();
  setupTouchControls();
  // Removed setupMainIntersectionToggle(); as we removed that button
}); 