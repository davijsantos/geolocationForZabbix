<?php declare(strict_types = 1);
 
namespace Modules\Geolocation\Actions;
 
use CControllerResponseData;
use CControllerResponseFatal;
use CProfile;
use CUrl;
use CControllerLatest as CAction;
use API;

/**
 * Example module action.
 */
class GeolocationView extends CAction {
 
	/**
	 * Initialize action. Method called by Zabbix core.
	 *
	 * @return void
	 */
	public function init(): void {
		/**
		 * Disable SID (Sessoin ID) validation. Session ID validation should only be used for actions which involde data
		 * modification, such as update or delete actions. In such case Session ID must be presented in the URL, so that
		 * the URL would expire as soon as the session expired.
		 */
		$this->disableSIDvalidation();
	}
 
	/**
	 * Check if the user has permission to execute this action. Method called by Zabbix core.
	 * Execution stops if false is returned.
	 *
	 * @return bool
	 */

	protected function checkPermissions(): bool {
		$permit_user_types = [USER_TYPE_ZABBIX_ADMIN, USER_TYPE_SUPER_ADMIN];
 
		return in_array($this->getUserType(), $permit_user_types);
	}

	protected function checkInput(): bool {
	    $fields = [
	        'sort' =>                                               'in name,status',
	        'sortorder' =>                                  'in '.ZBX_SORT_UP.','.ZBX_SORT_DOWN,
	        'page' =>                                               'ge 1',
	        'filter_set' =>                                 'in 1',
	        'filter_rst' =>                                 'in 1',
	        'filter_name' =>                                'string',
	        'filter_groupids' =>                    'array_id',
			'filter_hostids' =>				'array_id',
	        'filter_ip' =>                                  'string',
	        'filter_dns' =>                                 'string',
	        'filter_port' =>                                'string',
	        'filter_status' =>                              'in -1,'.HOST_STATUS_MONITORED.','.HOST_STATUS_NOT_MONITORED,
	        'filter_evaltype' =>                    'in '.TAG_EVAL_TYPE_AND_OR.','.TAG_EVAL_TYPE_OR,
	        'filter_tags' =>                                'array',
	        'filter_severities' =>                  'array',
	        'filter_show_suppressed' =>             'in '.ZBX_PROBLEM_SUPPRESSED_FALSE.','.ZBX_PROBLEM_SUPPRESSED_TRUE,
	        'filter_maintenance_status' =>  'in '.HOST_MAINTENANCE_STATUS_OFF.','.HOST_MAINTENANCE_STATUS_ON
	    ];

	    $ret = $this->validateInput($fields);
	
	    // Validate tags filter.
	    if ($ret && $this->hasInput('filter_tags')) {
	        foreach ($this->getInput('filter_tags') as $filter_tag) {
	            if (count($filter_tag) != 3
	                || !array_key_exists('tag', $filter_tag) || !is_string($filter_tag['tag'])
	                || !array_key_exists('value', $filter_tag) || !is_string($filter_tag['value'])
	                || !array_key_exists('operator', $filter_tag) || !is_string($filter_tag['operator'])) {
	                    $ret = false;
	                    break;
	            }
	        }
	    }
	
	    // Validate severity checkbox filter.
	    if ($ret && $this->hasInput('filter_severities')) {
	        foreach ($this->getInput('filter_severities') as $severity) {
	            if (!in_array($severity, range(TRIGGER_SEVERITY_NOT_CLASSIFIED, TRIGGER_SEVERITY_COUNT - 1))) {
	                $ret = false;
	                break;
	            }
	        }
	    }

	    if (!$ret) {
	        $this->setResponse(new CControllerResponseFatal());
	    }

	    return $ret;
	}

