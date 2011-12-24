<?php 

if ($this->Session->read('Auth.User')) {
	//set the submenu
	$menus = array(
		'new'=> array('text'=>'new post', 'link'=>array('action'=>'create', 'controller'=>'posts')),
	);
	echo $this->element('sub_menu', array('menus'=>$menus));
}
echo "<div id='content'>";

foreach ($posts as $post) {
	echo "<div class='post'>";
	echo "<div class='post_title'>";
	echo $post['title'];
	echo "</div>";
	echo "<div class='post_body'>";
	echo nl2br($post['body']);
	echo "</div>";
	echo "<div class='post_signature'>";
	echo "<div>";
	echo 'Last modified on: '. $this->Time->nice($post['modified']);
	echo "</div>";
	if ($this->Session->read('Auth.User')) {
		echo "<div class='post_actions'>";
		echo "<div class='post_action'>";
		echo $this->Html->link('edit', array('action'=>'edit', $post['id']));
		echo "</div>";
		echo "<div class='post_action'>";
		echo $this->Html->link('delete', array('action'=>'delete', $post['id']));
		echo "</div>";
		echo "</div>";
	}
	
	echo "</div>";
	echo "</div>";
}
echo "</div>";
?>
