<?php declare(strict_types = 1);
 
/**
 * @var CView $this
 */

$this->addJsFile('multiselect.js');
$this->addJsFile('layout.mode.js');

/**
 * Set the layout mode and other page attributes.
 */

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
	/**
	 * Add filter area with host groups and hosts options.
	 */
	$widget->addItem((new CFilter((new CUrl('zabbix.php'))->setArgument('action', 'geolocation.view')))
		->setProfile('web.latest.filter')
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

//Show the widget on screen.
$widget->show();


/**
 * Head HTML page. 
 * Leaflet links for CSS and JS scripts
 * Marker Cluster links for CSS and JS scripts. 
 * Leaflet Textpath links for CSS and JS scripts.
 * Leaflet Search links for CSS and JS scripts.
 */
echo '<link rel="stylesheet" href="./modules/geolocation/views/js/leaflet.css"/>';
echo '<script src="./modules/geolocation/views/js/leaflet.js"></script>';

echo '<link rel="stylesheet" href="./modules/geolocation/views/js/markercluster/dist/MarkerCluster.css" />';
echo '<link rel="stylesheet" href="./modules/geolocation/views/js/markercluster/dist/MarkerCluster.Default.css" />';
echo '<script src="./modules/geolocation/views/js/markercluster/dist/leaflet.markercluster-src.js"></script>';
echo '<script src="./modules/geolocation/views/js/leaflet-textpath/leaflet.textpath.js"></script>';

echo '<link rel="stylesheet" href="./modules/geolocation/views/js/leaflet-search-master/dist/leaflet-search.min.css" />';
echo '<script src="./modules/geolocation/views/js/leaflet-search-master/dist/leaflet-search.min.js"></script>';

echo '<link rel="stylesheet" href="./modules/geolocation/views/js/geolocation.css" />';
/**
 * Script for set json data with the geolocation information and, when it is set, the filter data.
 */

echo '<script type="text/javascript">';
echo 'var content = '.$data['hosts'].';';
echo 'var filterJson = '.$data['filterJson'].';';
echo '</script>';

//The div where the Open Street Map show the map.
echo "<div id='mapid'></div>";

//The JS script to show Open Street Map with the markers corresponding to hosts, based on data from Geolocation View Action.
echo '<script type="text/javascript" src="./modules/geolocation/views/js/geolocation.js"></script>';
