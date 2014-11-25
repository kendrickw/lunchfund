<?php
//--------------------------------------------------------------------------
// MYSQL database related globals
// Make sure you create a user with SELECT, INSERT, UPDATE privileges
// To populate tables, CREATE, DROP privileges are required
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// If Bluemix ClearDB service credentials are available, use them
// Otherwise, use local development MYSQL credentials.
//--------------------------------------------------------------------------
$services = getenv("VCAP_SERVICES");
if ($services != null) {
    $services_json = json_decode($services, true);
    $mysql_config = $services_json["cleardb"][0]["credentials"];

    $host = $mysql_config["hostname"];
    $user = $mysql_config["username"];
    $pass = $mysql_config["password"];
    $port = $mysql_config["port"];
    $dbname = $mysql_config["name"];    
} else {
    $host = "localhost";
    $user = "webUI";
    $pass = "WDwGzTeuhJn7JMfN";
    $port = 3306;
    $dbname = "lunchfund";
}

//--------------------------------------------------------------------------
// MYSQL table names
//--------------------------------------------------------------------------
$tbl_lunchers = "lunchers";
$tbl_restaurants = "restaurants";
$tbl_lunch_events = "lunch_events";
$tbl_lunch_event_lookup = "lunch_event_lookup";

?>
