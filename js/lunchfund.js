/*jslint browser: true*/
/*jslint devel: true*/
/*global $, jQuery, Modernizr*/

// Google spreadsheet vital info
var googleFormGETURL = "https://spreadsheets.google.com/feeds/cells/0Av83aWCuOImRdDA5cFVBd2hlbnhvYnhkQmJMNUhHYXc/od7/public/basic?alt=json-in-script&callback=?";
var googleFormPOSTURL = "https://docs.google.com/forms/d/1hGfAw3GT5YbiTWlNqZhMBAsx2fJ6Jnt5mmhg_8VJLs0/formResponse";
var googleAttendee = "entry.598889479";
var googleLunchFund = "entry_1892695599";
var googleFundHolder = "entry.960282559";
var googleSubmitter = "entry_1745174688";
var googleEventDate = "entry_472715279";

// Global variables for storing information obtained from app
// These values are also cached in local storage.
var submitter;
var showSubmitter;

// Global variables for keeping track of various cash amounts
var tipPercent = 10;
var billAmount = 0;
var amountToTip = 0;
var amountToPay = 0;
var eachPays = 0;
var lunchFundAmount = 0;

// Other Global variables
var namelist        = [];   // List of all shareholder names
var attendee        = [];   // List of attendees
var attendeeChanged = false;

// Functions for manipulating with local storage
function localStorageSetItem(name, value) {
    "use strict";
    if (Modernizr.localstorage) {
        localStorage.setItem(name, value);
    }
}

function localStorageGetItem(name) {
    "use strict";
    if (Modernizr.localstorage) {
        return localStorage.getItem(name);
    } else {
        return null;
    }
}

// Get current date (YYYY-MM-DD)
function getDate() {
    "use strict";
    var now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
}

//*******************************************************************
// Create the submission form <input> html array base on shareholders list
// <input type="checkbox" style="display:none;" name="SF_Names[]" value="Ka" id="SF_Name#">
// This only needs to be performed once
//*******************************************************************
function drawSubmissionFormChkBox(element) {
    "use strict";
    var chkboxlist = "",
        i = 0,
        len = namelist.length;
    while (i < len) {
        chkboxlist +=
            '<input type="checkbox" style="display:none;"' +
            ' name="SF_Names[]"' +
            ' value="' + namelist[i] + '"' +
            ' id="SF_Name' + i + '"/>\n';
        i += 1;
    }

    element.empty();
    element.append(chkboxlist);
    // No need to trigger create, since this is not rendered on screen anyways
}

// NOT NEEDED BECAUSE OF MYSQL SUPPORT
//*******************************************************************
// Create the app checkbox <input> html array base on shareholders list
// This only needs to be done once at the beginning
// <input type="checkbox" id="chkbox_#" name="Ka" checked="checked">
// <label for="chkbox_#">
//   Ka
// </label>
//*******************************************************************
/*
function drawAppFormChkBox(element) {
    "use strict";
    var chkboxlist = "",
        i = 0,
        len = namelist.length,
        name = "";

    while (i < len) {
        name = namelist[i];
        chkboxlist +=
            '<input type="checkbox"' +
            ' id="chkbox_' + i + '"' +
            ' name="' + name + '"';
        if ($.inArray(name, attendee) !== -1) {
            chkboxlist += ' checked="checked"';
        }
        chkboxlist += '/>\n' +
            '<label for="chkbox_' + i + '">' +
            name +
            '</label>\n';
        i += 1;
    }

    element.controlgroup("container").append(chkboxlist);
    for (i = 0; i < len; i += 1) {
        $('#chkbox_' + i).checkboxradio();
    }
    element.controlgroup("refresh");
}
*/

//*******************************************************************
// Create the <option> html array base on selectlist
// The 'selected' input parameter will be selected by default
// <option value="Ka">
//    Ka
// </option>
//*******************************************************************
function drawSelectMenu(selectelement, selectlist, selected) {
    "use strict";
    var optionlist = "<option value='' data-placeholder='true'>Choose one</option>\n",
        i = 0,
        len = selectlist.length,
        name = "";
    while (i < len) {
        name = selectlist[i];
        optionlist +=
            '<option value="' + name + '"';
        if (selected === name) {
            optionlist += ' selected="selected"';
        }
        optionlist +=
            '>' +
            name +
            '</option>\n';
        i += 1;
    }

    selectelement.empty();
    selectelement.append(optionlist);
    selectelement.selectmenu('refresh');
}

