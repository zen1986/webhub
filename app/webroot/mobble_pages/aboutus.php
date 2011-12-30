<?php

$page = "aboutus";
$content_image = "img/content_aboutus.png";

$scripts = "
	$('#menu li').removeClass('highlighted');
	$('#menu li.aboutus').addClass('highlighted');
	";
include "template/template.php";

?>

