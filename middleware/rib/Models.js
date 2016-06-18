/*
Copyright Christopher William Person-Rennell 2014-2015
All Rights Reserved
*/
var Models={

	User:{
		columns:{
			email:{type:"EmailField",unique:true,editable:false},
			type:{type:"CharField", length:255, choices:["student","admin","instructor"],print:false},
			join_date:{type:"DateTimeField",print:false},
			last_login:{type:"DateTimeField",print:false},
		},

		defaults:{
			email:"default@email.com",
			join_date:"2000-02-01",
			last_login:"2000-02-01",
			type:"student",
		},		
		name:"User",
	},
	
	Class:{
		columns:{
			title:{type:"CharField", length:255},
			description:{type:"TextField"},
		},

		defaults:{
			title:"Untitled",
			description:"Description of Class",
			
		},
		
		mtm:{
			student:"User",
			instructor:"User",
		},
		
		name:"Class"
		
	},
	
	Registration:{
		name:"Registration",
		columns:{
			start_date:{type:"DateField"},
			end_date:{type:"DateField"},
			access_code:{type:"CharField",length:255},
		},
		
		defaults:{
			access_code:"0",
			start_date:"2000-02-01",
			end_date:"2000-02-01",
		},
		
		fk:{
			class:"Class"
		},
		
	},
	
	Module:{	
		columns:{
			title:{type:"CharField",length:255},
			rank:{type:"CharField",length:255},
			description:{type:"TextField"},
		},

		defaults:{
			title:"Untitled",
			description:"Description of the Module",
			rank:"",
			creator:1,
		},
		
		fk:{
			creator:"User",
			submodule:"Module",
		},
		
		mtm:{
			class_module:"Class",
		},
		
		name:"Module",
	},
		
	Glossary:{
		name:"Glossary",
		columns:{
			entry:{type:"CharField",length:255},
		},
		
		defaults:{
			entry:"",
		},
	},
	
	Definition:{
		name:"Definition",
		columns:{
			rank:{type:"CharField",length:255},
			definition:{type:"TextField"},
		},
		
		defaults:{
			definition:"",
			rank:""
		},
		
		mtm:{
			entry:"Glossary",
		},
	},
	
	
	Question:{
		columns:{
			title:{type:"CharField",length:255},
			description:{type:"TextField",print:false},			
			header:{type:"TextField",print:false},
			question:{type:"TextField",editable:true},
			answer:{type:"TextField",print:false},
			solution:{type:"TextField",print:false},
			graph_data:{type:"TextField",print:false},
			placeholder:{type:"CharField",length:255,print:false},
			answer_type:{type:"CharField",choices:[
				"expression","number","function","matrix","equation","array","list","tuple","string","character","interval"
				],print:false},
			hint:{type:"TextField",print:false},
			tags:{type:"CharField",length:255,print:false},

		},
	
		defaults:{
			title:'Untitled Question',
			header:'',
			question:'',
			answer:'',
			solution:'',
			answer_type:'expression',
			hint:'',
			placeholder:'',
			description:'',
			graph_data:'',
			tags:'',

		},
		
		fk:{
			author:"User",
		},

		name:"Question",
	},
	
	Category:{
		columns:{
			title:{type:"CharField",length:255},
			description:{type:"TextField"},
		},

		defaults:{
			title:"Category--Undefined",
			description:"What kind of categorization are we talking about?",
			
		},
		
		mtm:{
			class_category:"Class",
			subcategory:"Category"
		},

		name:"Category"
		
	},
	/*
		
	Subcategory:{
		columns:{
			title:{type:"CharField",length:255},
			description:{type:"TextField"},
		},

		defaults:{
			title:"Subcategory--Undefined",
			description:"What kind of categorization are we talking about?",
			
		},
		
		mtm:{
			question:"Question",
			category:"Category",
		},
		
		
		name:"Subcategory"
		
	},
	*/
	/*
		Assignments are made to the whole CLASS
		Assignments are built upon the Problem_set model
		There may be many problem sets assigned to many assignments
		the weight is the pure point value that the assignment is worth
			within its respective 'type'.
		The rank is the order in which this assignment appears amongst ALL assignments
			in the students assignment collection
		Assignments may have prerequisites (other assignments) with requisite scores, 
			or time, from other assignments.
	*/
	Assignment:{
		columns:{
			title:{type:"CharField",length:255},
			description:{type:"TextField"},
			type:{type:"CharField",length:255,choices:["Homework","Practice","Quiz","Test","Review"]},
		},
		
		defaults:{
			description:"Describe the assignment",
			title:"Untitled",
			type:"Homework",
		},
		
		mtm:{
			category:"Category",
			question:"Question",
			class_assignment:"Class",
			module_assignment:"Module",
		},
		
		name:"Assignment",
	},
	
	Note:{
		name:"Note",
		columns:{
			title:{type:"CharField",length:255},
			description:{type:"TextField"},
			content:{type:"TextField"},		
			header:{type:"TextField"},				
		},
		
		defaults:{
			title:"",
			description:"",
			content:"",
			header:""
		},
		
		mtm:{
			category_note:"Category",
			lecture:"Module",
		},
	},
	

};

module.exports=Models;