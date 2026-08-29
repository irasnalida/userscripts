// ==UserScript==
// @name        AniList Intergration
// @namespace   Violentmonkey Scripts
// @match       https://animixplay.tub/watch/*
// @match       https://hianime.to/watch/*
// @icon        https://www.google.com/s2/favicons?domain=anilist.co&sz=128
// @grant       none
// @version     0.1
// @author      irasnalida
// @description Uses AniList API to show the ID and add a link to anime's Anilist page on watch page.
// @license     MIT
// @run-at      document-end
// ==/UserScript==


/*Anilist and loading SVG*/
const parser = new DOMParser();
const asvg = `<svg fill='#ffffff' viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6.361 2.943 0 21.056h4.942l1.077-3.133H11.4l1.052 3.133H22.9c.71 0 1.1-.392 1.1-1.101V17.53c0-.71-.39-1.101-1.1-1.101h-6.483V4.045c0-.71-.392-1.102-1.101-1.102h-2.422c-.71 0-1.101.392-1.101 1.102v1.064l-.758-2.166zm2.324 5.948 1.688 5.018H7.144z"></path></g></svg>`;
const lsvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="20" height="20" style="shape-rendering: auto; display: block; background: transparent;"><g><circle cx="50" cy="50" fill="none" stroke='#ffffff' stroke-width="16" r="32" stroke-dasharray="131.94689145077132 45.982297150257104"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"/></circle><g/></g></svg>`;

function fetchidbyseason(name, seasonname, seasonyear) {
  let querySeason = `
  query ($id: Int, $search: String, $season:MediaSeason, $seasonYear:Int) {
  Page {
    media (id: $id, search: $search, season: $season, seasonYear: $seasonYear) {
      id
      idMal
      title {
        english
      }
    }
  }
}
  `;

  let variablesSeason = {
    search: name,
    season: seasonname,
    seasonYear: seasonyear,
    page: 1,
    perPage: 3
  }

  var url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: querySeason,
        variables: variablesSeason
      })
    };

  /*fetch(url, options).then(handleResponse)
      .then(handleData)
      .catch(handleErrorSeason);*/

  // Return a new promise
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(handleResponse)
      .then(data => {
        resolve(data); // Resolve the promise with the retrieved data
      })
      .catch(error => {
        reject(error); // Reject the promise with the error if fetch fails
      });
  });

}

function getdate(dateEl) {
  let dateString = dateEl.textContent;
  const indexOfTo = dateString.indexOf(' to ');
  if (indexOfTo !== -1) {
    dateString = dateString.substring(0, indexOfTo).trim();
  }
  //alert(dateString);
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  let dateArr = dateString.split(',');
  let month = months[dateArr[0].split(' ')[0]];
  let day = dateArr[0].split(' ')[1];
  if (day.length === 1) {
    day = '0' + day;
  }
  let year = dateArr[1].trim();
  let date = parseInt(`${year}${month}${day}`);
  return date;
}


function fetchidbydate(name, date) {
  var queryDate = `
  query ($id: Int, $search: String, $startDate: FuzzyDateInt) {
    Page {
      media (id: $id, search: $search, startDate: $startDate) {
        id
        idMal
        title {
          english
        }
      }
    }
  }
  `;

  var variablesDate = {
    search: name,
    startDate: date,
    page: 1,
    perPage: 3
  };


  var url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: queryDate,
        variables: variablesDate
      })
    };
  /*
  fetch(url, options).then(handleResponse)
      .then(handleData)
      .catch(handleErrorDate);*/

  // Return a new promise
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(handleResponse)
      .then(data => {
        resolve(data); // Resolve the promise with the retrieved data
      })
      .catch(error => {
        reject(error); // Reject the promise with the error if fetch fails
      });
  });



}

function handleResponse(response) {
  return response.json().then(function (json) {
    return response.ok ? json : Promise.reject(json);
  });
}

function handleData(data) {
  let id = data.data.Page.media[0].id;
  if (id !== undefined && id !== null) {
    //alert(id);
    return id;
  }
}

function handleErrorSeason(error) {
  fetchidbydate();
}

