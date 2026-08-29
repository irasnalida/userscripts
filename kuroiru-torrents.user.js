// ==UserScript==
// @name        Kuroiru Torrents
// @namespace   Violentmonkey Scripts
// @match       https://kuroiru.co/*
// @icon        https://external-content.duckduckgo.com/ip3/kuroiru.co.ico
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @version     0.3
// @author      irasnalida
// @description Add torrent sites
// @updateURL   https://raw.githubusercontent.com/irasnalida/userscripts/main/kuroiru-torrents.user.js
// @downloadURL https://raw.githubusercontent.com/irasnalida/userscripts/main/kuroiru-torrents.user.js
// ==/UserScript==

const codeToFlag = {
  en: "🇺🇸",
  "en-US": "🇺🇸",
  "en-GB": "🇬🇧",
  "en-AU": "🇦🇺",
  "en-CA": "🇨🇦",
  jp: "🇯🇵",
  ja: "🇯🇵",
  "ja-JP": "🇯🇵",
  enm: "🙃",
  es: "🇪🇸",
  "es-ES": "🇪🇸",
  "es-MX": "🇲🇽",
  "es-AR": "🇦🇷",
  "es-CO": "🇨🇴",
  "es-CL": "🇨🇱",
  "es-419": "🇲🇽",
  pt: "🇧🇷",
  "pt-BR": "🇧🇷",
  "pt-PT": "🇵🇹",
  fr: "🇫🇷",
  "fr-FR": "🇫🇷",
  "fr-CA": "🇨🇦",
  de: "🇩🇪",
  "de-DE": "🇩🇪",
  it: "🇮🇹",
  "it-IT": "🇮🇹",
  ru: "🇷🇺",
  "ru-RU": "🇷🇺",
  ar: "🇸🇦",
  "ar-SA": "🇸🇦",
  "ar-AE": "🇦🇪",
  hi: "🇮🇳",
  "hi-IN": "🇮🇳",
  id: "🇮🇩",
  "id-ID": "🇮🇩",
  th: "🇹🇭",
  "th-TH": "🇹🇭",
  vi: "🇻🇳",
  "vi-VN": "🇻🇳",
  ko: "🇰🇷",
  "ko-KR": "🇰🇷",
  zh: "🇨🇳",
  "zh-Hans": "🇨🇳",
  "zh-Hant": "🇹🇼",
  "zh-CN": "🇨🇳",
  "zh-TW": "🇹🇼",
  "zh-HK": "🇭🇰",
  pl: "🇵🇱",
  "pl-PL": "🇵🇱",
  tr: "🇹🇷",
  "tr-TR": "🇹🇷",
  nl: "🇳🇱",
  "nl-NL": "🇳🇱",
  sv: "🇸🇪",
  "sv-SE": "🇸🇪",
  el: "🇬🇷",
  "el-GR": "🇬🇷",
  he: "🇮🇱",
  "he-IL": "🇮🇱",
  hu: "🇭🇺",
  "hu-HU": "🇭🇺",
  cs: "🇨🇿",
  "cs-CZ": "🇨🇿",
  da: "🇩🇰",
  "da-DK": "🇩🇰",
  fi: "🇫🇮",
  "fi-FI": "🇫🇮",
  no: "🇳🇴",
  "nb-NO": "🇳🇴",
  uk: "🇺🇦",
  "uk-UA": "🇺🇦",
  ms: "🇲🇾",
  "ms-MY": "🇲🇾",
  tl: "🇵🇭",
  "tl-PH": "🇵🇭",
};

function waitForElement(selector, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const existingElement = document.querySelector(selector);
    if (existingElement) return resolve(existingElement);

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    // Set a timer to abort if it takes too long
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(
          `Timeout: Element '${selector}' not found within ${timeoutMs}ms`,
        ),
      );
    }, timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

onUrlChange();

// if (self.navigation) {
//   navigation.addEventListener("navigatesuccess", onUrlChange);
// } else {
//   let u = location.href;
//   new MutationObserver(
//     () => u !== (u = location.href) && onUrlChange(),
//   ).observe(document, { subtree: true, childList: true });
// }
//
if (self.navigation) {
  navigation.addEventListener("navigatesuccess", onUrlChange);
} else {
  // Catch browser back/forward button clicks
  window.addEventListener("popstate", onUrlChange);

  // Intercept pushState (used by SPAs when a link in clicked)
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    onUrlChange();
  };

  // Intercept replaceState (used by SPAs for redirects without adding history)
  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    onUrlChange();
  };
}

