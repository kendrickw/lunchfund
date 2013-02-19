// Global variables storing information collected from Google spreadsheet
// These values are cached in local storage, so they don't need to be
// retrieved from Google Spreadsheet all the time.
var namelist       = null;   // List of shareholder names
var share          = null;   // share information (key: shareholder name)
var fund_bookvalue = 0;
var total_shares   = 0;

// Global variables for storing information obtained from app
// These values are also cached in local storage.
var attendee       = null;
var submitter;
var showSubmitter;

// Global variables for keeping track of various cash amounts
var tipPercent = 10;
var billAmount = 0;
var amountToTip = 0;
var amountToPay = 0;
var eachPays = 0;
var lunchFundAmount = 0;

//*******************************************************************
// MAINPAGE event handler
//*******************************************************************

$(document).on('pageinit', '#homePage', function() {

  // For iOS, switch to 'text' input, for enhanced Bill Amount entering experience

  if (navigator.userAgent.match(/(iPod|iPhone|iPad)/i)){
    var numInput = document.getElementById('billamountinput');
    numInput.setAttribute('type','text');
  }

  $('#billamountinput').keyup(function () {
    if ($(this).attr('type') == 'text') {
      var val = $(this).val().toString();
      $(this).val(formatMoney(val));
    }
  });

  $('#billamountinput').blur(function() {
    billAmount = $(this).val();
    calculate_using_billAmount(billAmount, attendee.length);
    drawAllAmountsText();
  });

  $('#billamountinput').focus(function() {
    // Wipe out previous value, so user don't need to backspace
    $(this).val('');
  });

  $('#lunchfundminus').click(function() {
    if (lunchFundAmount >= 0.25) {
      amountToTip += 0.25;
      amountToPay += 0.25;
      lunchFundAmount -= 0.25;
      drawAllAmountsText();
    }
  });

  $('#lunchfundplus').click(function() {
    if (amountToTip >= 0.25) {
      amountToTip -= 0.25;
      amountToPay -= 0.25;
      lunchFundAmount += 0.25;
      drawAllAmountsText();
    }
  });

  $('#submitterselect').change(function() {
    if ($(this).val() != '') {
      submitter = $(this).val();
      localStorageSetItem('submitter', submitter);
    }
  });

  // Initialize global variables from local storage
  submitter = localStorageGetItem('submitter');
  showSubmitter = localStorageGetItem('showSubmitter');
  if (showSubmitter === null) {
    showSubmitter = 1;
  }
  share = JSON.parse(localStorageGetItem('share'));
  fund_bookvalue = localStorageGetItem('fund_bookvalue');
  total_shares = localStorageGetItem('total_shares');
});

$(document).on('pagecreate', '#homePage', function() {

});

// Initialize attendee list
// If local storage exists, use it.  Otherwise
// get the information from the top 5 shareholders
function initAttendeeList () {
  if (attendee === null) {
    attendee = JSON.parse(localStorageGetItem('attendee'));
  }

  if (attendee === null) {
    attendee = [];
    // Mark top 5 shareholders as default attendee
    $.each(namelist, function (i, name) {
      if (i<5) {
        attendee.push(name);
      }
    });

    // Cache the attendee list
    localStorageSetItem('attendee', JSON.stringify(attendee));
  }
}

$(document).on('pageshow', '#homePage', function() {
  if (showSubmitter == 0) {
    $('#submitterfield').hide();
  } else {
    $('#submitterfield').show();
  }

  if (namelist === null) {
    namelist = JSON.parse(localStorageGetItem('namelist'));
  }

  if (namelist === null) {
    // Show initial text in the luncher selection box
    $("#participantcounttext").text(0);
    $("#participantlisttext").text(".. Refreshing List ..");

    jsonReadGoogleSpreadsheet(function() {
      initAttendeeList();
      drawAppFormChkBox ($("#peoplelistcheckboxes"));

      drawParticipantText();
      calculate_using_billAmount(billAmount, attendee.length);
      drawAllAmountsText ();

      drawSelectMenu ($('#fundholderselect'), attendee, getLunchFundHolder());
      drawSelectMenu ($('#submitterselect'), attendee, submitter);
      drawGoogleFormChkBox ($("#googleforminput"));
    });
  } else {
    initAttendeeList();

    drawAppFormChkBox ($("#peoplelistcheckboxes"));

    drawParticipantText();
    calculate_using_billAmount(billAmount, attendee.length);
    drawAllAmountsText ();

    drawSelectMenu ($('#fundholderselect'), attendee, getLunchFundHolder());
    drawSelectMenu ($('#submitterselect'), attendee, submitter);
    drawGoogleFormChkBox ($("#googleforminput"));
  }
});

