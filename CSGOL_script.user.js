// ==UserScript==
// @name        CSGOLounge item details
// @namespace   kamikazecz@gmail.com
// @description Script showing item names on the CSGOLounge website, under each item's image
// @include     http://csgolounge.com/*
// @include     http://www.csgolounge.com/*
// @version     1.2
// @grant       GM_xmlhttpRequest
// @downloadURL https://raw.githubusercontent.com/KamikazeCZ/CSGOL_scripts/master/CSGOL_script.user.js
// @updateURL https://raw.githubusercontent.com/KamikazeCZ/CSGOL_scripts/master/CSGOL_script.user.js
// ==/UserScript==

// Lukas Hellebrandt <kamikazecz@gmail.com>
// Not really tested or developed, it just works for me

// Display items names

loggedIn = true;

loginOnSteamWarning();

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
    if(loggedIn){
      getItemPrice(event.target);
    }else{
      getItemPriceFallback(event.target);
    }
  }
  if(hasClass(event.target.parentNode,"item")){
    if(loggedIn){
      getItemPrice(event.target.parentNode);
    }else{
      getItemPriceFallback(event.target.parentNode);
    }
  }
}

function getItemPrice(item){
  var name = item.querySelector(".name b").innerHTML;
  if(["Any Offers", "Dota items", "TF2 Items", "Real Money" , "Knife", "Any Key"].indexOf(name)>=0){
    item.querySelector(".price").innerHTML = "";
  }else{
    GM_xmlhttpRequest({
      method: "GET",
      url: encodeURI("http://steamcommunity.com/market/listings/730/"+name),
      onload: function(response){
          var responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
          var priceElement = responseXML.querySelector(".market_listing_price_with_fee");
          if(priceElement == null){ // the item is a commodity or something changed on Steam side
            eval(responseXML.querySelectorAll("script")[19].innerHTML); // 19th <script> tag
            var scriptWithIdLines = responseXML.querySelectorAll("script")[20].innerHTML.split(/\r?\n/); // 20th <script> tag
            var re_getItemId = /\s+ItemActivityTicker\.Start\(\s*(\d+)\s*\);/;
            var itemId = String(scriptWithIdLines[scriptWithIdLines.length-3]).match(re_getItemId)[1]; // the line before the last line
            console.log(itemId);
            if(typeof g_strCountryCode == 'undefined' || typeof g_strLanguage == 'undefined' || typeof g_rgWalletInfo == 'undefined'){
              // this shouldn't happen; if it did, something on Steam side related to commodity type items has probably changed
              getItemPriceFallback(item);
            }else{
              GM_xmlhttpRequest({ // we need to make another request because the current commodity price table on Steam is also loaded with ajax
                method: "GET",
                url: encodeURI("http://steamcommunity.com/market/itemordershistogram?country="+g_strCountryCode+"&language="+
                  g_strLanguage+"&currency="+ (g_rgWalletInfo['wallet_currency']!=0 ? g_rgWalletInfo['wallet_currency'] : "1") +"&item_nameid="+itemId),
                onload: function(response){
                    var responseJSON = JSON.parse(response.responseText);
                    var re_getPrice = /\d+ sell orders at ([^s]+) or lower/;
                    var price = String(responseJSON.sell_order_graph[0][2]).match(re_getPrice)[1];
                    item.querySelector(".price").innerHTML = price;
                  }
              });
            }
          }else{ // the item is a regular item
            var price = priceElement.innerHTML;
            item.querySelector(".price").innerHTML = price;
          }
        }
    });
  }
}

function getItemPriceFallback(item){
  var name = item.querySelector(".name b").innerHTML;
  if(["Any Offers", "Dota items", "TF2 Items", "Real Money" , "Knife", "Any Key"].indexOf(name)>=0){
    item.querySelector(".price").innerHTML = "";
  }else{
    GM_xmlhttpRequest({
      method: "GET",
      url: encodeURI("http://steamcommunity.com/market/search?q=\""+name+"\""),
      onload: function(response){
          var responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
          var priceElements = responseXML.querySelectorAll(".market_table_value span");
          var priceElement = priceElements[0];
          var price = priceElement.innerHTML;
          item.querySelector(".price").innerHTML = price;
          if(priceElements.length > 2){ // just one element found - 2 is for item price and quantity
            item.querySelector(".price").style.color = 'red';
            item.querySelector(".price").innerHTML += " - Search returned more than 1 item! Check the price manually, first item\'s price shown.";
          }
          if(priceElements.length < 2){ // this shouldn't happen; if it did, something on Steam side related to search funciton has probably changed
            item.querySelector(".price").innerHTML = "Error; price not found.";
          }
        }
    });
  }
}

function hasClass(e,c){
    return e&&(e instanceof HTMLElement)&&!!((' '+e.className+' ').indexOf(' '+c+' ')+1);
}

function loginOnSteamWarning(){
  GM_xmlhttpRequest({
    method: "GET",
    url: encodeURI("http://steamcommunity.com"),
    onload: function(response){
        var responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
        if(responseXML.querySelector("#global_action_menu > a.global_action_link") !== null){
          loggedIn = false;

          var div_warning = document.createElement('div');
          div_warning.style.color='red';
          div_warning.innerHTML = "<strong>WARNING:</strong> CSGOLounge_item_details plugin will not work reliably until you log in to <strong>Steam</strong>";
          var mainWindow = document.querySelector("section");
          mainWindow.insertBefore(div_warning,mainWindow.firstChild);
        }
      }
  });
}
