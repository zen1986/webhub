<?php

// take in menu items from viewlet

echo "<div id='submenu'>";
foreach ($menus as $menu) {
	echo "<div class='submenu_item'>";
	echo $this->Html->link($menu['text'], $menu['link']);
	echo "</div>";
}
echo "</div>";
?>
