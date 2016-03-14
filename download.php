<?php

$url  = 'http://download.belastingdienst.nl/belastingdienst/docs/wachtrij_belastingtelefoon_odt003.xls';
$file = 'C:/xampp/htdocs/bt/Downloads/raw/'.date("d_m_Y").'.xls';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$data = curl_exec($ch);
curl_close($ch);
echo file_put_contents($file, $data);
