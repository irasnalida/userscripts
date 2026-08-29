// ==UserScript==
// @name        Youtube Player Actions
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @icon        https://www.google.com/s2/favicons?domain=youtube.com&sz=128
// @grant       none
// @version     0.1
// @author      irasnalida
// @description Add more actions to youtube player
// ==/UserScript==


var isCodeMode = false;
var targetNode = document.body; // Assuming 'guide-content' is the parent element
var observerConfig = { childList: true, subtree: true };
var mutationCallback = function (mutationsList, observer) {
  mutationsList.forEach(function (mutation) {
    mutation.addedNodes.forEach(function (node) {
      if (node.nodeType === 1 && node.matches('.ytp-right-controls')) {
        observer.disconnect();
        console.log('Element matching query selector ".ytp-right-controls" added to the DOM:', node);
        loadbuttons();
        checkbuttons();
      }
    });
  });
};

var observer = new MutationObserver(mutationCallback);
observer.observe(targetNode, observerConfig);

function loadbuttons() {
  const rightcontrollist = document.querySelector('.ytp-right-controls');
  const video = document.querySelector('video');
  //if(rightcontrollist){console.log('c');}
  if (rightcontrollist) {
    addplaybackspeedbtn(rightcontrollist, video);
    addvideopausetogglebtn(rightcontrollist, video);
  }
  /*
    const c = document.getElementById('full-bleed-container');
    if(c){
      let cc = document.querySelector('.ytp-chrome-bottom');
      cc.style.bottom = '-55px';
      c.appendChild(cc);
      let ccc = document.getElementById('single-column-container');
      ccc.style.marginTop = "56px";
    };*/
}

function copytime() {
  var player = document.querySelector('video');
  if (player) {
    var currentTime = Math.floor(player.currentTime);
    let originalURL = window.location.href;
    let lastIndex = originalURL.lastIndexOf('=');
    if (lastIndex !== -1) {
      var before = originalURL.substring(0, lastIndex + 1);
      var after = currentTime + 's';
      let modiURL = before + after;
      console.log(modiURL);
    }
  }
}

function addplaybackspeedbtn(rightcontrollist, video) {
  let defaultplaybackrate = 1.2;
  let currentplaybackrate = 1.0;
  //const video = document.querySelector('video');
  video.playbackRate = currentplaybackrate.toFixed(1);
  const playbackspeedbtn = document.createElement('button');
  playbackspeedbtn.id = 'irslda-playback-rate-btn';
  playbackspeedbtn.setAttribute('class', 'playerButton ytp-button irslda-btn');
  //playbackspeedbtn.setAttribute('title', ''+defaultplaybackrate);
  rightcontrollist.insertBefore(playbackspeedbtn, rightcontrollist.firstChild);


  playbackspeedbtn.innerHTML = '<div class="irslda-text" id="irslda-speed-text"><span class="irslda-span" id="irslda-speed-span">Speed</span></div><div class="irslda-icon"><svg width="32px" height="32px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.05 15.42 6.256-8.475a.694.694 0 0 1 1.235.57l-.03.098-3.87 9.799a2.07 2.07 0 1 1-3.737-1.765l.069-.116.076-.11 6.257-8.476-6.257 8.476Zm8.56-8.006a10.66 10.66 0 0 1 2.022 2.172c.524.749 1.03 1.656 1.32 2.398a.75.75 0 1 1-1.397.547 8.238 8.238 0 0 0-.378-.812l-2.05 1.183a.75.75 0 0 1-.834-1.242l.085-.057 2.018-1.166-.23-.314a9.156 9.156 0 0 0-1.058-1.16l.38-.964c.038-.096.067-.194.087-.292l.024-.147.01-.146Zm-2.63-1.561a1.715 1.715 0 0 0-.406.328l-.114.14-.54.733a9.205 9.205 0 0 0-2.17-.47v2.672a.75.75 0 0 1-1.493.102l-.007-.102v-2.69A9.108 9.108 0 0 0 6.658 8.2c-.816.572-1.528 1.322-2.119 2.205l2.082 1.202a.75.75 0 0 1-.658 1.344l-.092-.045-2.074-1.197c-.128.266-.246.54-.356.821a.75.75 0 0 1-1.398-.543c.807-2.075 2.08-3.843 3.754-5.016a10.642 10.642 0 0 1 10.183-1.117Z" fill="#ffffff"/></svg></div>';
  const speedspan = document.getElementById('irslda-speed-span');
  speedspan.innerHTML = "Speed " + currentplaybackrate.toString();

  playbackspeedbtn.addEventListener('wheel', function (event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      currentplaybackrate = currentplaybackrate + 0.1;
      video.playbackRate = currentplaybackrate.toFixed(1);
      speedspan.innerHTML = "Speed " + currentplaybackrate.toFixed(1).toString();
    }
    else if (event.deltaY > 0) {
      if (currentplaybackrate.toFixed(1) < 0.11) {
        console.log('r');
        return;
      }
      currentplaybackrate = currentplaybackrate - 0.1;
      video.playbackRate = currentplaybackrate.toFixed(1);
      speedspan.innerHTML = "Speed " + currentplaybackrate.toFixed(1).toString();
      console.log(currentplaybackrate);
    }
  });
  playbackspeedbtn.addEventListener('click', function () {
    currentplaybackrate = defaultplaybackrate;
    video.playbackRate = currentplaybackrate.toFixed(1);
    speedspan.innerHTML = "Speed " + currentplaybackrate.toFixed(1).toString();
  })

}

