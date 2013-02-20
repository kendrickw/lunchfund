# ChangeLog

---

### 0.9.0
* Move lunchfund adjuster to tips field +/- $0.25
* Implement each pays adjuster +/- $1.00

### 0.8.9
* JSON handler revamped (performance improvement)
* Disable cookie, using local storage instead
* remove data-position="fixed" from header/footer. Performance problem with Android.
* move navbar to top (avoid fixed footer performance problem)
* Move all UI elements in fund holder page to main page
* New Settings page
    * add ability to clear local storage
    * refresh data from google
    * move event date adjustment to settings page
    * option to hide submitter selection from main page
* new background to all pages

### 0.8.8
* Fix Bill amount input for Android (revert to normal number field)

### 0.8.7
* Offline mode infrastructure (don't know how to cache JSON request)
* Fix fund holder radio list rendering
* add .htaccess for offline infrastructure (for apache web server)

### 0.8.6
* All new UI look
* Summary Page tab
* Tip percentage shown on main screen
* Lunchfund +/- adjuster

### 0.8.5
* Restore fat-finger friendly keypad in Bill Amount input
* Busy indicator when submitting google doc
* Clean up event handler (reduce click handler)

### 0.8.4
* peopleList and attendee list stored in cookie for a day
* Event date and submitter name recorded on google doc
* Summary Page reflects attendee list (still experimental)

### 0.8.3
* Go back to 'number' keypad for both iphone and Android. (compromise)
* create cookies to store JSON object (but iphone doesn't use the list? bug?)
* submitter name recorded in cookie

### 0.8.2
* Performance improvement:
    * use google to serve jquery.min.js
    * Reduce calls to append() when generating <input> lists
    * Separate javascript into its own file
    * Disable page transition
    * Delay event listener initializer to when page is created
* Bring up fat-finger friendly keypad when entering Bill Amount
* Date selector
* Piechart (experimental)
