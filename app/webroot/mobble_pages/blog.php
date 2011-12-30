<?php

$page = "blog";
$content_image = "img/content_index.png";

$scripts = "
	$('#menu li').removeClass('highlighted');
	$('#menu li.blog').addClass('highlighted');
	";

include "template.php";

?>


