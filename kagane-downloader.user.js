// ==UserScript==
// @name        Kagane Downloader
// @namespace   Violentmonkey Scripts
// @match       https://kagane.org/series/*
// @match       https://kagane.to/series/*
// @icon        https://external-content.duckduckgo.com/ip3/kagane.org.ico
// @grant       none
// @version     0.3
// @author      irasnalida
// @require     https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @description Automatically scroll and download images in a zip file.
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/kagane-downloader.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/kagane-downloader.user.js
// ==/UserScript==

async function blobUrlToBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

// Helper function to wait for an image to load after scrolling
function waitForImageToLoad(container, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkImg = setInterval(() => {
      const img = container.querySelector(".blob-image-page img");

      // Check if the image exists and has a valid blob URL
      if (img && img.src && img.src.startsWith("blob:")) {
        clearInterval(checkImg);
        resolve(img);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkImg);
        console.warn("Timeout waiting for image in container:", container);
        resolve(null); // Proceed anyway after timeout to prevent infinite hanging
      }
    }, 500); // Poll every 500ms
  });
}

// Icons used for different button states
const ICONS = {
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10l5 5l5-5" /></g></svg>`,
  spinner: `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
};

async function saveImagesAsZip() {
  const btn = document.getElementById("auto-download-btn");
  const btnIcon = document.getElementById("btn-icon-wrapper");
  const btnText = document.getElementById("btn-text");

  if (btn) {
    // Change to Amber/Working state
    btn.disabled = true;
    btn.className =
      "fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-full shadow-lg transition-all duration-300 cursor-not-allowed";
    btnIcon.innerHTML = ICONS.spinner;
    btnText.textContent = "Preparing...";
  }

  const zip = new JSZip();
  const title = document.title.replace(/[<>:"\/\\|?*]+/g, ""); // sanitize filename
  const usedFilenames = new Set();

  let currentIndex = 0;

  // Loop until we run out of containers
  while (true) {
    // Re-query in case new containers are injected into the DOM as we scroll
    const pageContainers = document.querySelectorAll(".page-container");
    const totalPages = pageContainers.length;

    if (currentIndex >= totalPages) {
      break; // No more containers left to process
    }

    if (btnText)
      btnText.textContent = `Processing ${currentIndex + 1} / ${totalPages}`;

    const container = pageContainers[currentIndex];

    // 1. Scroll the container into the center of the viewport to trigger lazy loading
    container.scrollIntoView({ behavior: "smooth", block: "center" });

    // Give the page a tiny breathing room to trigger the network request
    await new Promise((r) => setTimeout(r, 500));

    // 2. Wait for the image element to populate with a blob URL
    console.log(`Waiting for image on page index ${currentIndex}...`);
    const img = await waitForImageToLoad(container);

    if (img) {
      const pageNumber =
        container.getAttribute("data-page") || (currentIndex + 1).toString();
      let safeFileName = `${title} ${pageNumber}.jpg`;
      let counter = 1;

      while (usedFilenames.has(safeFileName)) {
        safeFileName = `${title} ${pageNumber} (${counter}).jpg`;
        counter++;
      }
      usedFilenames.add(safeFileName);

      // 3. Fetch and add to ZIP
      try {
        const blob = await blobUrlToBlob(img.src);
        zip.file(safeFileName, blob);
        console.log(`Successfully buffered: ${safeFileName}`);
      } catch (err) {
        console.error(`Failed to fetch blob for page ${pageNumber}:`, err);
      }
    }

    currentIndex++;
  }

  // 4. Generate and download the ZIP once the loop finishes
  console.log("All pages processed. Generating ZIP...");
  if (btn) {
    // Change to Blue/Zipping state
    btn.className =
      "fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-full shadow-lg transition-all duration-300 cursor-wait";
    btnText.textContent = "Zipping...";
  }

  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${title}.zip`);

    if (btn) {
      // Change to Green/Done state
      btn.className =
        "fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-full shadow-lg transition-all duration-300";
      btnIcon.innerHTML = ICONS.check;
      btnText.textContent = "Done!";

      // Reset button after 3 seconds so it can be used again
      setTimeout(() => {
        btn.className =
          "fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full shadow-lg transition-all duration-300 cursor-pointer";
        btnIcon.innerHTML = ICONS.download;
        btnText.textContent = "Download";
        btn.disabled = false;
      }, 3000);
    }
  });
}

// Add a button to trigger the download
function addDownloadButton() {
  const btn = document.createElement("button");
  btn.id = "auto-download-btn";
  // Use Tailwind classes for styling
  btn.className =
    "fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full shadow-lg transition-all duration-300 cursor-pointer";

  btn.innerHTML = `
        <span id="btn-icon-wrapper" class="flex items-center justify-center">
            ${ICONS.download}
        </span>
        <span id="btn-text">Download</span>
    `;

  btn.onclick = (e) => {
    e.preventDefault();
    // Prevent clicking while it's already running
    if (!btn.disabled) {
      saveImagesAsZip();
    }
  };

  document.body.appendChild(btn);
}

window.addEventListener("load", addDownloadButton);
