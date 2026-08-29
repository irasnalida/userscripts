// ==UserScript==
// @name        Comix zoom
// @namespace   Violentmonkey Scripts
// @match       https://comix.to/*
// @icon        https://external-content.duckduckgo.com/ip3/comix.to.ico
// @grant       none
// @version     0.3
// @run-at      document-end
// @author      irasnalida
// @description 3/12/2025, 7:22:06 pm
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/comix-zoom.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/comix-zoom.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION
    const LENS_SIZE = 250; // px
    const BORDER_COLOR = '#000';
    const BORDER_WIDTH = '2px';
    const TOGGLE_KEY = 'z';
    const ZOOM_STEP = 0.2;

    // --- STATE
    let isEnabled = false;
    let currentZoom = 1.4;
    let lens = null;

    function init() {
        createLens();
        addEventListeners();
        showStatus(`Magnifier Ready (${TOGGLE_KEY.toUpperCase()} to toggle)`);
    }

    // Create the DOM element for the magnifying glass
    function createLens() {
        lens = document.createElement('div');
        lens.setAttribute('id', 'vm-manga-magnifier');

        // CSS Styles for the lens
        Object.assign(lens.style, {
            position: 'fixed',
            width: `${LENS_SIZE}px`,
            height: `${LENS_SIZE}px`,
            border: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
            borderRadius: '8px', // Circle shape (change to '0px' for square)
            pointerEvents: 'none', // CRITICAL: Allows mouse to pass through to image below
            display: 'none',
            zIndex: '999999',
            backgroundColor: 'white',
            backgroundRepeat: 'no-repeat',
            transform: 'translate(-50%, -50%)' // Center lens on cursor
        });

        document.body.appendChild(lens);
    }

    // Handle mouse movement, scrolling, and keyboard shortcuts
    function addEventListeners() {

        /*document.addEventListener('mouseover', (e) => {
            if(e.target.tagName == 'A' && e.target.classList.contains("title")){
                const parts = e.target.href.split('/');
                e.target.href = "/title/"+parts[4];
            }
        });

        document.addEventListener('click', (e) => {
            if(e.target.tagName == 'A' && e.target.classList.contains("title")){
                e.preventDefault();
            }
        });*/

        // Update lens position and background
        document.addEventListener('mousemove', (e) => {
            if (!isEnabled) return;

            const target = e.target;

            // Only activate if hovering over an image
            if (target.tagName !== 'IMG') {
                lens.style.display = 'none';
                return;
            }

            const rect = target.getBoundingClientRect();

            // --- Show lens ---
            lens.style.display = 'block';
            lens.style.width = rect.width + 'px';
            lens.style.left = rect.left + rect.width/2 + 'px';
            lens.style.top = (e.clientY) + 'px';

            // Image source for background
            const imgSrc = target.currentSrc || target.src;
            lens.style.backgroundImage = `url("${imgSrc}")`;

            // Background zoom size
            const bgWidth = rect.width * currentZoom;
            const bgHeight = rect.height * currentZoom;
            lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

            // Mouse position *relative to image*
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            const bgPosX = -(relX * currentZoom - rect.width / 2);
            const bgPosY = -(relY * currentZoom - LENS_SIZE / 2);

            lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
        });
        // Wheel: Zoom In/Out
        /*document.addEventListener('wheel', (e) => {
            if (!isEnabled) return;
            if (e.target.tagName !== 'IMG') return;

            // Prevent page scrolling while zooming on an image
            e.preventDefault();

            if (e.deltaY < 0) {
                currentZoom += ZOOM_STEP; // Scroll Up -> Zoom In
            } else {
                currentZoom = Math.max(1, currentZoom - ZOOM_STEP); // Scroll Down -> Zoom Out
            }
        }, { passive: false });*/

        // Keyboard: Toggle On/Off
        document.addEventListener('keyup', (e) => {
            if (e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") return;
            if (e.key.toLowerCase() === TOGGLE_KEY) {
                isEnabled = !isEnabled;
                lens.style.display = 'none';
                showStatus(isEnabled ? "Magnifier ON" : "Magnifier OFF");
            }
            else if(e.key.toLowerCase() === '+'){
                currentZoom += ZOOM_STEP;
            }
            else if(e.key.toLowerCase() === '-'){
                currentZoom = Math.max(1, currentZoom - ZOOM_STEP);
            }
        });
    }

    // Show a small popup when toggling
    function showStatus(text) {
        const toast = document.createElement('div');
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: '1000000',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            pointerEvents: 'none',
            transition: 'opacity 0.5s'
        });
        toast.textContent = text;
        document.body.appendChild(toast);

        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 1500);
    }

    init();

})();
