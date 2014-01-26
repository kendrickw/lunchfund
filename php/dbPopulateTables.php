<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
        <title>Populating Lunchfund SQL with google spreadsheet CSV</title>
        <style type="text/css">
            body {
                background: #E3F4FC;
                font: normal 14px/30px Helvetica, Arial, sans-serif;
                color: #2b2b2b;
            }
            a {
                color:#898989;
                font-size:14px;
                font-weight:bold;
                text-decoration:none;
            }
            a:hover {
                color:#CC0033;
            }

            h1 {
                font: bold 14px Helvetica, Arial, sans-serif;
                color: #CC0033;
            }
            h2 {
                font: bold 14px Helvetica, Arial, sans-serif;
                color: #898989;
            }
            #container {
                background: #CCC;
                margin: 100px auto;
                width: 945px;
            }
            #form 			{padding: 20px 150px;}
            #form input     {margin-bottom: 20px;}
        </style>
    </head>
    <body>
        <div id="container">
            <div id="form">

                <?php
// CSV parameters
$maxLineLen = 1000;     // maximum line length per row
$rowsToIgnore = 4;      // Number of rows occupied by the header
$usernameRow = 4;       // Row containing names of lunchers

// CSV column layout
class HdrCol
{
    const Date      = 0;
    const Event     = 1;
    const Fund      = 2;
    const Submitter = 3;
    const AddDate   = 4;
    const Holder    = 5;
    const Name      = 6;
};

// Connect to mysql database
include 'dbParms.php';

$con = mysqli_connect($host, $user, $pass);
if (mysqli_connect_errno($con))
{
    die("<p>Failed to connect to MySQL: " . mysqli_connect_error());
}

// Select database
mysqli_select_db($con, $dbname);
// return name of current default database
if ($result = mysqli_query($con, "SELECT DATABASE()")) {
    $row = mysqli_fetch_row($result);
    printf("<p>Using Database %s.", $row[0]);
    mysqli_free_result($result);
}

// Emptying all table
$sql="TRUNCATE TABLE $tbl_lunchers";
if (!mysqli_query($con,$sql))
{
    die("<p>Error emptying table: " . mysqli_error($con));
}
$sql="TRUNCATE TABLE $tbl_lunch_events";
if (!mysqli_query($con,$sql))
{
    die("<p>Error emptying table: " . mysqli_error($con));
}
$sql="TRUNCATE TABLE $tbl_lunch_event_lookup";
if (!mysqli_query($con,$sql))
{
    die("<p>Error emptying table: " . mysqli_error($con));
}

//Upload File
if (isset($_POST['submit']))
{
    if (is_uploaded_file($_FILES['filename']['tmp_name']))
    {
        echo "<h1>" . "File ". $_FILES['filename']['name'] ." uploaded successfully." . "</h1>";
        // echo "<h2>Displaying contents:</h2>";
        // readfile($_FILES['filename']['tmp_name']);
    }

    //Import uploaded file to Database
    $handle = fopen($_FILES['filename']['tmp_name'], "r");
    $curRow = 0;

    while (($data = fgetcsv($handle, $maxLineLen, ",")) !== FALSE)
    {
        $curRow++;

        // Propagate Lunchers table
        if ($curRow == $usernameRow)
        {
            $num = count($data);
            $luncherNames = $data;
            for ($i = HdrCol::Name; $i<$num ;$i++)
            {
                $sql="INSERT into $tbl_lunchers(username) values('$data[$i]')";
                if (!mysqli_query($con,$sql))
                {
                    die("<p>Error inserting entries into $tbl_lunchers: " . mysqli_error($con));
                }

                // Query the ID of the previously inserted user
                $luncherID["'$data[$i]'"] = mysqli_insert_id($con);
            }
        }

        // Rows to Skip before processing
        if ($rowsToIgnore > 0)
        {
            $rowsToIgnore--;
            continue;
        }

        // Only process lunch event
        if ($data[HdrCol::Event] != 'Lunch') continue;

        // Insert a lunch event
        $lunchfund = trim(str_replace('$','',$data[HdrCol::Fund]));
        $datepieces = explode ('/', $data[HdrCol::Date]);
        $time = $datepieces[2] . '-' . $datepieces[0] . '-' . $datepieces[1];
        $fundholderNm = $data[HdrCol::Holder];
        $fundholderID = $luncherID["'$fundholderNm'"];
        $sql="INSERT into $tbl_lunch_events(time, fund, fundholder) values('$time', '$lunchfund', '$fundholderID')";
        if (!mysqli_query($con,$sql))
        {
            die("<p>Error inserting entries into $tbl_lunch_events: " . mysqli_error($con));
        }
        printf("<br />Entry: time=" . $time . " fund=" . $lunchfund . "[" . $fundholderNm . "] lunchers=");

        // Query the ID of the previously inserted lunch event
        $lunch_event_id = mysqli_insert_id($con);

        // For each lunchers, add a row into lunch_event_lookup
        $luncherNum=0;
        for ($i = HdrCol::Name; $i<$num ;$i++)
        {
            if ($data[$i] == 1)
            {
                $userid = $luncherID["'$luncherNames[$i]'"];
                printf ($luncherNames[$i] . ", ");
                $sql="INSERT into $tbl_lunch_event_lookup(lunch_event_id, luncher_id) values('$lunch_event_id','$userid')";
                if (!mysqli_query($con,$sql))
                {
                    die("<p>Error inserting entries into $tbl_lunch_event_lookup: " . mysqli_error($con));
                }
                $luncherNum++;
            }
        }
        printf (" total=" . $luncherNum);
    }

    fclose($handle);

    print "<p>Import done";
}
else
{
    print "<p>Upload new csv by browsing to file and clicking on Upload<br />";
    print "<form enctype='multipart/form-data' action='dbPopulateTables.php' method='post'>";
    print "File name to import:<br />";
    print "<input size='50' type='file' name='filename'><br />";
    print "<input type='submit' name='submit' value='Upload'></form>";
}

// Close connection
mysqli_close($con);

                ?>

            </div>
        </div>
    </body>
</html>
