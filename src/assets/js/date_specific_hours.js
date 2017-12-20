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
     * Class DateSpecificHours
     *
     * Contains the date specific hours functionality. The date specific hours DOM elements must be same
     * in every page this class is used.
     *
     * @class DateSpecificHours
     */
    var DateSpecificHours = function() {
        /**
         * This flag is used when trying to cancel row editing. It is
         * true only whenever the user presses the cancel button.
         *
         * @type {Boolean}
         */
        this.enableCancel = false;

        /**
         * This flag determines whether the jeditables are allowed to submit. It is
         * true only whenever the user presses the save button.
         *
         * @type {Boolean}
         */
        this.enableSubmit = false;

    };

    /**
     * Setup the dom elements of a given date specific hours.
     *
     * @param {Object} workingPlan Contains the working hours and breaks for each day of the week.
     */
    DateSpecificHours.prototype.setup = function(dateSpecific) {
        $.each(dateSpecific, function(index, dateRange) {
            // Find the prac name of each
            var planProvId;
            var planProv;
            var planStartData;
            var planEndData;
            var planStart;
            var planEnd;

            for (let pr of GlobalVariables.providers) {
                if (pr['id'] == dateRange['plan_prov_id']) {
                    planProvId = pr['id'];
                    planProv = pr['first_name'] + ' ' + pr['last_name'];
                    break;
                }
                // If we didnt find one, return
            }

            // Make sure our dates are valid
            planStartData = dateRange.start;
            planEndData = dateRange.end;
            planStart = Date.parse(dateRange.start);
            planEnd = Date.parse(dateRange.end);
            if ( planStart == null || planEnd == null )
                return;

            // Add the date range to table
            var tr =
                    '<tr>' +
                        '<td class="date-specific-working-plan editable" data-prov-id="' +
                            planProvId +'">' +
                        planProv +
                        '</td>' +
                        '<td class="date-specific-start editable" data-date="' +
                            planStartData +'">' + 
                            GeneralFunctions.formatDate(planStart, GlobalVariables.dateFormat, false) +
                        '</td>' +
                        '<td class="date-specific-end editable" data-date="' +
                            planEndData +'">' +
                            GeneralFunctions.formatDate(planEnd, GlobalVariables.dateFormat, false) +
                        '</td>' +
                        '<td>' +
                            '<button type="button" class="btn btn-default btn-sm edit-date-specific-hours" title="' + EALang['edit'] + '">' +
                                '<span class="glyphicon glyphicon-pencil"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm delete-date-specific-hours" title="' + EALang['delete'] + '">' +
                                '<span class="glyphicon glyphicon-remove"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm save-date-specific-hours hidden" title="' + EALang['save'] + '">' +
                                '<span class="glyphicon glyphicon-ok"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm cancel-date-specific-hours hidden" title="' + EALang['cancel'] + '">' +
                                '<span class="glyphicon glyphicon-ban-circle"></span>' +
                            '</button>' +
                        '</td>' +
                    '</tr>';
            $('.date-specific-hours tbody').append(tr);
        }.bind(this));

        // Make break cells editable.
        this.editableWorkingPlan($('.date-specific-hours .date-specific-working-plan'));
        this.editableDateRange($('.date-specific-hours').find('.date-specific-start, .date-specific-end'));
    };

    /**
     * Enable selection of working plan.
     *
     * @param {Object} $selector The jquery selector ready for use.
     */
    DateSpecificHours.prototype.editableWorkingPlan = function($selector) {
        var workingHours = {};
        for (let pr of GlobalVariables.providers) {
            if( pr['email'].startsWith("_") ) {
                workingHours[pr['id']] = pr['first_name'] + ' ' + pr['last_name'];
            }
        };

        $selector.editable(function(value, settings) {
            return workingHours[value];
        }, {
            type: 'select',
            data: workingHours,
            event: 'edit',
            height: '30px',
            submit: '<button type="button" class="hidden submit-editable">Submit</button>',
            cancel: '<button type="button" class="hidden cancel-editable">Cancel</button>',
            onblur: 'ignore',
            onreset: function(settings, td) {
                if (!this.enableCancel) {
                    return false; // disable ESC button
                }
            }.bind(this),
            onsubmit: function(settings, td) {
                if (!this.enableSubmit) {
                    return false; // disable Enter button
                }
            }.bind(this)
        });
    };

    /**
     * Enable editable date range.
     *
     * This method makes editable the date range cells.
     *
     * @param {Object} $selector The jquery selector ready for use.
     */
    DateSpecificHours.prototype.editableDateRange = function($selector) {
        $selector.editable(function(value, settings) {
            // Do not return the value because the user needs to press the "Save" button.
            return value;
        }, {
            event: 'edit',
            height: '25px',
            submit: '<button type="button" class="hidden submit-editable">Submit</button>',
            cancel: '<button type="button" class="hidden cancel-editable">Cancel</button>',
            onblur: 'ignore',
            onreset: function(settings, td) {
                if (!this.enableCancel) {
                    return false; // disable ESC button
                }
            }.bind(this),
            onsubmit: function(settings, td) {
                if (!this.enableSubmit) {
                    return false; // disable Enter button
                }
            }.bind(this)
        });
    };

    /**
     * Binds the event handlers for the date specific hours dom elements.
     */
    DateSpecificHours.prototype.bindEventHandlers = function() {
        /**
         * Event: Add Date Range Button "Click"
         *
         * A new row is added on the table and the user can enter the new date range
         * data. After that he can either press the save or cancel button.
         */
        $('.add-date-specific-hours').click(function() {
            var tr =
                    '<tr>' +
                        '<td class="date-specific-working-plan editable">' + EALang['monday'] + '</td>' +
                        '<td class="date-specific-start editable"></td>' +
                        '<td class="date-specific-end editable"></td>' +
                        '<td>' +
                            '<button type="button" class="btn btn-default btn-sm edit-date-specific-hours" title="' + EALang['edit'] + '">' +
                                '<span class="glyphicon glyphicon-pencil"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm delete-date-specific-hours" title="' + EALang['delete'] + '">' +
                                '<span class="glyphicon glyphicon-remove"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm save-date-specific-hours hidden" title="' + EALang['save'] + '">' +
                                '<span class="glyphicon glyphicon-ok"></span>' +
                            '</button>' +
                            '<button type="button" class="btn btn-default btn-sm cancel-date-specific-hours hidden" title="' + EALang['cancel'] + '">' +
                                '<span class="glyphicon glyphicon-ban-circle"></span>' +
                            '</button>' +
                        '</td>' +
                    '</tr>';
            $('.date-specific-hours').prepend(tr);

            // Bind editable and event handlers.
            tr = $('.date-specific-hours tr')[1];
        this.editableWorkingPlan($('.date-specific-hours .date-specific-working-plan'));
        this.editableDateRange($('.date-specific-hours').find('.date-specific-start, .date-specific-end'));
            this.editableWorkingPlan($(tr).find('.date-specific-working-plan'));
            this.editableDateRange($(tr).find('.date-specific-start, .date-specific-end'));
            $(tr).find('.edit-date-specific-hours').trigger('click');
            $('.add-date-specific-hours').prop('disabled', true);
        }.bind(this));

        /**
         * Event: Edit Break Button "Click"
         *
         * Enables the row editing for the "Breaks" table rows.
         */
        $(document).on('click', '.edit-date-specific-hours', function() {
            // Reset previous editable tds
            var $previousEdt = $(this).closest('table').find('.editable').get();
            $.each($previousEdt, function(index, editable) {
                if (editable.reset !== undefined) {
                    editable.reset();
                }
            });

            // Make all cells in current row editable.
            $(this).parent().parent().children().trigger('edit');
            var dateFormat;
            switch(GlobalVariables.dateFormat) {
                case 'DMY':
                    dateFormat = 'dd/mm/yy';
                    break;

                case 'MDY':
                    dateFormat = 'mm/dd/yy';
                    break;

                case 'YMD':
                    dateFormat = 'yy/mm/dd';
                    break;

                default:
                    throw new Error('Invalid date format setting provided!', GlobalVariables.dateFormat);
            }
            $(this).parent().parent().find('.date-specific-start input, .date-specific-end input').datepicker({
                defaultDate: new Date(),
                dateFormat: dateFormat
            });
            $(this).parent().parent().find('.date-specific-working-plan select').focus();

            // Show save - cancel buttons.
            $(this).closest('table').find('.edit-date-specific-hours, .delete-date-specific-hours').addClass('hidden');
            $(this).parent().find('.save-date-specific-hours, .cancel-date-specific-hours').removeClass('hidden');

            $('.add-date-specific-hours').prop('disabled', true);
        });

        /**
         * Event: Delete Break Button "Click"
         *
         * Removes the current line from the "Breaks" table.
         */
        $(document).on('click', '.delete-date-specific-hours', function() {
           $(this).parent().parent().remove();
        });

        /**
         * Event: Cancel Break Button "Click"
         *
         * Bring the ".breaks" table back to its initial state.
         *
         * @param {jQuery.Event} e
         */
        $(document).on('click', '.cancel-date-specific-hours', function(e) {
            var element = e.target;
            var $modifiedRow = $(element).closest('tr');
            this.enableCancel = true;
            $modifiedRow.find('.cancel-editable').trigger('click');
            this.enableCancel = false;

            $(element).closest('table').find('.edit-date-specific-hours, .delete-date-specific-hours').removeClass('hidden');
            $modifiedRow.find('.save-date-specific-hours, .cancel-date-specific-hours').addClass('hidden');
            $('.add-date-specific-hours').prop('disabled', false);
        }.bind(this));

        /**
         * Event: Save Break Button "Click"
         *
         * Save the editable values and restore the table to its initial state.
         *
         * @param {jQuery.Event} e
         */
        $(document).on('click', '.save-date-specific-hours', function(e) {
            // Break's start time must always be prior to break's end.
            var element = e.target,
                $modifiedRow = $(element).closest('tr'),
                planId = $modifiedRow.find('.date-specific-working-plan select').val(),
                start = $modifiedRow.find('.date-specific-start input').datepicker('getDate'),
                end = $modifiedRow.find('.date-specific-end input').datepicker('getDate');

            if (start == null)
                return;

            if (end == null || start > end) {
                $modifiedRow.find('.date-specific-end input').datepicker('setDate',start);
                end = $modifiedRow.find('.date-specific-end input').datepicker('getDate');
            }

            this.enableSubmit = true;
            $modifiedRow.find('.editable .submit-editable').trigger('click');
            this.enableSubmit = false;

            // Add standard date format to selector data attr
            $modifiedRow.find('.date-specific-working-plan').data('prov-id', planId);
            $modifiedRow.find('.date-specific-start').data('date', start.toString('yyyy-MM-dd'));
            $modifiedRow.find('.date-specific-end').data('date', end.toString('yyyy-MM-dd'));

            $modifiedRow.find('.save-date-specific-hours, .cancel-date-specific-hours').addClass('hidden');
            $(element).closest('table').find('.edit-date-specific-hours, .delete-date-specific-hours').removeClass('hidden');
            $('.add-date-specific-hours').prop('disabled', false);
        }.bind(this));
    };

    /**
     * Get the date specific hours settings.
     *
     * @return {Object} Returns the date specific hours settings object.
     */
    DateSpecificHours.prototype.get = function() {
        var dateSpecific = [];
        $('.date-specific-hours tbody tr').each(function(index, tr) {
            var workingPlan = $(tr).find('.date-specific-working-plan').data('prov-id');
            var start = $(tr).find('.date-specific-start').data('date'),
                end = $(tr).find('.date-specific-end').data('date');

            dateSpecific.push({
                'plan_prov_id': workingPlan,
                'start': start,
                'end': end
            });

        }.bind(this));

        return dateSpecific;
    };

    /**
     * Enables or disables the timepicker functionality from the date specific hours input text fields.
     *
     * @param {Boolean} disabled (OPTIONAL = false) If true then the timepickers will be disabled.
     */
    DateSpecificHours.prototype.timepickers = function(disabled) {
        disabled = disabled || false;

        if (disabled == false) {

            // Set timepickers where needed.
            var dateFormat;
            switch(GlobalVariables.dateFormat) {
                case 'DMY':
                    dateFormat = 'dd/mm/yy';
                    break;

                case 'MDY':
                    dateFormat = 'mm/dd/yy';
                    break;

                case 'YMD':
                    dateFormat = 'yy/mm/dd';
                    break;

                default:
                    throw new Error('Invalid date format setting provided!', GlobalVariables.dateFormat);
            }
            $('.date-specific-hours input[type="text"]').datepicker({
				defaultDate: new Date(),
				dateFormat: dateFormat,

                onSelect: function(datetime, inst) {
                    // Start time must be earlier than end time.
                    var start = Date.parse($(this).parent().parent().find('.work-start').val()),
                        end = Date.parse($(this).parent().parent().find('.work-end').val());

                    if (start > end) {
                        $(this).parent().parent().find('.work-end').val(start.addHours(1).toString('HH:mm'));
                    }
                }
            });
        } else {
            $('.date-specific-hours input').datepicker('destroy');
        }
    };

    /**
     * Reset the current plan back to the company's default date specific hours.
     */
    DateSpecificHours.prototype.reset = function() {

    };
    window.DateSpecificHours = DateSpecificHours;

})();
