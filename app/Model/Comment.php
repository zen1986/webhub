<?php
class Comment extends AppModel {
    var $useTable = "cp_comments";
    var $name = "Comment";
    var $belongsTo = "Post";

    var $validate = array(
        'email' => 'email', 
        'name' => 'notEmpty',
        'comment' => 'notEmpty',
        );
}
?>
