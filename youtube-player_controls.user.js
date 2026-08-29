// ==UserScript==
// @name        Player Controls
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @icon        https://external-content.duckduckgo.com/ip3/youtube.com.ico
// @grant       none
// @version     0.2
// @author      irasnalida
// @description YouTube player controls with integrated utility buttons.
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/youtube-player_controls.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/youtube-player_controls.user.js
// ==/UserScript==

const ICONS = {
  copy: "M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48",
  thumbnail:
    "M0 96c0-35.3 28.7-64 64-64h384c35.3 0 64 28.7 64 64v320c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64zm323.8 106.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6l-26.5-33.1c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4S78.8 416 88 416h336c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7zM112 192a48 48 0 1 0 0-96a48 48 0 1 0 0 96",
  download:
    "M169.4 502.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 402.7V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v370.7L54.6 297.3c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z",
  screenshot:
    "M149.1 64.8L138.7 96H64c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64h-74.7l-10.4-31.2C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8M256 192a96 96 0 1 1 0 192a96 96 0 1 1 0-192",
  playback:
    "m10.05 15.42 6.256-8.475a.694.694 0 0 1 1.235.57l-.03.098-3.87 9.799a2.07 2.07 0 1 1-3.737-1.765l.069-.116.076-.11 6.257-8.476-6.257 8.476Zm8.56-8.006a10.66 10.66 0 0 1 2.022 2.172c.524.749 1.03 1.656 1.32 2.398a.75.75 0 1 1-1.397.547 8.238 8.238 0 0 0-.378-.812l-2.05 1.183a.75.75 0 0 1-.834-1.242l.085-.057 2.018-1.166-.23-.314a9.156 9.156 0 0 0-1.058-1.16l.38-.964c.038-.096.067-.194.087-.292l.024-.147.01-.146Zm-2.63-1.561a1.715 1.715 0 0 0-.406.328l-.114.14-.54.733a9.205 9.205 0 0 0-2.17-.47v2.672a.75.75 0 0 1-1.493.102l-.007-.102v-2.69A9.108 9.108 0 0 0 6.658 8.2c-.816.572-1.528 1.322-2.119 2.205l2.082 1.202a.75.75 0 0 1-.658 1.344l-.092-.045-2.074-1.197c-.128.266-.246.54-.356.821a.75.75 0 0 1-1.398-.543c.807-2.075 2.08-3.843 3.754-5.016a10.642 10.642 0 0 1 10.183-1.117Z",
  info: "M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5l82.6-94.5l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320h118.1c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9c-4.3-3.8-9.7-5.9-15.4-5.9C10.4 32 0 42.4 0 55.2",
};
const VIEWBOXES = {
  copy: "0 0 448 512",
  thumbnail: "0 0 512 512",
  download: "0 0 384 512",
  screenshot: "0 0 512 512",
  playback: "0 0 24 24",
  info: "-96 0 512 512",
};

function createSVG(type, width = "24px", height = "24px") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", VIEWBOXES[type]);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", ICONS[type]);
  svg.appendChild(path);
  return svg;
}

function createPlayerButton(id, title, iconType, onClick) {
  const btn = document.createElement("button");
  btn.id = id;
  btn.className = "ytp-button irslda-btn";
  btn.title = title;
  btn.appendChild(createSVG(iconType));
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}

function f_copyurl() {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      console.log("URL Copied!");
    })
    .catch((err) => console.error("Copy failed", err));
}

function showThumbnails() {
  if (document.getElementById("irs-thmb")) return;
  const videoId =
    new URLSearchParams(window.location.search).get("v") ||
    (window.location.href.includes("/shorts/")
      ? window.location.href.split("/").pop().split("?")[0]
      : null);
  if (!videoId) return;

  createFloating(
    "irs-thmb",
    "Right Click then Save Image As | Left Click to close",
    [
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    ],
  );
}

function saveframe() {
  if (document.getElementById("irs-video-frame")) return;
  const video = document.querySelector("video");
  if (!video) return;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  createFloating(
    "irs-video-frame",
    "Right Click then Save Image As | Left Click to close",
    [canvas.toDataURL("image/png")],
    `${video.videoHeight}p`,
  );
}

function createFloating(id, infoText, images, label) {
  const div = document.createElement("div");
  div.id = id;
  div.className = "irs-float";

  const info = document.createElement("div");
  info.className = "irs-info";
  info.appendChild(createSVG("info", "1em", "1em"));
  info.appendChild(document.createTextNode(" " + infoText));
  if (label) {
    const span = document.createElement("span");
    span.textContent = label;
    info.appendChild(span);
  }
  div.appendChild(info);

  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    div.appendChild(img);
  });
  div.onclick = () => div.remove();
  document.body.appendChild(div);
}

function addPlaybackSpeedBtn(controls) {
  if (document.getElementById("irslda-playback-rate-btn")) return;
  const video = document.querySelector("video");
  let currentRate = video ? video.playbackRate : 1.0;
  const defaultRate = 1.2;

  const btn = document.createElement("button");
  btn.id = "irslda-playback-rate-btn";
  btn.className = "ytp-button irslda-btn";
  btn.title = "Playback Speed (Wheel to adjust, Click to reset)";

  const textDiv = document.createElement("div");
  textDiv.className = "irslda-text";

  const speedSpan = document.createElement("span");
  speedSpan.id = "irslda-speed-span";
  speedSpan.textContent = currentRate.toFixed(1) + "x";
  textDiv.appendChild(speedSpan);

  btn.appendChild(textDiv);
  const update = (rate) => {
    const v = document.querySelector("video");
    if (v) {
      currentRate = Math.max(0.1, Math.min(16, rate));
      v.playbackRate = currentRate;
      speedSpan.textContent = currentRate.toFixed(1) + "x";
    }
  };
  btn.onwheel = (e) => {
    e.preventDefault();
    update(currentRate + (e.deltaY < 0 ? 0.1 : -0.1));
  };
  btn.onclick = () => update(defaultRate);
  controls.insertBefore(btn, controls.firstChild);
}

function loadButtons() {
  const controls = document.querySelector(".ytp-right-controls");
  if (!controls) return;
  const btns = [
    {
      id: "irslda-copy-url",
      title: "Copy URL",
      icon: "copy",
      action: f_copyurl,
    },
    {
      id: "irslda-thumbnail",
      title: "Thumbnail",
      icon: "thumbnail",
      action: showThumbnails,
    },
    {
      id: "irslda-screenshot",
      title: "Screenshot",
      icon: "screenshot",
      action: saveframe,
    },
  ];
  btns.reverse().forEach((cfg) => {
    if (!document.getElementById(cfg.id)) {
      controls.insertBefore(
        createPlayerButton(cfg.id, cfg.title, cfg.icon, cfg.action),
        controls.firstChild,
      );
    }
  });
  addPlaybackSpeedBtn(controls);
}

window.addEventListener("yt-navigate-finish", loadButtons);
loadButtons();