// Fill in the text for Participant List button
function drawParticipantText() {
    "use strict";
    var selected = attendee.slice(),    // clone array
        num      = selected.length,
        listverbosetext;                // i.e. No Luncher; Mike,Phil

    // Form the "n Participant(s)" text
    if (num === 0) {
        listverbosetext  = "No Luncher";
    } else {
        listverbosetext  = selected.join(", ");
    }

    $("#participantcounttext").text(num);
    $("#participantlisttext").text(listverbosetext);
}

//*******************************************************************
// Functions for retrieving information from user input
//*******************************************************************

// Return name of the person who holds lunch fund
// null if nothing selected.
function getLunchFundHolder() {
    "use strict";
    var fundholder = $('#fundholderselect').val();

    if (fundholder !== "") {
        return fundholder;
    } else {
        return null;
    }
}

// Return name of the person who is submitting the form
// null if nothing selected.
function getSubmitter() {
    "use strict";
    var submittername = $('#submitterselect').val();

    if (submittername !== "") {
        return submittername;
    } else {
        return null;
    }
}

// Return Event date
function getEventDate() {
    "use strict";
    var date = $('#eventdate').val();
    if (date === '') {
        return getDate();
    } else {
        return date;
    }
}

// Return Event Location
function getEventLocation() {
    "use strict";
    return null;  // NOT IMPLEMENTED YET
}

//*******************************************************************
// Functions for syncing UI form to the google form
//*******************************************************************

// Populate Attendee list to Google Doc checkboxes
function syncSubFormCheckboxes() {
    "use strict";

    var i = 0,
        len = namelist.length,
        name = "",
        input_idname = "",
        input_elem;

    while (i < len) {
        name = namelist[i];
        input_idname = "SF_Name" + i;
        input_elem = $("#" + input_idname);

        if ($.inArray(name, attendee) !== -1) {
            input_elem.attr('checked', 'checked');
            // console.log(name + "(" + input_idname + ") checked");
        } else {
            input_elem.removeAttr('checked');
            // console.log(name + "(" + input_idname + ") unchecked");
        }
        i += 1;
    }
}

function syncSubFormBillAmount() {
    "use strict";
    $("#SF_BillAmount").attr('value', billAmount);
    //console.log ("BillAmount: " + billAmount);
}

function syncSubFormTotalPaid() {
    "use strict";
    $("#SF_TotalPaid").attr('value', amountToPay);
    //console.log ("TotalPaid: " + amountToPay);
}

function syncSubFormLunchFundAmount() {
    "use strict";
    $("#SF_LunchFund").attr('value', lunchFundAmount);
    //console.log ("LunchFund: " + lunchFundAmount);
}

function syncSubFormWhoHoldsMoney() {
    "use strict";
    $("#SF_FundHolder").attr('value', getLunchFundHolder());
    //console.log ("LunchFundHolder: " + getLunchFundHolder());
}

function syncSubFormSubmitterName() {
    "use strict";
    $("#SF_Submitter").attr('value', submitter);
    //console.log ("submitter: " + submitter);
}

function syncSubFormEventDate() {
    "use strict";
    $("#SF_EventDate").attr('value', getEventDate());
    //console.log ("event Date: " + getEventDate());
}

function syncSubFormEventLocation() {
    "use strict";
    $("#SF_EventLocation").attr('value', getEventLocation());
    //console.log ("event Date: " + getEventLocation());
}

// Sync all submission form related fields
// This is the form validation logic
// If error check fails, then return false
function syncSubmissionForm() {
    "use strict";
    if (attendee.length === 0) {
        alert("You must select at least one luncher.");
        return false;
    }

    if (billAmount <= 0) {
        alert("You must provide a non-zero bill amount.");
        return false;
    }

    if (getLunchFundHolder() === null) {
        alert("You must select a lunch fund holder.");
        return false;
    }

    if (getSubmitter() === null) {
        alert("You must select a submitter name.");
        return false;
    }

    // All is good, go ahead and fill in the submission form
    syncSubFormCheckboxes();
    syncSubFormBillAmount();
    syncSubFormTotalPaid();
    syncSubFormLunchFundAmount();
    syncSubFormWhoHoldsMoney();
    syncSubFormSubmitterName();
    syncSubFormEventDate();
    syncSubFormEventLocation();

    return true;
}

