// ==UserScript==
// @name        CSGOLounge item names
// @namespace   kamikazecz@gmail.com
// @description Script showing item names on the CSGOLounge website, under each item's image
// @include     http://csgolounge.com/*
// @include     http://www.csgolounge.com/*
// @version     1
// @grant       none
// ==/UserScript==

// Lukas Hellebrandt <kamikazecz@gmail.com>
// Not really tested or developed, it just works for me

var items = document.querySelectorAll('.item');

for(var i in items){
  var item = items[i];
  var div_visibleName = document.createElement('div');
  var nameMatch = /.*?\| (.*) \(.*/.exec(item.querySelector('.name b').innerHTML);
  var name = nameMatch ? nameMatch[1] : '';
  div_visibleName.style.color='black';
  div_visibleName.innerHTML = name;
  item.appendChild(div_visibleName);
}

