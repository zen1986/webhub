<?php

$page = "faq";
$content_image = "img/content_index.png";

$scripts = "
	$('#menu li').removeClass('highlighted');
	$('#menu li.faq').addClass('highlighted');
	";
include "template.php";

?>

