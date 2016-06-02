var _ 	= require("lodash");
var db 		= require("../../db");

var mtm = function(model_name,other_name, alias,structure){
	this.url="/rest/"+model_name+"."+other_name.toLowerCase()+"."+alias+".";
	if(model_name<other_name)
		this.table=model_name+"_"+other_name+"_"+alias;
	else
		this.table=other_name+"_"+model_name+"_"+alias;
	this.column = alias+"_id";
	this.other_column = other_name.toLowerCase()+"_id";
	this.id=undefined;
	this.other_structure = structure;
	this.other_model=other_name;
	this.model = model_name;
	this.alias = alias;
	
};

mtm.prototype.all = function(callback,order){
	var order = order || "";

	if(order != "DESC" || order != "" )
		order="";

	_.each(arguments,function(a){
		console.log(a);
	})

	var limit=1000000 || options.limit;
	if(!this.id) return callback(null,[]);
	var sql = "SELECT ";
	_.each(this.other_structure,function(val,keys,obj){
		sql+=keys+", ";
	});
	sql+=this.other_model+".id, rank ";
	sql+="FROM "+this.other_model+"\n";
	sql+="INNER JOIN "+this.table+"\n";
	sql+="ON "+this.other_model+".id"+"="+this.table+"."+this.other_column+"\n";
	sql+="WHERE "+this.column+"="+this.id+"\n";
	sql+="ORDER BY "+this.table+".rank "+order+"\n";
	sql+="LIMIT 0,"+limit+";\n";

//	console.log("MTM:ALL:",sql);
//	console.log(callback);
	return db.mysql(sql,callback);
};

mtm.prototype.new = function(data,callback){
	var other_id  = data.id;
	if(!other_id) throw new Error("Did not supply an id for creation!!");
	var data = {};
	data[this.column] = this.id;
	data[this.other_column] = other_id;
//	console.log(data)
	db.insert(this.table,data,callback);
};

module.exports = mtm;