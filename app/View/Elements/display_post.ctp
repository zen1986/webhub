<?php
echo "<div class='post'>";
echo "<div class='post_title'>";
echo $this->Html->link($post['title'], '/posts/view/'.$post['id']);
echo "</div>";
echo "<div class='post_body'>";
echo nl2br($post['body']);
echo "</div>";
echo "<div class='post_signature'>";
echo "<div>";
echo $this->Time->nice($post['created']);
echo "</div>";
if ($this->Session->read('Auth.User')) {
	echo "<div class='post_actions'>";
	echo "<div class='post_action'>";
	echo $this->Html->link('edit', array('action'=>'edit', $post['id']));
	echo "</div>";
	echo "<div class='post_action'>";
	echo $this->Html->link('delete', array('action'=>'delete', $post['id']));
	echo "</div>";
	echo "</div>";
}
if (isset($tags) && !empty($tags)) {
	echo "<span><strong>Tag: </strong></span>";	
	foreach ($tags as $tag) {
		echo "<span class='tagname'>";
		$tagname = $this->requestAction('/tags/tagName/'.$tag['tag_id']);
		echo $this->Html->link($tagname['Tag']['tagname'], '/posts/posttag/'.$tag['tag_id']);
		echo "</span> ";
	}
}
echo "</div>";
echo "</div>";
?>
