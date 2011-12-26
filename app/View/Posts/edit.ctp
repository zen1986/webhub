<?php
echo "<div id='post_create'>";
echo $this->Form->create('Post');
echo $this->Form->input('title');
echo $this->Form->input('body');
echo $this->Form->label('tags');
echo $this->Form->text('tags');
echo "<div>";
echo $this->Form->button('Reset', array('type'=>'reset'));
echo $this->Form->end('Create');
echo "</div>";
echo "</div>";
?>
