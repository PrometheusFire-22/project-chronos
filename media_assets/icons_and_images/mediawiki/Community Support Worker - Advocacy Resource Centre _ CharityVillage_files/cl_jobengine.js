(function (global) {


    var $ = jQuery;


    var ClJobengine = global.ClJobengine = {
        /**
         global events agreggator
         events: apply:completed,apply:with-profile,apply:howto-displayed,apply:external-clicked
         */
        vent: _.extend({}, Backbone.Events),
        Views: {}
    };

    ClJobengine.Views.BlockUI = Backbone.View.extend({
        defaults: {
            image: cl_jobengine_globals.imgURL + '/loading.gif',
            opacity: '0.5',
            background_position: 'center center',
            background_color: '#ffffff'
        },

        isLoading: false,

        initialize: function (options) {
            //var defaults = _.clone(this.defaults);
            options = _.extend(_.clone(this.defaults), options);

            var loadingImg = options.image;
            this.overlay = jQuery('<div class="loading-blur loading"><div class="loading-overlay"></div><div class="loading-img"></div></div>');
            this.overlay.find('.loading-img').css({
                'background-image': 'url(' + options.image + ')',
                'background-position': options.background_position
            });

            this.overlay.find('.loading-overlay').css({
                'opacity': options.opacity,
                'filter': 'alpha(opacity=' + options.opacity * 100 + ')',
                'background-color': options.background_color
            });
            this.$el.html(this.overlay);

            this.isLoading = false;
        },

        render: function () {
            this.$el.html(this.overlay);
            return this;
        },

        block: function (element) {
            var $ele = $(element);
            // if ( $ele.css('position') !== 'absolute' || $ele.css('position') !== 'relative'){
            // 	$ele.css('position', 'relative');
            // }
            this.overlay.css({
                'position': 'absolute',
                'top': $ele.offset().top,
                'left': $ele.offset().left,
                'width': $ele.outerWidth(),
                'height': $ele.outerHeight()
            });

            this.isLoading = true;

            this.render().$el.show().appendTo($('body'));
        },

        unblock: function () {
            this.$el.remove();
            this.isLoading = false;
        },

        finish: function () {
            this.$el.fadeOut(500, function () {
                $(this).remove();
            });
            this.isLoading = false;
        }
    });

    ClJobengine.vent.on('plugins:placeholder-shim:refresh', function () {
        jQuery('input, textarea').placeholder();
    })


    // })();
    // });

})(window);


///piwik analytics - custom events
(function () {
    var piwik = {
        queueCallback: function (cb) {
            if (cb) {
                if (window.Piwik) {
                    _paq.push([cb]);
                } else {
                    cb();
                }
            }
        },

        trackApply: function (job, label, cb) {
            //console.log('trackApply', job.cl_id);
            _paq.push(['setCustomVariable', 1, 'employer_id', job.employer_id, 'page']);
            _paq.push(['setCustomVariable', 2, 'job_id', job.cl_id, 'page']);

            _paq.push(['trackEvent', 'Apply', label]); //Application received
        },

        trackApplyWithProfile: function (job, cb) {
            piwik.trackApply(job, 'WithProfile', cb);
            piwik.trackApply(job, 'Completed', cb);
            if(window._paq){
                window._paq.push(["trackGoal", 16]);
                console.log('PIWIK_GOAL Apply with profile');
            }
        },

        trackApplyWithEmail: function (job, cb) {
            piwik.trackApply(job, 'WithProfileByEmail', cb);
            piwik.trackApply(job, 'Completed', cb);
        },

        trackHowtoDisplayed: function (job, cb) {
            piwik.trackApply(job, 'HowToDisplayed', cb);
            piwik.trackApply(job, 'Completed', cb);
        },

        trackApplyWithInstruction: function (job, cb) {
            piwik.trackApply(job, 'ApplyWithInstruction', cb);
            piwik.trackApply(job, 'Completed', cb);
        },

        trackApplyWithCustomInstruction: function (job, cb) {
            piwik.trackApply(job, 'ApplyWithJobDescInstruction', cb);
            piwik.trackApply(job, 'Completed', cb);
        },

        trackApplyExternalClick: function (job, cb) {
            piwik.trackApply(job, 'External', cb);
            piwik.trackApply(job, 'Completed', cb);
        }

    }

    // ClJobengine.vent.on('apply:completed', piwik.trackApply);
    ClJobengine.vent.on('apply:with-profile', piwik.trackApplyWithProfile);
    ClJobengine.vent.on('apply:with-email', piwik.trackApplyWithEmail);
    //ClJobengine.vent.on('apply:howto-displayed', piwik.trackHowtoDisplayed);
    ClJobengine.vent.on('apply:external-clicked', piwik.trackApplyExternalClick);
    ClJobengine.vent.on('apply:with-instruction', piwik.trackApplyWithInstruction);
    ClJobengine.vent.on('apply:with-custom-instruction', piwik.trackApplyWithCustomInstruction);

})();

var AgileCRMTracker = {
    registerVisitor: function(user){
        _agile.set_email(user.email);
        //console.log('agile-crm: set email: %s', user.email);
        this.verifyContact(user);
    }, 

    /** make sure that contact is created */
    verifyContact: function(user){
        var self = this;

        _agile.get_contact(user.email, { 
            error: function(data){
                if(data.error.indexOf('Contact not found')!=-1){
                    self.createContact(user);
                }               
            }
        });
    }, 
    createContact: function(user){
        var contact = {
            email: user.email, 
            first_name: user.first_name, 
            last_name: user.last_name,
            tags: 'Job Seeker', 
            custom_id: user.user_id
        }
        _agile.create_contact(contact, { 
            error: function(data){
                console.error(data)
            }
        });
    }
};

window.trackAgileVisitor = function(user){
    if(window._agile == undefined){
        console.log('AgileCRM not installed');
        return;
    }
    AgileCRMTracker.registerVisitor(user)
};