//*******************************************************************
// PEOPLE PAGE event handler
//*******************************************************************

$(document).on('pageinit', '#peoplePage', function() {
  // Register checkbox selection result
  $('#peopletomainbutton').click (function () {
    if (attendee.length !== 0) {
      attendee.splice(0);
    }

    $('#peoplelistcheckboxes input:checked').each(function() {
      attendee.push($(this).attr('name'));
    });

    localStorageSetItem('attendee', JSON.stringify(attendee));
  });
});

$(document).on('pagecreate', '#peoplePage', function() {

});

//*******************************************************************
// SETTING PAGE event handler
//*******************************************************************

$(document).on('pageinit', '#settingsPage', function() {
  $('#clearlocalstoragebutton').click(function() {
    localStorage.removeItem('submitter');
    localStorage.removeItem('showSubmitter');
    localStorage.removeItem('attendee');

    localStorage.removeItem('namelist');
    localStorage.removeItem('share');
    localStorage.removeItem('fund_bookvalue');
    localStorage.removeItem('total_shares');
    localStorage.removeItem('timeofstat');

    alert ('Local Storage Removed');
  });

  $('#refreshdatabutton').click(function() {
    jsonReadGoogleSpreadsheet(function() {
      // Update the text field on date of statistic
      alert ('Google data refreshed on ' + localStorageGetItem('timeofstat'));
    });
  });

  $('#showsubmitterchkbox').change(function() {
    if ($(this).is(':checked')) {
      showSubmitter = 1;
    } else {
      showSubmitter = 0;
    }
    localStorageSetItem('showSubmitter', showSubmitter);
  });

  // Disable certain settings control, if local storage is not supported
  if (!Modernizr.localstorage) {
    $('#clearlocalstoragebutton').addClass('ui-disabled');
    $('#showsubmitterchkbox').checkboxradio('disable');
  }

  // Reflect 'showSubmitter' checkbox status
  $('#showsubmitterchkbox').attr("checked",showSubmitter == 1 ? true: false).checkboxradio("refresh");
});

$(document).on('pagecreate', '#settingsPage', function() {
  // Default date in 'lunch date' field
  $("#eventdate").attr('value', getDate());

});

$(document).on('pageshow', '#settingsPage', function() {
  if (Modernizr.localstorage) {
    if (submitter === null) {
      $('#showsubmitterchkbox').checkboxradio('disable');
    } else {
      $('#showsubmitterchkbox').checkboxradio('enable');
    }
  }
});

//*******************************************************************
// SUMMARY PAGE event handler
//*******************************************************************

$(document).on('pagecreate', '#summaryPage', function() {
  $("#fundvaluetext").text(" .. refreshing .. ");
});

$(document).on('pageshow', '#summaryPage', function() {
  $('#timeofstat').text(localStorageGetItem('timeofstat'));
  $("#fundvaluetext").text(fund_bookvalue);
  if (submitter === null) {
    $('#submittersharetext').text('Specify Submitter');
    $('#submittersharevaluetext').text('N/A');
  } else {
    var submitter_share = parseFloat(share[submitter]);
    var submitter_shareratio = submitter_share / total_shares;
    var fundvalue = parseFloat(fund_bookvalue.substr(1));
    var submitter_sharevalue = fundvalue * submitter_shareratio;
    $('#submittersharetext').text(submitter_share.toFixed(2));
    $('#submittersharevaluetext').text('$'+submitter_sharevalue.toFixed(2));
  }

  drawPieChart(attendee);
});

// Get current date (YYYY-MM-DD)
function getDate() {
   now = new Date();
   return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
}

//*******************************************************************
// Create the google form <input> html array base on shareholders list
// <input type="checkbox" style="display:none;" name="entry.0.group" value="Ka" id="Gform_#">
// This only needs to be performed once
//*******************************************************************
var google_form_input_name       = "entry.0.group";
var google_form_input_id_pfx     = "gform_";
var google_form_lunchfund_id     = "entry_1";
var google_form_whoholdsmoney_id = "entry_2";
var google_form_submittername_id = "entry_3";
var google_form_eventdate_id     = "entry_4";

function drawGoogleFormChkBox(element) {
    var chkboxlist = "";

    $.each (namelist, function (i, name) {
      chkboxlist +=
        '<input type="checkbox" style="display:none;"' +
        ' name="' + google_form_input_name + '"' +
        ' value="' + name + '"' +
        ' id="' + google_form_input_id_pfx + i + '"/>\n';
    });

    element.empty();
    element.append(chkboxlist);
    // No need to trigger create, since this is not rendered on screen anyways
}

