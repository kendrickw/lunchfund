<?php

//--------------------------------------------------------------------------
// Connect to mysql database
//--------------------------------------------------------------------------
include 'dbParms.php';

$con = mysqli_connect($host, $user, $pass);
if (mysqli_connect_errno($con))
{
    die("<p>Failed to connect to MySQL: " . mysqli_connect_error());
}

// Select database
$dbexist = mysqli_select_db($con, $dbname);
if ($dbexist)
{
    // Delete database
    $sql="DROP DATABASE $dbname";
    if (mysqli_query($con,$sql))
    {
        printf("<p>Database '$dbname' dropped successfully.");
    }
    else
    {
        die("<p>Error dropping database: " . mysqli_error($con));
    }
}

// Create database
$sql="CREATE DATABASE $dbname";
if (mysqli_query($con,$sql))
{
    printf("<p>Database '$dbname' created successfully.");
}
else
{
    die ("<p>Error creating database: " . mysqli_error($con));
}

// Select database
mysqli_select_db($con, $dbname);

// return name of current default database
if ($result = mysqli_query($con, "SELECT DATABASE()")) {
    $row = mysqli_fetch_row($result);
    printf("<p>Current working database is %s.", $row[0]);
    mysqli_free_result($result);
}

// Create table
$sql="CREATE TABLE $tbl_lunchers (
  id        int(11) NOT NULL auto_increment,
  username  varchar(15) NOT NULL default '',
  firstname varchar(20) NOT NULL default '',
  lastname  varchar(20) NOT NULL default '',
  PRIMARY KEY  (id)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table $tbl_lunchers: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_restaurants (
  id        int(11) NOT NULL auto_increment,
  name      varchar(50) NOT NULL default '',
  PRIMARY KEY  (id)
)";
if (!mysqli_query($con,$sql))
{
    die("Error creating table $tbl_restaurants: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_lunch_events (
  id             int(11) NOT NULL auto_increment,
  rest_id        int(11) NOT NULL default '0',
  time           date,
  bill           decimal(10,2) NOT NULL default '0',
  totalpaid      decimal(10,2) NOT NULL default '0',
  fund           decimal(10,2) NOT NULL default '0',
  fundholder     int(11) NOT NULL default '0',
  submitter      int(11) NOT NULL default '0',
  PRIMARY KEY  (id),
  FOREIGN KEY  (rest_id)    REFERENCES $tbl_restaurants(id),
  FOREIGN KEY  (fundholder) REFERENCES $tbl_lunchers(id),
  FOREIGN KEY  (submitter)  REFERENCES $tbl_lunchers(id)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table $tbl_lunch_events: " . mysqli_error($con));
}

$sql="CREATE TABLE $tbl_lunch_event_lookup (
  lunch_event_id  int(11) NOT NULL default '0',
  luncher_id      int(11) NOT NULL default '0',
  multiplier      tinyint(4) NOT NULL default '1',
  PRIMARY KEY  (lunch_event_id, luncher_id),
  FOREIGN KEY  (lunch_event_id) REFERENCES $tbl_lunch_events(id),
  FOREIGN KEY  (luncher_id)     REFERENCES $tbl_lunchers(id)
)";
if (!mysqli_query($con,$sql))
{
    die("<p>Error creating table $tbl_lunch_event_lookup: " . mysqli_error($con));
}

printf("<p>All tables created successfully!");

// Close connection
mysqli_close($con);

?>
