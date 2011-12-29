<?php
$page = "theapp";

$content_image = "img/content_theapp.png";


// app demo

$out="";
$steps_shown=3;

$out.="<div id='demo_area'>";

for ($i=1;$i<$steps_shown+1;$i++) {
	$out.="<div class='demo_step step_$i'>";

	$out.="<img class='demo_step_instruction' src='img/demo_text_$i.png' />";
	$out.="<img class='demo_step_img' src='img/demo_img_$i.png' />";
	$out.="<img class='demo_step_numb' src='img/demo_numb_$i.png' />";

	$out.="</div>";
}
$out.="</div>";

$out.="<a href='#' class='demo_nav_left' onclick='goLeft();return false;'><img src='img/demo_left.png'/></a>";
$out.="<a href='#' class='demo_nav_right' onclick='goRight();return false;'><img src='img/demo_right.png'/></a>";
$out.="<script src='js/app_demo.js'></script>";
$app_demo = $out;

include "template.php";
?>

