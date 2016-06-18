//db.js--built on top of mysql 
/* Copyright 2014 Christopher Person-Rennell All Rights Reserved 

db v0.1 (Functional as of 10/25/14)

    db  API 

Module exposes:
db.get 
db.insert
db.update
db.search
db.getVia
db.bulkInsert
------------------API----------------
db.VERB(bucket, properties, callback)
--bucket--
   string of the table name from the db.
--properties--
	Object with key==column name, obj[key]=value to be saved/updated
    
    Example usage
    userid={id:12}
    
    db.get("user",userid,function(err,result){
    	if(err)
    		console.log(err)
    	else
    		console.log("Success")
    	post(result[0].latest);//fictional function
    	});
    	
    db.insert("user",{name:"Jolly",email:"OldSaintNick@northpole.org"},function(err,res){
    
    	if(!err)
    		console.log("New user created!");
    });
   
    //Returns a list of users with 'we' anywhere in their email
    db.search("user",{email:'we'},function(err,result){
		console.log(err);
		console.log(result);
	});
	
	 //Returns an array of users with 'we' at the start of their email
	 //Note that the search string may contain regular expression 
    db.search("user",{email:'^we',noWild:true},function(err,result){
		console.log(err);
		console.log(result);
	});
	
	//Returns an array with a single user who is also in the student_class table where their student id is 27.
	db.getVia(["user","student_class"],{on:['id','student_id'], where:['student_id',27], limit:1},function(err,result){
		console.log(err);
		console.log(result);
	});

	//Inserts multiple entries (in this example duplicate) into a table. Order matters!
	db.bulkInsert('student_class',[{student_id:22,class_id:11},{student_id:22,class_id:11},{student_id:22,class_id:11}],function(err,result){
		console.log(err)
		console.log(result);
	});
    
--callback--
    function called on the success or failure of the mysql execution
	This middleware simply passes the callback to the mysql 
	query function. This callback expects to have two parameters:
    callback(err,results)

*/
var mysql=require('mysql');
var _=require('lodash');
var config=require('./config');

var connection=mysql.createConnection(config.db);

function apple(auth)
{
	if(true)
	{
		try{
			config.db.multipleStatements=true;
			var connection=mysql.createConnection(config.db);
		}catch(err)
		{
			console.log("Could not connect to database.\n"+err.toString());
		}
	}
	else{
		try{

			var connection=mysql.createConnection(config.db);
		}catch(err)
		{
			console.log("Could not connect to database.\n"+err.toString());
		}
	}
	return connection;
}

function getLimit(properties)
{
	if(properties.limit){
		var limit=" LIMIT 0, "+properties.limit;
		delete properties.limit;
	}
	else
		var limit=" LIMIT 0, 30";
	return limit;
}

/*WINNER for updating based on a selection
UPDATE class_user_instructor
SET rank = rank + 1 
WHERE instructor_id = 1 and rank > 25;
*/

