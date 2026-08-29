// ==UserScript==
// @name        Anime Nexus Hide Controls
// @namespace   Violentmonkey Scripts
// @match       https://anime.nexus/*
// @icon        https://external-content.duckduckgo.com/ip3/anime.nexus.ico
// @grant       none
// @version     0.3
// @author      irasnalida
// @description Instantly hide player controls when mouse is on the left side of the video.
// @updateURL    https://raw.githubusercontent.com/irasnalida/userscripts/main/animenexus-hide_controls.user.js
// @downloadURL  https://raw.githubusercontent.com/irasnalida/userscripts/main/animenexus-hide_controls.user.js
// ==/UserScript==

const style = document.createElement("style");
style.textContent = `
        body.hide-player-controls-left div.videojs-player > div > div{
            display: none;
        }
    `;
document.head.appendChild(style);

const handleMouseMove = (e) => {
  const player = document.querySelector("video");
  if (!player) return;

  const rect = player.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Check if mouse is within player bounds
  if (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  ) {
    const relativeX = mouseX - rect.left;
    if (relativeX < 10) {
      document.body.classList.add("hide-player-controls-left");
    } else {
      document.body.classList.remove("hide-player-controls-left");
    }
  } else {
    // Remove override if mouse leaves the player
    document.body.classList.remove("hide-player-controls-left");
  }
};

window.addEventListener("mousemove", handleMouseMove, { passive: true });
