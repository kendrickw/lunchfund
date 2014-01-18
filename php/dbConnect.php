<?php
//--------------------------------------------------------------------------
// MYSQL database location
//--------------------------------------------------------------------------
$host = "192.168.1.203";
$user = "root";
$pass = "";

// Create connection
$con = mysqli_connect($host,$user,$pass);

// Check connection
if (mysqli_connect_errno())
{
    die('<p>Could not connect: ' . mysqli_error($con));
}
?>
