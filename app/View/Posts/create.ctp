<?php
//set the submenu
//$menus = array(
//	'cancel'=> array('text'=>'cancel', 'link'=>array('action'=>'index', 'controller'=>'posts'))
//);
//echo $this->element('sub_menu', array('menus'=>$menus));
//
$ts = array();
foreach ($tags as $tag) {
	$tag = $tag['Tag'];
	$ts[$tag['id']] = $tag['tag'];
}


echo "<div id='post_create'>";
echo $this->Form->create('Post');
echo $this->Form->input('title');
echo $this->Form->input('body');
echo $this->Form->text('tags', array('disabled'=>true));
echo $this->Form->label('tags', 'Tags');
echo $this->Form->select('tags_select',$ts); 
echo "</br>";
echo $this->Form->button('Reset', array('type'=>'reset'));
echo $this->Form->end('Create');
echo "</div>";
?>
