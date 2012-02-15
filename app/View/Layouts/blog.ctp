<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Zvaya</title>
    <meta name="description" content="">
    <meta name="author" content="">

    <?php echo $this->Html->css("blog.css");?>
    <?php echo $this->Html->css("common.css");?>
    <?php echo $this->Html->css("bootstrap.css");?>
    <style type="text/css" >
        body {
            padding-top: 60px;
        }
        
    </style>
    <?php echo $this->Html->css("bootstrap-responsive.css");?>
    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="images/favicon.ico">
  </head>

  <body>

    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
		  <?php echo $this->Html->link('Webhub', '/', array('class'=>'brand'));?>
          <div id="nav-collapse">
              <ul class="nav">
                  <li<?php if ($this->params['controller']=="pages") echo " class=\"active\"";?>><?php echo $this->Html->link('Home', '/');?></li>
                  <li<?php if ($this->params['controller']=="posts") echo " class=\"active\"";?>><?php echo $this->Html->link('Blog', '/posts');?></li>
                  <li<?php if ($this->params['controller']=="photos") echo " class=\"active\"";?>><?php echo $this->Html->link('Photo', '/photos');?></li>
              </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="container">

      <div class="content">
        <div class="page-header">
          <!--<h1>Zvaya Blog<small>Programming Life!</small></h1>-->
          <h1>Programming Life!</h1>
        </div>
        <div class="row">
          <div class="span10">
		<?php echo $content_for_layout;?>
          </div>
          <div class="span4">
<!--
            <h3>Secondary content</h3>
-->
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; zvaya.com 2012</p>
      </footer>

    </div> <!-- /container -->

  </body>
</html>
