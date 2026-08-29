// ==UserScript==
// @name        Gelbooru Drag to download
// @namespace   Violentmonkey Scripts
// @match       https://gelbooru.com/*
// @icon        https://external-content.duckduckgo.com/ip3/gelbooru.com.ico
// @version     0.4
// @author      irasnalida
// @description gelbooru download
// @grant       GM_download
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// ==/UserScript==

(function () {
  document.addEventListener("dragend", (e) => {
    if (e.target.tagName.toLowerCase() !== "img") return;

    let newSrc = e.target.src;
    newSrc = newSrc.replace(/\/+samples\//, "/images/").replace("sample_", "");

    const container = e.target.closest("section.image-container");
    if (container && container.hasAttribute("data-file-ext")) {
      const realExt = container.getAttribute("data-file-ext");
      newSrc = newSrc.replace(/\.[^/.]+$/, realExt);
    }

    // Extract Artist Name
    const artistNode = document.querySelector(".tag-type-artist > a");
    const artist = artistNode ? artistNode.textContent.trim() : "unknown";

    // Extract Date
    let dateStr = "00000000";
    for (const li of document.querySelectorAll("li:not([class])")) {
      if (li.textContent.includes("Posted:")) {
        const dateMatch = li.textContent.match(/Posted:\s*(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) dateStr = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
        break;
      }
    }

    // Construct Filename
    const urlParts = newSrc.split("/");
    const imageNameWithExt = urlParts[urlParts.length - 1];
    const filename = `[${artist}] ${dateStr} ${imageNameWithExt}`;
    console.log("Downloading:", newSrc);
    GM_download({
      url: newSrc,
      name: filename,
      headers: {
        "Referer": window.location.href
      }
    });
  });
})();