//*******************************************************************
// Create the app checkbox <input> html array base on shareholders list
// This only needs to be done once at the beginning
// <input type="checkbox" id="chkbox_#" name="Ka" checked="checked">
// <label for="chkbox_Ka">
//   Ka
// </label>
//*******************************************************************
function drawAppFormChkBox (element) {
    var chkboxlist = "";

    $.each (namelist, function (i, name) {
      chkboxlist +=
        '<input type="checkbox"' +
        ' id="chkbox_' + i + '"' +
        ' name="' + name + '"';
      if ($.inArray(name, attendee) != -1) {
        chkboxlist += ' checked="checked"';
      }
      chkboxlist += '/>\n' +
        '<label for="chkbox_' + i + '">' +
        name +
        '</label>\n';
    });

    element.empty();
    element.append(chkboxlist);
    element.parent().trigger('create');
}

//*******************************************************************
// Create the <option> html array base on selectlist
// The 'selected' input parameter will be selected by default
// <option value="Ka">
//    Ka
// </option>
//*******************************************************************
function drawSelectMenu (selectelement, selectlist, selected) {
  var optionlist = "<option value='' data-placeholder='true'>Choose one</option>\n";

  $.each (selectlist, function (i, name) {
    optionlist +=
      '<option value="' + name + '"';
    if (selected == name) {
      optionlist += ' selected="selected"';
    }
    optionlist +=
      '>' +
      name +
      '</option>\n';
  });

  selectelement.empty();
  selectelement.append(optionlist);
  selectelement.selectmenu('refresh');
}

//*******************************************************************
// Functions for syncing UI form to the google form
//*******************************************************************

// Populate Attendee list to Google Doc checkboxes
function syncGoogleCheckboxes () {
  $.each (namelist, function (i, name) {
    var input_idname = google_form_input_id_pfx + i;
    var input_elem = $("#"+input_idname);

    if ($.inArray(name, attendee) != -1) {
      input_elem.attr('checked','checked');
      // console.log (name + "(" + input_idname + ") checked");
    } else {
      input_elem.removeAttr('checked');
    }
  });
}

function syncGoogleLunchFundAmount () {
    var element = $("#"+google_form_lunchfund_id);

    element.attr('value', lunchFundAmount);
    //console.log ("LunchFund: " + lunchFundAmount);
}

function syncGoogleWhoHoldsMoney () {
    var element = $("#"+google_form_whoholdsmoney_id);

    element.attr('value', getLunchFundHolder());
    //console.log ("LunchFundHolder: " + getLunchFundHolder());
}

function syncGoogleSubmitterName () {
    var element = $("#"+google_form_submittername_id);

    element.attr('value', submitter);
    //console.log ("submitter: " + submitter);
}

function syncGoogleEventDate () {
    var element = $("#"+google_form_eventdate_id);

    element.attr('value', getEventDate());
    //console.log ("event Date: " + getEventDate());
}

// Sync all google form related fields
// This is the action that is perform when the google form is submitted
// Should do all error check here
// If error check fails, then return false
function syncGoogleForm() {
  if (attendee.length === 0) {
    alert ("You must select at least one luncher.");
    return false;
  }

  if (billAmount <= 0) {
    alert ("You must provide a non-zero bill amount.");
    return false;
  }

  if (getLunchFundHolder() === null) {
    alert ("You must select a lunch fund holder.");
    return false;
  }

  if (getSubmitter() === null) {
    alert ("You must select a submitter name.");
    return false;
  }

  // All is good, go ahead and fill in the google form
  syncGoogleCheckboxes();
  syncGoogleLunchFundAmount();
  syncGoogleWhoHoldsMoney();
  syncGoogleSubmitterName();
  syncGoogleEventDate();

  // Show busy indicator
  $.mobile.loading('show');
  return true;
}

// Perform these actions when google form is successfully submitted
function submittedGoogleForm() {
  // Hide busy indicator
  $.mobile.loading('hide');

  alert ("Submitted to Google Doc successfully.");

  //Re-direct back to main page
  //$.mobile.changePage( "#homePage", { transition: "none"} );
}

//*******************************************************************
// Functions for retrieving information from user input
//*******************************************************************

// Return name of the person who holds lunch fund
// null if nothing selected.
function getLunchFundHolder () {
  var fundholder = $('#fundholderselect').val();

  if (fundholder != "") {
    return fundholder;
  } else {
    return null;
  }
}