function handleErrorDate(error) {
  //alert(error);
  idspan.innerHTML = `${anilistavg}NA`;
  //console.error(error);
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}


// Function to fetch HTML content from a URL
async function fetchHTML(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch HTML');
    }
    const html = await response.text();
    return html;
  } catch (error) {
    //console.error(error);
    //alert(error);
    return null;
  }
}

// Function to parse HTML and use querySelector
async function parseHTMLAndQuerySelector(url, selector, key) {
  var element;
  try {
    const html = await fetchHTML(url);
    if (!html) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.textContent.trim() === key) {
        element = el.nextElementSibling;
        return;
      }
    });
    return element;
  } catch (error) {
    //console.error(error);
    //alert(error);
    return null;
  }
}

function getQueryString(qs) {
  const params = { search: qs };
  const queryString = new URLSearchParams(params);
  return queryString;
}

function lengthCheckandTrim(sn, l) {
  if (sn.length > l) {
    return sn.substring(0, l).trim();
  }
  else {
    return sn.trim();
  }
}


if (/animixplay\.tube/.test(location.hostname)) {
  //alert('anix');
  const statusel = document.querySelector('.maindata > .sub-info');
  statusel.style.marginBottom = '6px';
  const extrainfodiv = document.createElement('div');
  extrainfodiv.setAttribute('class', 'sub-dub-total');
  extrainfodiv.style.marginBottom = '10px';

  const openorsearch = document.createElement('span');
  openorsearch.setAttribute('class', "total");
  openorsearch.innerHTML = `${lsvg.replace('stroke=\'#ffffff\'', 'stroke=\'#cecece\'')}`;

  const AL_idspan = document.createElement('span');
  AL_idspan.className = "dub";
  //AL_idspan.innerHTML = `${asvg.replace('fill=\'#ffffff\'', 'fill=\'#cecece\'')}${lsvg.replace('stroke=\'#ffffff\'', 'stroke=\'#cecece\'')}`;

  const MAL_idspan = document.createElement('span');
  MAL_idspan.className = "dub";
  //MAL_idspan.innerHTML = `MAL${lsvg.replace('stroke=\'#ffffff\'', 'stroke=\'#cecece\'')}`;
  extrainfodiv.appendChild(openorsearch);
  statusel.insertAdjacentElement('afterend', extrainfodiv);
  /*Get anime name*/
  let acname = document.querySelector('.maindata > .ani-name').textContent.trim();
  let name = lengthCheckandTrim(acname, 32);
  /*GET SEASON*/
  const seasonel = document.querySelector('.metadata > .limiter > div:nth-child(3) > span > a');
  let season = seasonel.textContent;
  let seasonArr = season.split(' ');
  let seasonname = seasonArr[0].toUpperCase();
  let seasonyear = parseInt(seasonArr[1]);
  //alert(seasonyear);
  //console.log(name, seasonname, seasonyear);
  fetchidbyseason(name, seasonname, seasonyear)
    .then(data => {
      let AL_id = data.data.Page.media[0].id;
      let MAL_id = data.data.Page.media[0].idMal;
      //alert(AL_id);
      if ((AL_id !== undefined || AL_id !== null) && (MAL_id !== undefined || MAL_id !== null)) {
        showidbuttons(AL_id, MAL_id);
      }
    })
    .catch(error => {
      //alert("Error:", error);
      anixdateattempt();
    });
  function anixdateattempt() {
    const dateel = document.querySelector('.metadata > .limiter span[itemprop="dateCreated"]');
    let date = getdate(dateel);
    fetchidbydate(name, date)
      .then(data => {
        let AL_id = data.data.Page.media[0].id;
        let MAL_id = data.data.Page.media[0].idMal;
        if ((AL_id !== undefined || AL_id !== null) && (MAL_id !== undefined || MAL_id !== null)) {
          showidbuttons(AL_id, MAL_id);
        }
      })
      .catch(error => {
        extrainfodiv.appendChild(AL_idspan);
        extrainfodiv.appendChild(MAL_idspan);
        AL_idspan.innerHTML = `<a style='color:#cecece' href='https://anilist.co/search/anime?search=${name}' target='_blank'>AL</a>`;
        MAL_idspan.innerHTML = `<a style='color:#cecece' href='https://myanimelist.net/anime.php?q=${name}&cat=anime' target='_blank'>MAL</a>`;
        openorsearch.innerHTML = `SEARCH`;
      })
  }
  function showidbuttons(AL_id, MAL_id) {
    extrainfodiv.appendChild(AL_idspan);
    extrainfodiv.appendChild(MAL_idspan);
    AL_idspan.innerHTML = `<a style='color:#cecece' href='https://anilist.co/anime/${AL_id}' target='_blank'>AL</a>`;
    MAL_idspan.innerHTML = `<a style='color:#cecece' href='https://myanimelist.net/anime/${MAL_id}' target='_blank'>MAL</a>`;
    openorsearch.innerHTML = `OPEN`;
  }
}


