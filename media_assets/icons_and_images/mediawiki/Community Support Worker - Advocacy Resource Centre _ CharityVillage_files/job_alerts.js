(function ($) {

function setCsrfHeader(xhr){
	function getCookie(name) {
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}

	var csrftoken = getCookie('csrftoken');
	xhr.setRequestHeader("X-CSRFToken", csrftoken);
}    

$(document).ready(function(){

	// TODO: may become a global ClJobengine.Views.BlockUI



	 // var config = {
		//       '.chosen-select'           : {},
		//       '.chosen-select-deselect'  : {allow_single_deselect:true},
		//       '.chosen-select-no-single' : {disable_search_threshold:10},
		//       '.chosen-select-no-results': {no_results_text:'Oops, nothing found!'},
		//       '.chosen-select-width'     : {width:"95%"},
		//       'search_contains'			 :true,	
		//     }
		//     for (var selector in config) {
		//       $(selector).chosen(config[selector]);
		//     }
	
	var JobAlertModel = Backbone.Model.extend({
		url: function(){
			return window.CL_MAIN_URL + "/jobs/api/job-alerts/widget/";
		}
	})

	var CL_JobAlert	= Backbone.View.extend({
		el : 'div.widget-job-alert',
		events : {
			'typeahead:selected input.typeahead': 'selectLocation',
			'click .btn-subscribe' : 'subscribe',
			//'click  a#unsubscribe_btn' : 'unsubscribe',
		},

		initialize : function() {
			// TODO: get email from logged in user
			// this.email = 
			var user = JSON.parse($("#cl_current_user").html());
			if(user && user.email){
				var emailField = this.$("input[name=email]");
				emailField.val(user.email).hide();
			} 
			this.locObj= {}
		},
		subscribe : function (e) {
			e.preventDefault();
			var blockUi	=	new ClJobengine.Views.BlockUI(),
				$target	=	$(e.currentTarget);
			this.locObj.query = this.$("input[name=location]").val();
			var self = this;
			var data = {}
			console.log("JobAlert From WP");
            if(grecaptcha && G_RECAPTCHA_KEY){
                grecaptcha.ready(function() {
                    grecaptcha.execute(G_RECAPTCHA_KEY, { action: 'submit' }).then(function(token) {
						
						data = {
							keywords: self.$("input[name=keywords]").val(),
							location_hint: self.locObj,
							location_hints: [self.locObj],
							email: self.$("input[name=email]").val(),
							location: { 
								query: self.$("input[name=location]").val() 
							},
							g_recaptcha_token: token					
						}
						var model = new JobAlertModel();
						blockUi.block($target);
						
						self.clearErrors();
						model.save(data, {
							beforeSend: setCsrfHeader,
							success: function(){
								blockUi.finish();
								// alert('You successfully signed up for job alerts')
								self.showAfterSubscribe();
							}, 
							error: function(m, e){					
								blockUi.finish();
								//alert('failed')
								self.showErrors(e);
							}
						});
						return false;
                    });
                });
            }else{
				alert("Recaptcha is missing on the site");
			}
		},
		showAfterSubscribe: function(){
			var form = this.$("form");
			height = form.css('height');
			form.hide();
			if(window._paq){
				window._paq.push(["trackGoal", 11]);
				console.log('Hit Job Alert Signups Goal -> 11');
			}
			this.$("#subcribe-success").css({height: height}).show();
		},
	    selectLocation:function(e, data){
	        // console.log('here')
	        // console.log(data.name)
	        this.$('.typeahead').typeahead('val', data.name);
	        data.changed = true;
	        this.locObj = data;
	    }, 

	    clearErrors: function(){
	    	this.$('input.error').removeClass('error');
	    },
	    showErrors: function(e){
	    	var errors = null;
	    	try{
	    		errors = JSON.parse(e.responseText);
	    	}catch(err){
	    		console.error(err);
	    		console.warn("cannot parse response: %s", e.responseText);
	    	}
	    	var self = this;
	    	var focused = false;
	    	if(errors){
	    		_.each(_.keys(errors), function(field){
	    			var f = self.$('input[name=' + field + ']');
	    			if(!f.length){
	    				f = self.$('input[data-'+field+'=1]');
	    			}
	    			if(!f.length){
	    				return;
	    			}
	    			f.addClass('error');
	    			if(!focused){
	    				f.focus(); // focus on first element
	    				focused = true;
	    			}
	    		});
					
					if(errors == 'Unknown location'){
						var f = self.$('input[name=location]');
	    			if(!f.length){
	    				f = self.$('input[data-location=1]');
						}
						f.addClass('error');
	    			if(!focused){
	    				f.focus(); // focus on first element
							focused = true;
							alert("Please select the location from the dropdown");
	    			}
					}
				}
	    	if(!focused){
	    		alert("Unknown error");
	    	}
	    }

	});
	new CL_JobAlert();


	/*New JOB ALERT*/
	var CL_AdvJobAlert	= Backbone.View.extend({
		el : 'div.widget-adv-job-alert',
		events : {
			'typeahead:selected input.typeahead': 'selectLocation',
			'submit .frm-adv-job-alert' : 'handleFormSubmit',
			'change #accept-tos': 'handleAcceptTerms',
			'resize .frm-adv-job-alert': 'handleElementResize',
		},

		initialize : function() {
			var user = JSON.parse($("#cl_current_user").html());
			if(user && user.email){
				var emailField = this.$("input[name=email]");
				//emailField.val(user.email).hide();
				emailField.val(user.email).parent().remove();
			} 
			this.locObj= {}

			var $frmBlock = this.$('#alert-form-container');
			//console.log('TearUp', $frmBlock.width())
			if($frmBlock.width() > 600){
				$frmBlock.addClass('ja-fw');
				if($frmBlock.find('.form-item').length % 2 != 0){
					$frmBlock.addClass('ja-fw-odd');
				}
			}
		},

		selectLocation:function(e, data){
	        this.$('.typeahead').typeahead('val', data.name);
	        data.changed = true;
	        this.locObj = data;
	    }, 

		handleFormSubmit: function(e){
			e.preventDefault();

			var self = this;
			var $target	=	$(e.currentTarget);
			
			this.locObj.query = this.$("input[name=location]").val();
			var data = {
				email: this.$("input[name=email]").val(),
				location: null,
				keywords: '',
				raw_filter: {}			
			}

			if(this.$("input[name=keywords]").val()){
				data['keywords'] = this.$("input[name=keywords]").val()
			}

			if(this.$("input[name=location]").val()){
				data['location'] = { 
					query: this.$("input[name=location]").val() 
				};
				data['location_hint'] = this.locObj;
				data['location_hints']= [this.locObj];
			}

			if(this.$("select[name=category]").length && this.$("select[name=category]").val()){
				data['raw_filter']['categories'] = this.$("select[name=category]").val()
			}

			if(this.$("select[name=job_type]").length && this.$("select[name=job_type]").val()){
				data['raw_filter']['job_types'] = this.$("select[name=job_type]").val()
			}
			if(this.$("select[name=job_company]").length && this.$("select[name=job_company]").val()){
				data['raw_filter']['companies'] = this.$("select[name=job_company]").val()
			}
			
			console.log("Advanced job alert widget");
			if(grecaptcha && G_RECAPTCHA_KEY){
				grecaptcha.ready(function() {
				  grecaptcha.execute(G_RECAPTCHA_KEY, { action: 'submit' }).then(function(token) {
					data['g_recaptcha_token'] = token;
					var model = new JobAlertModel();
					self.loader(true);
					self.clearErrors();
					model.save(data, {
						beforeSend: setCsrfHeader,
						success: function(){
							self.loader(false);
							self.showAfterSubscribe();
						}, 
						error: function(m, e){					
							self.loader(false);
							self.showErrors(e);
						}
					});
				  });
				});
			}else{
				alert("Recaptcha is missing on the site");
			}
		},

		handleAcceptTerms: function(e){
			if(e.currentTarget.checked){
				this.$('.btn-subscribe').attr('disabled', false);
			}else{
				this.$('.btn-subscribe').attr('disabled', true);
			}
		},

		loader: function(state){
			if(state){
				this.$('.cl-alert-loading').fadeIn(300);
			}else{
				this.$('.cl-alert-loading').fadeOut(300);
			}
		},

		clearErrors: function(){
	    	this.$('input.error').removeClass('error');
	    },

	    showErrors: function(e){
	    	var errors = null;
	    	try{
	    		errors = JSON.parse(e.responseText);
	    	}catch(err){
	    		console.error(err);
	    		console.warn("cannot parse response: %s", e.responseText);
	    	}
	    	var self = this;
	    	var focused = false;
	    	if(errors){

	    		_.each(_.keys(errors), function(field){
	    			var f = self.$('input[name=' + field + ']');
	    			if(!f.length){
	    				f = self.$('input[data-'+field+'=1]');
	    			}
	    			if(!f.length){
	    				return;
	    			}
	    			f.addClass('error');
	    			if(!focused){
	    				f.focus(); // focus on first element
	    				focused = true;
	    			}
	    		});
					
				if(errors == 'Unknown location'){
					var f = self.$('input[name=location]');
					
					if(!f.length){
						f = self.$('input[data-location=1]');
					}
					
					f.addClass('error');
					
					if(!focused){
						f.focus(); // focus on first element
						focused = true;
						alert("Please select the location from the dropdown");
					}
				}
			}

	    	if(!focused){
	    		alert("Unknown error");
	    	}
	    },

	    showAfterSubscribe: function(){
			var form = this.$("form");
			height = form.css('height');
			form.hide();
			if(window._paq){
				window._paq.push(["trackGoal", 11]);
				console.log('Hit Job Alert Signups Goal -> 11');
			}
			this.$("#subcribe-success").css({height: height}).show();
		},

		handleElementResize: function(e) {
			console.log('Em-', $(e.currentTarget).width())
		}
	});

	new CL_AdvJobAlert();
});
}) (jQuery);