// Return name of the person who is submitting the form
// null if nothing selected.
function getSubmitter () {
  var submittername = $('#submitterselect').val();

  if (submittername != "") {
    return submittername;
  } else {
    return null;
  }
}

// Return Event date
function getEventDate() {
  var date = $('#eventdate').val();
  if (date === '') {
    return getDate();
  } else {
    return date;
  }
}

// Fill in the text for Participant List button
function drawParticipantText() {
    var selected = attendee.slice();  // clone array
    var num      = selected.length;
    var listverbosetext;   // i.e. No Luncher; Mike,Phil

    // Form the "n Participant(s)" text
    if (num === 0) {
        listverbosetext  = "No Luncher";
    } else {
        listverbosetext  = selected.join(", ");
    }

    $("#participantcounttext").text(num);
    $("#participantlisttext").text(listverbosetext);
}

//**************************************
// Core logic for calculating the bill
//**************************************
function calculate_using_billAmount(billamount,numPerson)
{
  var totalCollected;

  amountToPay = Math.ceil(billAmount * (1 + tipPercent/100));
  amountToTip = amountToPay - billAmount;
  if (numPerson > 0) {
    eachPays = Math.ceil(amountToPay / numPerson);
  } else {
    eachPays = 0;
  }
  totalCollected = eachPays * numPerson;
  lunchFundAmount = totalCollected - amountToPay;
}

function calculate_actual_tip_percentage (billamount, tipsamount)
{
  if (billamount == 0) {
    return 0;
  } else {
    return (tipsamount / billamount * 100).toFixed(2);
  }
}

//*******************************************************************
// Updating text fields related to calculation results
//*******************************************************************

// Fill in the text fields for all calculations
function drawAllAmountsText ()
{
  $("#tipspercenttext").text(calculate_actual_tip_percentage(billAmount, amountToTip));
  $("#tipstext1").text(amountToTip).formatCurrency();
  $("#mealtotaltext").text(amountToPay).formatCurrency();
  $("#eachpaystext").text(eachPays).formatCurrency();
  $("#lunchfundtext1").text(lunchFundAmount).formatCurrency();
  $("#lunchfundtext2").text(lunchFundAmount).formatCurrency();
}

// Given a string input of form "1234.55x",
// It discard trailing non-numeric characters, remove decimal point
// and then reformat the numeric characters into currency format
//  i.e. 1 would turn into 0.01
//  i.e. 12 would turn into 0.12
//  i.e. 1.456 would turn into 14.56
function formatMoney (val)
{
  // Verify last character entered is /[0-9]/
  var regex = /[0-9]/;
  if (!regex.test(val[val.length-1])) {
    val = val.slice(0,-1);
  }

  // Strip x.yy to xyy
  val = val.replace(".", "");

  // Remove leading zeros
  while (val.length > 1) {
    if (val[0] == '0') {
      val = val.substr(1);
    } else {
      break;
    }
  }

  if (val.length == 0) {
    val = "0.00";
  } else if (val.length == 1) {
    val = "0.0" + val;
  } else if (val.length == 2) {
    val = "0." + val;
  } else {
    var len = val.length;
    val = val.substr(0,len-2) + "." + val.substr(len-2);
  }

  return val;
}

// Create piechart base on input name list
function drawPieChart (inputnamelist) {
  $(function () {
    var piechart_data = [];
    var count = inputnamelist.length;
    var j = 0;

    // Show only the lunch attendees
    piechart_data[count] = { label: "Others", data: 0 };
    $.each(namelist, function (i, name) {
      if ($.inArray(name, inputnamelist) != -1) {
        piechart_data[j] = { label: name, data: parseInt(share[name], 10) };
        j++;
      } else {
        piechart_data[count].data += parseInt(share[name], 10);
      }
    });

    var plot = $.plot($("#piechart1"), piechart_data,
    {
      series: {
        pie: {
          show: true,
          radius: 1,
          label: {
            show: true,
            radius: 3/4,
            formatter: function(label, series){
              return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">'+
                label+
                '<br/>'+
                Math.round(series.percent)+
                '%</div>';
            }
          }
        }
      },
      legend: {
        show: false
      }
    });
  });
}

//*******************************************************************
// JSON related function for doing work that rely on information in
// Google Doc
// These function will return early while JSON does its thing
// asynchronizely
// These function will return the XHR object so you can add more
// functionalities when the JSON operation completes.
//*******************************************************************