function onUrlChange() {
  if (location.pathname.includes("/streams")) {
    addOptions();
  }
  const animeRegex = /^\/anime\/\d+(?:\/|$)/;
  if (animeRegex.test(location.pathname)) {
    addTorrentTab();
  }
}

function addOptions() {
  const sections = document.querySelectorAll(".stream-section-big");
  const freeSection = Array.from(sections).find(
    (el) => el.textContent.trim() === "Free",
  );
  if (!freeSection) {
    console.log("Not Found it!", freeSection);
    return;
  }
  const stream = freeSection.nextElementSibling;
  let link = location.pathname.split("/");
  let name = link[3];
  let malid = link[2];
  name = name.replaceAll("_", " ");
  const a = createStreamItem(
    (site = "NekoBT"),
    (iconUrl = "https://nekobt.to/cdn/pfp/null/64"),
    (link = "https://nekobt.to/search?query=" + name),
  );
  stream.appendChild(a);

  const b = createStreamItem(
    (site = "TsukiHime"),
    (iconUrl = "https://tsukihime.org/favicon.ico"),
    (link = "https://tsukihime.org/anime/m" + malid),
  );
  stream.appendChild(b);
}

function createStreamItem(site, iconUrl, link = "", type = "Torrent") {
  const anchor = document.createElement("a");
  anchor.href = link;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.className = "stream-item";

  const epBadge = document.createElement("div");
  epBadge.className = "stream-ep";
  epBadge.textContent = "EP ?";

  const img = document.createElement("img");
  img.src = iconUrl;
  img.style.width = "16px";
  img.style.width = "16px";

  const typeBadge = document.createElement("div");
  typeBadge.className = "stream-ep";
  typeBadge.textContent = type;

  anchor.appendChild(epBadge);
  anchor.appendChild(img);
  anchor.append(` ${site} `);
  anchor.appendChild(typeBadge);

  return anchor;
}

