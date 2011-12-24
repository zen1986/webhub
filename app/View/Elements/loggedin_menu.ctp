<div id="menu">
	<div class="menu_item">
		<?php echo $this->Html->link('home', array('controller'=>'pages', 'action'=>'home'));	?>
	</div>
	<div class="menu_item">
		<?php echo $this->Html->link('posts', array('controller'=>'posts', 'action'=>'index'));	?>
	</div>
	<div class="menu_item">
		<?php echo $this->Html->link('photos', array('controller'=>'photos', 'action'=>'index'));	?>
	</div>
<?php if ($this->Session->read('Auth.User')): ?>
	<div class="menu_item">
		<?php echo $this->Html->link('logout', array('controller'=>'users', 'action'=>'logout'));	?>
	</div>
<?php endif;?>
</div>
