<?php

class Posttag extends AppModel {
    var $useTable= 'cp_posttags';
	var $name = 'Posttag';
    var $belongsTo=array(
        'Post'=>array(
            'className'=>'cp_posts',
            'foreignKey'=>'cp_post_id',
        ),
        'Tag'=>array(
            'className'=>'cp_tags',
            'foreignKey'=>'cp_tag_id'
        )
    );
}

?>
