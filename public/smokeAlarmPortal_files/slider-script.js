$(document).ready(function() {

	//rotation speed and timer
	var speed = 2000;
	var run = setInterval('rotate()', speed);	
	
	//grab the width and calculate left value
	var item_width = jQuery('#sponsorSlides li').outerWidth(); 
	var left_value = item_width * (-1); 
        
    //move the last item before first item, just in case user click prev button
	jQuery('#sponsorSlides li:first').before(jQuery('#sponsorSlides li:last'));
	
	//set the default item to the correct position 
	jQuery('#sponsorSlides ul').css({'left' : left_value});

    //if user clicked on prev button
	jQuery('#sponsorprev').click(function() {

		//get the right position            
		var left_indent = parseInt(jQuery('#sponsorSlides ul').css('left')) + item_width;

		//slide the item            
		jQuery('#sponsorSlides ul:not(:animated)').animate({'left' : left_indent}, 200,function(){    

            //move the last item and put it as first item            	
			jQuery('#sponsorSlides li:first').before($('#sponsorSlides li:last'));           

			//set the default item to correct position
			jQuery('#sponsorSlides ul').css({'left' : left_value});
		
		});

		//cancel the link behavior            
		return true;
            
	});

 
    //if user clicked on next button
	jQuery('#sponsornext').click(function() {
		
		//get the right position
		var left_indent = parseInt(jQuery('#sponsorSlides ul').css('left')) - item_width;
		
		//slide the item
		jQuery('#sponsorSlides ul:not(:animated)').animate({'left' : left_indent}, 200, function () {
            
            //move the first item and put it as last item
			jQuery('#sponsorSlides li:last').after(jQuery('#sponsorSlides li:first'));                 	
			
			//set the default item to correct position
			jQuery('#sponsorSlides ul').css({'left' : left_value});
		
		});
		         
		//cancel the link behavior
		return false;
		
	});        
	
	//if mouse hover, pause the auto rotation, otherwise rotate it
	jQuery('#sponsorSlides').hover(
		
		function() {
			clearInterval(run);
		}, 
		function() {
			run = setInterval('rotate()', speed);	
		}
	); 
        
});

//a simple function to click next link
//a timer will call this function, and the rotation will begin :)  
function rotate() {
	jQuery('#sponsornext').click();
}