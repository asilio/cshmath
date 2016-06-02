var Model 	= require("./Model");
var Models 	= require("./Models");
var _		= require("lodash");
var db 		= require("../../db");
var async 	= require("async");
var mtm 	= require("./mtm");
var fs 		= require("fs");

var exports = {};
var models = {};

_.each(Models,function(model){
	models[model.name]=_.clone(model);
	models[model.name].defaults = _.clone(models[model.name].defaults) || {};
	models[model.name].mtm=_.clone(model.mtm) || new Object();
	models[model.name].secondary = new Array();
	if(model.mtm){
		var keys = _.keys(model.mtm);
		var values = _.values(model.mtm);
		for(var i = 0; i<keys.length; i++){
			models[model.name][keys[i]]=new mtm(model.name,values[i],keys[i],_.clone(Models[values[i]].columns));
			models[values[i]] = models[values[i]] || {};
			//console.log(model.name,keys[i],"=",values[i]);
			//console.log(values[i],keys[i],"=",keys[i]);
			if(!_.has(models[values[i]].mtm,keys[i])){
				models[values[i]].mtm[keys[i]]=model.name;
				models[values[i]].secondary.push(keys[i]);
			}
			models[values[i]][keys[i]]=new mtm(values[i],model.name,keys[i],_.clone(Models[model.name].columns));		
		}
	}
});

_.each(models,function(m){
	
	exports[m.name] = Model.extend(m);
	exports[m.name].prototype.type = function(){return m.name;};
	exports[m.name].extend({name:m.name});
	
	//Methods attached to the rib.TABLE object only
	exports[m.name]._name	= function(){return m.name;};
	/*
		Each Model needs to support the following where callback takes two arguments, err and result:
		it is assumed that the err is null or undefined if everything goes to plan. The array may be empty.

			rib.Model.all(callback)				
			rib.Model.search(query,callback) == rib.Model.filter(query,callback)
			rib.Model.get(id,callback)
			rib.Model.delete(id,callback)
	*/
	exports[m.name].all 	= function(callback){
		db.all(this._name(),callback);
	};
	
	exports[m.name].get 	= function(id,callback){
		db.get(this._name(),{id:id,limit:1},function(err,result){
			if(err) return callback(err);
			return callback(null,result[0]);
		});
	};
	
	exports[m.name].search 	= function(query,callback){
		db.search(this._name(),query,callback);
	};
	
	exports[m.name].filter 	= exports[m.name].search;
	
	exports[m.name].delete = function(id,callback){
		db.delete(this._name(),{id:id},callback);
	};

	
});

sql_map = {
	"AutoField"			:"INT UNSIGNED AUTO_INCREMENT",
	"BigIntegerField"	:"BIGINT",
	"BinaryField"		:"VARCHAR(255)",
	"BooleanField"		:"BOOL",
	"CharField"			:"VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci",
	"DateField"			:"DATE",
	"DateTimeField"		:"DATETIME",
	"DecimalField"		:"DECIMAL",
	"EmailField"		:"VARCHAR(255)",
	"FileField"			:"VARCHAR(255)",
	"FilePathField"		:"VARCHAR(255)",
	"FloatField"		:"FLOAT",
	"ImageField"		:"VARCHAR(255)",
	"IntegerField"		:"INT",
	"PositiveIntegerField":"INT UNSIGNED",
	"PositiveSmallIntegerField":"TINYINT UNSIGNED",
	"SmallIntegerField"	:"TINYINT",
	"TextField"			:'TEXT CHARACTER SET utf8 COLLATE utf8_general_ci',
	"TimeField"			:"TIME",
	
};

var create_table=function(model,callback){
	var sql="CREATE TABLE IF NOT EXISTS "+model.name+"(\n     ";
	sql+="id "+sql_map["AutoField"]+" PRIMARY KEY,\n     ";
	_.each(model.columns,function(value,key,obj){
		var __default__ = "";
		if(model.defaults[key] && value.type!="TextField")
			__default__ = " DEFAULT '"+model.defaults[key]+"'";
		sql+=key+" "+sql_map[value.type]+__default__+",\n     ";
	});
	if(model.fk){
		_.each(model.fk,function(val,key,obj){
			sql+=key+ " INT UNSIGNED,\n     ";
			sql+="FOREIGN KEY ("+key+")\n          REFERENCES "+val+"(id)\n         ON DELETE CASCADE,\n     ";
		});
	}
	sql=sql.slice(0,-7);
	sql+="\n)ENGINE=INNODB;\n\n"

	if(model.mtm){
		_.each(model.mtm,function(val,key,obj){
			if(model.name<val)
				var tbl_name=model.name+"_"+val+"_"+key;
			else
				var tbl_name=val+"_"+model.name+"_"+key;
			sql+="CREATE TABLE IF NOT EXISTS "+tbl_name+"(\n     ";
			sql+="id "+sql_map["AutoField"]+" PRIMARY KEY,\n     ";
			sql+="rank INT UNSIGNED ,\n     ";
			sql+=key+"_id INT UNSIGNED,\n     ";
			sql+=model.name.toLowerCase()+"_id INT UNSIGNED,\n     ";
			sql+="FOREIGN KEY ("+key+"_id)\n          REFERENCES "+val+"(id)\n          ON DELETE CASCADE,\n     ";
			sql+="FOREIGN KEY ("+model.name.toLowerCase()+"_id)\n          REFERENCES "+model.name+"(id)\n          ON DELETE CASCADE,\n     ";
			sql+="UNIQUE KEY ("+model.name.toLowerCase()+"_id,"+key+"_id)\n"
			sql+=")ENGINE=INNODB;\n\n"
		}.bind(this));
	}

	db.mysql(sql,callback);
};

