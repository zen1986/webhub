<?php
echo "<div id='content'>";
echo $this->Form->create('Post');
echo $this->Form->input('title');
echo $this->Form->input('body');
echo $this->Form->end('Submit');
echo "</div>";
?>
