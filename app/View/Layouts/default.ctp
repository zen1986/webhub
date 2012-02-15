<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Zvaya</title>
    <meta name="description" content="Zeng Qiang's webhub">
    <meta name="author" content="Zeng Qiang">

   <?php echo $this->Html->css("bootstrap.css");?>
    <style type="text/css">
      body {
        padding-top: 60px;
      }
    </style>

   <?php echo $this->Html->css("bootstrap-responsive.css");?>
    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="img/favicon.ico">
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

      <!-- Main hero unit for a primary marketing message or call to action -->
<!--
      <div class="hero-unit">
        <h1>Zeng Qiang's Home Page</h1>
        <p></p>
        <p><a class="btn primary large">Learn more &raquo;</a></p>
      </div>

-->
      <div class="row">
      <?php echo $content_for_layout;?>
      </div>

      <footer>
        <p>&copy; zvaya.com 2012</p>
      </footer>

    </div> <!-- /container -->

  </body>
</html>
