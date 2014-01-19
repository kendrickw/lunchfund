<?php

// SQL database name
$databaseName = "lunchfund";

// SQL tables to update
$tbl_lunchers = "lunchers";
$tbl_restaurants = "restaurants";
$tbl_lunch_events = "lunch_events";
$tbl_lunch_event_lookup = "lunch_event_lookup";

//--------------------------------------------------------------------------
// 1) Connect to mysql database
//--------------------------------------------------------------------------
include 'dbConnect.php';

// Select database
$dbexist = mysqli_select_db($con, $databaseName);
if ($dbexist)
{
    // Delete database
    $sql="DROP DATABASE $databaseName";
    if (mysqli_query($con,$sql))
    {
        printf("<p>Database '$databaseName' dropped successfully.");
    }
    else
    {
        die("<p>Error dropping database: " . mysqli_error($con));
    }
}

// Create database
$sql="CREATE DATABASE $databaseName";
if (mysqli_query($con,$sql))
{
    printf("<p>Database '$databaseName' created successfully.");
}
else
{
    die ("<p>Error creating database: " . mysqli_error($con));
}

// Select database
mysqli_select_db($con, $databaseName);

// return name of current default database
if ($result = mysqli_query($con, "SELECT DATABASE()")) {
    $row = mysqli_fetch_row($result);
    printf("<p>Current working database is %s.", $row[0]);
    mysqli_free_result($result);
}

// Create table
$sql="CREATE TABLE $tbl_lunchers (
  username  varchar(15) NOT NULL,
  firstname varchar(20) NOT NULL default '',
  lastname  varchar(20) NOT NULL default '',
  PRIMARY KEY  (username)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_restaurants (
  rest_id   int(11) NOT NULL auto_increment,
  name      varchar(50) NOT NULL default '',
  PRIMARY KEY  (rest_id)
)";
if (!mysqli_query($con,$sql))
{
    die("Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_lunch_events (
  lunch_event_id int(11) NOT NULL auto_increment,
  rest_id        int(11) NOT NULL default '0',
  time           datetime,
  bill           decimal(10,2) NOT NULL default '0',
  totalpaid      decimal(10,2) NOT NULL default '0',
  fund           decimal(10,2) NOT NULL default '0',
  fundholder     varchar(15) NOT NULL default '',
  submitter      varchar(15) NOT NULL default '',
  PRIMARY KEY  (lunch_event_id),
  FOREIGN KEY  (rest_id)    REFERENCES restaurants(rest_id),
  FOREIGN KEY  (fundholder) REFERENCES lunchers(username),
  FOREIGN KEY  (submitter)  REFERENCES lunchers(username)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_lunch_event_lookup (
  lunch_event_id  int(11) NOT NULL default '0',
  username        varchar(15) NOT NULL default '',
  multiplier      tinyint(4) NOT NULL default '1',
  PRIMARY KEY  (lunch_event_id, username),
  FOREIGN KEY  (lunch_event_id) REFERENCES lunch_events(lunch_event_id),
  FOREIGN KEY  (username)       REFERENCES lunchers(username)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

printf("<p>All tables created successfully!");

// Close connection
mysqli_close($con);

?>