const torrentCache = new Map();
let isFetching = false;
function addTorrentTab() {
  waitForElement("#prompt-menu-cont").then((tabBar) => {
    if (tabBar.querySelector("#torrent-tab")) return;
    const tabTorrentItem = document.createElement("div");
    tabTorrentItem.classList.add("prompt-tab-menu");
    tabTorrentItem.id = "torrent-tab";
    tabTorrentItem.textContent = "Torrent";
    tabBar.appendChild(tabTorrentItem);
    tabTorrentItem.addEventListener("click", async (e) => {
      const currentPath = window.location.pathname;
      let curActiveTab = tabBar.querySelector(".tab-active");
      curActiveTab.classList.remove("tab-active");
      tabTorrentItem.classList.add("tab-active");
      const match = currentPath.match(/\/anime\/(\d+)/);
      if (match) {
        const promptTab = document.getElementById("prompt-tab");
        let torrentContainer = document.getElementById("torrent-container");
        if (!torrentContainer) {
          torrentContainer = document.createElement("div");
          torrentContainer.id = "torrent-container";
          promptTab.insertAdjacentElement("beforebegin", torrentContainer);
        }
        torrentContainer.style.display = "block";
        const animeId = match[1];
        if (torrentCache.has(animeId)) {
          console.log(
            `[Cache] Loading torrents for MAL ID ${animeId} from memory`,
          );

          const cachedTorrentData = torrentCache.get(animeId);
          renderTorrentUI(cachedTorrentData);
        } else {
          if (isFetching) {
            console.log(
              `[Network] Already fetching data for MAL ID ${animeId}`,
            );
            return;
          }
          isFetching = true;
          console.log(`[Network] Fetching new data for MAL ID ${animeId}`);
          const data = await fetchTsukihimeId(animeId);
          const internalId = data.id;
          const torrentData = await fetchTorrents(internalId, 100, 0);
          torrentData.internalId = internalId;
          patchMissingEpisodes(torrentData.results);
          torrentCache.set(animeId, torrentData);
          console.log(`[Cache] Caching torrents for MAL ID ${animeId}`);
          console.log(torrentCache);
          isFetching = false;
          renderTorrentUI(torrentData);
        }
        function renderTorrentUI(torrentData, savedActiveEp = "#") {
          torrentContainer.innerHTML = "";

          tabTorrentItem.textContent = `Torrent ${torrentData.results.length} of ${torrentData.total}`;

          const epSelectCont = document.createElement("div");
          epSelectCont.id = "torrent-epselect-cont";

          const groupSelectCont = document.createElement("div");
          groupSelectCont.style.padding = "0 0 10px 0";

          const groupSelect = document.createElement("select");
          groupSelect.id = "group-select";
          groupSelect.style.padding = "6px";
          groupSelect.style.backgroundColor = "#222";
          groupSelect.style.color = "#fff";
          groupSelect.style.border = "1px solid #444";
          groupSelect.style.borderRadius = "4px";
          groupSelect.style.cursor = "pointer";

          const defaultOption = document.createElement("option");
          defaultOption.value = "all";
          defaultOption.textContent = "All Groups";
          groupSelect.appendChild(defaultOption);
          groupSelectCont.appendChild(groupSelect);

          const listContainer = document.createElement("div");
          listContainer.id = "torrent-list-cont";

          torrentContainer.appendChild(epSelectCont);
          torrentContainer.appendChild(groupSelectCont);
          torrentContainer.appendChild(listContainer);

          let currentSelectedEp = savedActiveEp;
          let currentSelectedGroup = "all";

          groupSelect.addEventListener("change", function (e) {
            currentSelectedGroup = e.target.value;
            updateFilterStyle(currentSelectedEp, currentSelectedGroup);
          });

          // Explicitly maintain the unique states
          const uniqueEpisodesSet = new Set();
          const uniqueGroupsMap = new Map();
          let sortedEpisodes = [];

          // Explicitly build the static "#" and "Batch" buttons first
          const allItem = document.createElement("div");
          allItem.className = "ep-item";
          if (currentSelectedEp === "#") allItem.id = "ep-item-active";
          allItem.textContent = "#";
          allItem.addEventListener("click", function () {
            currentSelectedEp = "#";
            updateActiveStyling();
            updateFilterStyle("#", currentSelectedGroup);
          });
          epSelectCont.appendChild(allItem);

          const batchItem = document.createElement("div");
          batchItem.className = "ep-item";
          if (currentSelectedEp === "Batch") batchItem.id = "ep-item-active";
          batchItem.textContent = "Batch";
          batchItem.addEventListener("click", function () {
            currentSelectedEp = "Batch";
            updateActiveStyling();
            updateFilterStyle("Batch", currentSelectedGroup);
          });
          epSelectCont.appendChild(batchItem);

          function updateActiveStyling() {
            const items = epSelectCont.querySelectorAll(".ep-item");
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.textContent === String(currentSelectedEp)) {
                item.id = "ep-item-active";
              } else {
                item.removeAttribute("id");
              }
            }
          }

          // Add episode helper: maintains the Set and inserts DOM using array index
          function handleNewEpisode(epNum) {
            // The Set implicitly prevents duplicates
            if (uniqueEpisodesSet.has(epNum)) return;
            uniqueEpisodesSet.add(epNum);

            // Keep it sorted
            sortedEpisodes = Array.from(uniqueEpisodesSet).sort((a, b) => parseFloat(a) - parseFloat(b));

            // Find where it belongs in our sorted array
            const targetIndex = sortedEpisodes.indexOf(epNum);

            const epItem = document.createElement("div");
            epItem.className = "ep-item";
            if (String(currentSelectedEp) === String(epNum)) epItem.id = "ep-item-active";
            epItem.textContent = epNum;

            epItem.addEventListener("click", function () {
              currentSelectedEp = epNum;
              updateActiveStyling();
              updateFilterStyle(epNum, currentSelectedGroup);
            });

            // Insert at the exact index (+2 because "#" and "Batch" take up indices 0 and 1)
            const insertBeforeNode = epSelectCont.children[targetIndex + 2];
            if (insertBeforeNode) {
              epSelectCont.insertBefore(epItem, insertBeforeNode);
            } else {
              epSelectCont.appendChild(epItem);
            }
          }

          function handleNewGroup(group) {
            if (!group || group.id === null || group.id === undefined) return;

            if (!uniqueGroupsMap.has(group.id)) {
              const groupName = group.name || "Unknown Group";
              uniqueGroupsMap.set(group.id, groupName);

              const option = document.createElement("option");
              option.value = group.id;
              option.textContent = groupName;

              // Insert alphabetically (skipping the "All Groups" option at index 0)
              const existingOptions = Array.from(groupSelect.options).slice(1);
              let inserted = false;

              for (let j = 0; j < existingOptions.length; j++) {
                if (groupName.toLowerCase() < existingOptions[j].textContent.toLowerCase()) {
                  groupSelect.insertBefore(option, existingOptions[j]);
                  inserted = true;
                  break;
                }
              }

              if (!inserted) {
                groupSelect.appendChild(option);
              }
            }
          }

          // Initial loop: Create rows and process episodes cleanly
          for (let i = 0; i < torrentData.results.length; i++) {
            const torrent = torrentData.results[i];

            if (torrent.episode_no !== null && torrent.episode_no !== undefined && torrent.episode_no !== "") {
              handleNewEpisode(torrent.episode_no);
            }
            if (torrent.group) {
              handleNewGroup(torrent.group);
            }

            const row = createTorrentRow(torrent);
            listContainer.appendChild(row);
          }

          // Apply initial CSS filter state
          updateFilterStyle(currentSelectedEp, currentSelectedGroup);

          // Load More Button Logic
          if (torrentData.results.length < torrentData.total) {
            const loadMoreBtn = document.createElement("div");
            loadMoreBtn.className = "prompt-tab-menu";
            loadMoreBtn.style.textAlign = "center";
            loadMoreBtn.style.marginTop = "10px";
            loadMoreBtn.style.cursor = "pointer";
            loadMoreBtn.textContent = `Load More (Showing ${torrentData.results.length} of ${torrentData.total})`;

            loadMoreBtn.addEventListener("click", async function () {
              if (isFetching) return;
              isFetching = true;
              loadMoreBtn.textContent = "Loading...";

              try {
                const currentOffset = torrentData.results.length;
                const newData = await fetchTorrents(torrentData.internalId, 100, currentOffset);

                patchMissingEpisodes(newData.results);

                // Explicitly append ONLY new rows and dynamically track new episodes
                for (let i = 0; i < newData.results.length; i++) {
                  const torrent = newData.results[i];
                  torrentData.results.push(torrent);

                  if (torrent.episode_no !== null && torrent.episode_no !== undefined && torrent.episode_no !== "") {
                    handleNewEpisode(torrent.episode_no);
                  }

                  const row = createTorrentRow(torrent);
                  listContainer.appendChild(row);
                }

                tabTorrentItem.textContent = `Torrent ${torrentData.results.length} of ${torrentData.total}`;

                if (torrentData.results.length < torrentData.total) {
                  loadMoreBtn.textContent = `Load More (Showing ${torrentData.results.length} of ${torrentData.total})`;
                } else {
                  loadMoreBtn.remove();
                }

                isFetching = false;

              } catch (error) {
                console.error("Load More Error:", error);
                loadMoreBtn.textContent = "Error - Try Again";
                isFetching = false;
              }
            });

            torrentContainer.appendChild(loadMoreBtn);
          }
        }
      }
    });
    tabBar.addEventListener("click", (e) => {
      const clickedDiv = e.target.closest("div");
      if (
        clickedDiv &&
        clickedDiv !== tabBar &&
        clickedDiv.id !== "torrent-tab"
      ) {
        const torrentContainer = document.getElementById("torrent-container");
        torrentContainer.style.display = "none";
        tabTorrentItem.classList.remove("tab-active");
        clickedDiv.classList.add("tab-active");
      }
    });
  });
}

