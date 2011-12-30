<?php

$page = "media";
$content_image = "img/content_index.png";

$scripts = "
	$('#menu li').removeClass('highlighted');
	$('#menu li.media').addClass('highlighted');
	";
include "template.php";

?>

