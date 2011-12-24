<?php

// take in menu items from viewlet

// some compulsory items
$c = array(
	'tags'=> array('text'=>'tags', 'link'=>array('action'=>'index', 'controller'=>'tags')),
);

if (is_array($menus)) {
	$menus = array_merge($menus, $c);
}

echo "<div id='submenu'>";
foreach ($menus as $menu) {
	echo "<div class='submenu_item'>";
	echo $this->Html->link($menu['text'], $menu['link']);
	echo "</div>";
}
echo "</div>";
?>
