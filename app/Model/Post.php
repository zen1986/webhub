<?php

class Post extends AppModel {
    var $useTable = 'cp_posts';
	var $name='Post';
    var $belongsTo=array(
        'User'=>array(
            'className'=>'cp_users',
            'foreignKey'=>'cp_user_id'
        )
    );
	var $hasMany=array('Posttag', 'Comment');
}
?>
