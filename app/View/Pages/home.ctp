
<!--personal info-->
<div class='span-one-third'>
	<h3>About Me</h3>
	<dl>
		<dt>Occupation:</dt>
		<dd>Software Engineer</dd>
		<dt>Company:</dt>
		<dd>SSI Mobile Pte. Ltd</dd>
		<dt>Intersts:</dt>
		<dd>Programming, Running, Reading</dd>
	</dl>

</div>

<!--project related porfolio-->
<div class='span-one-third'>
	<h3> Project Management </h3>
	<div class='project'>
		<dl>
			<dt>iMobble</dt>
			<dd>
				<?php echo $this->Html->link("Project Page", array("controller"=>"pages", "action"=>"links"));?>
			</dd>
		</dl>
	</div>
</div>

<!--personal related -->
<div class='span-one-third'>
<h3> My Item and Apps</h3>
<ul>
<li>
	<?php echo $this->Html->link("Blog", array("controller"=>"posts", "action"=>"index"));?>
</li>
<li>
	<?php echo $this->Html->link("Photo", array("controller"=>"photos", "action"=>"index"));?>
</li>
</ul>

<?php echo $this->Html->link("login", array("controller"=>"users", "action"=>"login"));?>
</div>
