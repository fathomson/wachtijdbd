<?php

require_once 'C:/xampp/htdocs/bt/config/db.php';
$input = 'C:/xampp/htdocs/bt/Downloads/converted/11_03_2016.csv';

$csvfile = fopen($input, 'r');
$theData = fgets($csvfile);


$html = "<table border='1'>";
if (($handle = fopen($input, "r")) !== FALSE) {

    //Skip first two lines
    $skipCount = 0;
    $skip = 2;
    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
        $skipCount++;
        if ($skipCount < $skip) {
            continue;
        }

        $jaar = $data[1];
        $kwartaal = $data[2];
        $jaarmaand = $data[3];
        $maand = $data[4];
        $jaarweek = $data[5];
        $week = $data[6];
        $date = $data[7];
        //fix later, exell data format faack
        $normal_date = ($date - 25569) * 86400;
        $dateFormat = date("Y-m-d", $normal_date);
        $uur = $data[8];
        $uur_15min = $data[9];
        $werkstroom = $data[10];
        $contactthema = $data[11];
        $v_aanbod = $data[12];
        $calls_short_abandoned = $data[13];
        $v_abandoned = $data[14];
        $calls_answered = $data[15];
        $calls_answered_threshold = $data[16];
        $wait_time_to_answer = $data[17];
        $time_to_abandon = $data[18];
        $geweigerde_aantallen = $data[19];
        $aantal_herr_naar_ct_kwart = $data[20];
        $v_aangenomen = $data[21];
        $v_sl = $data[22];

        if (strlen($jaar) == 0) {
            break;
        }

        //When is data add to database
        $query = "insert into belastingtelefoon(
            Jaar,
            Kwartaal,
            JaarMaand,
            Maand,
            JaarWeek,
            Week,Date,
            Uur,Uur_15min,
            Werkstroom,
            Contactthema,
            V_Aanbod,
            Calls_Short_Abandoned,
            V_Abandoned,
            Calls_Answered,
            Calls_Answered_Threshold,
            Wait_Time_to_Answer,
            Time_to_Abandon,
            Geweigerde_aantallen,
            Aantal_Herr_Naar_CT_kwart,
            V_Aangenomen,
            V_SL
                ) values('" . $jaar . "','" .
                $kwartaal . "','" .
                $jaarmaand . "','" .
                $maand . "','" .
                $jaarweek . "','" .
                $week . "','" .
                $dateFormat . "','" .
                $uur . "','" .
                $uur_15min . "','" .
                $werkstroom . "','" .
                $contactthema . "','" .
                $v_aanbod . "','" .
                $calls_short_abandoned . "','" .
                $v_abandoned . "','" .
                $calls_answered . "','" .
                $calls_answered_threshold . "','" .
                $wait_time_to_answer . "','" .
                $time_to_abandon . "','" .
                $geweigerde_aantallen . "','" .
                $aantal_herr_naar_ct_kwart . "','" .
                $v_aangenomen . "','" .
                $v_sl . "')";

        if ($skipCount == $skip) {
            $succes = "Succes";
        } else {
            $succes = mysqli_query($connection, $query);
        }

        $html.="<tr>";
        $html.="<td>$jaar</td>";
        $html.="<td>$kwartaal</td>";
        $html.="<td>$jaarmaand</td>";
        $html.="<td>$maand</td>";
        $html.="<td>$jaarweek</td>";
        $html.="<td>$week</td>";
        if ($skipCount == $skip) {
            $html.="<td>$date</td>";
        } else {
            $html.="<td>$dateFormat</td>";
        }
        $html.="<td>$uur</td>";
        $html.="<td>$uur_15min</td>";
        $html.="<td>$werkstroom</td>";
        $html.="<td>$contactthema</td>";
        $html.="<td>$v_aanbod</td>";
        $html.="<td>$calls_short_abandoned</td>";
        $html.="<td>$v_abandoned</td>";
        $html.="<td>$calls_answered</td>";
        $html.="<td>$calls_answered_threshold</td>";
        $html.="<td>$wait_time_to_answer</td>";
        $html.="<td>$time_to_abandon</td>";
        $html.="<td>$geweigerde_aantallen</td>";
        $html.="<td>$aantal_herr_naar_ct_kwart</td>";
        $html.="<td>$v_aangenomen</td>";
        $html.="<td>$v_sl</td>";
        $html.="<td></td>";
        $html.="<td>$succes</td>";
        $html.="</tr>";
    }
    fclose($handle);
}

$html.="</table>";
echo $html;
?>