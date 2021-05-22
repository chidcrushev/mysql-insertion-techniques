$(window).on("load", function () {
    console.log("window loaded");

    var x = document.getElementsByClassName("message-content");
    console.log(x)
    console.log(x.length)
    if (x.length > 0) {
        console.log(x)
        setTimeout(function () {
            x[0].style.display = 'none';
        }, 10000);
    }

    //Handling Form Dropdown
    $("#operation").change(function() {
        if ($(this).val() == "delete") {

            $('#fileupload-div').hide();
            $('#fileupload').removeAttr('required');
            $('#textarea-div').hide();
            $('#textarea_query').removeAttr('required');

        }
        else if ($(this).val() == "query"){
            $('#fileupload-div').hide();
            $('#fileupload').removeAttr('required');
            $('#textarea-div').show();
            $('#textarea_query').attr('required', '');

        }
        else {
            $('#fileupload-div').show();
            $('#fileupload').attr('required', '');
            $('#textarea-div').hide();
            $('#textarea_query').removeAttr('required');
        }
      });
      $("#operation").trigger("change");
});