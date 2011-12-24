<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<?php echo $this->Html->css("loggedin.css");?>
	<?php echo $this->Html->css("common.css");?>

	<title>zvaya</title>
	<body>
			<div id="top">
<?php echo $this->element('loggedin_menu');?>
			</div>
			<div id="middle">
<?php echo $this->Session->flash('auth');?>
<?php echo $this->Session->flash();?>
			<div id="content">
				<?php echo $content_for_layout;?>
			</div>
			</div>
			<div id="bottom">
			</div>
	</body>
</head>
</html>
