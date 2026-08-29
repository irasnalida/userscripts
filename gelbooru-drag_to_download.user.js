// ==UserScript==
// @name        Gelbooru Drag to download
// @namespace   Violentmonkey Scripts
// @match       https://gelbooru.com/*
// @icon        https://external-content.duckduckgo.com/ip3/gelbooru.com.ico
// @version     0.3
// @author      irasnalida
// @description gelbooru download
// @grant       GM_download
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// ==/UserScript==

(function () {
  document.addEventListener("dragend", (e) => {
    if (e.target.tagName.toLowerCase() !== "img") return;

    const originalSrc = e.target.src;

    if (!originalSrc.includes("/samples/") && !originalSrc.includes("sample_"))
      return;

    let newSrc = originalSrc
      .replace(/\/+samples\//, "/images/")
      .replace("sample_", "");

    const originalImageLink = document.querySelector('a[href*="/images/"]');
    if (originalImageLink && originalImageLink.href) {
      newSrc = originalImageLink.href;
    }

    // Extract Artist Name
    const artistNode = document.querySelector(".tag-type-artist > a");
    const artist = artistNode ? artistNode.textContent.trim() : "unknown";

    // Extract Date
    let dateStr = "00000000";
    const listItems = document.querySelectorAll("li:not([class])");
    for (const li of listItems) {
      if (li.textContent.includes("Posted:")) {
        // YYYYMMDD
        const dateMatch = li.textContent.match(/Posted:\s*(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          dateStr = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
        }
        break;
      }
    }

    const urlParts = newSrc.split("/");
    const imageNameWithExt = urlParts[urlParts.length - 1];
    const filename = `[${artist}] ${dateStr} ${imageNameWithExt}`;

    console.log("Downloading:", newSrc);
    GM_download({
      url: newSrc,
      name: filename,
      headers: {
        "Referer": window.location.href
      },
      onload: function() {
        console.log("Download successful:", filename);
      },
      onerror: function(error) {
        console.error("Download failed:", error);
      }
    });
  });
})();
