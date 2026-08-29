// ==UserScript==
// @name        anime.nexus enhancer
// @namespace   Violentmonkey Scripts
// @match       https://anime.nexus/*
// @icon        https://external-content.duckduckgo.com/ip3/anime.nexus.ico
// @grant       none
// @version     0.2
// @author      irasnalida
// @description 1/4/2025, 3:34:55 pm
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/animenexus-enhancer.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/animenexus-enhancer.user.js
// ==/UserScript==

const WATCH_PAGE_MODE = 2; // 0 = Default, 1 = new tab, 2 = iframe in same tab (beta)

document.addEventListener("mouseover", (event) => {
  if (
    event.target.tagName.toLowerCase() === "a" &&
    event.target.href.includes("watch/")
  ) {
    const a = event.target;
    if (WATCH_PAGE_MODE == 1) {
      a.setAttribute("target", "_blank");
    } else if (WATCH_PAGE_MODE == 2) {
      const a = event.target;
      const href = a.href;
      a.removeAttribute("href");
      const adupe = a.cloneNode(false);
      a.insertAdjacentElement("afterend", adupe);
      a.remove();
      adupe.setAttribute("link", href);
    }
  }
});

document.addEventListener("click", (event) => {
  if (
    event.target.tagName.toLowerCase() === "a" &&
    event.target.hasAttribute("link")
  ) {
    //alert(event.target.getAttribute('link'));
    const link = event.target.getAttribute("link");
    const div = document.createElement("div");
    div.id = "irs-anx-div";

    const close = document.createElement("button");
    close.id = "irs-anx-close";
    close.innerHTML = "Close";

    const expand = document.createElement("button");
    expand.id = "irs-anx-expand";
    expand.innerHTML = "Expand";

    const frame = document.createElement("iframe");
    frame.id = "irs-anx-frame";

    div.appendChild(close);
    div.appendChild(expand);
    div.appendChild(frame);

    document.body.appendChild(div);
    frame.src = link;

    close.addEventListener("click", function (event) {
      div.remove();
    });

    expand.addEventListener("click", function (event) {
      const isWindowed = document.body.getAttribute("windowed") === "true";
      document.body.setAttribute("windowed", !isWindowed);
    });
  }
});
