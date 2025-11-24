(function ($) {
	jQuery(document).ready(function ($) {

		// $('.featured .emp-container .inner-pad').each(function(){
		// 	console.log($(this).width())
		// 	if($(this).find('.inner-emp-logo img').width() > $(this).width()){
		// 		console.log($(this).find('.inner-emp-logo img').width())
		// 		$(this).find('.inner-emp-logo img').css('width','100%')
		// 	}
		// })

		// $('.job-container').each(function(){
		// 	if($(this).find('.job-img img').width() > $(this).width()){
		// 		$(this).find('.job-img img').css('width','100%')
		// 	}
		// })

	$('.featured .emp-container .inner-emp-logo img').each(function(){
		if($(this).height() > '208'){
			$(this).css('height','200')
		}
	})

	$('.featured .job-img img').each(function(){
		if($(this).height() > '208'){
			$(this).css('height','200')
		}
	})

		$(window).scroll(function(e){
			if ($(window).width() > 800) {
				$('.header').css({
					'bottom' : "0",
				});  
			} 
		});

		jQuery('.view-all a.parent').click(function(e){
			e.stopPropagation();
			var self = $(this).parents('ul.view-all')
			if(self.hasClass('open')){
				self.removeClass('open')
			}else{
				self.addClass('open')
			}
			
			return false
		})

		$('html').click(function() {
			$('.view-all').removeClass('open')
		});

		var initSlider = function(slider){
			var slideRender = function(){

				if($(window).innerWidth() < 900 && $(window).innerWidth() > 600){
					if(!slider.hasClass('twoWide')){
						twoWide()
					}
				}else if($(window).innerWidth() < 600){
					if(!slider.hasClass('oneWide')){
						oneWide()
					}
				}else{
					if(slider.data("max")){
						reInit(parseInt(slider.data("max")));
						return;
					}
					if(!slider.hasClass('threeWide')){
						threeWide()
					}
				}
			}

			$(window).resize(function(){
				slideRender()
			})
			var threeWide = function(){
				reInit(3)
				slider.removeClass('oneWide twoWide').addClass('threeWide')
			}

			var twoWide = function(){
				reInit(2)
				slider.removeClass('oneWide threeWide').addClass('twoWide')
			}

			var oneWide = function(){
				reInit(1)
				slider.removeClass('twoWide threeWide').addClass('oneWide')
			}

			var reInit = function(count){
				slider.find('.flex-viewport').each(function(){
					if(!$(this).html()){
						$(this).remove()
					}
				})
				slider.find('.flex-control-nav').remove()
				slider.find('.flex-direction-nav').remove()
				slider.removeData("flexslider");
				slider.flexslider({
					animation: "slide",
				    animationLoop: true,
				    itemMargin: 0,
				    minItems: count,
		    		maxItems: count,
		    		itemWidth: 315,
	    			slideshow: false,
	    			pauseOnHover: true
				});

			}

			slideRender()
		}

			
		if($('.flexslider-jobs ul li').length > 3){
			var slider = $('.flexslider-jobs')
			initSlider(slider)
			
		}else{
			$('#featured-jobs').addClass('block-jobs')
		}

		if($('.flexslider-emp ul li').length > 3){
			var slider = $('.flexslider-emp')
			initSlider(slider)
			
		}else{
			$('#featured-employers').addClass('block-emp')
		}

		if($('.flexslider-blog ul li').length > 3){
			var slider = $('.flexslider-blog')
			initSlider(slider)
		}else{
			$('#featured-blog').addClass('block-blog')
		}

		if($('.hide-slide').length){

			var img_array = [];
			
			$('.hide-slide').each(function(){
				img_array.push($(this).html())
			})
			
	        var newIndex = 0;
	        var index = -1;
	        var interval = 5000;

		    (function changeBg() {

		        index = (index + 1) % img_array.length;

		        $('.header-over-image-slide').css('backgroundImage', function () {
		            $('.header-fade').animate({
		                opacity: 0
		            }, 800, function () {
		                setTimeout(function () {
		                    $('.header-fade').animate({
		                        opacity: 1
		                    }, 1100);
		                }, 3000);
		            });
		            return 'url(' + img_array[index] + ')';
		        });
		        setTimeout(changeBg, interval);
		    })();
		}
		
		$('.search-toggle').on('click', function(e){
			$('html,body').animate({scrollTop: 0}, 500);	
		});

	});
})(jQuery);