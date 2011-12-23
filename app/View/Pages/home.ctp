
<!--<h1>曾强的主页/Zeng Qiang's Home Page</h1>-->
<?php
echo $this->Html->link("project links", array("controller"=>"pages", "action"=>"links"));
echo "<br>";
echo $this->Html->link("login", array("controller"=>"pages", "action"=>"login"));

?>
