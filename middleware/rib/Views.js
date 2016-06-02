var Views={

		User:{
			name:"User",
			
			columns:{
				email:{type:"EmailField",unique:true,editable:false},
				type:{type:"CharField", length:255, choices:["student","admin","instructor"],print:false, auth:["admin"]},
				join_date:{type:"DateTimeField",print:false,editable:false},
				last_login:{type:"DateTimeField",print:false,editable:false},
			},
			
			mtm:[
				{ alias:"instructor", model:"Class", auth:["instructor","admin"], button:"Create new Class?"}
			],
			
			initialize:function(){
				
			}
		},
	
		Class:{
			columns:{
				title:{type:"CharField", length:255, auth:["instructor","admin"]},
				description:{type:"TextField", auth:["instructor","admin"]},
			},
			name:"Class",
			
			mtm:[
				{ alias:"class", model:"Module", auth:["instructor","admin"], button:"Add Module to Class?"},
				{ alias:"class", model:"Category", auth:["instructor","admin"], button:"Add Category to Class?"},
			]
		},
	
		Registration:{
			columns:{
				start_date:{type:"DateField", auth:["instructor","admin"]},
				end_date:{type:"DateField", auth:["instructor","admin"]},
				access_code:{type:"CharField",length:255, editable:false},
			},
			name:"Registration",
		},
	
		Module:{	
			columns:{
				title:{type:"CharField",length:255, auth:["instructor","admin"]},
				description:{type:"TextField",auth:["instructor","admin"]},
				creator:{type:"CharField", editable:false, print:false},
				class:{type:"CharField",editable,false,print:false},
			},
			mtm:[
				{alias:"submodule",model:"Module", auth:["instructor","admin"],button:"Create New Submodule for this Module?"},
				{alias:"module",model:"Assignment", auth:["instructor","admin"],button:"Create Assignment for this Module?"},
				{alias:"module",model:"Note", auth:["instructor","admin"],button:"Create new Note For this Module?"},
			],
			name:"Module",
		},
		
		Glossary:{
			name:"Glossary",

		},
	
		Definition:{
			name:"Definition",

		},
	
	
		Question:{
			columns:{
				description:{type:"TextField",auth:["instructor","admin"]},
				title:{type:"CharField",length:255,auth:["instructor","admin"]},
				header:{type:"TextField",auth:["instructor","admin"]},
				question:{type:"TextField",auth:["instructor","admin"]},
				answer:{type:"TextField",auth:["instructor","admin"]},
				solution:{type:"TextField",auth:["instructor","admin"]},
				hint:{type:"TextField",auth:["instructor","admin"]},
				graph_data:{type:"TextField",auth:["instructor","admin"]},
				tags:{type:"CharField",length:255,auth:["instructor","admin"]},
				placeholder:{type:"CharField",length:255,auth:["instructor","admin"]},
				answer_type:{type:"CharField",choices:[
					"expression","number","function","matrix","equation","array","list","tuple","string","character","interval"
					],auth:["instructor","admin"]},
			},
			
			name:"Question",
		},
	
		Category:{
			columns:{
				title:{type:"CharField",length:255,auth:["instructor","admin"]},
				description:{type:"TextField",auth:["instructor","admin"],
			},

			mtm:[
				{alias:"subcategory",model:"Category",auth:["instructor","admin"],button:"Create new subcategory for this category?"},
				{alias:"module",model:"Note", auth:["instructor","admin"],button:"Create new Note For this Category?"},
			],
			name:"Category"
		
		},

		Assignment:{

			columns:{
				title:{type:"CharField",length:255,auth:["instructor","admin"]},
				description:{type:"TextField",auth:["instructor","admin"]},
				type:{type:"CharField",length:255,choices:["Homework","Practice","Quiz","Test","Review"],auth:["instructor","admin"]},
			},
			
			mtm:[
				{alias:"question",model:"Question", auth:["instructor","admin"],button:"Create new Question for this Assignment?"},
			],
		
			name:"Assignment",
		},
	
		Note:{
			columns:{
				description:{type:"TextField"},auth:["instructor","admin"],
				title:{type:"CharField",length:255,auth:["instructor","admin"]},
				header:{type:"TextField",auth:["instructor","admin"]},	
				content:{type:"TextField",auth:["instructor","admin"]},		
			
			},
			name:"Note",
	
		},
	};
module.exports=Views