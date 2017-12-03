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

 window.BackendJobs = window.BackendJobs || {};

/**
 * Backend Jobs
 *
 * Backend Jobs javascript namespace. Contains the main functionality of the backend jobs
 * page. If you need to use this namespace in a different page, do not bind the default event handlers
 * during initialization.
 *
 * @module BackendJobs
 */
(function(exports) {

    'use strict';

    /**
     * The page helper contains methods that implement each record type functionality
     * (for now there is only the JobsHelper).
     *
     * @type {Object}
     */
    var helper = {};

    /**
     * This method initializes the backend jobs page. If you use this namespace
     * in a different page do not use this method.
     *
     * @param {Boolean} defaultEventHandlers Optional (false), whether to bind the default
     * event handlers or not.
     */
    exports.initialize = function(defaultEventHandlers) {
        defaultEventHandlers = defaultEventHandlers || false;

        helper = new JobsHelper();
        helper.resetForm();
        helper.filter('');

        $('#filter-jobs .results').jScrollPane();

        if (defaultEventHandlers) {
           _bindEventHandlers();
        }
    };

    /**
     * Default event handlers declaration for backend jobs page.
     */
    function _bindEventHandlers() {
        helper.bindEventHandlers();
    }

})(window.BackendJobs);