function updateFilterStyle(epFilter, groupFilter) {
  let styleEl = document.getElementById("torrent-css-filter");

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "torrent-css-filter";
    document.head.appendChild(styleEl);
  }

  let rules = [];

  // Explicitly isolate the episode rule
  if (epFilter !== "#") {
    if (epFilter === "Batch") {
      rules.push("#torrent-list-cont .custom-torrent-row:not(.batch)");
    } else {
      rules.push(`#torrent-list-cont .custom-torrent-row:not(.ep${epFilter})`);
    }
  }

  // Explicitly isolate the group rule
  if (groupFilter !== "all") {
    rules.push(`#torrent-list-cont .custom-torrent-row:not(.gr${groupFilter})`);
  }

  // Apply the combined rules
  if (rules.length === 0) {
    styleEl.textContent = "";
  } else {
    // Joining with a comma creates an explicit OR condition for hiding:
    // "Hide it if it fails the EP check, OR hide it if it fails the GR check"
    styleEl.textContent = rules.join(", ") + " { display: none !important; }";
  }
}

async function addRecentlyFinished() {
  let recentFinSection = document.getElementById("recently-finished");
  if (!recentFinSection) {
    recentFinSection = document.createElement("div");
    recentFinSection.id = "recently-finished";
    const airingSection = document.getElementById("airing-panel");
    airingSection.insertAdjacentElement("beforebegin", recentFinSection);
  }

  const myQuery = `
    fragment AnimeFields on Media {
      id idMal title { romaji english } format episodes averageScore popularity
      endDate { year month day } coverImage { large }
    }
    query GetRecentlyFinishedAnime100 {
      page1: Page(page: 1, perPage: 50) {
        media(type: ANIME, status: FINISHED, sort: END_DATE_DESC) { ...AnimeFields }
      }
      page2: Page(page: 2, perPage: 50) {
        media(type: ANIME, status: FINISHED, sort: END_DATE_DESC) { ...AnimeFields }
      }
    }`;
  try {
    const data = await fetchRecentlyFinished(myQuery);
    const animeList = [...data.data.page1.media, ...data.data.page2.media];
    console.log("Final Data:", data);
    recentFinSection.innerHTML = `
      <div class="section-title">Recently Finished <span class="title-count">${animeList.length}</span></div>
      <div class="leftright-cont">
        <div class="panel-list" id="justfinished-panel">
        </div
      </div>
      `;
    const justFinished = document.getElementById("justfinished-panel");
    setupDragScroll(justFinished);
    setupScrollButtons(justFinished);
    animeList.forEach((anime) => {
      const cardElement = createAnimeCard(anime);
      justFinished.appendChild(cardElement);
    });
  } catch (error) {
    console.error("Error fetching anime:", error);
  }
}

