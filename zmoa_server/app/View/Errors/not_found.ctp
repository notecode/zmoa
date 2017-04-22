<div class="container">
	<div class="row">
		<column id="column-left" class="col-sm-3 hidden-xs">
		<?php echo $this->element('column_left'); ?>
		</column>
		<div id="content" class="col-sm-9">
			<ul class="breadcrumb">
				<?php foreach ($breadcrumbs as $breadcrumb) : ?>
				<li><a href="<?php echo $breadcrumb['href']; ?>"><?php echo $breadcrumb['text']; ?></a></li>
				<?php endforeach; ?>
			</ul>
			<h1><?php echo $heading_title; ?></h1>
			<p><?php echo $text_error; ?></p>
			<div class="buttons">
				<div class="pull-right"><a href="<?php echo BASE_PATH;?>" class="btn btn-primary"><?php echo __d('root', 'button_continue');?></a></div>
			</div>
			<?php echo $this->element('content_bottom'); ?>
		</div>
		<?php echo $this->element('column_right'); ?>
	</div>
</div>