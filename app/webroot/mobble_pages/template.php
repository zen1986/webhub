<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">

	<title>Mobble</title>	
	<link rel="stylesheet" href="css/main.css" type="text/css" media="screen" charset="utf-8">
</head>

<body>
	<div id="center">
		<?php include "include/banner.php";?>
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
		</div>
		<?php include "include/footer.php";?>	
	</div>
	<div id="background"></div>
</body>
</html>
