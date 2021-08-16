(function logWrapper($) {
    var logId;
    const deleteIcon = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-trash trash-can'fill='currentColor' xmlns='http://www.w3.org/2000/svg'>\
    <path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z'/>\
    <path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z'/>\
    </svg>";
    var $loading = $("<img id='loading'>");
    var authToken;
    const TOTAL_ENTRIES = 20;
    const LOADING_ICON_URL = "https://media0.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif";
    const GHOST_IMG_URL = "https://eatloggo-images.s3-us-west-1.amazonaws.com/log_entry_pictures/eatloggo-food-placeholder.png";
    var response;

    EatLogGo.checkLogin().then(retrieveFoodLog);
    
    function showLoadingSign() {
        $loading.attr("src", LOADING_ICON_URL);
        $loading.appendTo("body");
    }

    function retrieveFoodLog() {
        debugger;
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/food-log',
            headers: {
              "Authorization": EatLogGo.globalAuthToken
            },
            contentType: 'application/json',
            beforeSend: showLoadingSign,
            success: handleSuccess,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                alert('Failed to retrieve food log');
            }
        });
    }
    
    function handleSuccess(response) {
        debugger;
        $loading.remove();
        var entries = response.Item || response.Items;
        entries.sort(compareLogEntries);
        var i = 0;
        for(const key in entries) {
            
            var date = formatDate(entries[key].EntryDate);
            var details = "<span class='realDetails'>" + entries[key].Details + "</span>";
            var type = entries[key].Type;
            logId = entries[key].LogId;
            var entryHTML = ["<div id='entry_" + logId + "'class='entry border rounded border-light'>"];
            var imgUrl = entries[key].Picture && entries[key].Picture.Location;
            var href;
           
            entryHTML.push("<div class='img-holder'>");

            if(imgUrl) {
                href = imgUrl;
                entryHTML.push('<a href="' + href + '">');
                entryHTML.push('<img src="' + imgUrl + '" class="entry-pic" />');
                entryHTML.push('</a>');
            }
            
            $(deleteIcon).css("float","right");
            entryHTML.push("<div class='details'>" + details);
            entryHTML.push("<a href='javascript:;' class= 'delete-wrapper' id='del_" + logId + "'" + ">" + deleteIcon + "</a>");
            entryHTML.push("<a href='javascript:;' class='edit-wrapper' id='edit_" + logId + "'> <svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-pencil-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>\
              <path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>\
              <path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z'/>\
              </svg></a></div>")
            entryHTML.push("</div>");
            entryHTML.push("<span class='date'>" + date + "</span>");
            entryHTML.push("<span class='type'>" + type + "</span>");
            
            entryHTML.push("</div>");
            
            $("#allEntries").append(entryHTML.join(""));
            
            i++;
            if((i+1) === TOTAL_ENTRIES) {
                return;
            }
            
        }
        for(var y = 0; y < Object.keys($(".type")).length; y++) { 
            if($($(".type")[y]).text() === "Lunch") { 
                $($(".type")[y]).addClass("badge").addClass("badge-warning");
            } 
            else if($($(".type")[y]).text() === "Dinner") { 
                $($(".type")[y]).addClass("badge").addClass("badge-danger");
                $($(".type")[y]).css("color","black")       
            } else {
                $($(".type")[y]).addClass("badge").addClass("badge-secondary");

            }
        }
        
        if(!entries.length) {
            showEmptyState();
        }
        $("#log").show();
        // attach a click handler to delete icon here
        $(".delete-wrapper").click(deleteEntry);
        $(".edit-wrapper").click(editEntry);
    }

    function compareLogEntries(a, b) {
        var ts1 = new Date(a.EntryDate).getTime();
        var ts2 = new Date(b.EntryDate).getTime();

        var comparison = 0;
        if(ts2 > ts1) {
            comparison = 1;
        } else {
            comparison = -1;
        }
        return comparison;
    }


    function showEmptyState() {
        var ghost = $("<img>");
        ghost.attr("src",GHOST_IMG_URL);
        ghost.attr("id","pic");
        var note = $("<p id='note'>");
        note.text("You have no entries yet.");
        var create = $("<button id='create' class='btn btn-primary'>");
        create.attr("type","submit");
        create.text("Create Entry");
        $("#table").prepend(ghost);
        $("#pic").after(note);
        $(note).after(create);
        create.on("click",emptyStateCreate);
    }  
    function emptyStateCreate() {
        EatLogGo.redirectTo("log-food.html");
    }
    function deleteEntry(e) {
        var deleteAjaxCall = $.ajax({
            method: 'DELETE',
            url: _config.api.invokeUrl + '/food-log',
            headers: {
                "Authorization": EatLogGo.globalAuthToken
            },
            data: JSON.stringify({
                "LogId": e.currentTarget.id.replace('del_', '')
            }),
            contentType: 'application/json',
            beforeSend: function() {
                var check = confirm("We will now be deleting this entry");
                if(!check) {
                    deleteAjaxCall.abort();
                } else {

                }

            },
            success: handleDelete,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {

                alert("An error occured when deleting your entry");
                //window.location.reload(true);
            } 
        })
    }
    function handleDelete() {
        window.location.reload(true);
    }
    function handleEdit() {
        EatLogGo.redirectTo(docum);
    }
    function editEntry(e) {
        debugger;
        var id = e.currentTarget.id;
        var entry = $("#entry_"+id.replace('edit_',''));
        $(entry.find('span')[0]).addClass("edit").attr("contenteditable","true");
        var startEdit = $("<button class='editEntry'>").attr("type","submit").text("Save").addClass("btn").addClass("btn-primary").appendTo("#entry_"+id.replace('edit_',''));
        console.log(e.currentTarget.id)
        $(".edit-wrapper").off("click",editEntry);
        startEdit.click(function() {
            $(entry.find('span')[0]).attr("contenteditable","false").removeClass("edit");
            $(".editEntry").remove()
            $.ajax({
            method: 'PATCH',
            url: _config.api.invokeUrl + '/food-log',
            headers: {
                "Authorization": EatLogGo.globalAuthToken
            },
            data: JSON.stringify({
                "LogId": id.replace('edit_',''),
                "newDetails": $(entry.find('span')[0]).text(),

            }),
            contentType: 'application/json',
            success: handleEdit,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {

                alert("An error occured when deleting your entry");
                //window.location.reload(true);
            } 
        })
        });
    }
       
        
    function handleEdit() {
        //alert("Edited successfully!");
        debugger;
        window.location.reload(true);
    }
    

    function formatDate(entryDate) {
        var daysOfWeek = {
            "0": "Sun",
            "1": "Mon",
            "2": "Tues",
            "3": "Wed",
            "4": "Thurs",
            "5": "Fri",
            "6": "Sat"
        };
        var dateParts = entryDate.split("-");
        var entryDateObj = new Date(dateParts[0], (dateParts[1]-1), dateParts[2], 0, 0, 0);
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return daysOfWeek[entryDateObj.getDay().toString()] + " " + entryDateObj.toLocaleDateString(undefined, options);
    }
}(jQuery));

