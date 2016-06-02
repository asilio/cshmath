function noaction(e,type){
		var attrs=e.currentTarget.attributes;
	
		var data=$(e.currentTarget).serializeArray();
		var url;
		if(attrs.action)
			url=attrs.action.value;
		var redirect;
	
		if(attrs.redirect)
			redirect=e.currentTarget.attributes.redirect.value;
		var reload=false;
		if(attrs.reload)
			reload=true;
	
		var msg="Done!";
		if(attrs.msg)
			msg=attrs.msg.value;
	
		$.ajax({
			method:type,
			url:url,
			data:data,
		}).done(function(result){
			//required to update the on page stuff.
			if(reload)
				location.reload();
			 $( "#msg" ).text( msg ).show().fadeOut( 3000 );
			 if(redirect!="back")
				setTimeout(function(){location.replace(redirect);},5000);
			else
				setTimeout(function(){history.back()},5000);
		});
		return false;
	}
	
$(function() {
	$('.noactionpost').submit(function(e){
		return noaction(e,"POST");
	});
	
	$('.noactionupdate').submit(function(e){
		return noaction(e,"PUT");
	});		
});