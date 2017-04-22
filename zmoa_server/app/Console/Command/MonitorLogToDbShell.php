<?php
class MonitorLogToDbShell extends AppShell {
	private $weixin_instance = null;
	private $cur_time;
	public function main() {
		$ret = $this->_init();
		$this->_log_to_db( '/data/logs/monitor_logs/' . 'merge_monitorlog_2015_11_24.log');

	}
	private function _init() {
		$log_to_table = 'gym_' . date('Ym', strtotime('yesterday'));
		$tables = g('MonitorLog', 'Model')->query('show tables');
		foreach ($tables as $key => $table_arr) {
			foreach ($table_arr as  $table_name ) {
				$all_tables[] = $table_name;
			}
		}
		if ( !in_array($log_to_table, $all_tables) ){
			$sql = "CREATE TABLE IF NOT EXISTS `{$log_to_table}` (
				`id` int(11) unsigned NOT NULL auto_increment,
				`user` varchar(255) NOT NULL,
				`club_id` int(11) default NULL,
				`system` varchar(50) default NULL,
				`url` varchar(2048) default NULL,
				`reference` varchar(2048) default NULL,
				`controller` varchar(255) default NULL,
				`action` varchar(255) default NULL,
				`http_method` varchar(20) default NULL,
				`user_agent` varchar(255) default NULL,
				`ip` varchar(255) default NULL COMMENT 'client ip',
				`http_status` varchar(4) default NULL,
				`http_cookie` varchar(2048) default NULL,
				`post` longtext,
				`created` datetime NOT NULL,
				PRIMARY KEY  (`id`),
				KEY `idx_user` (`user`),
				KEY `idx_club_id` (`club_id`),
				KEY `idx_controller` (`controller`),
				KEY `idx_action` (`action`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ";
			g('MonitorLog', 'Model')->query( $sql);
		}
	}

	private function _log_to_db( $file_full_path ) {
		$handle = @fopen( $file_full_path, "r");
		$data = [];
		if ($handle) {
			while ( !feof($handle) ) {
				$line = fgets($handle);
				$data[] = $line;
			}
			fclose($handle);
		}
		g('MonitorLog', 'log')->save();
		foreach ($data as $key => $value) {
			$d = json_decode( $value, true );
		}
		debug($data);die;
	}
}