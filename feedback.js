(function feedbackWrapper($) {
  EatLogGo.checkLogin();
  $("#submit-feedback").click(handleSend);

  function handleSend(e) {
    e.preventDefault();
    submitFeedback($("#feedback_text").val());
  }

  function submitFeedback(feedback) {
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/feedback',
      headers: {
        "Authorization": EatLogGo.globalAuthToken,
      },
      data: JSON.stringify({
          Email: EatLogGo.loggedInUser,
          Feedback: feedback,
      }),
      contentType: 'application/json',
      beforeSend: function Processing() {
          $("#submit-feedback").removeClass("btn-primary")
          .addClass("btn-secondary")
          .off("click",submitFeedback)
          .text("Submitting....");

      },
      success: function() {
        alert("Feedback submitted!");
        EatLogGo.redirectTo("log.html");
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
          alert('An error occured when submitting your feedback\n');
          $("#submit-feedback").removeClass("btn-secondary")
          .addClass("btn-primary")
          .on("click",handleSend)
          .text("Submit");
          }
        });
  }
}(jQuery));