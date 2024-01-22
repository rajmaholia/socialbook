listMedia(document.getElementById('btnListVideos'),'videos');

function listMedia(currentTarget ,mediaType) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(mediaType).style.display = "block";
    currentTarget.className += " active";
  }

  document.getElementById("tab").addEventListener('click',function(e){
    if (e.target.id=='btnListVideos'){
      listMedia(e.target,'videos')
    } else if(e.target.id == 'btnListImages') {
      listMedia(e.target,"images")
    }
  },true);

