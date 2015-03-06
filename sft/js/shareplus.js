//SHAREPLUS

/* global SPlus */
/* eslint dot-notation: 0 */

/* Declare a package for the functions to avoid putting them in global scope */
var StandbyManager = {};

//Helper to show the cancel response message
StandbyManager.showErrorResponse = function showErrorResponse(errorResponse) { 
  SPlus.Utility.showMessage('Error: List.getItems', errorResponse['error#displayValue']); 
};

  //Helper to show the cancel response message
StandbyManager.showCancelResponse = function showCancelResponse(cancelResponse) { 
  SPlus.Utility.showMessage('Cancel: SPlus.List.getItems', cancelResponse); 
};

//Helper to create the links
StandbyManager.createListLinks = function createListLinks(listId, items, max) {
  var itemsList = document.getElementById(listId);
  itemsList.innerHTML = '';
  var itemNum = items.length;
  if (max && max<itemNum) {
    itemNum = max;
  }
  for(var i = 0; i < itemNum; i++) {
    var item = items[i];
    var d = new Date(item['ows_Modified']);
    var modifiedDate = d.toDateString();
    var displayName = item['ows_Editor'].substring(item['ows_Editor'].indexOf(";") + 2);
    var lastName = displayName.substring(0, displayName.indexOf(","));
    var firstName = displayName.substring(displayName.indexOf(",")+1, displayName.indexOf("#")-1 );
    var updatedList = document.createElement('li');
    updatedList.innerHTML = 
      "<a href='splus://hydroshare"+item['ows_ServerUrl']+"?action=viewdocument' class='file-link'>"
      + item['ows_LinkFilename'] + "</a>" 
      + "<div class='modified'>Modified: " + modifiedDate +"</div>"
      + "<div class='modified'>Modified By: " + lastName + firstName + "</div>";
    itemsList.appendChild(updatedList);
  }
};

//COMMON Function to get items from SPlus
StandbyManager.getItems = function getResultItems(viewName, listId, maxItems) {
  //var LISTURL ="http://hydroshare/KnowledgeCentres/WorkMethodsWikis/Safety Portal/Contacts"
  
  var LISTURL = 'http://hydroshare/sites/vi_gen/Working%20Documents';
  var FIELDS = ['ows_LinkFilename', 'ows_Modified', 'ows_ServerUrl', 'ows_Editor'];

  //Invoke the API method, loop through the items retrieved and get the contacts
  SPlus.List.getItems(LISTURL, viewName, FIELDS, function (items) {
    StandbyManager.createListLinks(listId, items, maxItems);
  },
  StandbyManager.showErrorResponse,
  StandbyManager.showCancelResponse
  );
};

//GETTING THE RECENT ITEMS FROM THE RECENT VIEW -http://hydroshare/sites/vi_gen/Working%20Documents
StandbyManager.getListItems = function getListItems() {
  var MAX_ITEMS = 10;
  StandbyManager.getItems('SP001-Recent', 'updatedlist', MAX_ITEMS);
};

//GETTING THE VIEWS ACCORDING TO THE VIEWNAME THE USER SELECTS IN THE DROPDOWN
StandbyManager.getResultItems = function getResultItems(viewName, listId) {
  StandbyManager.getItems(viewName, 'resultlist');
};

/*
ENABLE THE BRIDGE (SharePlusBridge.js) IN THE CONFIG FILE TO ALLOW COMMUNICATION BETWEEN SHAREPLUS AND LAUNCHPAD
SharePlusOnLoad IS CALLED WHEN LAUNCHPAD HAS FINISHED LOADING
*/
function SharePlusOnLoad() {
  //GETTING RECENT UPDATES FROM THE RECENT VIEW
  StandbyManager.getListItems();
}
StandbyManager.SharePlusOnLoad = SharePlusOnLoad; //alias to avoid unused-var errors

//CREATING DROPDOWN FROM A LIST
function DropDown(el) {
  // handle cases where "new" keyword wasn't used
  if (!(this instanceof DropDown)) {
    return new DropDown(el);
  }
  this.dd = el;
  this.placeholder = this.dd.children('span');
  this.opts = this.dd.find('ul.dropdown > li');
  this.val = '';
  this.index = -1;
  this.initEvents();
}

DropDown.prototype = {
  initEvents: function() {
    var obj = this;
    //toggling the view of the dropdown list
    obj.dd.on('click', function(event) {
      $(this).toggleClass('active');
      return false;
    });
    //adding the selcted value to the wrapper
    obj.opts.on('click', function() {
      var opt = $(this);
      obj.val = opt.text();
      obj.index = opt.index();
      obj.placeholder.text('Selected: ' + obj.val);
    });
  },
  getValue: function() {
    return this.val;
  },
  getIndex: function() {
    return this.index;
  }
};

//onload - DROPDOWN init
$(function() {
  DropDown( $('#dd') ); //convert the ul/li to a Dropdown

  $(document).click(function() {
    // remove the active class from all dropdown
    $('.wrapper-dropdown').removeClass('active');
  });

  $('.dropdown a').on('click', function(event) {
    var name = $(this).data('name');
    StandbyManager.getResultItems(name);
  });
});

//onload - COLLAPSIBLE BLOCKS - VIEWS AND RECENT UPDATES
$(function() { 
  $('.collapsible').on('click', function(event) {
    $(this).parent().toggleClass('active');
    return false;
  });
});