else if (/hianime\.to/.test(location.hostname)) {
  //alert('h');
  const insertafter = document.querySelector('.anis-watch.anis-watch-tv');
  const iddiv = document.createElement('div');
  iddiv.setAttribute('class', '');
  iddiv.style.padding = '15px';
  //iddiv.innerHTML = `<div class='ps__-list'><div>`;
  //insertafter.appendChild(iddiv);
  //insertafter.insertAdjacentElement('afterend', iddiv);
  insertafter.appendChild(iddiv);

  const v = document.querySelector('.anisc-detail > .block > a');
  if (v) {
    const url = v.href;
    const selector = 'span.item-head';
    parseHTMLAndQuerySelector(url, selector, "Premiered:")
      .then(element => {
        if (element) {
          //alert(element.textContent);
          let acname = document.querySelector('.anisc-detail > .film-name > a').textContent;
          let name = lengthCheckandTrim(acname, 32);
          let season = element.textContent;
          let seasonArr = season.split(' ');
          let seasonname = seasonArr[0].toUpperCase();
          let seasonyear = parseInt(seasonArr[1]);
          //alert(name+', '+seasonname+', '+seasonyear);
          fetchidbyseason(name, seasonname, seasonyear)
            .then(data => {
              let AL_id = data.data.Page.media[0].id;
              let MAL_id = data.data.Page.media[0].idMal;
              //alert(id);
              iddiv.innerHTML = `<div class='ps__-list'><div class='item'><a href='https://anilist.co/anime/${AL_id}' target='_blank' class='btn'>AniList</a></div><div class='item'><a href='https://myanimelist.net/anime/${MAL_id}' target='_blank' class='btn'>MAL</a></div></div>`;
            })
            .catch(error => {
              //console.error("Error:", error);
              //alert(error);
              hianimedateattempt();
            });

        } else {
          //console.log("No elements found or failed to fetch HTML");
        }
      })
      .catch(error => {
        //console.error("Error:", error);
        //alert(error);
      });

    function hianimedateattempt() {
      parseHTMLAndQuerySelector(url, selector, "Aired:")
        .then(element => {
          if (element) {
            let acname = document.querySelector('.anisc-detail > .film-name > a').textContent;
            let name = lengthCheckandTrim(acname, 32);
            let date = getdate(element);
            //alert(date);
            fetchidbydate(name, date)
              .then(data => {
                let id = data.data.Page.media[0].id;
                //alert(id);
                iddiv.innerHTML = `<div class='ps__-list'><div class='item'><a href='https://anilist.co/anime/${AL_id}' target='_blank' class='btn'>Anilist</a></div><div class='item'><a href='https://myanimelist.net/anime/${MAL_id}' target='_blank' class='btn'>MAL</a></div></div>`;
              })
              .catch(error => {
                console.error("Error:", error);
                //alert(error);
                iddiv.innerHTML = `<div class='tick'><div class='tick-item'><span style='width:13px;margin-right:2px;'>${asvg.replace('fill=\'#ffffff\'', 'fill=\'#111111\'')}</span><a style='color:#111111' href='https://anilist.co/search/anime?${getQueryString(name)}' target='_blank'>SEARCH</a></div><div>`;

              });
          }
        })
        .catch(error => {
          //alert(error);
        });
    }
  }
}