<?php
//set the submenu
//$menus = array(
//	'cancel'=> array('text'=>'cancel', 'link'=>array('action'=>'index', 'controller'=>'posts'))
//);
//echo $this->element('sub_menu', array('menus'=>$menus));

echo "<div id='content'>";
echo "<div id='post_create'>";
echo $this->Form->create('Post');
echo $this->Form->input('title');
echo $this->Form->input('body');
echo $this->Form->button('Reset', array('type'=>'reset'));
echo $this->Form->end('Create');
echo "</div>";
echo "</div>";
?>
