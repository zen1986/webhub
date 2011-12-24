<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">

	<title>zvaya</title>
<?php echo $this->Html->css('home.css');?>	
<?php echo $this->Html->css('common.css');?>	
</head>
<body>

<?php
echo $this->Session->flash('auth');
echo $content_for_layout;

?>
</body>
</html>