function setupDragScroll(element) {
  const slider = element;
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    isDragging = false;
    slider.classList.add("active");

    // Get initial X coordinate relative to the container
    startX = e.pageX - slider.offsetLeft;

    // Store the initial scroll position
    scrollLeft = slider.scrollLeft;
  });

  // Handle mouse leaving the container area while dragging
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("active");
  });

  // Handle mouse release
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("active");
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return; // Only run if the mouse is pressed
    e.preventDefault(); // Stop any default selection behaviors

    // Calculate how far the mouse has moved
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.0;
    if (Math.abs(walk) > 5) {
      isDragging = true;
      e.preventDefault(); // Prevents highlighting text/images while dragging
    }
    // Update the scroll position
    slider.scrollLeft = scrollLeft - walk;
  });
  slider.addEventListener(
    "click",
    (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true },
  );
}

function setupScrollButtons(container) {
  const leftBtn = createElementFromHTML(
    `<div class="left-btn" style="visibility: visible;"><i class="lrbtn-shape mdil mdil-chevron-left"></i></div>`,
  );
  const rightBtn = createElementFromHTML(
    `<div class="right-btn" style="visibility: visible;"><i class="lrbtn-shape mdil mdil-chevron-right"></i></div>`,
  );

  if (!container || !leftBtn || !rightBtn) return;

  container.insertAdjacentElement("afterbegin", leftBtn);
  container.insertAdjacentElement("beforeend", rightBtn);

  function scroll(direction) {
    let distance = container.clientWidth - 120;
    if (direction === "left") {
      distance *= -1;
    }
    container.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  }

  leftBtn.addEventListener("click", () => scroll("left"));
  rightBtn.addEventListener("click", () => scroll("right"));

  function updateButtonVisibility() {
    // If at the very beginning (0), hide left button
    if (container.scrollLeft <= 0) {
      leftBtn.style.visibility = "hidden";
    } else {
      leftBtn.style.visibility = "visible";
    }

    // If scrollLeft + visible width >= total scrollable width, hide right button
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (Math.ceil(container.scrollLeft) >= maxScrollLeft - 1) {
      rightBtn.style.visibility = "hidden";
    } else {
      rightBtn.style.visibility = "visible";
    }

    // If there are so few items that scrolling isn't needed at all, hide both
    if (container.scrollWidth <= container.clientWidth) {
      leftBtn.style.visibility = "hidden";
      rightBtn.style.visibility = "hidden";
    }
  }

  container.addEventListener("scroll", updateButtonVisibility);
  window.addEventListener("resize", updateButtonVisibility);
  setTimeout(updateButtonVisibility, 100);
}

