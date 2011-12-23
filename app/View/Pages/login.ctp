<?php
echo $this->Form->create("User", array("action"=>"login"));
echo $this->Form->input("username", array("label"=>"User Name"));
echo $this->Form->input("password", array("label"=>"Password"));
echo $this->Form->end("login");
?>
