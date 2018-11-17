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

(function() {

    'use strict';

    /**
     * JobsHelper Class
     *
     * This class contains the methods that are used in the backend jobs page.
     *
     * @class JobsHelper
     */
    function JobsHelper() {
        this.filterResults = {};
    };

    /**
     * Binds the default event handlers of the backend jobs page.
     */
    JobsHelper.prototype.bindEventHandlers = function() {
        var instance = this;

        /**
         * Event: Filter Jobs Form "Submit"
         */
        $('#filter-jobs form').submit(function(event) {
            var key = $('#filter-jobs .key').val();
            $('#filter-jobs .selected').removeClass('selected');
            instance.resetForm();
            instance.filter(key);
            return false;
        });

        /**
         * Event: Filter Jobs Clear Button "Click"
         */
        $('#filter-jobs .clear').click(function() {
            $('#filter-jobs .key').val('');
            instance.filter('');
            instance.resetForm();
        });

        /**
         * Event: Filter Entry "Click"
         *
         * Display the job data of the selected row.
         */
        $(document).on('click', '.entry', function() {
            if ($('#filter-jobs .filter').prop('disabled')) {
                return; // Do nothing when user edits a job record.
            }

            var jobId = $(this).attr('data-id');
            var job = {};
            $.each(instance.filterResults, function(index, item) {
                if (item.id == jobId) {
                    job = item;
                    return false;
                }
            });

            instance.display(job);
            $('#filter-jobs .selected').removeClass('selected');
            $(this).addClass('selected');
            $('#edit-job, #delete-job').prop('disabled', false);

            console.log(job.smsSentDate);
            if (!job.smsSentDate) {
                $('#sms-notif, #finalise-job').prop('disabled', false);
            }
            else {
                $('#finalise-job').prop('disabled', false);
                $('#sms-notif').prop('disabled', true);
            }
                
        });

        /**
         * Event: Appointment Row "Click"
         *
         * Display appointment data of the selected row.
         */
        $(document).on('click', '.appointment-row', function() {
            $('#job-appointments .selected').removeClass('selected');
            $(this).addClass('selected');

            var jobId = $('#filter-jobs .selected').attr('data-id');
            var appointmentId = $(this).attr('data-id');
            var appointment = {};

            $.each(instance.filterResults, function(index, c) {
                if (c.id === jobId) {
                    $.each(c.appointments, function(index, a) {
                        if (a.id == appointmentId) {
                            appointment = a;
                            return false;
                        }
                    });
                    return false;
                }
            });

            instance.displayAppointment(appointment);
        });

        /**
         * Event: Add Job Button "Click"
         */
        $('#add-job').click(function() {
            instance.resetForm();
            $('#add-edit-delete-group').hide();
            $('#save-cancel-group').show();
            $('.record-details').find('input, textarea').prop('readonly', false);

            $('#filter-jobs button').prop('disabled', true);
            $('#filter-jobs .results').css('color', '#AAA');
        });

        /**
         * Event: Edit Job Button "Click"
         */
        $('#edit-job').click(function() {
            $('.record-details').find('input, textarea').prop('readonly', false);
            $('#add-edit-delete-group').hide();
            $('#save-cancel-group').show();

            $('#filter-jobs button').prop('disabled', true);
            $('#filter-jobs .results').css('color', '#AAA');
        });

        /**
         * Event: Cancel Job Add/Edit Operation Button "Click"
         */
        $('#cancel-job').click(function() {
            var id = $('#job-id').val();
            instance.resetForm();
            if (id != '') {
                instance.select(id, true);
            }
        });

        /**
         * Event: Save Add/Edit Job Operation "Click"
         */
        $('#save-job').click(function() {
            var job = {
                first_name: $('#first-name').val(),
                last_name: $('#last-name').val(),
                email: $('#email').val(),
                phone_number: $('#phone-number').val(),
                address: $('#address').val(),
                city: $('#city').val(),
                zip_code: $('#zip-code').val(),
                notes: $('#notes').val()
            };

            if ($('#job-id').val() != '') {
                job.id = $('#job-id').val();
            }

            if (!instance.validate(job)) return;

            instance.save(job);
            Backend.displayNotification(EALang['job_saved']);
        });

        /**
         * Event: Finalise Job notification
         */
        $('#finalise-job').click(function() {
            var payload = {
                customer_id: $('#customer-id').val(),
                job_id: $('#job-id').val()
            };

           instance.finalise_Job(payload); 

        });

        /**
         * Event: Send SMS notification
         */
        $('#sms-notif').click(function() {
            var payload = {
                customer_id: $('#customer-id').val(),
                job_id: $('#job-id').val()
            };

           instance.send_Sms(payload); 

        });

        /**
         * Event: Delete Job Button "Click"
         */
        $('#delete-job').click(function() {
            var jobId = $('#job-id').val();
            var messageBtns = {};

            messageBtns[EALang['delete']] = function() {
                instance.delete(jobId);
                $('#message_box').dialog('close');
            };

            messageBtns[EALang['cancel']] = function() {
                $('#message_box').dialog('close');
            };

            GeneralFunctions.displayMessageBox(EALang['delete_job'],
                    EALang['delete_record_prompt'], messageBtns);
        });
    };

    /**
     * Save a job record to the database (via ajax post).
     *
     * @param {Object} job Contains the job data.
     */
    JobsHelper.prototype.save = function(job) {
        var postUrl = GlobalVariables.baseUrl + '/index.php/backend_api/ajax_save_job';
        var postData = {
            csrfToken: GlobalVariables.csrfToken,
            job: JSON.stringify(job)
        };

        $.post(postUrl, postData, function(response) {
            if (!GeneralFunctions.handleAjaxExceptions(response)) {
                return;
            }

            Backend.displayNotification(EALang['job_saved']);
            this.resetForm();
            $('#filter-jobs .key').val('');
            this.filter('', response.id, true);
        }.bind(this), 'json').fail(GeneralFunctions.ajaxFailureHandler);
    };

    
    /**
     * Finalise Job
     *
     * @param {Object} payload contains job_id.
     */
    JobsHelper.prototype.finalise_Job = function(payload) {
        var postUrl = GlobalVariables.baseUrl + '/index.php/backend_api/ajax_finalise_job';
        var postData = {
            csrfToken: GlobalVariables.csrfToken,
            job_id: payload.job_id,
            customer_id: payload.customer_id
        };

        $.post(postUrl, postData, function(response) {
            if (!GeneralFunctions.handleAjaxExceptions(response)) {
                return;
            }

            Backend.displayNotification("Job finalised");
            this.resetForm();
            this.filter($('#filter-jobs .key').val());

        }.bind(this), 'json').fail(GeneralFunctions.ajaxFailureHandler);
    };


    
    
    /**
     * Send an sms notification to customer (via ajax post).
     *
     * @param {Object} payload contains customer_id and job_id.
     */
    JobsHelper.prototype.send_Sms = function(payload) {
        var postUrl = GlobalVariables.baseUrl + '/index.php/backend_api/ajax_notify_customer';
        var postData = {
            csrfToken: GlobalVariables.csrfToken,
            customer_id: payload.customer_id,
            job_id: payload.job_id
        };

        $.post(postUrl, postData, function(response) {
            if (!GeneralFunctions.handleAjaxExceptions(response)) {
                return;
            }

            Backend.displayNotification("SMS sent to Customer");
            $('#sms-notif').prop('disabled', true);

        }.bind(this), 'json').fail(GeneralFunctions.ajaxFailureHandler);
    };








    /**
     * Delete a job record from database.
     *
     * @param {Number} id Record id to be deleted.
     */
    JobsHelper.prototype.delete = function(id) {
        var postUrl = GlobalVariables.baseUrl + '/index.php/backend_api/ajax_delete_job';
        var postData = {
            csrfToken: GlobalVariables.csrfToken,
            job_id: id
        };

        $.post(postUrl, postData, function(response) {
            if (!GeneralFunctions.handleAjaxExceptions(response)) {
                return;
            }

            Backend.displayNotification(EALang['job_deleted']);
            this.resetForm();
            this.filter($('#filter-jobs .key').val());
        }.bind(this), 'json').fail(GeneralFunctions.ajaxFailureHandler);
    };

    /**
     * Validate job data before save (insert or update).
     *
     * @param {Object} job Contains the job data.
     */
    JobsHelper.prototype.validate = function(job) {
        $('#form-message').hide();
        $('.required').css('border', '');

        try {
            // Validate required fields.
            var missingRequired = false;

           // $('.required').each(function() {
           //     if ($(this).val() == '') {
           //         $(this).css('border', '2px solid red');
           //        missingRequired = true;
           //     }
           // });

            if (missingRequired) {
                throw EALang['fields_are_required'];
            }

            // Validate email address.
            //if (!GeneralFunctions.validateEmail($('#email').val())) {
            //    $('#email').css('border', '2px solid red');
            //    throw EALang['invalid_email'];
            //}

            return true;

        } catch(exc) {
            $('#form-message').text(exc).show();
            return false;
        }
    };

    /**
     * Bring the job form back to its initial state.
     */
    JobsHelper.prototype.resetForm = function() {
        $('.record-details').find('input, textarea').val('');
        $('.record-details').find('input, textarea').prop('readonly', true);

        $('#job-appointments').html('');
        $('#appointment-details').html('');
        $('#edit-job, #delete-job').prop('disabled', true);
        $('#sms-notif, #finalise-job').prop('disabled', true);
        $('#add-edit-delete-group').show();
        $('#save-cancel-group').hide();

        $('.record-details .required').css('border', '');
        $('.record-details #form-message').hide();

        $('#filter-jobs button').prop('disabled', false);
        $('#filter-jobs .selected').removeClass('selected');
        $('#filter-jobs .results').css('color', '');
    };

    /**
     * Display a job record into the form.
     *
     * @param {Object} job Contains the job record data.
     */
    JobsHelper.prototype.display = function(job) {
        $('#job-id').val(job.id);
        $('#customer-id').val(job.customer.id);
        $('#first-name').val(job.customer.first_name);
        $('#last-name').val(job.customer.last_name);
        $('#email').val(job.customer.email);
        $('#phone-number').val(job.customer.phone_number);
        $('#address').val(job.customer.address);
        $('#city').val(job.customer.city);
        $('#zip-code').val(job.customer.zip_code);
        $('#notes').val(job.notes);
        $('#cust_notes').val(job.customer.notes);
        $('#cust_name').html("Name: " + job.customer.first_name + " " + job.customer.last_name);
        $('#cust_address').html("Address: " + job.customer.address + " " + job.customer.city + " " + job.customer.zip_code);
        $('#cust_email').html("Email: " + job.customer.email);
        $('#cust_phone').html("Phone: " + job.customer.phone_number);

        $.each(job.appointments, function(index, appointment) {
            var start = GeneralFunctions.formatDate(Date.parse(appointment.start_datetime), GlobalVariables.dateFormat, true);
            var end = GeneralFunctions.formatDate(Date.parse(appointment.end_datetime), GlobalVariables.dateFormat, true);
            var html =
                    '<div class="appointment-row" data-id="' + appointment.id + '">' +
                        start + ' - ' + end + '<br>' +
                        appointment.service.name + ', ' +
                        appointment.provider.first_name + ' ' + appointment.provider.last_name +
                    '</div>';
            $('#job-appointments').append(html);
        });
        $('#job-appointments').jScrollPane({ mouseWheelSpeed: 70 });

        $('#appointment-details').empty();
    };

    /**
     * Filter job records.
     *
     * @param {String} key This key string is used to filter the job records.
     * @param {Number} selectId Optional, if set then after the filter operation the record with the given
     * ID will be selected (but not displayed).
     * @param {Boolean} display Optional (false), if true then the selected record will be displayed on the form.
     */
    JobsHelper.prototype.filter = function(key, selectId, display) {
        display = display || false;

        var postUrl = GlobalVariables.baseUrl + '/index.php/backend_api/ajax_filter_jobs';
        var postData = {
            csrfToken: GlobalVariables.csrfToken,
            key: key
        };

        $.post(postUrl, postData, function(response) {
            if (!GeneralFunctions.handleAjaxExceptions(response)) {
                return;
            }

            this.filterResults = response;

            $('#filter-jobs .results').data('jsp').destroy()
            $('#filter-jobs .results').html('');
            $.each(response, function(index, job) {
               var html = this.getFilterHtml(job);
               $('#filter-jobs .results').append(html);
           }.bind(this));
            $('#filter-jobs .results').jScrollPane({ mouseWheelSpeed: 70 });

            if (response.length == 0) {
                $('#filter-jobs .results').html('<em>' + EALang['no_records_found'] + '</em>');
            }

            if (selectId != undefined) {
                this.select(selectId, display);
            }

        }.bind(this), 'json').fail(GeneralFunctions.ajaxFailureHandler);
    };

    /**
     * Get the filter results row HTML code.
     *
     * @param {Object} job Contains the job data.
     *
     * @return {String} Returns the record HTML code.
     */
    JobsHelper.prototype.getFilterHtml = function(job) {
        var name = job.customer.first_name + ' ' + job.customer.last_name;
        var info = job.customer.email;
        var appointmentDate = $.datepicker.parseDateTime("yy-mm-dd", "HH:mm:ss", job.appointment.start_datetime);
        info = (job.customer.phone_number != '' && job.customer.phone_number != null)
                ? info + ', ' + job.customer.phone_number : info;

        var html =
                '<div class="entry" data-id="' + job.id + '">' +
                    '<strong>' +
                        name +
                    '</strong><br>' +
                    info +
                    '<br>' +
                    'Pickup Appt: ' + appointmentDate.toDateString() + ' ' + appointmentDate.getHours() + ':' + ('0'+appointmentDate.getMinutes()).slice(-2) +
                '</div><hr>';

        return html;
    };

    /**
     * Select a specific record from the current filter results.
     *
     * If the job id does not exist in the list then no record will be selected.
     *
     * @param {Number} id The record id to be selected from the filter results.
     * @param {Boolean} display Optional (false), if true then the method will display the record
     * on the form.
     */
    JobsHelper.prototype.select = function(id, display) {
        display = display || false;

        $('#filter-jobs .selected').removeClass('selected');

        $('#filter-jobs .entry').each(function() {
            if ($(this).attr('data-id') == id) {
                $(this).addClass('selected');
                return false;
            }
        });

        if (display) {
            $.each(this.filterResults, function(index, job) {
                if (job.id == id) {
                    this.display(job);
                    $('#edit-job, #delete-job').prop('disabled', false);
                    $('#sms-notif, #finalise-job').prop('disabled', false);
                    return false;
                }
            }.bind(this));
        }
    };

    /**
     * Display appointment details on jobs backend page.
     *
     * @param {Object} appointment Appointment data
     */
    JobsHelper.prototype.displayAppointment = function(appointment) {
        var start = GeneralFunctions.formatDate(Date.parse(appointment.start_datetime), GlobalVariables.dateFormat, true);
        var end = GeneralFunctions.formatDate(Date.parse(appointment.end_datetime), GlobalVariables.dateFormat, true);

        var html =
                '<div>' +
                    '<strong>' + appointment.service.name + '</strong><br>' +
                    appointment.provider.first_name + ' ' + appointment.provider.last_name + '<br>' +
                    start + ' - ' + end + '<br>' +
                '</div>';

        $('#appointment-details').html(html);
    };

    window.JobsHelper = JobsHelper;
})();
