<!DOCTYPE html>
<!-- Offline Caching
<html lang="en" manifest="offline.appcache">
-->
<html>

    <head>
        <title>LunchFund Calculator</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>

        <link rel="apple-touch-icon" sizes="57x57" href="images/icon-iphone-57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="images/icon-ipad-72.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="images/icon-iphone-114.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="images/icon-ipad-144.png" />
        <link rel="apple-touch-icon-precomposed" href="images/icon-iphone-114.png"/>

        <link media="(device-width: 320px)" rel="apple-touch-startup-image"
              href="images/splash-iphone-320-460.png" />
        <link media="(device-width: 320px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image"
              href="images/splash-iphone-640-920.png" />
        <link media="screen (min-device-width: 481px) and (max-device-width: 1024px) and (orientation: portrait)" rel="apple-touch-startup-image"
              href="images/splash-ipad-748-1024.png" />
        <link media="screen (min-device-width: 481px) and (max-device-width: 1024px) and (orientation: landscape)" rel="apple-touch-startup-image"
              href="images/splash-ipad-1004-768.png" />
        <link media="screen (min-device-width: 481px) and (max-device-width: 1024px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image"
              href="images/splash-ipad-1536-2008.png" />
        <link media="screen and (min-device-width: 481px) and (max-device-width: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image"
              href="images/splash-ipad-2048-1496.png" />

        <link rel="stylesheet" type="text/css" href="css/themes/lunchfund.min.css" />
        <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />
        <link rel="stylesheet" type="text/css" href="jquery/jqm-datebox-1.2.0.min.css" />
        <link rel="stylesheet" type="text/css" href="css/lunchfund_global.css" />

        <script type="text/javascript" src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
        <script type="text/javascript" src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
        <script type="text/javascript" src="jquery/jqm-datebox-1.2.0.comp.calbox.min.js"></script>
        <script type="text/javascript" src="jquery/jquery.formatCurrency-1.4.0.min.js"></script>
        <script type="text/javascript" src="jquery/jquery.flot.js"></script>
        <script type="text/javascript" src="jquery/jquery.flot.pie.js"></script>
    </head>

    <body>

        <!-- "tada" sound on submit courtesy of filo -->
        <audio id="tadaAudio">
            <source src="audio/tada.mp3" type="audio/mpeg">
        </audio>

        <!-----------
