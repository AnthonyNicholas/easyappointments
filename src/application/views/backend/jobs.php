<script type="text/javascript"
        src="<?php echo $base_url; ?>/assets/ext/jquery-ui/jquery-ui-timepicker-addon.js"></script>

<script type="text/javascript"
        src="<?php echo $base_url; ?>/assets/js/backend_jobs_helper.js"></script>

<script type="text/javascript"
        src="<?php echo $base_url; ?>/assets/js/backend_jobs.js"></script>

<script type="text/javascript">
    var GlobalVariables = {
        'csrfToken'         : <?php echo json_encode($this->security->get_csrf_hash()); ?>,
        'availableProviders': <?php echo json_encode($available_providers); ?>,
        'availableServices' : <?php echo json_encode($available_services); ?>,
        'dateFormat'        : <?php echo json_encode($date_format); ?>,
        'baseUrl'           : <?php echo json_encode($base_url); ?>,
        'jobs'         : <?php echo json_encode($jobs); ?>,
        'user'              : {
            'id'        : <?php echo $user_id; ?>,
            'email'     : <?php echo json_encode($user_email); ?>,
            'role_slug' : <?php echo json_encode($role_slug); ?>,
            'privileges': <?php echo json_encode($privileges); ?>
        }
    };

    $(document).ready(function() {
        BackendCustomers.initialize(true);
    });
</script>

<div id="jobs-page" class="container-fluid backend-page">
    <div class="row">
    	<div id="filter-jobs" class="filter-records column col-xs-12 col-sm-5">
    		<form class="input-append">
    			<input class="key" type="text" />
                <div class="btn-group">
                    <button class="filter btn btn-default btn-sm" type="submit" title="<?php echo $this->lang->line('filter'); ?>">
                        <span class="glyphicon glyphicon-search"></span>
                    </button>
                    <button class="clear btn btn-default btn-sm" type="button" title="<?php echo $this->lang->line('clear'); ?>">
                        <span class="glyphicon glyphicon-repeat"></span>
                    </button>
                </div>
    		</form>

            <h3><?php echo $this->lang->line('jobs'); ?></h3>
            <div class="results"></div>
    	</div>

    	<div class="record-details col-xs-12 col-sm-7">
            <div class="btn-toolbar">
                <div id="add-edit-delete-group" class="btn-group">
                    <?php if ($privileges[PRIV_CUSTOMERS]['add'] == TRUE) { ?>
                    <button id="add-job" class="btn btn-primary">
                        <span class="glyphicon glyphicon-plus"></span>
                        <?php echo $this->lang->line('add'); ?>
                    </button>
                    <?php } ?>

                    <?php if ($privileges[PRIV_CUSTOMERS]['edit'] == TRUE) { ?>
                    <button id="edit-job" class="btn btn-default" disabled="disabled">
                        <span class="glyphicon glyphicon-pencil"></span>
                        <?php echo $this->lang->line('edit'); ?>
                    </button>
                    <?php }?>

                    <?php if ($privileges[PRIV_CUSTOMERS]['delete'] == TRUE) { ?>
                    <button id="delete-job" class="btn btn-default" disabled="disabled">
                        <span class="glyphicon glyphicon-remove"></span>
                        <?php echo $this->lang->line('delete'); ?>
                    </button>
                    <?php } ?>
                </div>

                <div id="save-cancel-group" class="btn-group" style="display:none;">
                    <button id="save-job" class="btn btn-primary">
                        <span class="glyphicon glyphicon-ok"></span>
                        <?php echo $this->lang->line('save'); ?>
                    </button>
                    <button id="cancel-job" class="btn btn-default">
                        <i class="glyphicon glyphicon-ban-circle"></i>
                        <?php echo $this->lang->line('cancel'); ?>
                    </button>
                </div>
            </div>

            <input id="job-id" type="hidden" />

            <div class="row">
                <div class="col-md-6" style="margin-left: 0;">
                    <h3><?php echo $this->lang->line('details'); ?></h3>
                    <div id="form-message" class="alert" style="display:none;"></div>

                    <div class="form-group">
                        <label for="notes"><?php echo $this->lang->line('notes'); ?></label>
                        <textarea id="notes" rows="4" class="form-control"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="sms-notif"><?php echo 'Send SMS'; ?></label>
                        <input type="button" id="sms-notif" class="form-control" value="send-sms" >
                    </div>

                    <center><em id="form-message" class="text-error">
                        <?php echo $this->lang->line('fields_are_required'); ?></em></center>
                </div>

                <div class="col-md-5">
                    <h3><?php echo $this->lang->line('appointments'); ?></h3>
                </div>
            </div>
    	</div>
    </div>
</div>
