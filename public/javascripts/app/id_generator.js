define("id_generator",function(require){
	var module={};
	
	var generator=function(name){
		this.id=0;
		this.name=name || "";
	};
	
	generator.prototype.next=function(){
		this.id++;
		return this.name+this.id;
	}
	
	
	module.new=function(name){
		module[name]=new generator(name);
	}	
	
	return module;
});