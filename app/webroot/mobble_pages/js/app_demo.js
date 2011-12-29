steps_shown = 3;
cur_shown = 1;
step_width = 240;
function goRight() {
	if (cur_shown==7) return;
	add(true);
	$('.demo_step').animate({"left":"-="+step_width}, {"duration": 500});
	setTimeout(function () {$('.demo_step:first').remove();}, 501);
	cur_shown++;
}

function goLeft() {
	if (cur_shown==1) return;
	add(false);
	$('.demo_step').animate({"left":"+="+step_width}, {"duration": 500});
	setTimeout(function () {$('.demo_step:last').remove();}, 501);
	cur_shown--;
}

function add(after) {
	if (after) {
		var step="";
		var next=cur_shown+steps_shown;
		step+="<div class='demo_step step_"+next+"'>";

		step+="<img class='demo_step_instruction' src='img/demo_text_"+next+".png' />";
		step+="<img class='demo_step_img' src='img/demo_img_"+next+".png' />";
		step+="<img class='demo_step_numb' src='img/demo_numb_"+next+".png' />";

		step+="</div>";
		$('#demo_area').append(step);
		$(".step_"+next).css("left", step_width*steps_shown);
	} else {
		var step="";
		var pre=cur_shown-1;
		step+="<div class='demo_step step_"+pre+"'>";

		step+="<img class='demo_step_instruction' src='img/demo_text_"+pre+".png' />";
		step+="<img class='demo_step_img' src='img/demo_img_"+pre+".png' />";
		step+="<img class='demo_step_numb' src='img/demo_numb_"+pre+".png' />";

		step+="</div>";
		$('#demo_area').prepend(step);
		$(".step_"+pre).css("left", -step_width);
	}
}
