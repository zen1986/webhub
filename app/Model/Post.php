<?php

class Post extends AppModel {
    var $useTable = 'cp_posts';
	var $name='Post';
	var $belongsTo='User';
	var $hasMany=array('Posttag', 'Comment');
}
?>
