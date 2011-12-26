<?php 

if ($this->Session->read('Auth.User')) {
	//set the submenu
	$menus = array(
		'new'=> array('text'=>'new post', 'link'=>array('action'=>'create', 'controller'=>'posts')),
	);
	echo $this->element('sub_menu', array('menus'=>$menus));
}

foreach ($posts as $post) {
	$tags = $post['Posttag'];
	echo $this->Element('display_post', array('post'=>$post['Post'], 'tags'=>$tags));
}
?>
