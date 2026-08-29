// ==UserScript==
// @name        Miruro extra features
// @namespace   Violentmonkey Scripts
// @match       https://www.miruro.tv/*
// @icon        https://external-content.duckduckgo.com/ip3/miruro.tv.ico
// @grant       none
// @version     0.2
// @author      irasnalida
// @description A script to improve your Miruro experience
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/miruro-enhancer.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/miruro-enhancer.user.js
// ==/UserScript==

window.addEventListener('popstate', function () {
  console.log('P location changed!');
  const exp = document.getElementById('irs-mir-exp');
  exp.innerHTML = "";

});

const observer = new MutationObserver(check);

window.addEventListener('load', function () {
  if (window.location.href.includes('/watch')) {
    console.log('loaded');
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

document.addEventListener('click', function (event) {
  let el = event.target;
  if (el.baseURI.includes('/watch')) {
    console.log('navigated');
    observer.observe(document.body, { childList: true, subtree: true });
  }
});


function check(changes, observer) {
  const element = document.querySelector('.player');
  if (element) {
    observer.disconnect();
    addstuff();
  }
}

function addstuff() {

  if (document.getElementById('irslda-speed-btn')) return;

  console.log('add');

  const insertafter = document.querySelector('button[title="Toggle Player Layout"]');
  const video = document.querySelector('video');
  let speedbtn = document.createElement('button');
  speedbtn.id = 'irslda-speed-btn';

  insertafter.classList.forEach(function (className) {
    speedbtn.classList.add(className);
  });
  insertafter.insertAdjacentElement('afterend', speedbtn);
  speedbtn.textContent = "Speed: " + video.playbackRate + "x";

  speedbtn.addEventListener('click', norm_rate);

  speedbtn.addEventListener('wheel', function (event) {
    event.preventDefault();
    if (event.deltaY < 0) inc_rate();
    else if (event.deltaY > 0) dec_rate();
  });
}


var defexp = 0;

const expandStyle = document.createElement('style');
expandStyle.id = 'irs-mir-exp'
document.head.appendChild(expandStyle);

document.addEventListener("keyup", function (event) {
  if (event.target === document.querySelector('input')) {
    return;
  }
  else if (event.key === "`") {
    toggleExpand();
  }
  else if (event.key === "+") {
    inc_rate();
  }
  else if (event.key === '-') {
    dec_rate();
  }
  else if (event.key === '*') {
    norm_rate();
  }
  else if (event.key.toLowerCase() === 's') {
    const skipbtn = document.querySelector('button.skip-button');
    if (skipbtn) skipbtn.click();
  }
});


function toggleExpand() {
  if (!window.location.href.startsWith("https://www.miruro.tv/watch")) return;
  const exp = document.getElementById('irs-mir-exp')
  if (exp.innerHTML === "") {
    exp.innerHTML = expandCSS;
  }
  else {
    console.log('n');
    exp.innerHTML = '';
  }
}

function inc_rate() {
  let video = document.querySelector('.player video');

  video.playbackRate = (video.playbackRate + 0.1).toFixed(1);
  console.log('plus');

  const speedbtn = document.getElementById('irslda-speed-btn');
  speedbtn.textContent = "Speed: " + video.playbackRate + "x";
}

function dec_rate() {
  let video = document.querySelector('.player video');
  video.playbackRate = (video.playbackRate - 0.1).toFixed(1);
  console.log('minus');

  const speedbtn = document.getElementById('irslda-speed-btn');
  speedbtn.textContent = "Speed: " + video.playbackRate + "x";
}

function norm_rate() {
  let video = document.querySelector('.player video');
  video.playbackRate = (1.0).toFixed(1);

  const speedbtn = document.getElementById('irslda-speed-btn');
  speedbtn.textContent = "Speed: " + video.playbackRate + "x";
}

const expandCSS = `
.player{
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 209;
}
body{
    overflow: hidden !important;
}
.player video{
    height: 100%;
}
`;
