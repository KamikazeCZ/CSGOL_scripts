// ==UserScript==
// @name        CSGOLounge item names
// @namespace   kamikazecz@gmail.com
// @description Script showing item names on the CSGOLounge website, under each item's image
// @include     http://csgolounge.com/*
// @include     http://www.csgolounge.com/*
// @version     1.1
// @grant       GM_xmlhttpRequest
// @downloadURL https://raw.githubusercontent.com/KamikazeCZ/CSGOL_scripts/master/CSGOL_script.user.js
// @updateURL https://raw.githubusercontent.com/KamikazeCZ/CSGOL_scripts/master/CSGOL_script.user.js
// ==/UserScript==

// Lukas Hellebrandt <kamikazecz@gmail.com>
// Not really tested or developed, it just works for me

// Display items names

var items = document.querySelectorAll('.item');

for(var i = 0; i < items.length; ++i){
  var item = items[i];
  var nameMatch = /.*?\| (.*) \(.*/.exec(item.querySelector('.name b').innerHTML);
  var name = nameMatch ? nameMatch[1] : '';

  var div_visibleName = document.createElement('div');
  div_visibleName.style.color='black';
  div_visibleName.style.fontSize='0.75em';
  div_visibleName.innerHTML = name;
  item.appendChild(div_visibleName);

  var div_price = document.createElement('div');
  div_price.style.color='green';
  div_price.style.fontSize='0.75em';
  div_price.innerHTML = "...";
  div_price.className += " price";
  item.querySelector(".name").appendChild(div_price);
}


// Show item price on hover

document.addEventListener("mouseover",displayPrice);

function displayPrice(event){
  if(hasClass(event.target,"item")){
    getItemPrice(event.target);
  }
  if(hasClass(event.target.parentNode,"item")){
    getItemPrice(event.target.parentNode);
  }
}

function getItemPrice(item){
  var name = item.querySelector(".name b").innerHTML;
  if(["Any Offers", "Dota items", "TF2 Items", "Real Money"].indexOf(name)>=0){
    item.querySelector(".price").innerHTML = "";
  }else{
    GM_xmlhttpRequest({
      method: "GET",
      url: encodeURI("http://steamcommunity.com/market/search?q="+name),
      onload: function(response){
          var responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
          var price = responseXML.querySelector(".market_table_value span").innerHTML;
          item.querySelector(".price").innerHTML = price;
        }
    });
  }
}

function hasClass(e,c){
    return e&&(e instanceof HTMLElement)&&!!((' '+e.className+' ').indexOf(' '+c+' ')+1);
}