// Get all useful information from google spreadsheet
// Including: (the global variables are only updated if LocalStorage cache is null)
//  - participants list
//  - attendee list
//  - shares per participant
//  - total book value
//  - total shares
// And optionally invoke a callback function after refresh completes.
function jsonReadGoogleSpreadsheet (callbackfunc)
{
  // Enable busy indicator
  $.mobile.loading('show');

  $.getJSON("https://spreadsheets.google.com/feeds/cells/0Ar6mVNHXXbF3dHV4QmMtdmpUbWcxOHJpZFhwSGxUbWc/od7/public/basic?alt=json-in-script&callback=?",
    function(data) {
    var owner_row = 0;   // spreadsheet row containing owner name
    var shares_row = 0;  // spreadsheet row containing # of shares
    var bookvalue_row = 0;  // spreadsheet row containing 'Current Fund Book Value'
    var totalshare_row = 0; // spreadsheet row containing 'Total outstanding shares'
    var name_idx;

    // Initialize the global variables
    namelist       = [];   // List of shareholder names
    share          = {};   // share information (key: shareholder name)
    fund_bookvalue = 0;
    total_shares   = 0;

    //console.log(data);
    $.each(data.feed.entry, function (i, entry) {
        var cell  = entry.title.$t;
        var value = entry.content.$t;

        if (cell[0] == 'A') {
          if (bookvalue_row === 0 && value == 'Current Fund Book Value') {
            bookvalue_row = cell.substr(1);
          } else if (totalshare_row === 0 && value == 'Total outstanding shares') {
            totalshare_row = cell.substr(1);
          } else if (owner_row === 0 && value == 'Owner') {
            owner_row  = cell.substr(1);
          } else if (shares_row === 0 && value == 'Number of Shares') {
            shares_row = cell.substr(1);
            name_idx = 0;
          }
        } else {
          if (cell.substr(1) == bookvalue_row) {
            fund_bookvalue = value;
          } else if (cell.substr(1) == totalshare_row) {
            total_shares = value;
          } else if (cell.substr(1) == owner_row) {
            namelist.push(value);
          } else if (cell.substr(1) == shares_row) {
            share[namelist[name_idx]] = value;
            name_idx++;
          }
        }
    });

    // Record time when statistics are gathered
    localStorageSetItem('timeofstat', Date());

    // Sort the shareholder namelist by descending share #
    namelist.sort(function(a, b){
      var a1=parseFloat(share[a]), b1=parseFloat(share[b]);
      if(a1==b1) return 0;
      return a1<b1? 1: -1;
    });

    localStorageSetItem('namelist', JSON.stringify(namelist));
    localStorageSetItem('share', JSON.stringify(share));
    localStorageSetItem('fund_bookvalue', fund_bookvalue);
    localStorageSetItem('total_shares', total_shares);

   /*
    // Display the sorted information
    console.log ("Current Fund Book Value: " + fund_bookvalue);
    console.log ("Total outstanding shares: " + total_shares);
    $.each(namelist, function (i, name) {
      console.log (i + ": " + name + ", share:" + share[name]);
    });
   */

    // Disable busy indicator
    $.mobile.loading('hide');
    callbackfunc();
  });
}

function localStorageSetItem (name, value)
{
  if (Modernizr.localstorage) {
    localStorage.setItem(name, value);
  }
}

function localStorageGetItem (name)
{
  if (Modernizr.localstorage) {
    return localStorage.getItem(name);
  } else {
    return null;
  }
}

// For debugging of offline.appcache
/*
var cacheStatusValues = [];
cacheStatusValues[0] = 'uncached';
cacheStatusValues[1] = 'idle';
cacheStatusValues[2] = 'checking';
cacheStatusValues[3] = 'downloading';
cacheStatusValues[4] = 'updateready';
cacheStatusValues[5] = 'obsolete';

var cache = window.applicationCache;
cache.addEventListener('cached', logEvent, false);
cache.addEventListener('checking', logEvent, false);
cache.addEventListener('downloading', logEvent, false);
cache.addEventListener('error', logEvent, false);
cache.addEventListener('noupdate', logEvent, false);
cache.addEventListener('obsolete', logEvent, false);
cache.addEventListener('progress', logEvent, false);
cache.addEventListener('updateready', logEvent, false);

function logEvent(e) {
    var online, status, type, message;
    online = (navigator.onLine) ? 'yes' : 'no';
    status = cacheStatusValues[cache.status];
    type = e.type;
    message = 'online: ' + online;
    message+= ', event: ' + type;
    message+= ', status: ' + status;
    if (type == 'error' && navigator.onLine) {
        message+= ' (A syntax error in manifest?)';
    }
    console.log(message);
}

window.applicationCache.addEventListener(
    'updateready',
    function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    },
    false
);
*/