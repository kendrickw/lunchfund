<?php
// ------------------------------------------
// Adding a lunch event to the MYSQL database
// ------------------------------------------
require "dbParms.php";

// Return code structure
$rc["status"]  = 'success';
$rc["message"] = 'Event Successfully Added';

// Lunch Event Object
class lunchEvent {
    public $rest_id;
    public $eventdate;
    public $bill;
    public $totalpaid;
    public $fund;
    public $fundholder;
    public $submitter;

    function __construct($fundholder,$submitter) {
        $this->rest_id    = 0;
        $this->eventdate  = $_POST["SF_EventDate"];
        $this->bill       = $_POST["SF_BillAmount"];
        $this->totalpaid  = $_POST["SF_TotalPaid"];
        $this->fund       = $_POST["SF_LunchFund"];;
        $this->fundholder = $fundholder;
        $this->submitter  = $submitter;
    }
}

// Debug traces
//$rc["message"] = '';
//$rc["message"] .= "_POST" . ': ' . print_r($_POST, true);

try {
    // Verify FORM input
    if (!(isset($_POST["SF_Names"]) &&
          isset($_POST["SF_BillAmount"]) &&
          isset($_POST["SF_TotalPaid"]) &&
          isset($_POST["SF_LunchFund"]) &&
          isset($_POST["SF_FundHolder"]) &&
          isset($_POST["SF_EventDate"]) &&
          isset($_POST["SF_EventLocation"]))) {
        throw new Exception('Bad FORM Input');
    }

    // Connect to database
    $DBH = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

    // Query last inserted row and make sure it is different from this entry
    $STH = $DBH->query("SELECT time, bill, totalpaid, fund FROM $tbl_lunch_events ORDER BY id DESC LIMIT 1");
    $STH->setFetchMode(PDO::FETCH_ASSOC);
    $row = $STH->fetch();
    if ($row &&
        strtotime($row['time'])  == strtotime($_POST["SF_EventDate"]) &&
        round($row['bill'])      == round($_POST["SF_BillAmount"]) &&
        round($row['totalpaid']) == round($_POST["SF_TotalPaid"]) &&
        round($row['fund'])      == round($_POST["SF_LunchFund"])) {
        throw new Exception('Duplicate Entry');
    }

    // Get table of username<->ID mapping
    $STH = $DBH->query("SELECT username, id FROM $tbl_lunchers");
    $STH->setFetchMode(PDO::FETCH_ASSOC);
    while($row = $STH->fetch()) {
        $luncherIDs[$row['username']] = $row['id'];
    }

    // Insert a new lunch event
    $STH = $DBH->prepare("INSERT INTO $tbl_lunch_events (rest_id, time, bill, totalpaid, fund, fundholder, submitter) " .
                         "VALUE (:rest_id, :eventdate, :bill, :totalpaid, :fund, :fundholder, :submitter)");
    $event = new lunchEvent ($luncherIDs[$_POST["SF_FundHolder"]],
                             $luncherIDs[$_POST["SF_Submitter"]]);
    $STH->execute((array)$event);
    $event_id = $DBH->lastInsertId();

    // Insert a lunch_event_lookup entry for each participants
    $STH = $DBH->prepare("INSERT INTO $tbl_lunch_event_lookup (lunch_event_id, luncher_id, multiplier) " .
                         "VALUE (:lunch_event_id, :luncher_id, :multiplier)");
    foreach ($_POST["SF_Names"] as $i => $username) {
        $data = array ( 'lunch_event_id' => $event_id,
                       'luncher_id' => $luncherIDs["$username"],
                       'multiplier' => 1 );
        $STH->execute($data);
    }
}
catch(PDOException $e) {
    $rc["status"]  = 'PDOException';
    $rc["message"] = $e->getMessage();
}
catch (Exception $e) {
    $rc["status"]  = 'Exception';
    $rc["message"] = $e->getMessage();
}

// Return results back to client
echo json_encode($rc);

// Close MYSQL Connection
$DBH = null;

?>