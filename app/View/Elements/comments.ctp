<?php 
/* need $pid  => post id*/
?>
<div id="comments">
    <?php echo $this->Form->create("Comment", array('type'=>'post', 'action'=>'add'));?>
        
    <p><label for="name">Name</label><input type="text" name="name" value="" ></p>
    <p><label for="email">email</label><input type="text" name="email" value="" ></p>
    <p><label for="website">website</label><input type="text" name="website" value="" ></p>
    <p><label for="comment">comment</label><input type="text" name="comment" value="" ></p>
    <input type="hidden" name="cp_post_id" value="<?php echo $data['Post']['id'];?>" ></p>
    <?php echo $this->Form->end('Submit');?>
</div>

<?php
$comments = $data['Comment'];

foreach ($comments as $c) {
    if (empty($c['website'])) 
        echo $c['name'];
    else 
        echo $this->Html->link($c['name'], $c['website']);
    echo " says:<br>";
    echo $c['comment']."<br>";
    echo $c['created']."<br>";
}

?>