function createElementFromHTML(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild;
}

// Extracts unique episode numbers from the data and sorts them
function extractUniqueEpisodes(torrentsArray) {
  const epSet = new Set();

  for (let i = 0; i < torrentsArray.length; i++) {
    const ep = torrentsArray[i].episode_no;
    // Ensure we only add valid episode numbers
    if (ep !== null && ep !== undefined && ep !== "") {
      epSet.add(ep);
    }
  }

  const epArray = Array.from(epSet);
  epArray.sort((a, b) => {
    return parseFloat(a) - parseFloat(b);
  });

  return epArray;
}

// Filters the torrent array based on the selected episode
function filterTorrents(torrentsArray, selectedEp) {
  if (selectedEp === "#") {
    return torrentsArray; // Show all
  }

  // Explicitly handle the new Batch filter
  if (selectedEp === "Batch") {
    const filtered = [];
    for (let i = 0; i < torrentsArray.length; i++) {
      // Parse filecount to ensure we are comparing numbers
      if (parseInt(torrentsArray[i].filecount, 10) > 1) {
        filtered.push(torrentsArray[i]);
      }
    }
    return filtered;
  }

  // Handle normal episode numbers
  const filtered = [];
  for (let i = 0; i < torrentsArray.length; i++) {
    if (String(torrentsArray[i].episode_no) === String(selectedEp)) {
      filtered.push(torrentsArray[i]);
    }
  }

  return filtered;
}

function extractEpisodeFromName(name) {
  if (!name) return null;

  // Matches "S03E12", "s01e05", etc. and captures the episode digits
  const match = name.match(/S\d+E(\d+)/i);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

function patchMissingEpisodes(torrentsArray) {
  for (let i = 0; i < torrentsArray.length; i++) {
    const torrent = torrentsArray[i];

    // Check if episode_no is strictly missing or empty
    if (torrent.episode_no === null || torrent.episode_no === undefined || torrent.episode_no === "") {
      const extractedEp = extractEpisodeFromName(torrent.name);

      if (extractedEp !== null) {
        torrent.episode_no = extractedEp;
      }
    }
  }
}

/**
 * Formats AniList data and creates a DOM element for the anime card.
 *
 * @param {object} anime - A single media object from the AniList API.
 * @returns {HTMLElement} The constructed anchor tag element.
 */
function createAnimeCard(anime) {
  // Format the score (AniList returns 1-100, UI expects a 10-point scale)
  const score = anime.averageScore
    ? (anime.averageScore / 10).toFixed(2)
    : "N/A";

  // Format popularity (e.g., 20500 -> "20.5K")
  const pop =
    anime.popularity > 999
      ? (anime.popularity / 1000).toFixed(1).replace(".0", "") + "K"
      : anime.popularity;

  // Format episodes based on the format type
  const isMovie = anime.format === "MOVIE";
  const epText = isMovie ? "Movie" : `${anime.episodes || "?"} Eps`;

  // Format the end date (YYYY-MM-DD) for the bottom label
  const dateStr = getRelativeTime(
    anime.endDate.year,
    anime.endDate.month,
    anime.endDate.day,
  );

  // Fallback to romaji if english title is null
  const title = anime.title.english || anime.title.romaji;

  // Construct the HTML string
  const cardItem = `
        <a draggable="false" href="/anime/${anime.idMal}" class="panel-item" onclick="event.preventDefault();pAnime(${anime.idMal})">
            <div class="cover">
                <div class="item-ep">${epText}</div>
                <div class="item-pop">${score} <i class="mdil mdil-account"></i> ${pop}</div>
                <img class="cover-img" alt="cover" src="${anime.coverImage.large}">
            </div>
            <div class="item-title">${title}</div>
            <div class="item-bottom">${dateStr}</div>
        </a>
    `;

  // Convert the HTML string into a live DOM node
  const wrapper = document.createElement("div");
  wrapper.innerHTML = cardItem.trim();

  return wrapper.firstElementChild;
}

addRecentlyFinished();
/**
 * Fetches anime data from Tsukihime API using a MAL ID.
 * * @param {number|string} malId - The MyAnimeList ID of the anime.
 * @returns {Promise<number>} A promise that resolves with the internal Tsukihime ID.
 */
function fetchTsukihimeId(malId) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://api.tsukihime.org/v1/animes/mal/${malId}`,
      headers: {
        accept: "application/json",
      },
      onload: (response) => {
        // Check if the request was successful (Status 200-299)
        if (response.status >= 200 && response.status < 300) {
          try {
            // Parse the JSON string into a JavaScript object
            const data = JSON.parse(response.responseText);

            // Resolve the promise with just the ID
            resolve(data);
          } catch (error) {
            reject(
              new Error("Failed to parse JSON response from Tsukihime API."),
            );
          }
        } else {
          reject(
            new Error(`API Error: ${response.status} - ${response.statusText}`),
          );
        }
      },
      onerror: (error) => {
        reject(
          new Error(
            "Network error occurred while fetching from Tsukihime API.",
          ),
        );
      },
      ontimeout: () => {
        reject(new Error("Request to Tsukihime API timed out."));
      },
    });
  });
}

