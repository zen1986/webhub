<?php
echo $this->Element('display_post', array('post'=>$post_ret['Post'], 'tags'=>$post_ret['Posttag']));
echo $this->Element('comments', array('data'=>$post_ret));
?>
