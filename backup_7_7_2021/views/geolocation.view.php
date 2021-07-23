<?php declare(strict_types = 1);
 
/**
 * @var CView $this
 */

$this->addJsFile('multiselect.js');
$this->addJsFile('layout.mode.js');

$this->enableLayoutModes();
$web_layout_mode = $this->getLayoutMode();

$widget = (new CWidget())
	->setTitle(_('Geolocation Module'))
	->setWebLayoutMode($web_layout_mode)
	->setControls(
		(new CTag('nav', true, (new CList())->addItem(get_icon('kioskmode', ['mode' => $web_layout_mode]))))
			->setAttribute('aria-label', _('Content controls'))
	);

if ($web_layout_mode == ZBX_LAYOUT_NORMAL) {
	$widget->addItem((new CFilter((new CUrl('zabbix.php'))->setArgument('action', 'geolocation.view')))
		->setProfile('web.latest.filter')
		// ->setActiveTab($data['active_tab'])
		->addFormItem((new CVar('action', 'geolocation.view'))->removeId())
		->addFilterTab(_('Filter'), [
			(new CFormList())
				->addRow((new CLabel(_('Host groups'), 'filter_groupids__ms')),
					(new CMultiSelect([
						'name' => 'filter_groupids[]',
						'object_name' => 'hostGroup',
						'data' => $data['multiselect_hostgroup_data'],
						'popup' => [
							'parameters' => [
								'srctbl' => 'host_groups',
								'srcfld1' => 'groupid',
								'dstfrm' => 'zbx_filter',
								'dstfld1' => 'filter_groupids_',
								'real_hosts' => true,
								'enrich_parent_groups' => true
							]
						]
					]))->setWidth(ZBX_TEXTAREA_FILTER_STANDARD_WIDTH)
				)
				->addRow((new CLabel(_('Hosts'), 'filter_hostids__ms')),
					(new CMultiSelect([
						'name' => 'filter_hostids[]',
						'object_name' => 'hosts',
						'data' => $data['multiselect_host_data'],
						'popup' => [
							'filter_preselect_fields' => [
								'hostgroups' => 'filter_groupids_'
							],
							'parameters' => [
								'srctbl' => 'hosts',
								'srcfld1' => 'hostid',
								'dstfrm' => 'zbx_filter',
								'dstfld1' => 'filter_hostids_'
							]
						]
					]))->setWidth(ZBX_TEXTAREA_FILTER_STANDARD_WIDTH)
				)
		])
	);
}

// print_r($data['multiselect_host_data']);

// $widget->addItem(new CPartial('monitoring.latest.view.html', array_intersect_key($data, array_flip(['filter',
// 	'sort_field', 'sort_order', 'view_curl', 'paging', 'rows', 'hosts', 'applications', 'applications_size',
// 	'applications_index', 'items', 'history', 'collapsed_index', 'collapsed_all'
// ]))));

$widget->show();

// Initialize page refresh.
// (new CScriptTag('latest_page.start();'))
// 	->setOnDocumentReady()
// 	->show();


echo '<link rel="stylesheet" href="./modules/geolocation/views/js/leaflet.css"/>';
echo '<script src="./modules/geolocation/views/js/leaflet.js"></script>';

echo '<link rel="stylesheet" href="./modules/geolocation/views/js/markercluster/dist/MarkerCluster.css" />';
echo '<link rel="stylesheet" href="./modules/geolocation/views/js/markercluster/dist/MarkerCluster.Default.css" />';
echo '<script src="./modules/geolocation/views/js/markercluster/dist/leaflet.markercluster-src.js"></script>';

echo '<script type="text/javascript">';
echo 'var content = '.$data['hosts'].';';
echo 'var filterJson = '.$data['filterJson'].';';
echo '</script>';

echo "<div id='mapid'></div>";

echo '<script type="text/javascript" src="./modules/geolocation/views/js/geolocation.js"></script>';
