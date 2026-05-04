document.addEventListener('DOMContentLoaded', function() {
    // Initialize controls for each video
    const directions = ['north', 'south', 'east', 'west'];
    
    directions.forEach(direction => {
        const video = document.getElementById(`${direction}Video`);
        if (!video) return;

        // Get control elements
        const playPauseBtn = document.querySelector(`.play-pause-btn[data-video="${direction}"]`);
        const muteBtn = document.querySelector(`.mute-btn[data-video="${direction}"]`);
        const fullscreenBtn = document.querySelector(`.fullscreen-btn[data-video="${direction}"]`);
        const progressBar = document.querySelector(`.video-progress[data-video="${direction}"]`);
        
        if (!playPauseBtn || !muteBtn || !fullscreenBtn || !progressBar) return;

        // Play/Pause
        playPauseBtn.addEventListener('click', function() {
            if (video.paused) {
                video.play();
                this.innerHTML = '<i class="bi bi-pause-fill"></i>';
            } else {
                video.pause();
                this.innerHTML = '<i class="bi bi-play-fill"></i>';
            }
        });

        // Mute/Unmute
        muteBtn.addEventListener('click', function() {
            video.muted = !video.muted;
            this.innerHTML = video.muted ? 
                '<i class="bi bi-volume-mute-fill"></i>' : 
                '<i class="bi bi-volume-up-fill"></i>';
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) {
                    video.msRequestFullscreen();
                }
                this.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                this.innerHTML = '<i class="bi bi-fullscreen"></i>';
            }
        });

        // Progress bar
        video.addEventListener('loadedmetadata', function() {
            progressBar.max = video.duration;
        });

        video.addEventListener('timeupdate', function() {
            progressBar.value = video.currentTime;
        });

        progressBar.addEventListener('change', function() {
            video.currentTime = progressBar.value;
        });

        // Handle fullscreen change
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) {
                fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            }
        });

        // Auto-restart when ended (if not already looping)
        video.addEventListener('ended', function() {
            if (!video.loop) {
                video.currentTime = 0;
                video.play();
            }
        });

        // Error handling
        video.addEventListener('error', function() {
            console.error(`Error loading ${direction} video:`, video.error);
            video.closest('.camera-stream').querySelector('.camera-fallback').style.display = 'flex';
        });

        // Add hover effect for controls
        const controlsContainer = video.closest('.camera-stream').querySelector('.video-controls');
        if (controlsContainer) {
            let hideTimeout;
            
            // Show controls on hover
            video.closest('.camera-view').addEventListener('mouseenter', function() {
                controlsContainer.style.opacity = '1';
                clearTimeout(hideTimeout);
            });

            // Hide controls when mouse leaves
            video.closest('.camera-view').addEventListener('mouseleave', function() {
                hideTimeout = setTimeout(() => {
                    controlsContainer.style.opacity = '0';
                }, 1500);
            });

            // Initially hide controls
            controlsContainer.style.opacity = '0';
            controlsContainer.style.transition = 'opacity 0.3s ease';
        }
    });

    // Log that directional videos are initialized
    console.log('[VideoControls] Directional video controls initialized');
});