//**************************************
// Core logic for calculating the bill
//**************************************
function calculate_using_billAmount(billamount, numPerson) {
    "use strict";
    var totalCollected;

    amountToPay = Math.ceil(billAmount * (1 + tipPercent / 100));
    amountToTip = amountToPay - billAmount;
    if (numPerson > 0) {
        eachPays = Math.ceil(amountToPay / numPerson);
    } else {
        eachPays = 0;
    }
    totalCollected = eachPays * numPerson;
    lunchFundAmount = totalCollected - amountToPay;
}

function calculate_actual_tip_percentage(billamount, tipsamount) {
    "use strict";
    if (billamount === 0) {
        return 0;
    } else {
        return (tipsamount / billamount * 100).toFixed(2);
    }
}

//*******************************************************************
// Updating text fields related to calculation results
//*******************************************************************

// Fill in the text fields for all calculations
function drawAllAmountsText() {
    "use strict";
    $("#tipspercenttext").text(calculate_actual_tip_percentage(billAmount, amountToTip));
    $("#tipstext1").text(amountToTip).formatCurrency();
    $("#tipstext2").text(amountToTip).formatCurrency();
    $("#mealtotaltext").text(amountToPay).formatCurrency();
    $("#eachpaystext1").text(eachPays).formatCurrency();
    $("#eachpaystext2").text(eachPays).formatCurrency();
    $("#lunchfundtext").text(lunchFundAmount).formatCurrency();
}

// Given a string input of form "1234.55x",
// It discard trailing non-numeric characters, remove decimal point
// and then reformat the numeric characters into currency format
//  i.e. 1 would turn into 0.01
//  i.e. 12 would turn into 0.12
//  i.e. 1.456 would turn into 14.56
function formatMoney(val) {
    "use strict";
    // Verify last character entered is /[0-9]/
    var regex = /[0-9]/,
        len   = 0;
    if (!regex.test(val[val.length - 1])) {
        val = val.slice(0, -1);
    }

    // Strip x.yy to xyy
    val = val.replace(".", "");

    // Remove leading zeros
    while (val.length > 1) {
        if (val[0] === '0') {
            val = val.substr(1);
        } else {
            break;
        }
    }

    if (val.length === 0) {
        val = "0.00";
    } else if (val.length === 1) {
        val = "0.0" + val;
    } else if (val.length === 2) {
        val = "0." + val;
    } else {
        len = val.length;
        val = val.substr(0, len - 2) + "." + val.substr(len - 2);
    }

    return val;
}

