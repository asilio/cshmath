//UI Elements
define([ "jquery", "jquery_ui" ], function( $ ){
	var pop_up=$('#pop_up');

	if(!pop_up.length)
	{

		pop_up=$('<div></div>');
		pop_up.css("z-index",500);
		pop_up.attr("id","pop_up");
		var body=$('body');

		body.append(pop_up);
	
	}else{
		pop_up.html('');
	}

	var info=$('#info_box');
	if(!info.length)
	{

		info=$('<div></div>');
		info.css("z-index",500);
		info.attr("id","info");
		var body=$('body');

		body.append(info);
	
	}else{
		info.html('');
	}
	
	function getYesNoCancel(_msg,callback,options)
	{
		options=options || {};		

		var msg=$('<p></p>');
		msg.html(_msg);
		pop_up.html(msg.html());

		var title=options.title || "Are you sure?";
		
		pop_up.dialog({
			resizable:false,
			height:240,
			modal:true,
			title:title,
			buttons:{
				"Yes":function(){
					var result={};
					result.response="yes";
					result.value=1;
					callback(result);

					$(this).dialog("close");
				},
				Cancel:function(){
					$(this).dialog("close");
				}
			}
		});
	}
	
	function infoBox(_msg,options,callback)
	{
		options=options || {};		
		callback=callback || function(){};
		var msg=$('<p></p>');
		msg.html(_msg);

		info.html(msg.html());
		var title=options.title || "Just so ya know:";
		info.find("button").focus();
		info.dialog({
			resizable:false,
			height:240,
			title:title,
			modal:true,
			buttons:{
				"Okay":function(){
					callback();
					$(this).dialog("close");
				}
			}
		});
	
	}
	
	return {
		getYesNoCancel:getYesNoCancel,
		infoBox:infoBox,
	}
});