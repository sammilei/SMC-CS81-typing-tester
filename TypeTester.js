var default_article = "Points to remember. Preheat oven and a baking sheet to 220C/fan 200C. Mix strong bread flour, " +
"salt and fast-action yeast together in a large bowl. Quickly stir in lukewarm water and olive oil and bring " +
"together to a rough dough. Tip out the mixture onto a lightly floured worksurface and knead for 5 mins until " +
"you have a smooth, springy dough. Roll out into a thin round (you may have to stretch it with your hands a little) " +
"and place on a floured baking sheet. Add your favourite toppings (such as tomato passata, mozzarella, vegetables " +
"or cured meats), place the floured sheet on top of the preheated sheet and bake for 10-15 mins, until the pizza is golden and crispy." + "";
var text_article;
var input_by_word, typing_input;
var article_by_word, typeIn_by_word = [];
var time_selected;
var mode_selected;
var typingSpeed, num_of_error = 0, remaining_time;
var start_input = true;
var click_2_start = true;
var finished_one_word = false;
var len_per_minute = 500;//the highest len of text in char per sec
window.setInterval(function() {}, 20000);//for courting down

var text_article = sessionStorage.getItem('text_article');
time_selected = sessionStorage.getItem('time_selected');
var total_error = new Set();//store all error words index. 

$(document).ready(function() {
	/**
	 * customizeText.html
	 */
	//toolbar handler for customize
	$("#article_area").text(default_article);//set up the text area by default text
	$("#submitChoice").click(function() {
		mode_selected = $("#mode option:selected").text();
		time_selected = $("#time option:selected").text();	
		sessionStorage.setItem("time_selected",time_selected);
		
		if(mode_selected == "Customize"){//need to change
			//change the textarea style
			$("#article_area").text("Insert Your Customized Article Please");
			$("#article_area").css({
				'color' : 'red',
			});
			$("#article_area").fadeOut(500).fadeIn(500).prop('disabled', false);
		}else{
			text_article = packTheText(time_selected, default_article, len_per_minute);
			$("#article_area").text(text_article);
		}	
	});

	$('#submit_text').click(function(){
		//get the customized text
		text_article = packTheText(time_selected, $('#article_area').val(), len_per_minute);
		sessionStorage.setItem("text_article",text_article);
		window.location.replace("typingTester.html");
	});

	$("#article_area").click(function() {
		//change the textarea style
		$("#article_area").text("").css({
			'color' : 'blue',
		});

	});

	function packTheText(time, current_text,len_per_min){
		var len_needed = time * len_per_min;
		while(current_text.length < len_needed){
			current_text += current_text;
		}
		return current_text;
	}
	
	/**
	 * typingTest.html
	 */	
	
	/**
	 * disable cut copy paste functions
	 */
	 $('#typing').bind("cut copy paste",function(e) {
	      e.preventDefault();
	   });
	 
	$("#article2follow").html(text_article);
	$("#typing").click(function() {
		if(click_2_start == true){
			//change the textarea style
			$("#typing").text("");
			//once they start to type in, slip the text into an array of words 
			click_2_start = false;
			article_by_word = text_article.split(/\s+/);
		}
	});

	$( "#typing").keypress(function() {
		if(start_input == true){		
			start_input = false;
			var timer = parseInt(time_selected) * 60;
			var end = (new Date).getTime() + timer * 1000
			var countdown = setInterval(function() {
				var now = (new Date).getTime();
				remaining_time = Math.floor((end - now)/1000);
				if(remaining_time <= 0){
					clearInterval(countdown);//clear the setInterval
					//store result for the result page
					sessionStorage.setItem("accuracy", $('#speed').text());
					sessionStorage.setItem("error", $('#total_error').text());
					//direct to result page 
					window.location.replace("result.html");
				}else{
					$("#timeLeft").text(remaining_time);
					if(finished_one_word == true){//only process once a complete word is done by recognizing the space bar is pressed
						typeIn_by_word = $("#typing").val().trim().split(/\s+/);						
						comparingTyping();
						$("#article").text("");
						$("#article2follow").html(new_text);

						//update the evaluation session
						$("#error").text(num_of_error);
						$('#speed').text(get_accurary());
						$('#total_error').text(total_error.size/time_selected);
						finished_one_word = false;//reset the word completion detection
					}
				}
			}, 1000);
		}
	});	

	$("#typing").keydown(function(e){
		if(e.keyCode == 32){
			finished_one_word = true;
		}
	});	
});

var accuracy;
function get_accurary(){
	return parseInt((typeIn_by_word.length - num_of_error)/parseInt(time_selected*60 - remaining_time)*60);
}
/**
 * to compare the article and input texts
 * update article and input
 * updat num of error
 * formatting: wrong word: bold; finished: grey; ongoing: blue
 */
var new_text;
var new_typeIn;
function comparingTyping(){
	var text_for_article = "";//next formatted text
	var error = 0;//error counter
	for(var i = 0; i < typeIn_by_word.length; i++){
		if(typeIn_by_word[i] != article_by_word[i]){
			error ++;
			total_error.add(i);
			text_for_article += "<span style='color:red'>" + article_by_word[i] + "</span>" + " " ;
		}else{
			//color each finished word
			text_for_article += "<span style='color:grey'>" + article_by_word[i] + "</span>" + " ";
		}
		if(i == typeIn_by_word.length - 1){
			//color ongoing word
			text_for_article += "<span style='color:blue'>" + article_by_word[i + 1] + "</span>" + " ";
		}
	}

	
	//copy all rest of word to text
	for(var i = typeIn_by_word.length + 1; i < article_by_word.length; i++){
		text_for_article += article_by_word[i] + " ";
	}
	//updates
	num_of_error = error;
	new_text = text_for_article;
	new_typeIn = $('#typing');//
}