/**
 * Fetches the list of torrents for a specific anime from the Tsukihime API.
 * * @param {number} internalId - The internal Tsukihime ID of the anime.
 * @param {number} limit - Number of results per page (default: 50).
 * @param {number} offset - Starting point for pagination (default: 0).
 * @returns {Promise<Object>} A promise that resolves with the full API response object.
 */
function fetchTorrents(internalId, limit = 50, offset = 0) {
  return new Promise((resolve, reject) => {
    // Construct the URL with pagination parameters
    const apiUrl = `https://api.tsukihime.org/v1/animes/${internalId}?limit=${limit}&offset=${offset}`;

    GM_xmlhttpRequest({
      method: "GET",
      url: apiUrl,
      headers: {
        accept: "application/json",
      },
      onload: (response) => {
        if (response.status >= 200 && response.status < 300) {
          try {
            const data = JSON.parse(response.responseText);

            // Check if the API explicitly returned an error flag
            if (data.error) {
              return reject(new Error("API returned an error state."));
            }

            // Resolve with the entire data object (so you can access .results, .total, etc.)
            resolve(data);
          } catch (error) {
            reject(new Error("Failed to parse torrent data JSON."));
          }
        } else {
          reject(
            new Error(`API Error: ${response.status} - ${response.statusText}`),
          );
        }
      },
      onerror: () => {
        reject(new Error("Network error occurred while fetching torrents."));
      },
      ontimeout: () => {
        reject(new Error("Request for torrents timed out."));
      },
    });
  });
}

function createTorrentRow(torrent) {
  const sizeText = formatSize(torrent.totalsize);
  const dateText = formatDataAndRelativeTime(torrent.added_date);
  const magnetLink = `magnet:?xt=urn:btih:${torrent.btih}`;

  const audText =
    (torrent.audiolangs || [])
      .map((code) => codeToFlag[code] || code)
      .join(" ") || "-";
  const subText =
    (torrent.sublangs || [])
      .map((code) => codeToFlag[code] || code)
      .join(" ") || "-";

  const episodeNo = torrent.episode_no || "-";
  const numOfFiles = torrent.filecount || "-";
  const hasEnglish = torrent.audiolangs.includes("en");

  const rowDiv = document.createElement("div");
  rowDiv.classList.add("custom-torrent-row");

  if (hasEnglish) {
    rowDiv.classList.add("en");
  }

  if (torrent.episode_no !== null && torrent.episode_no !== undefined && torrent.episode_no !== "") {
    rowDiv.classList.add(`ep${torrent.episode_no}`);
  }

  if (torrent.group && torrent.group.id !== null && torrent.group.id !== undefined) {
    rowDiv.classList.add(`gr${torrent.group.id}`);
  }

  if (parseInt(torrent.filecount, 10) > 1) {
    rowDiv.classList.add("batch");
  }

  // Inject the HTML
  rowDiv.innerHTML = `
    <div class="torrent-meta">
      <span>Episode ${episodeNo}</span>
      <span class="torrent-separator">•</span>
      <span>Files ${numOfFiles}</span>
      <span class="torrent-separator">•</span>
      <span class="torrent-date">${dateText}</span>
      <span class="torrent-separator">•</span>
      <span class="torrent-size">${sizeText}</span>
    </div>
    <a href="${magnetLink}" class="torrent-title" title="Download via Magnet">
      ${torrent.name}
    </a>
    <div class="torrent-langs">
      AUD: <span class="lang-highlight">${audText}</span> &nbsp;&nbsp; SUB: <span class="lang-highlight">${subText}</span>
    </div>
  `;

  return rowDiv;
}

