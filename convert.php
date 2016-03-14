<?php
require_once 'C:/xampp/htdocs/bt/Classes/PHPExcel.php';


$input = 'C:/xampp/htdocs/bt/Downloads/raw/11_03_2016.xls';
$output = 'C:/xampp/htdocs/bt/Downloads/converted/11_03_2016.csv';
convertXLStoCSV($input,$output);

function convertXLStoCSV($infile,$outfile)
{
    $fileType = PHPExcel_IOFactory::identify($infile);
    $objReader = PHPExcel_IOFactory::createReader($fileType);
 
    $objReader->setReadDataOnly(true);   
    $objPHPExcel = $objReader->load($infile);    
 
    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'CSV');
    $objWriter->save($outfile);
}