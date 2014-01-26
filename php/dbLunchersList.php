<?php

include "dbParms.php";

// The first few attendee gets automatically checked
$defaultAttendee = 5;

try {
    // Connect to database
    $DBH = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

    // Create participant list base on past attendence
    $STH = $DBH->query("SELECT username " .
                       "FROM  $tbl_lunchers " .
                       "INNER JOIN $tbl_lunch_event_lookup ON ( $tbl_lunchers.id = $tbl_lunch_event_lookup.luncher_id ) " .
                       "GROUP BY $tbl_lunch_event_lookup.luncher_id " .
                       "ORDER BY COUNT( * ) DESC");
    $STH->setFetchMode(PDO::FETCH_OBJ);

    $counter = 0;
    while($row = $STH->fetch()) {
        printf('<input type="checkbox" id="chkbox_%1$d" name="%2$s" %3$s>' .
               '<label for="chkbox_%1$d">%2$s</label>',
               $counter,
               $row->username,
               $counter < $defaultAttendee ? 'checked="checked"' : '');
        $counter++;
    }

}
catch(PDOException $e) {
    printf('<input type="checkbox" id="chkbox_1" name="%1$s" checked="checked">' .
           '<label for="chkbox_1">PDOException: %1$s</label>', $e->getMessage());
}
catch (Exception $e) {
    printf('<input type="checkbox" id="chkbox_1" name="%1$s" checked="checked">' .
           '<label for="chkbox_1">Exception: %1$s</label>', $e->getMessage());
}

// Close MYSQL connection
$DBH = null;

?>