Lab Lunch Group Mutual Fund Mobile Application
==============================================

This a mobile app optimized for iOS and Android OS. Other mobile devices may work but are untested. This application helps to calculate lunch fund contribution, and also record attendance and lunch fund amount in a spreadsheet hosted on google drive.

Getting Started
---------------

The [zipball of latest release](https://github.com/kendrickw/lunchfund/archive/master.zip) contains *index.php* and all the javascripts/php scripts that the application needs.

There is a server side (MYSQL, PHP), and a client side (javascripts, htmls).
Once you have downloaded the zipball and extracted the content to the root of the webserver, the directory structure should look like:
* audio
* css
* images
* jquery
* js
* php
* index.php

On the server side, you must have MYSQL server and PHP installed:
* Modify *php/dbParms.php* to match the username and password to the MYSQL database.
* To create the initial database, run *php/dbCreate.php*
* To populate the database with data from google spreadsheet, first export the spreadsheet as .csv file, and then run *php/dbPopulateTables.php*
* Move these setup php files to a location outside the webserver since you don't want other people to accidentally run these files.
* It is advisable to create a user account in MYSQL with SELECT, INSERT, UPDATE privileges only. (And update *php/dbParms.php* with the new user account)

On the client side, simply navigate to *index.php* from your web browser.

Features
--------

* MYSQL database to store data entries
* Pulls list of attendees from MYSQL
* Pulls share information from google spreadsheet
* Calculate lunch fund automatically using number of attendees and bill amount

Why not native app?
-------------------

Everything we want to accomplish so far can be done via a web app.  Some of the more advance features (i.e. face recognition) may require us to implement native code.  But until that is implemented, this will remain a web app.

Possible Future Work
--------------------

* Build native app (maybe needed for performance anyways)

Issues
------

Found a bug? Please create an issue here on GitHub!

https://github.com/kendrickw/lunchfund/issues

Testing
-------

None at the moment.

License
-------

Copyright 2013, 2014 Lunch Fund Group
