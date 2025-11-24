(function($){
$(window).load(function(){

var SearchForm = Backbone.View.extend({
    el: '.cl_job_search_form', 

    events: {
        'typeahead:selected input.typeahead': 'selectLocation',
        'keypress input.search-box': 'query_keypressed', 
        'click #searchsubmit' :'headerSearch',
    },


    initialize: function(){

        var substringMatcher = function(strs) {
          return function findMatches(q, cb) {
            var matches, substrRegex;
         
            // an array that will be populated with substring matches
            matches = [];
         
            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');
         
            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
              if (substrRegex.test(str)) {
                // the typeahead jQuery plugin expects suggestions to a
                // JavaScript object, refer to typeahead docs for more info
                matches.push({ value: str });
              }
            });
         
            cb(matches);
          };
        };

        var locations = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: '/app/jobs/api/search-places/?q=%QUERY&limit=4',
            }
        });

        locations.initialize()
         
        $('.typeahead').typeahead({
            hint: false,
            highlight: true,
            minLength: 2,
            remote:{
                rateLimitBy: 'throttle',
                rateLimitWait: 250
            }
        },
        {
          name: 'states',
          displayKey: 'name',
          source: locations.ttAdapter(),
          templates:{
            // suggestion: function (data) { return Hogan.compile('<p><strong>{{name}}</strong></p>').render(data) }
          },
          // onselect: function(data){}
        });

    },
    query_keypressed: function(e){
        //e.preventDefault();
        if(e.keyCode==13){
            this.startSearch(e);
        }
        // console.log($('.tt-dataset-states').html())
    },

    selectLocation:function(e, data){
        // console.log('here')
        // console.log(data.name)
        $('.typeahead').typeahead('val', data.name);
        this.locObj = data;
    },

    headerSearch: function(e) {
        e.preventDefault();
        this.startSearch(e);
    },

    /* forwards to internal page to start using search there */
    startSearch: function(e){
        var thisForm = $(e.target).parents('.cl_job_search_form');
        var loc = thisForm.find("#job-search-location").typeahead('val') || thisForm.find("#job-search-location").val();
        var kw = thisForm.find("#job-search-keyword").val();   

        if(loc || kw){
            
            var data = {kw: kw, loc: loc};
            if(this.locObj){
                data.place_id = this.locObj.place_id;
                data.city = this.locObj.city;
                data.postal_code = this.locObj.postal_code
            }

            window.location = jobsearch_vars.searchPageUrl + "/#/init?" + $.param(data)
        }
        else{

            var inputFields = thisForm.find('input[type="text"]');
            inputFields.css({'background-color': '#FFEFF7', 'border': '1px solid #bb4400'});
            inputFields.bind('focus', function(){
                $(this).css({'background-color': '', 'border': ''})
            })
            // inputFields.effect('shake', 'left', 10, 5);
            // inputFields.addClass('input-empty-warning');

        }
    }




})

$(function(){
    new SearchForm();
})
});
})(jQuery)