/**
 * Fetches data using GM_xmlhttpRequest and caches it daily via GM_setValue.
 *
 * @param {string} query - The GraphQL query string.
 * @param {object} variables - Variables to pass into the GraphQL query.
 * @returns {Promise<object>} Resolves with the API response data.
 */
function fetchRecentlyFinished(query) {
  return new Promise((resolve, reject) => {
    const CACHE_KEY = "anilist_anime_cache";
    const TIME_KEY = "anilist_last_fetch_time";

    const cachedData = GM_getValue(CACHE_KEY);
    const lastFetchTime = GM_getValue(TIME_KEY, 0);
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(6, 0, 0, 0);

    if (now.getTime() < resetTime.getTime()) {
      resetTime.setDate(resetTime.getDate() - 1);
    }
    const mostRecentReset = resetTime.getTime();
    // Check if data is present AND less than 24 hours old
    const isCacheValid = cachedData && lastFetchTime > mostRecentReset;

    if (isCacheValid) {
      console.log("Loading AniList data from local cache.");
      try {
        // Return stored data immediately
        return resolve(JSON.parse(cachedData));
      } catch (e) {
        console.warn("Failed to parse cached data. Refetching...");
        // If parsing fails, fall through and fetch fresh data
      }
    }

    console.log("Cache missing or expired. Fetching fresh AniList data...");

    // Fetch new data using GM_xmlhttpRequest
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://graphql.anilist.co",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: JSON.stringify({
        query: query,
      }),
      onload: (response) => {
        if (response.status >= 200 && response.status < 300) {
          try {
            const parsedData = JSON.parse(response.responseText);

            // Store the new data and update the timestamp
            GM_setValue(CACHE_KEY, JSON.stringify(parsedData));
            GM_setValue(TIME_KEY, Date.now());

            resolve(parsedData);
          } catch (e) {
            reject(new Error("Failed to parse API response JSON."));
          }
        } else {
          reject(
            new Error(`API Error: ${response.status} - ${response.statusText}`),
          );
        }
      },
      onerror: () => reject(new Error("Network error during API request.")),
      ontimeout: () => reject(new Error("API request timed out.")),
    });
  });
}

// Converts bytes to a readable format (MB or GB)
function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Converts a UNIX timestamp to "17 Jun 2026 (22 days ago)"
function formatDataAndRelativeTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();

  // Format the absolute date (e.g., "17 Jun 2026")
  const options = { day: "2-digit", month: "short", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  // Calculate relative time
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let relativeText = "";
  if (diffDays === 0) relativeText = "today";
  else if (diffDays === 1) relativeText = "1 day ago";
  else if (diffDays < 30) relativeText = `${diffDays} days ago`;
  else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    relativeText = `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    relativeText = `${years} year${years > 1 ? "s" : ""} ago`;
  }

  return `${formattedDate} (${relativeText})`;
}

function getRelativeTime(year, month, day) {
  if (!year || !month || !day) return "Unknown";

  // JavaScript Date expects months to be 0-indexed (0 = Jan, 11 = Dec)
  const endDate = new Date(year, month - 1, day);
  const today = new Date();

  // Reset times to midnight to calculate strict day boundaries
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffMs = today - endDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Not finished yet"; // Safety catch
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30.44); // 30.44 is average days in a month
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;

  const diffYears = Math.floor(diffDays / 365.25);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}