function addvideopausetogglebtn(rightcontrollist) {
  const autopausetogglebtn = document.createElement('button');
  autopausetogglebtn.id = 'irslda-auto-pause-toggle';
  autopausetogglebtn.setAttribute('class', 'playerButton ytp-button irslda-btn');
  rightcontrollist.insertBefore(autopausetogglebtn, rightcontrollist.firstChild);

  autopausetogglebtn.innerHTML = '<div class="irslda-text" id="irslda-codemode-text"><span id="irslda-codemode-span">Code Mode is Off</span></div><div class="irslda-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>';
  const codemodespan = document.getElementById('irslda-codemode-span');
  autopausetogglebtn.addEventListener('click', function () {
    if (isCodeMode) {
      isCodeMode = false;
      codemodespan.innerHTML = "Code Mode is Off";
    }
    else {
      isCodeMode = true;
      codemodespan.innerHTML = "Code Mode is On";
    }
  })
}

window.addEventListener('blur', function () {
  if (isCodeMode) {
    const video = document.querySelector('video');
    video.pause();
  }
});
window.addEventListener('focus', function () {
  if (isCodeMode) {
    const video = document.querySelector('video');
    video.play();
  }
});

function checkbuttons() {
  const speed = document.getElementById('irslda-playback-rate-btn');
  if (!speed) { loadbuttons() }
}

function movecontrol() {
  const c = document.querySelector('.ytp-chrome-bottom');
  if (c) console.log('c');
  const cc = document.getElementById('full-bleed-container');
  if (cc) console.log('cc');
  const cd = document.createElement('div');
  cd.style.display = 'block';
  cc.style.marginBottom = '45px';
  c.style.bottom = '-55px';
  cd.appendChild(c);
  cc.appendChild(cd);
}

const playeractionstylesheet = document.createElement('style');
playeractionstylesheet.innerHTML = `
.irslda-text{position: absolute;display: flex;visibility: collapse;align-items: center;justify-content: center;background-color: rgba(15, 15, 15, 0.8);font-size: 1.25rem;height: 24px;padding-inline: 5px;bottom: 63px;border-radius: 4px;}
.irslda-btn:hover > .irslda-text{visibility: visible;}
.irslda-span{color: white;display: flex;align-items: center;justify-content: center;height: 100%;width: 100%;}
.irslda-icon{display: flex;align-items: center;justify-content: center;}`;
document.head.appendChild(playeractionstylesheet);