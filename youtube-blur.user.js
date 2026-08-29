// ==UserScript==
// @name        YT BG Blur
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.3
// @author      irasnalida
// @description Youtube theme for blur effect like windows 11
// ==/UserScript==

window.onload = function () {
    const bgdivblur = document.createElement('div');
    bgdivblur.id = 'bgdivblur';
    document.body.insertBefore(bgdivblur, document.body.firstChild);
    const bgdiv = document.createElement('div');
    bgdiv.id = 'bgdiv';
    document.body.insertBefore(bgdiv, document.body.firstChild);
    //test sync for greasyfork
}