var db={

	get:function(bucket, properties, callback){
		var connection=apple(false);//Start a connection
		var filter=""//Prepare filter
	
		//If the properties.limit is set, assume that the user wants a limit
		//Otherwise the default limit is 30.
		var limit=getLimit(properties);
		
		//Cycle through the properties for filtering and conjoin with AND
		_.each(properties,function(value,key){
			filter+=" "+bucket+"."+key+"='"+value+"' AND";
		});
		
		if(filter!="")
			filter=" WHERE "+filter;
			
		//Nip that extra AND off the end
		filter=filter.slice(0,-3);

		var query="SELECT * FROM "+bucket+filter+limit;

//		console.log(query);
		connection.query(query,callback);
		connection.end();
	},

	//Inserts into the table setting the giving properties.
	insert:function(bucket, properties, callback){
		var connection=apple(false);
		var query="INSERT INTO "+bucket+" SET ?";
//		console.log(query,properties);
		connection.query(query,properties,callback);
		connection.end();
	},

	//Properties can only contain one search item at a time.
	//This uses Regular expression searches for any string
	//containing the search value.
	search:function(bucket, properties, callback){
		console.log("SEARCHING DB");
		console.log("properties");
		var connection=apple(false);
		
		//If the properties.limit is set, assume that the user wants a limit
		//Otherwise the default limit is 30.
		var limit=getLimit(properties);

		var columns=_.keys(properties);
		//If the user passes in a noWild card exception drop the extra wild cards.
		if(properties.noWild)
		{
			var regexp="REGEXP '"+properties[columns[0]]+"'\n";
			delete properties.noWild;
		}
		else
			var regexp="REGEXP '.*"+properties[columns[0]]+".*'\n";
		
		
		var query="SELECT *\n"+
		   "FROM  "+bucket+" "+ 
			"WHERE  "+columns[0]+" "+ 
			regexp+
			limit;
		console.log(query);
		connection.query(query,callback);
		connection.end();
	},

	//Properties.id MUST be set. 
	//The id determines what is actually being updated in the table.
	update:function(bucket, properties, callback){
		var connection=apple(false);
		var id=properties.id;
		delete properties.id;
		
		var query="UPDATE "+bucket+" SET ? WHERE id="+id;
//		console.log(query);
//		console.log(properties);
		connection.query(query,properties,callback);
		connection.end();
	},
	
	
	delete:function(bucket,properties,callback){
		var connection=apple(false);
		var filter='';
		
		_.each(properties,function(value,key){
			filter+=bucket+"."+key+"="+value+" AND "
		});
		
		filter=filter.slice(0,-4);
		var query="DELETE FROM "+bucket+" WHERE "+filter;
		connection.query(query,callback);
		connection.end();
	},
	
	//Buckets must be an array with two buckets
	//The first is the table from which you want the results
	//The second is the shared table
	//properties.on must also be an array containing the column names
	//that the inner join is functioning on.
	//properties.where is an optional array. Will be converted into "WHERE properties.where[0]=properties.where[1]"
	getVia:function(buckets,properties,callback)
	{
		var connection=apple(false);
		var limit=getLimit(properties);
		var on=buckets[0]+"."+properties.on[0]+"="+buckets[1]+"."+properties.on[1];
		on="ON "+on;
		
		if(properties.where)
		{	
			var where=properties.where[0]+"="+properties.where[1];
			where="WHERE "+where+"\n";
		}else
			var where='';
		
		var query="SELECT * "+
					"FROM "+buckets[0]+"\n"+
					"INNER JOIN "+buckets[1]+"\n"+
					on+"\n"+
					where+
					limit;
//		console.log(query);
		connection.query(query,callback);
		connection.end();
	},
	
	//We are assuming now that properties is an array of properties
	//Order of the properties is kinda important...Hmm...
	//Each property of properties is assumed to contain, int he same order as expected on the DB
	//the list of values to be inserted, skipping the first (id) assumed to be an auto increment.
	//The value of null may be acceptable for those tables with default values.
	bulkInsert:function(bucket,properties,callback)
	{
		var connection=apple(false);
		var values="";
		//First cycle through the list
		_.each(properties,function(property)
		{
			values+="(null";
			//Then cycle through each property
			_.each(property,function(value,prop){		
				values+=", "+value;
			});
			
			values+="), ";
		});
		
		values=values.slice(0,-2);//Nip the pesky last comma.
		values=" VALUES "+values;
		var query="INSERT INTO "+bucket+values;
		connection.query(query,callback);
		connection.end();
		
	},
	
	all:function(bucket,callback){
		var connection = apple(false);
		var query = "SELECT * FROM "+bucket+";";
		connection.query(query,callback);
		connection.end();
	},
	
	//Execute pure arbitrary sql code. Possibly a horrible, horrible idea, but watheve.
	mysql:function(sql,callback)
	{
		var connection=apple(false);
		connection.query(sql,callback);
		connection.end();
	},
	
	
}
module.exports=db;
