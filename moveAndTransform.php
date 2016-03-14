<pre>
    <?php
    require_once 'C:/xampp/htdocs/bt/config/db.php';

    //loop though  && Werkstroom='AUTO' && Contactthema='BT_A_HSB_1'
    $query = "select * from belastingtelefoon WHERE Date='2016-03-09'";

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


        $level4 = array('Average_Wait_Time' => $average_wait_time);
        $level3 = array($uur_15min . 'u' => $level4);
        $level2 = array('details' => $level3);
        $level1 = array($contactthema => $level2);
        $level0 = array($werkstroom => $level1);

        $res = array_merge_recursive($res, $level0);
    }

    //Time array used for header
    $times = array();

    //Time array with information, used to complete matrix
    $fullTimes = array();
    $detailTimes = array('Average_Wait_Time' => 0);
    for ($i = 0; $i < 49; $i++) {
        $count = (800 + 100 * floor($i / 4)) + 15 * ($i % 4);
        array_push($times, $count);
        $fullTimes = array_merge($fullTimes, array($count . 'u' => $detailTimes));
    }

    //Correct for missing times
    foreach ($res as $werkstroom => $contactthemas) {
        foreach ($contactthemas as $contactthema => $details) {
            foreach ($details as $detail => $tijdstippen) {
                $res[$werkstroom][$contactthema][$detail] = array_merge($fullTimes, $tijdstippen);
            }
        }
    }

    //loop though  all werkstroom
    foreach ($res as $werkstroom => $contactthemas) {
        foreach ($contactthemas as $contactthema => $details) {
            $wait_times = array();
            foreach ($details as $detail => $tijdstippen) {
                foreach ($tijdstippen as $tijdstip => $data) {
                    array_push($wait_times, $data['Average_Wait_Time']);
                }
            }
            //Determine max wait for later coloring
            $aggregate = array('Max_Wait' => max($wait_times));
            $res[$werkstroom][$contactthema]['aggregate'] = $aggregate;
        }
    }



    // print_r($res);
    //somehow show nicely
    $html = "<table border='1'>";

    $html.="<tr><td>waiting times</td>";
    foreach ($times as $time) {
        $html .= "<td>" . $time . "</td>";
    }
    $html.="</tr>";

    foreach ($res as $werkstroom => $contactthemas) {
        foreach ($contactthemas as $contactthema => $details) {

            $max_wait = $res[$werkstroom][$contactthema]['aggregate']['Max_Wait'];

            $html.="<tr>";
            $html.="<td>" . $werkstroom . " " . $contactthema . "</td>";
            foreach ($details as $detail => $tijdstippen) {

                foreach ($tijdstippen as $tijdstip => $data) {
                    //Somehow adds one later
                    if (strlen($data['Average_Wait_Time']) < 1)
                        continue;

                    $norm_wait = round($data['Average_Wait_Time'] * 100 / $max_wait);

                    $html.="<td bgcolor='" . getColor($norm_wait) . "'>" . $data['Average_Wait_Time'] . "</br>  " . $norm_wait . "</td>";
                }
            }
            $html.="</tr>";
        }
    }
    $html.="</table>";
    echo $html;

    function getColor($i) {
        if ($i < 10) {
            return '#10FF00';
        } else if ($i < 20) {
            return '#40FF00';
        } else if ($i < 30) {
            return '#60FF00';
        } else if ($i < 40) {
            return '#90FF00';
        } else if ($i < 50) {
            return '#D0FF00';
        } else if ($i < 60) {
            return '#FFF000';
        } else if ($i < 70) {
            return '#FFC000';
        } else if ($i < 80) {
            return '#FF9000';
        } else if ($i < 90) {
            return '#FF5000';
        } else if ($i <= 100) {
            return '#FF0000';
        }
    }
    ?>
</pre>