var init = function(callback){
	var funcs = [];
	_.each(Models,function(model){
		var f = function(cbk){
//			console.log("Creating Table for ",model.name)
			create_table(model,cbk);
		}
		funcs.push(f);
	});
	
	_.each(models,function(model){
		var f = function(cbk){
//			console.log("Creating Template for ",model.name);
			var print 	= "<div class = 'print sixteen columns'>";
			var view	= "<div class='view sixteen columns'><div class='fourteen columns'>";
			var edit	= "<div class='edit sixteen columns'><div class='fourteen columns'>";
			
			_.each(model.columns,function(col,key){
				if(col.print == false)
					return;
				if(col.type ==="TextField")
					print+="\n\t<p id='"+key+"' class='fourteen columns'>{{{"+key+"}}}</p>";
				if(col.type ==="CharField" || col.type ==="EmailField")
					print+="\n\t<label class='two columns'>"+key[0].toUpperCase()+key.slice(1)+":</label><label id='"+key+"' class='thirteen columns'> {{"+key+"}}</label>";
//				print+="<br>";
			});			
			
			_.each(model.columns,function(col,key){
				if(col.type ==="TextField")
					view+="\n\t<label class='one columns'>"+key[0].toUpperCase()+key.slice(1)+": </label><p id='"+key+"' class='sixteen columns'>{{{"+key+"}}}</p>";
				if(col.type ==="CharField" || col.type ==="EmailField")
					view+="\n\t<label class='one columns'>"+key[0].toUpperCase()+key.slice(1)+":</label><p id='"+key+"' class='thirteen columns'> {{"+key+"}}</p>";
				
//				view+="<br>";
			});
			
			_.each(model.columns, function(col,key){
				if(col.type ==="TextField")
					edit+="\n\t<label class='one columns'>"+key[0].toUpperCase()+key.slice(1)+": </label><textarea id='"+key+"' class='fourteen columns'>{{{"+key+"}}}</textarea>";
				if(col.type ==="CharField" || col.type ==="EmailField")
					if(col.editable!=false && !col.choices)
						edit+="\n\t<label class='two columns'>"+key[0].toUpperCase()+key.slice(1)+": </label><input id='"+key+"' type='text' value = {{"+key+"}}></input>";
					else if(col.editable!=false && col.choices){
						edit+="\n\t<label class='two columns'>"+key[0].toUpperCase()+key.slice(1)+": </label><select id='"+key+"' selected='{{"+key+"}}'>";
						edit+="\n\t\t<option value='{{"+key+"}}' label='Currently: {{"+key+"}}' selected='true'>";
						_.each(col.choices,function(choice){
							edit+="\n\t\t<option value='"+choice+"'>"+choice+"</option>";
						});
						edit+="\n\t</select>";
					} else
						edit+="\n\t<label class='two columns'>"+key[0].toUpperCase()+key.slice(1)+": </label><label id='"+key+"'>{{"+key+"}}</label>";
//				edit+="<br>";
			});
			
			_.each(model.mtm,function(mtm,alias){
				edit+="<form class='noactionupdate' action='/rest/"+model.name+"."+alias+".new/' method='POST'>";
				edit+="<input type='hidden' value='{{id}}'></input>";
				edit+="<input type='submit' value='Add New "+mtm+" to "+alias[0].toUpperCase()+alias.slice(1)+"'></submit>";
				edit+="</form>";
			});
			
			print	+=	"\n</div>";
			view	+=	"\n</div><button class='__edit__ one columns'>Edit</button></div>";
			edit	+=	"\n</div><button class='__done__ one columns'>Done</button></div>";

			var content=print+edit+view;
			fs.writeFile("./public/templates/"+model.name+".hbs",content,cbk);
		};
		
		funcs.push(f);
	});
	async.series(funcs,function(err,result){
//		console.log(err,result);
		callback(err,result);
	})
}

exports.init   = init;
module.exports = exports;
