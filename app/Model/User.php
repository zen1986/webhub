<?php

class User extends AppModel {
    var $useTable= 'cp_users';
	var $name = 'User';
	var $hasMany = 'Post';
}

?>
