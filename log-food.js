(function logFoodWrapper($) {
    EatLogGo.checkLogin();

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      document.getElementById('fphoto').addEventListener('change', handleFileSelect, false);
    } else {
      $("#fphoto-wrap").hide();
    }
    function handleClick(e) {
        e.preventDefault();
        logEntry($("#fdate").val(), $("#type").val(), $("#details").val(), $("#fphoto-b64").val());
    }
    $("#log-food-submit").click(handleClick);

    function logEntry(date, type, details, encodedPicture) {

      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/food-log',
        headers: {
          "Authorization": EatLogGo.globalAuthToken,
        },
        data: JSON.stringify({
            Date: date,
            Type: type,
            Details: details,
            EncodedPicture: encodedPicture
        }),
        contentType: 'application/json',
        beforeSend: function Processing() {
            $("#log-food-submit").removeClass("btn-primary")
            .addClass("btn-secondary")
            .off("click",handleClick)
            .text("Processing....");

        },
        success: handleSuccess,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            alert('An error occured when logging your entry\n');
            $("#log-food-submit").removeClass("btn-secondary")
            .addClass("btn-primary")
            .on("click",handleClick)
            .text("Submit");
        }
      });
    }

    function handleSuccess() {
      alert("Food Log entry successfully added.");
      window.location.href = "log.html";
    }

    function handleFileSelect(evt) {
      var f = evt.target.files[0]; // FileList object
      var reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var binaryData = e.target.result;
          //Converting Binary Data to base 64
          var base64String = window.btoa(binaryData);
          //showing file converted to base64
          $("#fphoto-b64").val(base64String);
        };
      })(f);
      // Read in the image file as a data URL.
      reader.readAsBinaryString(f);
    }

    function setCurrentDate() {
        var now = new Date();
        var today =  now.getFullYear() + "-" + (now.getMonth()+1).toString().padStart(2,"0") + "-" + now.getDate().toString().padStart(2,"0");
        $("#fdate").val(today);    
    }

    setCurrentDate();


}(jQuery));