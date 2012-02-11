<?php

class Tag extends AppModel {
    var $useTable= 'cp_tags';
	var $name = 'Tag';
	var $hasMany = 'Posttag';
}

?>
