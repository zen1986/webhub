<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">

	<title>Mobble</title>	
	<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.9.0/build/reset/reset-min.css">
	<link rel="stylesheet" href="css/main.css" type="text/css" media="screen" charset="utf-8">
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
</head>

<body>
	<div id="center">
		<div id="top_content">
			<?php include "include/banner.php";?>
		</div>
		<div id="middle_content">
			<?php include "include/menu.php";?>	
			<div id="content-image">
				<img border="0" src=<?php echo $content_image;?> usemap="#content_map"/>
				<?php if ($page == "index"): ?>
				<map name="content_map">
					<area shape="rect" coords="635,105,844,176" href="#" alt="App Store"/>
					<area shape="rect" coords="635,189,844,257" href="#" alt="App Store"/>
				</map>
				<?php endif;?>
			</div>
			<?php if ($page == "theapp"): ?>
			<div id="app_demo">
				<?php echo $app_demo;?>
			</div>
			<?php endif;?>
		</div>
		<div id="bottom_content">
			<?php include "include/footer.php";?>	
		</div>
	</div>
	<?php if ($page == "index"): ?>
		<div id="background"></div>
	<?php else: ?>
		<div id="background_upper"></div>
		<div id="background_lower"></div>
	<?php endif;?>
</body>
</html>