	/**
	 * Prepare the response object for the view. Method called by Zabbix core.
	 *
	 * @return void
	 */
	protected function doAction(){	
		// filter
		if ($this->hasInput('filter_set')) {
			CProfile::updateArray('web.geolocation.filter.groupids', $this->getInput('filter_groupids', []),
				PROFILE_TYPE_ID
			);
			CProfile::updateArray('web.geolocation.filter.hostids', $this->getInput('filter_hostids', []), PROFILE_TYPE_ID);
		}
		elseif ($this->hasInput('filter_rst')) {
			CProfile::deleteIdx('web.geolocation.filter.groupids');
			CProfile::deleteIdx('web.geolocation.filter.hostids');
		}

		// Force-check "Show items without data" if there are no hosts selected.
		$filter_hostids = CProfile::getArray('web.geolocation.filter.hostids');
		$filter_show_without_data = $filter_hostids ? CProfile::get('web.geolocation.filter.show_without_data', 1) : 1;

		$filter = [
			'groupids' => CProfile::getArray('web.geolocation.filter.groupids'),
			'hostids' => $filter_hostids,
			'application' => CProfile::get('web.geolocation.filter.application', ''),
			'select' => CProfile::get('web.geolocation.filter.select', ''),
			'show_without_data' => $filter_show_without_data,
			'show_details' => CProfile::get('web.geolocation.filter.show_details', 0)
		];

		

		$sort_field = $this->getInput('sort', CProfile::get('web.geolocation.sort', 'name'));
		$sort_order = $this->getInput('sortorder', CProfile::get('web.geolocation.sortorder', ZBX_SORT_UP));

		// CProfile::update('web.geolocation.sort', $sort_field, PROFILE_TYPE_STR);
		// CProfile::update('web.geolocation.sortorder', $sort_order, PROFILE_TYPE_STR);

		$view_curl = (new CUrl('zabbix.php'))->setArgument('action', 'geolocation.view');

		// $refresh_curl = (new CUrl('zabbix.php'))
		// 	->setArgument('action', 'geolocation.view.refresh')
		// 	->setArgument('filter_groupids', $filter['groupids'])
		// 	->setArgument('filter_hostids', $filter['hostids'])
		// 	->setArgument('filter_application', $filter['application'])
		// 	->setArgument('filter_select', $filter['select'])
		// 	->setArgument('filter_show_without_data', $filter['show_without_data'] ? 1 : null)
		// 	->setArgument('filter_show_details', $filter['show_details'] ? 1 : null)
		// 	->setArgument('sort', $sort_field)
		// 	->setArgument('sortorder', $sort_order)
		// 	->setArgument('page', $this->hasInput('page') ? $this->getInput('page') : null);

		// data sort and pager
		$prepared_data = $this->prepareData($filter, $sort_field, $sort_order);

		// $paging = CPagerHelper::paginate(getRequest('page', 1), $prepared_data['rows'], ZBX_SORT_UP, $view_curl);

		// $this->extendData($prepared_data, $filter['show_without_data']);
		$this->addCollapsedDataFromProfile($prepared_data);

		//
		$responseArrayHosts = array();

		$hosts = API::Host()->get([
			"output" => "extend",
			"selectInventory" => [
				"location_lat",
				"location_lon"
			],
			"filter" => [
					"status" => "0"
			],
			"groupids" => $filter['groupids']
		]);

		$i = 0;

		foreach ($hosts as $key => $value) {
			$triggers = API::Trigger()->get([
				"output" => "extend",
				"filter" => [
					"value" => 1,
					"skipDependent" => 1,
					"status" => 0,
					"host" => $value['host']
				]
			]);

			if(!empty($triggers)){
				$responseArrayHosts[$i] = array(
					"hostid" => $value['hostid'],
					"host" => $value['host'],
					"name" => $value['name'],
					"problem" => 1,
					"maintenance" => $value['maintenance_status'],
					"lat" => isset($value['inventory']['location_lat']) ? $value['inventory']['location_lat'] : 0,
					"lon" => isset($value['inventory']['location_lon']) ? $value['inventory']['location_lon'] : 0
				);
			}else{
				$responseArrayHosts[$i] = array(
					"hostid" => $value['hostid'],
					"host" => $value['host'],
					"name" => $value['name'],
					"problem" => 0,
					"maintenance" => $value['maintenance_status'],
					"lat" => isset($value['inventory']['location_lat']) ? $value['inventory']['location_lat'] : 0,
					"lon" => isset($value['inventory']['location_lon']) ? $value['inventory']['location_lon'] : 0
				);
			}

			$i++;
		}

		// display
		$data = [
			'filter' => $filter,
			'sort_field' => $sort_field,
			'sort_order' => $sort_order,
			'view_curl' => $view_curl,
			// 'refresh_url' => $refresh_curl->getUrl(),
			// 'refresh_interval' => CWebUser::getRefresh() * 1000,
			'active_tab' => CProfile::get('web.geolocation.filter.active', 1),
			// 'paging' => $paging,
			'hosts' => json_encode($responseArrayHosts),
			'filterJson' => json_encode($filter)
		] + $prepared_data;

		// print_r($data);

		$response = new CControllerResponseData($data);
		$response->setTitle(_('Geolocation Module'));
		$this->setResponse($response);
	}
}
