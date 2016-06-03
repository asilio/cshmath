var _ 	= require("lodash");
var db 		= require("../../db");

var mtm = function(model_name,other_name, alias,structure,mtms){
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
//	console.log(alias,structure);
	this.mtms=mtms;
};

//Return ALL of the entries with a relation to the model with this id.
mtm.prototype.all = function(id,callback,order){
	var order = order || "";

	if(order != "DESC" || order != "" )
		order="";

	_.each(arguments,function(a){
		console.log(a);
	})

	console.log(this.mtms);
	var other_column = _.clone(this.other_column);
	var column = _.clone(this.column);
	
	if(this.mtms == undefined)
	{
		other_column = this.table.split("_")[2]+"_id";
		column = this.model.toLowerCase()+"_id";
	}	
	var limit=1000000 || options.limit;
//	if(!this.id) return callback(null,[]);
	var sql = "SELECT ";
	_.each(this.other_structure,function(val,keys,obj){
		if(keys=="rank") 
		{
			console.log(this.other_model);
			sql+=this.other_model+".rank, ";
			return;
		}
		sql+=keys+", ";
	}.bind(this));
	sql+=this.other_model+".id ";
	sql+="FROM "+this.other_model+"\n";
	sql+="INNER JOIN "+this.table+"\n";
	sql+="ON "+this.other_model+".id"+"="+this.table+"."+other_column+"\n";
	sql+="WHERE "+column+"="+id+"\n";
	//sql+="ORDER BY "+this.table+".rank "+order+"\n";
	sql+="LIMIT 0,"+limit+";\n";

	console.log("MTM:ALL:",sql, this.alias);
//	console.log(callback);
	return db.mysql(sql,callback);
};

//Attach a new connection between the model with id=id to the foreign model with data=data.
//The other model must already exist and have an id of its own, otherwise this will fail.
mtm.prototype.new = function(id,data,callback){
	var other_id  = data.id;
	if(!other_id) throw new Error("Did not supply an id for creation!!");
	var data = {};
	data[this.column] = id;
	data[this.other_column] = other_id;
//	console.log(data)
	db.insert(this.table,data,callback);
};

module.exports = mtm;