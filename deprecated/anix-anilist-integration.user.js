// ==UserScript==
// @name        AniAnix
// @namespace   Violentmonkey Scripts
// @match       https://anix.to/anime/*
// @match       https://anixtv.to/anime/*
// @icon        https://www.google.com/s2/favicons?domain=anix.to&sz=128
// @grant       none
// @version     1.2
// @author      irasnalida
// @description Uses AniList API to show the ID and add a link to Anime's Anilist page on watch page.
// ==/UserScript==


/*Anilist SVG*/
const anilistavg = '<svg fill="#cecece" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6.361 2.943 0 21.056h4.942l1.077-3.133H11.4l1.052 3.133H22.9c.71 0 1.1-.392 1.1-1.101V17.53c0-.71-.39-1.101-1.1-1.101h-6.483V4.045c0-.71-.392-1.102-1.101-1.102h-2.422c-.71 0-1.101.392-1.101 1.102v1.064l-.758-2.166zm2.324 5.948 1.688 5.018H7.144z"></path></g></svg>';

function fetchidbyseason(name, seasonname, seasonyear) {
  let querySeason = `
  query ($id: Int, $page: Int, $perPage: Int, $search: String, $season:MediaSeason, $seasonYear:Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media (id: $id, search: $search, season: $season, seasonYear: $seasonYear) {
      id
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


function fetchidbydate() {
  const dateEl = document.querySelector('span[itemprop="dateCreated"]');
  let dateString = dateEl.innerHTML;
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  let dateArr = dateString.split(',');
  let month = months[dateArr[0].split(' ')[0]];
  let day = dateArr[0].split(' ')[1];
  let year = dateArr[1].trim();
  let date = parseInt(`${year}${month}${day}`);

  var queryDate = `
  query ($id: Int, $page: Int, $perPage: Int, $search: String, $startDate: FuzzyDateInt) {
    Page (page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media (id: $id, search: $search, startDate: $startDate) {
        id
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


if (/anix\.to/.test(location.hostname)) {
  //alert('anix');
  const statusel = document.querySelector('.maindata > .sub-info > .sub-dub-total');
  const idspan = document.createElement('span');
  idspan.setAttribute('class', 'dub');
  //idspan.style.backgroundColor = 'rgb(149, 182, 208)';
  idspan.innerHTML = `${anilistavg}NA`;
  statusel.appendChild(idspan);
  /*Get anime name*/
  const name = document.querySelector('.maindata > .ani-name').textContent.trim();
  /*GET SEASON*/
  const seasonel = document.querySelector('.metadata > .limiter > div:nth-child(3) > span > a');
  let season = seasonel.textContent;
  let seasonArr = season.split(' ');
  let seasonname = seasonArr[0].toUpperCase();
  let seasonyear = parseInt(seasonArr[1]);
  fetchidbyseason(name, seasonname, seasonyear)
    .then(data => {
      let id = data.data.Page.media[0].id;
      idspan.innerHTML = `${anilistavg}<a href='https://anilist.co/anime/${id}'>${id}</a>`;
    })
    .catch(error => {
      console.error("Error:", error);
    });
}











