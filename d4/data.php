
<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'C:/xampp/htdocs/bt/config/db.php';

//loop though  && Werkstroom='AUTO' && Contactthema='BT_A_HSB_1'
$query = "select * from belastingtelefoon WHERE Date='2016-03-09'  ";

$result = mysqli_query($connection, $query);
$num = $result->num_rows;


$res = array();

while ($row = $result->fetch_assoc()) {
    $uur_15min = $row['Uur_15min'];
    $werkstroom = $row['Werkstroom'];
    $contactthema = $row['Contactthema'];
    $calls_answered = $row['Calls_Answered'];
    $wait_time_to_answer = $row['Wait_Time_to_Answer'];
    $average_wait_time = round($calls_answered == 0 ? 0 : $wait_time_to_answer / $calls_answered);


    $level3 = array($uur_15min . 'u' => $average_wait_time);
    $level2 = array('details' => $level3);
    $level1 = array($contactthema => $level2);
    $level0 = array($werkstroom => $level1);

    $res = array_merge_recursive($res, $level0);
}

$forchart = array();
//Time array used for header
$times = array();

//Time array with information, used to complete matrix
$fullTimes = array();
for ($i = 0; $i < 49; $i++) {
    $count = (800 + 100 * floor($i / 4)) + 15 * ($i % 4);

    array_push($times, $count);
    $fullTimes = array_merge($fullTimes, array($count . 'u' => 0));
}
$forchart['xLabels'] = $times;

//Correct for missing times
$contactthemaa = array();
foreach ($res as $werkstroom => $contactthemas) {

    foreach ($contactthemas as $contactthema => $details) {
        array_push($contactthemaa, $contactthema);
        foreach ($details as $detail => $tijdstippen) {
            $res[$werkstroom][$contactthema][$detail] = array_merge($fullTimes, $tijdstippen);
        }
    }
}
// $forchart['yLabels'] = $contactthemaa;
//loop though  all werkstroom
$pointData = array();
foreach ($res as $werkstroom => $contactthemas) {
    foreach ($contactthemas as $contactthema => $details) {
        foreach ($details as $detail => $tijdstippen) {
            $themaArray = array();
            foreach ($tijdstippen as $tijdstip => $wait_time) {
                array_push($themaArray, $wait_time);
            }
        }
        array_push($pointData, array($contactthema => $themaArray));
    }
}
$forchart['data'] = $pointData;

header('Content-type: application/json');
echo json_encode($forchart, JSON_PRETTY_PRINT);
?>

