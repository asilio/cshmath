var _ 	= require("lodash");
var db 		= require("../../db");

var mtm = function(model_name,other_name, alias,structure,mtms){
	this.url="/rest/"+model_name+"."+other_name.toLowerCase()+"."+alias+".";
	if(model_name<other_name)
		this.table=model_name+"_"+other_name+"_"+alias;
	else
		this.table=other_name+"_"+model_name+"_"+alias;

	if(mtms == undefined)
	{
		this.column =model_name.toLowerCase()+"_id";
		this.other_column =  alias+"_id";
	}
	else{
		this.column = alias+"_id";
		this.other_column = other_name.toLowerCase()+"_id";
	}
	this.id=undefined;
	this.other_structure = structure;
	this.other_model=other_name;
	this.model = model_name;
	this.alias = alias;
	this.mtms=mtms;
	//console.log(model_name,other_name);
	//console.log(this)
	/*Only do this once when the server is first set up, and only if you don't mind wiping out any ordering which was done before*/
	/*this.reset_order(function(err,res){
		console.log("Requested Reset of Rank Ordering")
		console.log(err,res);
	});
	/**/
};

//Return ALL of the entries with a relation to the model with this id.
mtm.prototype.all = function(id,callback,order){
	var order = order || "";

	if(order != "DESC" || order != "" )
		order="";

/*	_.each(arguments,function(a){
		console.log(a);
	})

	console.log(this.mtms);
*/
	var other_column = _.clone(this.other_column);
	var column = _.clone(this.column);
	
	//console.log(other_column);
	//console.log(this.mtms)

/*
	if(this.mtms == undefined)
	{
		other_column = this.table.split("_")[2]+"_id";
		column = this.model.toLowerCase()+"_id";
	}	
*/
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
	sql+="ORDER BY "+this.table+".rank "+order+"\n";
	sql+="LIMIT 0,"+limit+";\n";

//	console.log("MTM:ALL:\n",sql, this.alias);
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
	//data.rank = 1;
//	console.log("TABLE: " ,this.table);
	//console.log(data)
	db.all(this.table,function(err,res){
		//console.log(res,err)
		if(err)
			return callback(err,res);
		console.log("RESULTS")
		console.log(res)
		//r = _.max(res,function(e){return 1*e.rank});
		r = 0;
		_.each(res,function(e){
			if(1*e.rank > r)
				r = 1*e.rank;
		});

//		console.log("MAX RANK")
//		console.log(r);
		data.rank = r+1;
		console.log("INSERTING DATA")
		console.log(data)
		db.insert(this.table,data,callback);
	}.bind(this));
	
};


//Presumes that the reference table uses a "rank" column to organize mtm relationships
//source_id and target_id both reference the other_column entry
//id references ths model's base id
mtm.prototype.insert_after = function(options){
	var source_id = options.source_id;
	var target_id  = options.target_id;
	var callback  = options.callback;
	var id        = options.id;
//	console.log(options)
//	console.log("INSERT AFTER: ",this.table)

	var options = {};
	options[this.column] = id;
	options[this.other_column] = source_id;
	var source_entry = {};
	db.get(this.table, options,function(err,res){
		//console.log(res,err)
		if(err || res.length == 0)
			return callback(err,res);

		var options = {};
		options[this.column] = id;
		options[this.other_column] = target_id;
		//console.log(options);
		source_entry = res[0];
//		console.log(source_entry);

		db.get(this.table,options,function(err,res){
				//console.log(res,err)
				if(err || res.length == 0)
					return callback(err,res);

				var target_entry = res[0];
				if(target_entry.rank == null || target_entry.rank == undefined){
					target_entry.rank = 1;
				}
//				source_entry.rank = target_entry.rank;
				if(source_entry.rank < target_entry.rank){
					var sql = "UPDATE "+this.table+"\n"+
							  "SET rank = rank - 1\n"+ 
							  "WHERE "+this.column+" = "+id+" AND rank <= "+target_entry.rank+" AND rank >"+source_entry.rank+";";
					
					//console.log(sql);
					
					//db.update(this.table,source_entry,callback);
					db.mysql(sql,function(err,res){
						//console.log(res,err)
						if(err || res.length == 0)
							return callback(err,res);
						
						source_entry.rank = target_entry.rank;

						db.update(this.table,source_entry,callback);
					}.bind(this))	
				}else if(source_entry.rank > target_entry.rank){
					var sql = "UPDATE "+this.table+"\n"+
							  "SET rank = rank + 1\n"+ 
							  "WHERE "+this.column+" = "+id+" AND rank >= "+target_entry.rank+" AND rank <"+source_entry.rank+";";
					
//					console.log(sql);
					
					//db.update(this.table,source_entry,callback);
					db.mysql(sql,function(err,res){
						//console.log(res,err)
						if(err || res.length == 0)
							return callback(err,res);
						
						source_entry.rank = target_entry.rank;

						db.update(this.table,source_entry,callback);
					}.bind(this))	
				}else{
					return callback("Same rank...")
				}

				

			}.bind(this));
		
	}.bind(this));

}

mtm.prototype.delete = function(options){
	var source_id = options.source_id;
	var callback  = options.callback;
	var id        = options.id;
//	console.log(options)
//	console.log("DELETE ENTRY FROM: ",this.table,options)

	var options = {};
	options[this.column] = id;
	options[this.other_column] = source_id;
	db.delete(this.table,options,callback);
}


mtm.prototype.add = function(options){
	var source_id = options.source_id;
	var target_id  = options.target_id;
	var callback  = options.callback;
	var id        = options.id;
	//console.log(options)
	//console.log("INSERT AFTER: ",this.table)

	var options = {};
	options[this.column] = id;
	options[this.other_column] = target_id;
	
	var source_entry = {};
	source_entry.other_column = source_id;

	db.get(this.table, options,function(err,res){
		//console.log(res,err)
		if(err || res.length == 0)
			return callback(err,res);

		var target_entry = res[0];
		if(target_entry.rank == null || target_entry.rank == undefined){
			target_entry.rank = 1;
		}

		source_entry.rank = target_entry.rank+1;

	
		console.log(source_entry);
		db.insert(this.table,source_entry,callback);
	});
}

//Forces a reset, assigning a 1-N value to the rank column.
//Should only be used on datatables where the rank is null or ill-organized and needs
//to be reset.
mtm.prototype.reset_order = function(callback){

	var sql = "SELECT @i:=0;"+
				"UPDATE "+this.table+" SET rank = @i:=@i+1;";
	db.mysql(sql,callback);
}
/*Force a native ordering of the rank

UPDATE class_user_instructor
SET rank = id
WHERE instructor_id = 1;

*/
module.exports = mtm;