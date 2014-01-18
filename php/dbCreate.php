<?php

$databaseName = "lunchfund";

//--------------------------------------------------------------------------
// 1) Connect to mysql database
//--------------------------------------------------------------------------
include 'dbConnect.php';

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
    printf("<p>Default database is %s.", $row[0]);
    mysqli_free_result($result);
}

// Create table
$sql="CREATE TABLE lunchers (
  username  varchar(15) NOT NULL,
  firstname varchar(20) NOT NULL default '',
  lastname  varchar(20) NOT NULL default '',
  PRIMARY KEY  (username)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE restaurants (
  rest_id   int(11) NOT NULL auto_increment,
  name      varchar(50) NOT NULL default '',
  PRIMARY KEY  (rest_id)
)";
if (!mysqli_query($con,$sql))
{
    die("Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE lunch_events (
  lunch_event_id int(11) NOT NULL auto_increment,
  rest_id        int(11) NOT NULL default '0',
  time           datetime,
  bill           decimal(10,2) NOT NULL,
  totalpaid      decimal(10,2) NOT NULL,
  fund           decimal(10,2) NOT NULL,
  PRIMARY KEY  (lunch_event_id)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

$sql="CREATE TABLE lunch_event_lookup (
  lunch_event_id  int(11) NOT NULL default '0',
  username        varchar(15) NOT NULL default '',
  PRIMARY KEY  (lunch_event_id, username)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table: " . mysqli_error($con));
}

// Close connection
mysqli_close($con);

?>
