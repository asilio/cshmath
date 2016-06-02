<div class="fourteen columns clearfix" >
	<div class="row" >

		<div id="title" class="ten columns"><%= Title %></div>
		<div id="score" class="three columns"></div>

	</div>
	<% if(NoSolution){ %>
		<div class="row" id="question_graph">
			<div id="question" class="eight columns"><%= Question %></div>
			<div id="graph" class="four columns"></div>
		</div>
	
		<% if(!NoAnswer){ %>
			<div class="row fifteen columns">
				<input id="answer" type="text" placeholder= "<%= placeholder %>" class="five columns">
				<input type="button" class="two columns" id="check_answer" value="Check Answer">
				<% if(!NoSimilarQuestion){ %>
				<input type="button" class="two columns" id="similar_question" value="Similar Question">
				<% } if(!NoButtons){ %>

					<% if(!NoSolutionButton){ %>
					<input type="button" class="two columns" id="solution_button" value="Solution">
					<% }if(!NoCalculator){ %>
					<input type="button" class="two columns" id="calculator" value="calculator">
					<% } if(!NoHint){%>
					<input type="button" class="two columns hidden" id="hint" value="Hint" style="display:none">
					<% } %>
				<% } %>
				
			</div>
		<% } %>		
	
		
		
	<% if(!NoKeyBoard){ %>
	<div class="row iKeyboard sixteen columns">
		<div class="sixteen columns">
		<div class="row">
		<div class="iButton one columns" value="x">\(x\)</div>
		<div class="iButton one columns" value="y">\(y\)</div>
		<div class="iButton one columns" value="+">&#43;</div>
		<div class="iButton one columns" value="-">-</div>
		<div class="iButton one columns" value="/">&divide;</div>
		<div class="iButton one columns" value="*">&times;</div>
		<div class="iButton one columns" value="=">=</div>			
		<div class="iButton one columns" value="^">&#94;</div>

		<div class="iButton one columns" value="sqrt(">\(\sqrt{x}\)</div>
		<div class="iButton one columns" value="(">&#40;</div>
		<div class="iButton one columns" value=")">&#41;</div>
		<div class="iButton one columns" value="DELETE_ONE">&larr;</div>
		<div class="iButton one columns" value="DELETE_ALL">Clear</div>
		</div>
		</div>

	</div>
	<% if(iPad){ %>
		<div class="row iKeyboard sixteen columns">
			<div class="row">
				<div class="eleven columns">
					<div class="row">
						<div class="iButton one columns" value="q">Q</div>
						<div class="iButton one columns" value="w">W</div>
						<div class="iButton one columns" value="e">E</div>
						<div class="iButton one columns" value="r">R</div>
						<div class="iButton one columns" value="t">T</div>
						<div class="iButton one columns" value="y">Y</div>
						<div class="iButton one columns" value="u">U</div>
						<div class="iButton one columns" value="i">I</div>
						<div class="iButton one columns" value="o">O</div>
						<div class="iButton one columns" value="p">P</div>				
					</div>
					<div class="row">
						<div class="iButton one columns" value="a">A</div>
						<div class="iButton one columns" value="s">S</div>
						<div class="iButton one columns" value="d">D</div>
						<div class="iButton one columns" value="f">F</div>
						<div class="iButton one columns" value="g">G</div>
						<div class="iButton one columns" value="h">H</div>
						<div class="iButton one columns" value="j">J</div>
						<div class="iButton one columns" value="k">K</div>
						<div class="iButton one columns" value="l">L</div>
					</div>		
					<div class="row">
						
						<div class="iButton one columns " value="z">Z</div>
						<div class="iButton one columns" value="x">X</div>
						<div class="iButton one columns" value="c">C</div>
						<div class="iButton one columns" value="v">V</div>
						<div class="iButton one columns" value="b">B</div>
						<div class="iButton one columns" value="n">N</div>
						<div class="iButton one columns" value="m">M</div>
						<div class="iButton one columns" value=",">,</div>
						<div class="iButton one columns" value="[">&#91;</div>
						<div class="iButton one columns" value="]">&#93;</div>
					</div>
				</div>
	
				<div class="four columns">
					<div class="row">
						<div class="iButton one columns" value="7">7</div>
						<div class="iButton  one columns" value="8">8</div>
						<div class="iButton  one columns" value="9">9</div>
					</div>
					<div class="row">
						<div class="iButton one columns" value="4">4</div>
						<div class="iButton one columns" value="5">5</div>
						<div class="iButton one columns" value="6">6</div>
					</div>
					<div class="row">
						<div class="iButton one columns" value="1">1</div>
						<div class="iButton one columns" value="2">2</div>
						<div class="iButton one columns" value="3">3</div>
					</div>
					<div class="row">
						<div class="iButton one columns" value="&lt;" >&lt;</div>
						<div class="iButton one columns" value="0">0</div>
						<div class="iButton one columns" value="&gt;">&gt;</div>
					</div>
				</div>
			</div>
		</div>
	<% } %>
	<% } %>
	<div class="row"><label>Clicking this will erase your current input</label><input type="button" id="toggle_keyboard" value="On Screen Keyboard"></div>
	<% }else if(!IsTest){%>
			<div class="row">
				<div id="solution" class="eight columns" type="text" ><%= Solution %></div>
				<div id="graph" class="four columns"></div>
			</div>
			<div class="row">
			<input type="button" class="two columns" id="similar_question" value="Similar Question">
			</div>
	<% }else if(IsTest){ %>
		<div class="row">
			<h3>Answer has already been submitted</h3>
		</div>
	<% } %>

	
</div>