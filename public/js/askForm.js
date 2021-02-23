(function ($) {
	var askForm = $('#ask-form');
	var askInput = $('#question-text');
	var askBtn = $('#ask-submit-btn');
	var inputErrorDiv1 = $('#ask-error-div1');
	var inputErrorDiv2 = $('#ask-error-div2');
	var inputErrorDiv3 = $('#ask-error-div3');
	var remainp = $('#question-remain')
	var select = $('#select-topic option')
	askForm.on('submit',function(event){
		if(select.filter(':selected').val() == ''){
			event.preventDefault()
			askInput.focus();
			inputErrorDiv3.show()
		}
		if(!askInput.val() || askInput.val().trim() === '' || askInput.val().trim().length <5){
			event.preventDefault()
			askInput.focus();
			inputErrorDiv1.show()
	
		}

		
	})


	askInput.on('keyup blur', function() {
		//get the maxlength attr
		inputErrorDiv1.hide()
		inputErrorDiv2.hide()
		inputErrorDiv3.hide()
		var maxlength = $(this).attr('maxlength');
		var val = $(this).val().length;
		remain = parseInt(maxlength - val);
		remainp.text(remain +" characters remaining");
		//Stop input when length over max
		if (val.length > maxlength) {
			$(this).val(val.slice(0, maxlength));
		}
	});


  })(jQuery);
