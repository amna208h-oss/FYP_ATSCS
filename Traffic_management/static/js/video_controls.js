document.addEventListener('DOMContentLoaded', function () {
    function initVideoControls(videoId, dataKey) {
        const video = document.getElementById(videoId);
        if (!video) {
            console.warn(`[VideoControls] Video element not found: #${videoId}`);
            return;
        }

        const playPauseBtn  = document.querySelector(`.play-pause-btn[data-video="${dataKey}"]`);
        const muteBtn       = document.querySelector(`.mute-btn[data-video="${dataKey}"]`);
        const fullscreenBtn = document.querySelector(`.fullscreen-btn[data-video="${dataKey}"]`);
        const progressBar   = document.querySelector(`.video-progress[data-video="${dataKey}"]`);

        if (!playPauseBtn || !muteBtn || !fullscreenBtn || !progressBar) {
            console.warn(`[VideoControls] One or more control elements missing for: ${dataKey}`);
            return;
        }

        const controlsContainer = playPauseBtn.closest('.video-controls');
        if (controlsContainer) {
            
            controlsContainer.style.setProperty('z-index', '200', 'important');
            controlsContainer.style.setProperty('pointer-events', 'all', 'important');
            controlsContainer.style.setProperty('position', 'absolute', 'important');
            controlsContainer.style.setProperty('bottom', '0', 'important');
            controlsContainer.style.setProperty('left', '0', 'important');
            controlsContainer.style.setProperty('right', '0', 'important');

            [playPauseBtn, muteBtn, fullscreenBtn, progressBar].forEach(el => {
                el.style.setProperty('pointer-events', 'all', 'important');
                el.style.setProperty('position', 'relative', 'important');
                el.style.setProperty('z-index', '201', 'important');
            });
        }

        const cameraStream = video.closest('.camera-stream');
        if (cameraStream) {
            const metricsOverlay   = cameraStream.querySelector('.real-time-metrics');
            const detectionOverlay = cameraStream.querySelector('.ai-detection-overlay');

            if (metricsOverlay) {
                metricsOverlay.style.setProperty('pointer-events', 'none', 'important');
                // Keep its existing z-index (100) but make sure it cannot swallow clicks
            }
            if (detectionOverlay) {
                // Already has pointer-events: none in HTML, but enforce it here too
                detectionOverlay.style.setProperty('pointer-events', 'none', 'important');
            }
        }

        playPauseBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (video.paused) {
                video.play().catch(err => console.warn(`[VideoControls] Play failed (${dataKey}):`, err));
                this.innerHTML = '<i class="bi bi-pause-fill"></i>';
            } else {
                video.pause();
                this.innerHTML = '<i class="bi bi-play-fill"></i>';
            }
        });

        video.addEventListener('play',  () => { playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>'; });
        video.addEventListener('pause', () => { playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';  });

        muteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            video.muted = !video.muted;
            this.innerHTML = video.muted
                ? '<i class="bi bi-volume-mute-fill"></i>'
                : '<i class="bi bi-volume-up-fill"></i>';
        });

        fullscreenBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!document.fullscreenElement) {
                const container = video.closest('.camera-view') || video;
                const requestFS = container.requestFullscreen
                    || container.webkitRequestFullscreen
                    || container.msRequestFullscreen;
                if (requestFS) {
                    requestFS.call(container).catch(err => {
                        console.warn(`[VideoControls] Fullscreen failed (${dataKey}):`, err);
                    });
                }
                this.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            } else {
                const exitFS = document.exitFullscreen
                    || document.webkitExitFullscreen
                    || document.msExitFullscreen;
                if (exitFS) exitFS.call(document);
                this.innerHTML = '<i class="bi bi-fullscreen"></i>';
            }
        });

        video.addEventListener('loadedmetadata', function () {
            progressBar.max = video.duration;
        });

        video.addEventListener('timeupdate', function () {
            if (!progressBar.matches(':active')) {
                progressBar.value = video.currentTime;
            }
        });

        progressBar.addEventListener('input', function (e) {
            e.stopPropagation();
            video.currentTime = parseFloat(this.value);
        });

        video.addEventListener('ended', function () {
            if (!video.loop) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }
        });

        video.addEventListener('error', function () {
            console.error(`[VideoControls] Error loading video (${dataKey}):`, video.error);
        });

        const cameraView = video.closest('.camera-view');

        if (cameraView && controlsContainer) {
            let hideTimeout;

            controlsContainer.style.opacity    = '0';
            controlsContainer.style.transition = 'opacity 0.3s ease';

            cameraView.addEventListener('mouseenter', function () {
                clearTimeout(hideTimeout);
                controlsContainer.style.opacity = '1';
            });

            cameraView.addEventListener('mouseleave', function () {
                hideTimeout = setTimeout(function () {
                    controlsContainer.style.opacity = '0';
                }, 1500);
            });

            controlsContainer.addEventListener('mouseenter', function () {
                clearTimeout(hideTimeout);
                controlsContainer.style.opacity = '1';
            });

            controlsContainer.addEventListener('mouseleave', function () {
                hideTimeout = setTimeout(function () {
                    controlsContainer.style.opacity = '0';
                }, 1500);
            });

            cameraView.addEventListener('touchstart', function () {
                clearTimeout(hideTimeout);
                controlsContainer.style.opacity = '1';
                hideTimeout = setTimeout(function () {
                    controlsContainer.style.opacity = '0';
                }, 3000);
            }, { passive: true });
        }

        console.log(`[VideoControls] Initialised: ${dataKey}`);
    }

    const directionalVideos = [
        { id: 'northVideo', key: 'north' },
        { id: 'southVideo', key: 'south' },
        { id: 'eastVideo',  key: 'east'  },
        { id: 'westVideo',  key: 'west'  },
    ];

    directionalVideos.forEach(function (v) {
        initVideoControls(v.id, v.key);
    });

    initVideoControls('mainIntersectionVideo', 'main');

    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement) {
            document.querySelectorAll('.fullscreen-btn').forEach(function (btn) {
                btn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            });
        }
    });

    document.addEventListener('webkitfullscreenchange', function () {
        if (!document.webkitFullscreenElement) {
            document.querySelectorAll('.fullscreen-btn').forEach(function (btn) {
                btn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            });
        }
    });

    console.log('[VideoControls] All video controls initialised successfully.');
});
