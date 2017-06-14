var default_article = "The word dinosaur comes from the Greek language and means 'terrible lizard'. The word was coined by English paleontologist Richard Owen in 1842 and was meant" +
" to refer to Dinosaurs impressive size rather than their scary appearance. Dinosaurs ruled the Earth for over 160 million years, from the Triassic period around 230 million years ago"+
" through the Jurassic period and until the end of the Cretaceous period around 65 million years ago. The time period from 250 million years ago until around 65 million years ago is" + 
" known as the Mesozoic Era. It is often referred to as the Age of the Dinosaurs because most dinosaurs developed and became extinct during this time.It is believed that dinosaurs" +
" lived on Earth until around 65 million years ago when a mass extinction occurred.";
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
					typeIn_by_word = $("#typing").val().trim().split(/\s+/);						
					comparingTyping();
					$("#article").text("");
					$("#article2follow").html(new_text);

					//update the evaluation session
					$("#error").text(num_of_error);
					$('#speed').text(get_accurary());
					$('#total_error').text(total_error.size/time_selected);
				}
			}, 1000);
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
		if(i == typeIn_by_word.length - 1){
			//color ongoing word
			text_for_article += "<span style='color: yellowgreen'>" + article_by_word[i] + "</span>" + " ";
			text_for_article += "<span style='color:blue'>" + article_by_word[i + 1] + "</span>" + " ";
			break;
		}
		if(typeIn_by_word[i] != article_by_word[i]){
			error ++;
			total_error.add(i);
			text_for_article += "<span style='color:red'>" + article_by_word[i] + "</span>" + " " ;
		}else{
			//color each finished word
			text_for_article += "<span style='color:lightgrey'>" + article_by_word[i] + "</span>" + " ";
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

