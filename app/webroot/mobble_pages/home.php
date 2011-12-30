<?php
$page = "home";

$content_image = "img/content_home.png";
$scripts = "
	$('#menu li').removeClass('highlighted');
	$('#menu li.home').addClass('highlighted');
	";
include "template.php";

?>
