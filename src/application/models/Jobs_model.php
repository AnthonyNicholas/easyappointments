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
 * Jobs Model
 *
 * Modified by Adam Young and Anthony Nicholas 2017 for job type support in
 * easyappointments
 *
 * @package Models
 */
class Jobs_Model extends CI_Model {
    /**
     * Add a job record to the database.
     *
     * This method adds a job to the database. If the job
     * doesn't exists it is going to be inserted, otherwise the
     * record is going to be updated.
     *
     * @param array $job Associative array with the job's
     * data. Each key has the same name with the database fields.
     * @return int Returns the job id.
     */
    public function add($job) {
        // Validate the job data before doing anything.
        $this->validate($job);

        // :: CHECK IF JOB ALREADY EXIST (FROM EMAIL).
        if ($this->exists($job) && !isset($job['id'])) {
        	// Find the job id from the database.
        	$job['id'] = $this->find_record_id($job);
        }

        // :: INSERT OR UPDATE JOB RECORD
        if (!isset($job['id'])) {
            $job['id'] = $this->_insert($job);
        } else {
            $this->_update($job);
        }

        return $job['id'];
    }
    /**
     * Check if a particular job record already exists.
     *
     * This method checks whether the given job already exists in
     * the database. It doesn't search with the id, but with the following
     * fields: "email"
     *
     * @param array $job Associative array with the job's
     * data. Each key has the same name with the database fields.
     * @return bool Returns whether the record exists or not.
     */
    public function exists($job) {
        if (!isset($job['id'])) {
            throw new Exception('Job\'s id is not provided.');
        }

        // This method shouldn't depend on another method of this class.
        $num_rows = $this->db
                ->select('*')
                ->from('ea_jobs')
                ->where('id', $jobs['id'])
                ->get()->num_rows();

        return ($num_rows > 0) ? TRUE : FALSE;
    }

    /**
     * Insert a new job record to the database.
     *
     * @param array $job Associative array with the job's
     * data. Each key has the same name with the database fields.
     * @return int Returns the id of the new record.
     */
    protected function _insert($job) {
        // Before inserting the job we need to get the job's role id
        // from the database and assign it to the new record as a foreign key.
      
       /* 
       $job_role_id = $this->db
                ->select('id')
                ->from('ea_roles')
                ->where('slug', DB_SLUG_JOB)
                ->get()->row()->id;

        $job['id_roles'] = $job_role_id; 
        */

        if (!$this->db->insert('ea_jobs', $job)) {
            throw new Exception('Could not insert job into the database.');
        }

        return intval($this->db->insert_id());
    }

    /**
     * Update an existing job record in the database.
     *
     * The job data argument should already include the record
     * id in order to process the update operation.
     *
     * @param array $job Associative array with the job's
     * data. Each key has the same name with the database fields.
     * @return int Returns the updated record id.
     */
    protected function _update($job) {
        // Do not update empty string values.
        foreach ($job as $key => $value) {
            if ($value === '')
                unset($job[$key]);
        }

        $this->db->where('id', $job['id']);
        if (!$this->db->update('ea_jobs', $job)) {
            throw new Exception('Could not update job to the database.');
        }

        return intval($job['id']);
    }


    /**
     * Validate job data before the insert or update operation is executed.
     *
     * @param array $job Contains the job data.
     * @return bool Returns the validation result.
     */
    public function validate($job) {
        $this->load->helper('data_validation');

        // If a job id is provided, check whether the record
        // exist in the database.
                        
        $this->exists($job);
        
        return TRUE;
    }

    /**
     * Delete an existing job record from the database.
     *
     * @param numeric $job_id The record id to be deleted.
     * @return bool Returns the delete operation result.
     */
    public function delete($job_id) {
        if (!is_numeric($job_id)) {
            throw new Exception('Invalid argument type $job_id: ' . $job_id);
        }

        $num_rows = $this->db->get_where('ea_jobs', array('id' => $job_id))->num_rows();
        if ($num_rows == 0) {
            return FALSE;
        }

        return $this->db->delete('ea_jobs', array('id' => $job_id));
    }

    /**
     * Get a specific row from the appointments table.
     *
     * @param numeric $job_id The record's id to be returned.
     * @return array Returns an associative array with the selected
     * record's data. Each key has the same name as the database
     * field names.
     */
    public function get_row($job_id) {
        if (!is_numeric($job_id)) {
            throw new Exception('Invalid argument provided as $job_id : ' . $job_id);
        }
        return $this->db->get_where('ea_jobs', array('id' => $job_id))->row_array();
    }

    /**
     * Get a specific field value from the database.
     *
     * @param string $field_name The field name of the value to be
     * returned.
     * @param int $job_id The selected record's id.
     * @return string Returns the records value from the database.
     */
    public function get_value($field_name, $job_id) {
        if (!is_numeric($job_id)) {
            throw new Exception('Invalid argument provided as $job_id: '
                    . $job_id);
        }

        if (!is_string($field_name)) {
            throw new Exception('$field_name argument is not a string: '
                    . $field_name);
        }

        if ($this->db->get_where('ea_jobs', array('id' => $job_id))->num_rows() == 0) {
            throw new Exception('The record with the $job_id argument '
                    . 'does not exist in the database: ' . $job_id);
        }

        $row_data = $this->db->get_where('ea_jobs', array('id' => $job_id)
                )->row_array();
        if (!isset($row_data[$field_name])) {
            throw new Exception('The given $field_name argument does not'
                    . 'exist in the database: ' . $field_name);
        }

        $job = $this->db->get_where('ea_jobs', array('id' => $job_id))->row_array();

        return $job[$field_name];
    }

    /**
     * Get all, or specific records from appointment's table.
     *
     * @example $this->Model->getBatch('id = ' . $recordId);
     *
     * @param string $whereClause (OPTIONAL) The WHERE clause of
     * the query to be executed. DO NOT INCLUDE 'WHERE' KEYWORD.
     * @return array Returns the rows from the database.
     */
    
    public function get_batch($where_clause = '') {
        return $this->db->get('ea_users')->result_array();
    }
    

    /**
     * Get the jobs role id from the database.
     *
     * @return int Returns the role id for the job records.
     */
    
    public function get_jobs_role_id() {
        return $this->db->get_where('ea_roles', array('slug' => DB_SLUG_JOB))->row()->id;
    }
}

/* End of file Jobs_model.php */
/* Location: ./application/models/Jobs_model.php */
