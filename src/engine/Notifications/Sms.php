<?php 

/* ----------------------------------------------------------------------------
 * Easy!Appointments - Open Source Web Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) 2013 - 2016, Alex Tselegidis
 * @license     http://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        http://easyappointments.org
 * @since       v1.2.0
 * ---------------------------------------------------------------------------- */

namespace EA\Engine\Notifications; 

use \EA\Engine\Types\Text;
use \EA\Engine\Types\NonEmptyText;
use \EA\Engine\Types\Url;

/**
 * SMS Notifications Class
 *
 * This library handles all the notification sms deliveries on the system. 
 *
 * Important: The sms configuration settings are located at: /application/config/sms.php
 */
class Sms {
    /**
     * Framework Instance
     *
     * @var CI_Controller
     */
    protected $framework;

    /**
     * Contains sms configuration.
     *
     * @var array
     */
    protected $config;

    /**
     * Class Constructor
     *
     * @param \CI_Controller $framework
     * @param array $config Contains the sms configuration to be used.
     */
    public function __construct(\CI_Controller $framework, array $config) {
        $this->framework = $framework;
        $this->config = $config;
    }

    /**
     * Replace the sms template variables.
     *
     * This method finds and replaces the html variables of an sms template. It is used to 
     * generate dynamic HTML smss that are send as notifications to the system users.
     *
     * @param array $replaceArray Array that contains the variables to be replaced.
     * @param string $templateHtml The sms template HTML.
     *
     * @return string Returns the new sms html that contain the variables of the $replaceArray.
     */
    protected function _replaceTemplateVariables(array $replaceArray, $templateHtml) {
        foreach($replaceArray as $name => $value) {
            $templateHtml = str_replace($name, $value, $templateHtml);
        }

        return $templateHtml;
    }

    /**
     * Send an sms with the appointment details.
     *
     * This sms template also needs an sms title and an sms text in order to complete
     * the appointment details.
     *
     * @param array $appointment Contains the appointment data.
     * @param array $provider Contains the provider data.
     * @param array $service Contains the service data.
     * @param array $customer Contains the customer data.
     * @param array $company Contains settings of the company. By the time the
     * "company_name", "company_link" and "company_sms" values are required in the array.
     * @param \EA\Engine\Types\Text $title The sms title may vary depending the receiver.
     * @param \EA\Engine\Types\Text $message The sms message may vary depending the receiver.
     * @param \EA\Engine\Types\Url $appointmentLink This link is going to enable the receiver to make changes
     * to the appointment record.
     * @param \EA\Engine\Types\Email $recipientEmail The recipient sms address.
     */
    public function sendNotification(array $customer, Text $messageText) {

        // https://twilio.github.io/twilio-php/
        $texter = new \Twilio\Rest\Client($this->config['twilio_sid'], $this->config['twilio_token']);
        $message = $texter->messages->create(
            $customer['phone_number'], // we replace with customer number
            array(
                'from' => '+61451562962',
                'body' => $messageText->get()
            )
        );
        
        // if no id returned
        if (!$message->sid > 0) {
            throw new \RuntimeException('SMS could not been sent. Error (Line ' . __LINE__ . '): ' 
                    . $message->sid);
        }
    }

}
