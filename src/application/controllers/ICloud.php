<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * Easy!Appointments - Open Source Web Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) 2013 - 2016, Alex Tselegidis
 * @license     http://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        http://easyappointments.org
 * @since       v1.0.0
 * ---------------------------------------------------------------------------- */

/**
 * iCloud Controller
 *
 * This controller handles the iCloud Calendar synchronization operations.
 *
 * @package Controllers
 */
class ICloud extends CI_Controller {
	/**
	 * Class Constructor
	 */
	public function __construct() {
		parent::__construct();
	}

    /**
     * Complete synchronization of appointments between ICloud Calendar and Easy!Appointments.
     *
     * This method will completely sync the appointments of a provider with their iCloud Calendar. 
     *
     * @param numeric $provider_id Provider record to be synced.
     */
    public function sync($provider_id = NULL) {
        try {
            // The user must be logged in.
            $this->load->library('session');
            if ($this->session->userdata('user_id') == FALSE) return;

            if ($provider_id === NULL) {
                throw new Exception('Provider id not specified.');
            }

            $this->load->model('appointments_model');
            $this->load->model('providers_model');
            $this->load->model('services_model');
            $this->load->model('customers_model');
            $this->load->model('settings_model');

            $provider = $this->providers_model->get_row($provider_id);

            // Fetch provider's appointments that belong to the sync time period.
            $sync_past_days = $this->providers_model->get_setting('sync_past_days', $provider['id']);
            $sync_future_days = $this->providers_model->get_setting('sync_future_days', $provider['id']);
            $start = strtotime('-' . $sync_past_days . ' days', strtotime(date('Y-m-d')));
            $end = strtotime('+' . $sync_future_days . ' days', strtotime(date('Y-m-d')));

            $where_clause = array(
                'start_datetime >=' => date('Y-m-d H:i:s', $start),
                'end_datetime <=' => date('Y-m-d H:i:s', $end),
                'id_users_provider' => $provider['id']
            );

            $appointments = $this->appointments_model->get_batch($where_clause);

            $company_settings = array(
                'company_name' => $this->settings_model->get_setting('company_name'),
                'company_link' => $this->settings_model->get_setting('company_link'),
                'company_email' => $this->settings_model->get_setting('company_email')
            );

         
            foreach($appointments as $appointment) {
                if ($appointment['is_unavailable'] == FALSE) {
                    $service = $this->services_model->get_row($appointment['id_services']);
                    $customer = $this->customers_model->get_row($appointment['id_users_customer']);
                } else {
                    $service = NULL;
                    $customer = NULL;
                }

            // Create iCloud feed.

		// the iCal date format. Note the Z on the end indicates a UTC timestamp.
    		define('DATE_ICAL', 'Ymd\THis\Z');

		// Note: for ical format the max line length is 75 chars. New line is \\n


 		$output = "BEGIN:VCALENDAR
            		METHOD:PUBLISH
                        VERSION:2.0
                        PRODID:-//".$company_settings['company_name']."//Pickup Time//EN\n";

                // loop over events
                foreach ($appointments as $appointment){
               		$output .=
                         	"BEGIN:VEVENT
                         	SUMMARY: 'Summary'
                         	UID:".$appointment['id']."
                         	STATUS:'None' 
                         	DTSTART:" . date(DATE_ICAL, strtotime($appointment['start_datetime'])) . "
                         	DTEND:" . date(DATE_ICAL, strtotime($appointment['end_datetime'])) . "
                         	LAST-MODIFIED:" . date(DATE_ICAL, strtotime("now")." 
                         	LOCATION: 'None'
                         	END:VEVENT\n";
               		};

                         // close calendar
                         $output .= "END:VCALENDAR";

                         echo $output;
		
		// Write iCal to file
		$file = 'iCalendarLog.txt';
		$current = file_get_contents($file);
		$current .= "\n\n".$output;
		file_put_contents($file, $current);
	
                } 
            }
            echo json_encode(AJAX_SUCCESS);

        } catch(Exception $exc) {
            echo json_encode(array(
                'exceptions' => array(exceptionToJavaScript($exc))
            ));
        }
    }
}

/* End of file ICloud.php */
/* Location: ./application/controllers/ICloud.php */
