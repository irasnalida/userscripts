// ==UserScript==
// @name        R34V Time Jumps
// @namespace   Violentmonkey Scripts
// @match       https://rule34video.com/*
// @icon        https://external-content.duckduckgo.com/ip3/rule34video.com.ico
// @grant       none
// @run-at      document-end
// @version     0.2
// @author      irasnalida
// @description Add buttons to skip video by time
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/r34v-video_time_jumps.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/r34v-video_time_jumps.user.js
// ==/UserScript==

(function () {
  'use strict';

  function init() {
    const v = document.querySelector('.video_container');
    if (!v) return;

    const c = document.createElement('div');
    c.style.marginTop = '8px';

    [[-60, '⏪1m'], [-5, '⏪5s'], [-2, '⏪2s'], [2, '⏩2s'], [5, '⏩5s'], [60, '⏩1m']]
      .forEach(([s, t]) => {
        const b = document.createElement('button');
        b.textContent = t;

        // basic styling
        b.style.margin = '2px';
        b.style.padding = '6px 10px';
        b.style.border = '0px solid #ccc';
        b.style.borderRadius = '4px';
        b.style.background = '#222';
        b.style.color = '#fff';
        b.style.cursor = 'pointer';
        b.onmouseenter = () => b.style.background = '#444';
        b.onmouseleave = () => b.style.background = '#222';

        b.onclick = () => v.querySelector('video').currentTime += s;
        c.appendChild(b);
      });

    v.appendChild(c);
  }

  init();
})();
