Lab Lunch Group Mutual Fund Mobile Application
==============================================

This a mobile app optimized for iOS and Android OS. Other mobile devices may work but are untested. This application helps to calculate lunch fund contribution, and also record attendance and lunch fund amount in a spreadsheet hosted on google drive.

Getting Started
---------------
The [zipball of latest release](https://github.com/kendrickw/lunchfund/archive/master.zip) contains *index.php* and all the javascripts require to load it. Simply download it and extract the content in the webserver. Once extracted, load the *index.php* page to start the application.

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