Main Page
data-theme="a"(normal), "b"(black), "c"(yellow) "d"(blue)
------------->
        <div data-theme="a" data-role="page" id="homePage">

            <div data-theme="b" data-role="header" data-position="">
                <h1>LF Calc v1.0.1<?php @include 'admin_php/debugMode.php'; ?></h1>
                <div data-role="navbar" data-iconpos="left">
                    <ul>
                        <li><a href="#" data-transition="fade" data-icon="home"
                               class="ui-btn-active ui-state-persist">Home</a></li>
                        <li><a href="#summaryPage" data-transition="fade" data-icon="eye">Summary</a></li>
                        <li><a href="#settingsPage" data-transition="fade" data-icon="gear">Settings</a></li>
                    </ul>
                </div>
            </div>

            <div data-role="content">

                <!-- Show number of participants and allow list customization -->
                <ul data-theme="d" data-role="listview" data-inset="true">
                    <li data-role="list-divider">Select Lunchers:</li>
                    <li><a href="#peoplePage" data-transition="slide">
                        <!-- Dynamically generated. Populated by drawParticipantText() -->
                        <h3 style="white-space:normal"><span id="participantlisttext"></span></h3>
                        <span class="ui-li-count" id="participantcounttext"></span>
                        </a>
                    </li>
                </ul>

                <!-- Meal calculator -->
                <ul data-role="listview" data-inset="true">
                    <!-- Bill Amount -->
                    <li>
                        <table style="width: 100%"><tr>
                            <td>Bill Amount:</td>
                            <td style="text-align:right">$</td>
                            <td><input type="number" step="any" min="0" value="0.00" pattern="[0-9]*" id="billamountinput" /></td>
                            </tr></table>
                    </li>

                    <!-- Tip -->
                    <li data-icon="edit">
                        <!-- To disable button, add: class="ui-disabled" -->
                        <a href="#tipspopup" data-rel="popup">Tips (<span id="tipspercenttext"></span>%):
                            <span id="tipstext1" class="ui-li-count"></span>
                        </a>

                        <div data-role="popup" id="tipspopup" class="ui-content">
                            <a href="#" data-rel="back" data-role="button" data-icon="delete"
                               data-iconpos="notext" class="ui-btn-left">Close</a>
                            <table><tr>
                                <td><a href="#" data-role="button" data-icon="minus"
                                       data-iconpos="notext" id="tipsminus"></a></td>
                                <td><span id="tipstext2"></span></td>
                                <td><a href="#" data-role="button" data-icon="plus"
                                       data-iconpos="notext" id="tipsplus"></a></td>
                                </tr></table>
                        </div>
                    </li>

                    <!-- Meal Total -->
                    <li>
                        Meal Total:
                        <span class="ui-li-count" id="mealtotaltext"></span>
                    </li>

                    <!-- Each Pays -->
                    <li data-icon="edit">
                        <!-- To disable button, add: class="ui-disabled" -->
                        <a href="#eachpayspopup" data-rel="popup">Each Pays:
                            <span class="ui-li-count" id="eachpaystext1"></span>
                        </a>

                        <div data-role="popup" id="eachpayspopup" class="ui-content" >
                            <a href="#" data-rel="back" data-role="button" data-icon="delete"
                               data-iconpos="notext" class="ui-btn-left">Close</a>
                            <table><tr>
                                <td><a href="#" data-role="button" data-icon="minus"
                                       data-iconpos="notext" id="eachpayminus"></a></td>
                                <td><span id="eachpaystext2"></span></td>
                                <td><a href="#" data-role="button" data-icon="plus"
                                       data-iconpos="notext" id="eachpayplus"></a></td>
                                </tr></table>
                        </div>
                    </li>

                    <!-- Lunch Fund -->
                    <li data-theme-count="c" data-theme="a">
                        Lunch Fund:
                        <span class="ui-li-count" id="lunchfundtext"></span>
                    </li>

                </ul>

                <!-- Fund Holder, Submitter -->
                <div class="ui-field-contain">
                    <fieldset data-role="controlgroup">
                        <legend>Fund Holder:</legend>
                        <select id="fundholderselect">
                            <!-- Dynamically created content. Populated by drawSelectMenu() -->
                        </select>
                    </fieldset>
                    <fieldset data-role="controlgroup" id="submitterfield">
                        <legend>Submitter:</legend>
                        <select id="submitterselect">
                            <!-- Dynamically created content. Populated by drawSelectMenu() -->
                        </select>
                    </fieldset>
                </div>

                <!-- Form submission logic -->
                <!-- No action because javascript is doing the actual POST -->
                <!-- data-ajax="false" -->
                <form method="POST" id="submissionForm"
                      enctype="multipart/form-data"
                      data-ajax="false"
                      action="">
                    <div id="submissionforminput">
                        <!-- Dynamically created content. Populated by drawSubmissionFormChkBox() -->
                    </div>
                    <!-- Bill amount -->
                    <input type="text" style="display:none;" name="SF_BillAmount" value="" id="SF_BillAmount" data-role="none" />
                    <!-- Total Paid -->
                    <input type="text" style="display:none;" name="SF_TotalPaid" value="" id="SF_TotalPaid" data-role="none" />
                    <!-- Lunch Fund amount -->
                    <input type="text" style="display:none;" name="SF_LunchFund" value="" id="SF_LunchFund" data-role="none" />
                    <!-- Name of person holding the fund -->
                    <input type="text" style="display:none;" name="SF_FundHolder" value="" id="SF_FundHolder" data-role="none"/>
                    <!-- Name of submitter -->
                    <input type="text" style="display:none;" name="SF_Submitter" value="" id="SF_Submitter" data-role="none"/>
                    <!-- Event Date -->
                    <input type="text" style="display:none;" name="SF_EventDate" value="" id="SF_EventDate" data-role="none"/>
                    <!-- Event Location -->
                    <input type="text" style="display:none;" name="SF_EventLocation" value="" id="SF_EventLocation" data-role="none"/>
                    <!-- submission button -->
                    <input type="submit" name="submit" data-theme="c" data-icon="cloud" data-iconpos="right" id="submitButton" value="Submit to Server"/>
                </form>

                <!-- Last couple submission content -->
                <table data-role="table" id="table-column-toggle" data-mode="columntoggle" class="ui-responsive table-stroke">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Bill Amount</th>
                            <th data-priority="1">Lunch Fund</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamically created content. Inserted by PHP -->
                        <?php include 'views/dbEventsList.php'; ?>
                    </tbody>
                </table>

            </div> <!-- end of homePage content -->

        </div> <!-- end of homePage proper-->

        <!-----------
Lunch People selection Page
------------>
        <div data-role="page" id="peoplePage">

            <div data-theme="c" data-role="header" data-position="">
                <a href="#" data-rel="back" data-icon="back" data-transition="slide" data-direction="reverse"
                   id="peopletomainbutton">
                    Back
                </a>
                <h1>Participants</h1>
            </div>

            <div data-role="content">

                <div data-role="fieldcontain">
                    <fieldset data-role="controlgroup" data-type="vertical" id="peoplelistcheckboxes">
                        <!-- Dynamically created content. Inserted by PHP -->
                        <?php include 'views/dbLunchersList.php'; ?>
                    </fieldset>
                </div>

            </div> <!-- end of peoplePage content -->

        </div> <!-- end of peoplePage proper-->

        <!-----------
