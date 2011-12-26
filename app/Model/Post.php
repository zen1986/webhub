<?php

class Post extends AppModel {
	var $name='Post';
	var $belongsTo='User';
	var $hasMany='Posttag';
}
?>
