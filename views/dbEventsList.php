<?php
// ------------------------------------------
// Retrieve list of events
// ------------------------------------------
require_once("config/db.php");

// The first few events gets automatically loaded
$defaultEvents = 2;

/*
<tr>
                            <th>Date</th>
                            <th data-priority="1">Lunchers</th>
                            <th>Bill Amount</th>
                            <th data-priority="2">Lunch Fund</th>
                            <th data-priority="3">Submitter</th>
                            <th data-priority="4">Fund Holder</th>
                        </tr>
                        */

/*
SELECT time, bill, fund, lunchers.username AS luncher, fundholder.username AS fundholder, submitter.username AS submitter FROM lunch_event_lookup
INNER JOIN (SELECT * FROM lunch_events ORDER BY id DESC LIMIT 2) sub_lunch_events ON ( sub_lunch_events.id = lunch_event_lookup.lunch_event_id )
INNER JOIN lunchers ON ( lunch_event_lookup.luncher_id = lunchers.id)
INNER JOIN lunchers AS fundholder ON ( sub_lunch_events.fundholder = fundholder.id)
INNER JOIN lunchers AS submitter ON ( sub_lunch_events.fundholder = submitter.id)
ORDER BY time DESC
*/

try {
    // Connect to database
    $DBH = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

    // Select the past n events
    $STH = $DBH->query("SELECT *" .
                       "FROM $tbl_lunch_events " .
                       "ORDER BY $tbl_lunch_events.id DESC LIMIT $defaultEvents");
    $STH->setFetchMode(PDO::FETCH_OBJ);

    while($row = $STH->fetch()) {
        printf('<tr>' .
               '<td>%1$s</td>' .
               '<td>%2$s</td>' .
               '<td>%3$s</td>' .
               '</tr>',
               $row->time, $row->bill, $row->fund);
    }
}
catch(PDOException $e) {
    printf('<tr><td>%1$s</td></tr>', $e->getMessage());
}
catch (Exception $e) {
    printf('<tr><td>%1$s</td></tr>', $e->getMessage());
}

// Close MYSQL connection
$DBH = null;

?>