Summary Page
------------->
        <div data-role="page" id="summaryPage">

            <div data-theme="b" data-role="header" data-position="">
                <h1>Summary</h1>
                <div data-role="navbar" data-iconpos="left">
                    <ul>
                        <li><a href="#homePage" data-transition="fade" data-icon="home">Home</a></li>
                        <li><a href="#" data-transition="fade" data-icon="eye"
                               class="ui-btn-active ui-state-persist">Summary</a></li>
                        <li><a href="#settingsPage" data-transition="fade" data-icon="gear">Settings</a></li>
                    </ul>
                </div>
            </div>

            <div data-role="content">

                <!-- fund summary -->
                <ul data-role="listview" data-inset="true" data-divider-theme="d">
                    <li data-role="list-divider">Data retrieved from:<br><span id="timeofstat"></span></li>
                    <li>Fund Book Value:
                        <span class="ui-li-aside" id="fundbookvaluetext"></span>
                    </li>
                    <li>Fund Market Value:
                        <span class="ui-li-aside" id="fundmarketvaluetext"></span>
                    </li>
                    <li>Your Shares:
                        <span class="ui-li-aside" id="submittersharetext"></span>
                    </li>
                    <li>Your Share Market Value:
                        <span class="ui-li-aside" id="submittersharevaluetext"></span>
                    </li>
                </ul>

                <!-- Piechart of holding percentage -->
                <div class="center-wrapper">
                    <div id="piechart1" style="width:300px;height:300px;"></div>
                </div>

            </div>

        </div> <!-- end of summaryPage proper-->

        <!-------------
Settings Page
------------->
        <div data-role="page" id="settingsPage">

            <div data-theme="b" data-role="header" data-position="">
                <h1>Settings</h1>
                <div data-role="navbar" data-iconpos="left">
                    <ul>
                        <li><a href="#homePage" data-transition="fade" data-icon="home">Home</a></li>
                        <li><a href="#summaryPage" data-transition="fade" data-icon="eye">Summary</a></li>
                        <li><a href="#" data-transition="fade" data-icon="gear"
                               class="ui-btn-active ui-state-persist">Settings</a></li>
                    </ul>
                </div>
            </div>

            <div data-role="content">

                <!-- Button group -->
                <div data-role="controlgroup">
                    <a data-role="button" href="#"
                       data-icon="delete" data-iconpos="right"
                       id="clearlocalstoragebutton">
                        Clear local storage
                    </a>
                    <a data-role="button" href="#"
                       data-icon="refresh" data-iconpos="right"
                       id="refreshdatabutton">
                        Refresh data from Google
                    </a>
                </div>

                <table style="width: 100%">
                    <!-- event date -->
                    <tr>
                        <td style="width: 30%">
                            <label for="eventdate">
                                Event Date:
                            </label>
                        </td>
                        <td>
                            <input name="eventdate" id="eventdate" type="text"
                                   data-role="datebox"
                                   data-options='{"mode": "calbox", "beforeToday": true, "useFocus": true}'/>
                        </td>
                    </tr>
                </table>

                <div data-role="fieldcontain">
                    <fieldset data-role="controlgroup" data-type="vertical">
                        <label for="showsubmitterchkbox">
                            Show Submitter
                        </label>
                        <input type="checkbox" id="showsubmitterchkbox" checked="checked"/>
                    </fieldset>
                </div>

                <!-- filo -->
                <!-- Restaurant Suggestion Generator -->
                <div data-role="controlgroup">
                    <a data-role="button" data-icon="info" data-iconpos="right"
                       href="#restaurantsuggestpopup" data-rel="popup">
                        Tell Me Where to Eat!
                    </a>
                    <div data-role="popup" id="restaurantsuggestpopup" class="ui-content" data-overlay-theme="a">
                        <a href="#" data-rel="back" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-left">Close</a>
                        <table><tr>
                            <td>Kenny's Of Course!</td>
                            </tr></table>
                    </div>
                </div>
                <!-- olif -->

            </div>

            <div data-role="footer" data-position="fixed">
                <div style="margin:8px 8px 8px 8px;">
                    &copy; 2013-2014 Lunch Group
                </div>
            </div>

        </div> <!-- end of settingsPage proper-->

    </body>

    <script type="text/javascript" src="js/modernizr.min.js"></script>
    <script type="text/javascript" src="js/lunchfund.min.js"></script>

</html>
