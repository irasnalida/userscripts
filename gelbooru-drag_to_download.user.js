// ==UserScript==
// @name        Gelbooru Drag to download
// @namespace   Violentmonkey Scripts
// @match       https://gelbooru.com/*
// @icon        https://external-content.duckduckgo.com/ip3/gelbooru.com.ico
// @version     0.2
// @author      irasnalida
// @description gelbooru download
// @grant       GM_download
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/gelbooru-drag_to_download.user.js
// ==/UserScript==

document.addEventListener("dragend", (e) => {
  // Check if the dragged element is an image
  if (e.target.tagName.toLowerCase() !== "img") return;

  const originalSrc = e.target.src;

  // Basic check to ensure we only process sample images
  if (!originalSrc.includes("/samples/") && !originalSrc.includes("sample_"))
    return;

  // Parse the SRC to get the original full-size image link
  const newSrc = originalSrc
    .replace("\/samples", "images/")
    .replace("sample_", "");

  // Extract Artist Name
  const artistNode = document.querySelector(".tag-type-artist > a");
  const artist = artistNode ? artistNode.textContent.trim() : "unknown";

  // Extract Date
  let dateStr = "00000000";
  const listItems = document.querySelectorAll("li:not([class])");
  for (const li of listItems) {
    if (li.textContent.includes("Posted:")) {
      // Extracts YYYY-MM-DD from text like "Posted: 2025-01-10 15:30:37"
      const dateMatch = li.textContent.match(
        /Posted:\s*(\d{4})-(\d{2})-(\d{2})/,
      );
      if (dateMatch) {
        const year = dateMatch[1]; // Keep all 4 digits -> '2025'
        const month = dateMatch[2]; // '01'
        const day = dateMatch[3]; // '10'
        dateStr = `${year}${month}${day}`;
      }
      break;
    }
  }

  // Construct Filename
  const urlParts = newSrc.split("/");
  const imageNameWithExt = urlParts[urlParts.length - 1];
  const filename = `[${artist}] ${dateStr} ${imageNameWithExt}`;

  // Construct Final URL with Hash Parameters
  // URL-encoding the values ensures spaces and brackets don't break the URL
  const finalUrl = `${newSrc}#filename=${encodeURIComponent(filename)}&pack=${encodeURIComponent(artist)}`;

  console.log(newSrc);
  GM_download(newSrc, filename);
});