// Create piechart base on input name list
function drawPieChart(inputnamelist, share) {
    "use strict";
    $(function () {
        var piechart_data = [],
            count = inputnamelist.length,
            j = 0,
            plot;

        // Show only the lunch attendees
        piechart_data[count] = { label: "Others", data: 0 };
        $.each(namelist, function (i, name) {
            if ($.inArray(name, inputnamelist) !== -1) {
                piechart_data[j] = { label: name, data: parseInt(share[name], 10) };
                j += 1;
            } else {
                piechart_data[count].data += parseInt(share[name], 10);
            }
        });

        plot = $.plot($("#piechart1"), piechart_data, {
            series: {
                pie: {
                    show: true,
                    radius: 1,
                    label: {
                        show: true,
                        radius: 3 / 4,
                        formatter: function (label, series) {
                            return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' +
                                label +
                                '<br/>' +
                                Math.round(series.percent) +
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
function jsonReadGoogleSpreadsheet(callbackfunc) {
    "use strict";
    // Enable busy indicator
    $.mobile.loading('show');

    $.getJSON(googleFormGETURL, function (data) {
        var owner_row = 0,        // spreadsheet row containing owner name
            shares_row = 0,       // spreadsheet row containing # of shares
            bookvalue_row = 0,    // spreadsheet row containing 'Current Fund Book Value'
            marketvalue_row = 0,  // spreadsheet row containing 'Current Fund Market Value'
            totalshare_row = 0,   // spreadsheet row containing 'Total outstanding shares'
            name_idx = 0,
            cell,
            value,
            gnamelist = [],     // List of shareholder names
            gshare = {},        // share information (key: shareholder name)
            gfund_bookvalue = 0,
            gfund_marketvalue = 0,
            gtotal_shares = 0;

        //console.log(data);
        $.each(data.feed.entry, function (i, entry) {
            cell  = entry.title.$t;
            value = entry.content.$t;

            //console.log(i + ': cell:' + cell + ', value:' + value);
            if (cell === 'B2') {
                // Fund Current Total Book Value
                gfund_bookvalue = value;
            } else if (cell === 'D2') {
                // Fund Current Total Market Value
                gfund_marketvalue = value;
            } else if (cell === 'B3') {
                // Total number of outstanding shares
                gtotal_shares = value;
            } else if (cell[0] === 'A') {
                if (owner_row === 0 && value === 'Owner') {
                    owner_row = cell.substr(1);
                } else if (shares_row === 0 && value === 'Number of Shares') {
                    shares_row = cell.substr(1);
                    name_idx = 0;
                }
            } else {
                if (cell.substr(1) === owner_row) {
                    gnamelist.push(value);
                } else if (cell.substr(1) === shares_row) {
                    gshare[gnamelist[name_idx]] = value;
                    name_idx += 1;
                }
            }
        });

        // Record time when statistics are gathered
        localStorageSetItem('timeofstat', Date());

        // Sort the shareholder namelist by descending share #
        gnamelist.sort(function (a, b) {
            var a1 = parseFloat(gshare[a]),
                b1 = parseFloat(gshare[b]);
            if (a1 === b1) {
                return 0;
            }
            return a1 < b1 ? 1 : -1;
        });

        localStorageSetItem('share', JSON.stringify(gshare));
        localStorageSetItem('fund_marketvalue', gfund_marketvalue);
        localStorageSetItem('fund_bookvalue', gfund_bookvalue);
        localStorageSetItem('total_shares', gtotal_shares);

        /*
        // Display the sorted information
        console.log("Current Fund Book Value: " + gfund_bookvalue);
        console.log("Current Fund Market Value: " + gfund_marketvalue);
        console.log("Total outstanding shares: " + gtotal_shares);
        $.each(namelist, function (i, name) {
            console.log(i + ": " + name + ", share:" + gshare[name]);
        });
        */

        // Disable busy indicator
        $.mobile.loading('hide');
        callbackfunc();
    });
}

// Submit FORM to google spread sheet
// element is the ID containing the FORM to be submitted
function postFormToGoogle() {
    "use strict";
    // Need to change the form data to satisfy what google expects
    var googleFormData = $('#submissionForm').serialize();
    googleFormData = googleFormData.replace(/SF_Names%5B%5D/g, googleAttendee);
    googleFormData = googleFormData.replace(/SF_LunchFund/,    googleLunchFund);
    googleFormData = googleFormData.replace(/SF_FundHolder/,   googleFundHolder);
    googleFormData = googleFormData.replace(/SF_Submitter/,    googleSubmitter);
    googleFormData = googleFormData.replace(/SF_EventDate/,    googleEventDate);
    // console.log(googleFormData);

    $.post(googleFormPOSTURL, googleFormData, function () {
        // sucesss
    }).fail(function (data) {
        // It always fails due to Access-Control-Allow-Origin restriction.
        // i.e. phil website -> docs.google.com is not allowed.
        // But the spreadsheet update seems to go through.
        // console.log(data);
    }).always(function () {
        // alert("Submitted to Google Doc successfully.");
    });
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

//*******************************************************************
// MAINPAGE event handler
//*******************************************************************

// Initialize attendee list
// base on the checked box in '#peoplelistcheckboxes'
function initAttendeeList() {
    "use strict";
    if (namelist.length !== 0) {
        attendee.splice(0);
    }
    if (attendee.length !== 0) {
        attendee.splice(0);
    }

    $('#peoplelistcheckboxes :checkbox').each(function () {
        namelist.push($(this).attr('name'));
        if ($(this).is(':checked')) {
            attendee.push($(this).attr('name'));
        }
    });
}

// Pre-DOM manipulation code. Fire once per application
// The following kind of items should go here:
//   - Variable initializations
//   - Event driven code
$(document).on('pagecreate', '#homePage', function () {
    "use strict";
    // Debug traces
    // console.log('homePage pagecreate');

    // Initialize global variables from local storage
    submitter = localStorageGetItem('submitter');
    showSubmitter = localStorageGetItem('showSubmitter');
    if (showSubmitter === null) {
        showSubmitter = 1;
    }

    // Event driven code
    $('#billamountinput').keyup(function () {
        if ($(this).attr('type') === 'text') {
            var val = $(this).val().toString();
            $(this).val(formatMoney(val));
        }
    });

    $('#billamountinput').blur(function () {
        billAmount = $(this).val();
        calculate_using_billAmount(billAmount, attendee.length);
        drawAllAmountsText();

        // Re-activate submit button if new bill amount is entered
        $('#submitButton').button('enable');
    });

    $('#billamountinput').focus(function () {
        // Wipe out previous value, so user don't need to backspace
        $(this).val('');
    });

    $('#tipsminus').click(function () {
        if (amountToTip >= 0.25) {
            amountToTip -= 0.25;
            amountToPay -= 0.25;
            lunchFundAmount += 0.25;
            drawAllAmountsText();
        }
    });

    $('#tipsplus').click(function () {
        if (lunchFundAmount >= 0.25) {
            amountToTip += 0.25;
            amountToPay += 0.25;
            lunchFundAmount -= 0.25;
            drawAllAmountsText();
        }
    });

    $('#eachpayminus').click(function () {
        if (lunchFundAmount > attendee.length) {
            eachPays -= 1.00;
            lunchFundAmount -= attendee.length;
            drawAllAmountsText();
        }
    });

    $('#eachpayplus').click(function () {
        eachPays += 1.00;
        lunchFundAmount += attendee.length;
        drawAllAmountsText();
    });

    $('#submitterselect').change(function () {
        if ($(this).val() !== '') {
            submitter = $(this).val();
            localStorageSetItem('submitter', submitter);
        }
    });

    // Form submission validation
    $('#submissionForm').submit(function (event) {
        // Sync/Validate submission form
        if (syncSubmissionForm()) {
            // Submit to MYSQL
            $.post('php/dbAddEvent.php', $(this).serialize(), function (data) {
                if (data.status === 'success') {
                    // "tada" sound on submit courtesy of filo
                    document.getElementById('tadaAudio').play();

                    // Post data to google spreadsheet
                    postFormToGoogle();

                    alert("Submitted Successfully");

                    // Prevent Double submission
                    $('#submitButton').button('disable');
                } else {
                    // Failed, error feedback
                    // console.log(data.status);
                    // console.log(data.message);

                    // uh oh sound would be nice here.
                    alert('ERROR: ' + data.message);
                }
            }, 'json');
        }

        // Stop form from submitting because we are POSTing manually.
        event.preventDefault();

        //Re-direct to other page?
        //$.mobile.changePage( "#homePage", { transition: "none"} );
    });
});

// Post-DOM manipulation code. Fire once per application
$(document).on('pageinit', '#homePage', function () {
    "use strict";

    // For iOS, switch to 'text' input, for enhanced Bill Amount entering experience
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/i)) {
        var numInput = document.getElementById('billamountinput');
        numInput.setAttribute('type', 'text');
    }

    initAttendeeList();

    drawParticipantText();
    drawAllAmountsText();

    drawSelectMenu($('#fundholderselect'), attendee, getLunchFundHolder());
    drawSelectMenu($('#submitterselect'), attendee, submitter);
    drawSubmissionFormChkBox($("#submissionforminput"));
});

// Every time the page is shown, this function will be triggered.
$(document).on('pageshow', '#homePage', function () {
    "use strict";
    if (showSubmitter === 0) {
        $('#submitterfield').hide();
    } else {
        $('#submitterfield').show();
    }

    if (attendeeChanged === true) {
        // Redraw all elements that may change due to attendee list changes
        drawParticipantText();
        calculate_using_billAmount(billAmount, attendee.length);
        drawAllAmountsText();

        drawSelectMenu($('#fundholderselect'), attendee, getLunchFundHolder());
        drawSelectMenu($('#submitterselect'), attendee, submitter);

        attendeeChanged = false;
    }
});

//*******************************************************************
// PEOPLE PAGE event handler
//*******************************************************************

// Pre-DOM manipulation code. Fire once per application
// The following kind of items should go here:
//   - Variable initializations
//   - Event driven code
$(document).on('pagecreate', '#peoplePage', function () {
    "use strict";
    $('#peoplelistcheckboxes input:checkbox').change(function () {
        attendeeChanged = true;
    });

    $('#peopletomainbutton').click(function () {
        if (attendeeChanged === true) {

            if (attendee.length !== 0) {
                attendee.splice(0);
            }

            $('#peoplelistcheckboxes input:checked').each(function () {
                attendee.push($(this).attr('name'));
            });
        }
    });
});

// Post-DOM manipulation code. Fire once per application
$(document).on('pageinit', '#peoplePage', function () {
    "use strict";
});

//*******************************************************************
// SETTING PAGE event handler
//*******************************************************************

// Pre-DOM manipulation code. Fire once per application
// The following kind of items should go here:
//   - Variable initializations
//   - Event driven code
$(document).on('pagecreate', '#settingsPage', function () {
    "use strict";
    $('#clearlocalstoragebutton').click(function () {
        localStorage.clear();
        alert('Local Storage Removed, You must restart the app now');
    });

    $('#refreshdatabutton').click(function () {
        jsonReadGoogleSpreadsheet(function () {
            // Update the text field on date of statistic
            alert('Google data refreshed on ' + localStorageGetItem('timeofstat'));
        });
    });

    $('#showsubmitterchkbox').change(function () {
        if ($(this).is(':checked')) {
            showSubmitter = 1;
        } else {
            showSubmitter = 0;
        }
        localStorageSetItem('showSubmitter', showSubmitter);
    });

});

// Post-DOM manipulation code. Fire once per application
$(document).on('pageinit', '#settingsPage', function () {
    "use strict";
    // Default date in 'lunch date' field
    $("#eventdate").attr('value', getDate());

    // Disable certain settings control, if local storage is not supported
    if (!Modernizr.localstorage) {
        $('#clearlocalstoragebutton').addClass('ui-disabled');
        $('#showsubmitterchkbox').checkboxradio('disable');
    }

    // Reflect 'showSubmitter' checkbox status
    $('#showsubmitterchkbox').attr("checked", showSubmitter === 1 ? true : false).checkboxradio("refresh");
});

$(document).on('pageshow', '#settingsPage', function () {
    "use strict";
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

$(document).on('pagecreate', '#summaryPage', function () {
    "use strict";
    $("#fundbookvaluetext").text(" .. refreshing .. ");
});

$(document).on('pageshow', '#summaryPage', function () {
    "use strict";
    var share = JSON.parse(localStorageGetItem('share')),
        fund_bookvalue = localStorageGetItem('fund_bookvalue'),
        fund_marketvalue = localStorageGetItem('fund_marketvalue'),
        total_shares = localStorageGetItem('total_shares'),
        submitter_share,
        submitter_shareratio,
        fundvalue,
        submitter_sharevalue;

    $('#timeofstat').text(localStorageGetItem('timeofstat'));
    $("#fundbookvaluetext").text(fund_bookvalue);
    $("#fundmarketvaluetext").text(fund_marketvalue);
    if (submitter === null) {
        $('#submittersharetext').text('Specify Submitter');
        $('#submittersharevaluetext').text('N/A');
    } else {
        submitter_share = parseFloat(share[submitter]);
        submitter_shareratio = submitter_share / total_shares;
        fundvalue = parseFloat(fund_marketvalue.substr(1));
        submitter_sharevalue = fundvalue * submitter_shareratio;
        $('#submittersharetext').text(submitter_share.toFixed(2));
        $('#submittersharevaluetext').text('$' + submitter_sharevalue.toFixed(2));
    }

    if (share === null) {
        $("#fundbookvaluetext").text('Go to Settings Page');
        $("#fundmarketvaluetext").text('And Refresh Data from Google');
    } else {
        drawPieChart(attendee, share);
    }
});
