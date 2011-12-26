<?php
foreach ($posts as $post) {
	$tags = $post['Posttag'];
	echo $this->Element('display_post', array('post'=>$post['Post'], 'tags'=>$tags));
}
?>
