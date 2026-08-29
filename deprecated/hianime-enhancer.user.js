// ==UserScript==
// @name        Hianime.to Enhancer
// @namespace   Violentmonkey Scripts
// @match       https://hianime.to/watch/*
// @icon        https://www.google.com/s2/favicons?domain=hianime.to&sz=128
// @grant       none
// @version     0.1
// @author      irasnalida
// @description 4/1/2024, 2:50:22 PM
// ==/UserScript==

const defaultStyleElement = document.createElement('style');
defaultStyleElement.innerHTML = `
.anis-watch-tv {display: flex;flex-direction: column;padding-left: 0px;width: 79%;}
#episodes-content,.seasons-block,.ss-list {position: static;}
#episodes-content,.ss-list {width: 100% !important;}
.ss-list.ss-list-min .ssl-item {max-width: 50px;}
.other-season {order: 1;}
.anis-watch-detail {width: 20%;top: 0px}
.ssc-button .ssc-label {min-height: 30px;}
.anis-watch-detail .anis-content .anisc-poster {width: 200px;}
`;
document.head.appendChild(defaultStyleElement);


const observer = new MutationObserver(check);
observer.observe(document.body, { childList: true, subtree: true });
function check(changes, observer) {
  const element = document.querySelector('#episodes-content .ss-list');
  if (element) {
    observer.disconnect();
    element.classList.add('ss-list-min');
  }
}


const styleElement = document.createElement('style');
styleElement.innerHTML = `
.player-controls { display: flex; align-items: center; }
#ani_detail > div > div > div.anis-watch-wrap > div.anis-watch-detail,
#ani_detail > div > div > div.anis-watch-wrap > div.anis-watch.anis-watch-tv > div.watch-player > div.player-controls > div.pc-item.pc-resize{display:none;}
.anis-watch, .anis-watch-tv{width: 100% !important;}
.player-frame{height: 680px;}
#adjustableHeight{width: 50px; background-color: transparent; color: #95b6d0; border: unset;}
#adjustableHeight:focus{outline: none;background-color: #95b6d0;color: #111;}
`;
document.head.appendChild(styleElement);

const hianimestyle = `
body{overflow: hidden;}
.watch-player{position: fixed;width: 100%;height: 100%;top: 0px;left: 0px;padding: 0px;margin: 0px;}
.player-frame{position: fixed;width: 100%;height: 100% !important;top: 0px;left: 0px;padding: 0px;margin: 0px;z-index: 9999;}
#detail-ss-list,#header,.container > #main-content,#footer,.player-servers,.other-season,.anis-watch-detail{display: none;}
.player-controls{display: flex;align-items: center;position:relative;width: 100%;top: 0px;z-index: 99999;opacity: 0;background-color: transparent !important;backdrop-filter: blur(12px) brightness(20%) contrast(80%) saturate(150%);transition: opacity 0.15s;}
.player-controls:hover{opacity: 1;}
`;

const expandElement = document.createElement('style');
expandElement.id = 'irslda-hianime-fillscreen-stylesheet';
document.head.appendChild(expandElement);

//add new expand button in control list
const expandBtn = document.createElement('div');
expandBtn.setAttribute('class', 'pc-item pc-control');
expandBtn.innerHTML = `
<a class="btn btn-sm">
  <i class="fas fa-expand"></i>
  Expand
</a>
`;
expandBtn.addEventListener('click', function () {
  expand();
});

//add new expand button in control list
const alignBtn = document.createElement('div');
alignBtn.setAttribute('class', 'pc-item pc-control');
alignBtn.innerHTML = `
<a class="btn btn-sm">
  <i class="fas fa-up-down"></i>
  Align
</a>
`;
alignBtn.addEventListener('click', function () {
  scrollintoview();
});

//add new expand button in control list
const inputarea = document.createElement('div');
inputarea.setAttribute('class', 'pc-item pc-control');
inputarea.innerHTML = `
<input type="text" id="adjustableHeight" value="680px" readonly></input>
`;
inputarea.addEventListener('keydown', adjustHeight);

window.onload = function () {
  const insetin = document.querySelector('.pc-item.pc-toggle.pc-autoskipintro');
  insetin.insertAdjacentElement("afterend", expandBtn);
  insetin.insertAdjacentElement("afterend", alignBtn);

  const c_right = document.querySelector('.player-controls .pc-right');
  c_right.appendChild(inputarea);
  scrollintoview();
}

//event listener for key press
document.addEventListener("keyup", function (event) {
  if (event.key === "`") {
    expand();
  }
});
let flag = 0;

function expand() {
  scrollintoview();
  const fillscreen = document.getElementById('irslda-hianime-fillscreen-stylesheet');
  if (flag === 0) {
    fillscreen.innerHTML = hianimestyle;
    flag = 1;
  } else {
    fillscreen.innerHTML = ``;
    flag = 0;
  }
}

function scrollintoview() {
  let player = document.querySelector('.player-frame');
  player.scrollIntoView({
    behavior: 'smooth'
  });
}

function adjustHeight() {
  const inputarea = document.getElementById('adjustableHeight');
  let value = parseInt(inputarea.value, 10);
  let player = document.querySelector('.player-frame');
  if (isNaN(value)) return;
  if (event.key === 'ArrowUp') {
    if (value >= 760) return;
    value += 10; // Increase value
  } else if (event.key === 'ArrowDown') {
    if (value <= 500) return;
    value -= 10; // Decrease value
  }
  inputarea.value = `${value}px`;
  player.style.height = `${value}px`;
  event.preventDefault();
}