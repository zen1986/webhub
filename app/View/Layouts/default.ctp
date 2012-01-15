<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Zvaya</title>
    <meta name="description" content="Zeng Qiang's webhub">
    <meta name="author" content="Zeng Qiang">

    <!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le styles -->
    <?php echo $this->Html->css("bootstrap.css");?>
    <style type="text/css">
      body {
        padding-top: 60px;
      }
    </style>

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="images/favicon.ico">
    <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/apple-touch-icon-114x114.png">
  </head>

  <body>

    <div class="topbar">
      <div class="fill">
        <div class="container">
		  <?php echo $this->Html->link('Webhub', '/', array('class'=>'brand'));?>
          <ul class="nav">
            <li class="active"><?php echo $this->Html->link('Home', '/');?></li>
            <li><?php echo $this->Html->link('Blog', '/posts');?></li>
            <li><?php echo $this->Html->link('Photo', '/photos');?></li>
          </ul>
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
