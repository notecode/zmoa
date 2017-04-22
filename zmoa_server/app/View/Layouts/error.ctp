<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<?php if (isset($descriptions)):?>
		<meta name="description" content="<?php echo $descriptions; ?>" />
		<?php endif; ?>
		<?php if (isset($keywords)): ?>
		<meta name="keywords" content= "<?php echo $keywords; ?>" />
		<?php endif; ?>
		<title><?php echo $title;?></title>
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>js/font-awesome/css/font-awesome.min.css">
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>css/stylesheet.css">

		
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>css/carousel.css">
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>css/custom.css">
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>js/bootstrap/css/bootstrap.min.css">
		<link rel="stylesheet" href="<?php echo BASE_PATH;?>css/owl.carousel.css">

		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/jquery/jquery-2.1.1.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/bootstrap/js/bootstrap.min.js"></script>

		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/custom.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/jstree.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/carousel.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/megnor.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/jquery.custom.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/scrolltop.min.js"></script>
		<script type="text/javascript" src="<?php echo BASE_PATH;?>js/megnor/jquery.formalize.min.js"></script> 

		<script src="<?php echo BASE_PATH;?>js/common.js" type="text/javascript"></script>
		<script src="<?php echo BASE_PATH;?>js/jquery/owl-carousel/owl.carousel.js" type="text/javascript"></script>
	</head>
	<body class=" <?php echo $class;?> layout-2 left-col" >
		<?php echo $this->element('top');?>
		<?php echo $this->element('header');?>
		<?php echo $this->element('nav');?>
		<?php echo $this->fetch('content'); ?>
		<?php echo $this->element('sql_dump'); ?>
	</body>
</html>
