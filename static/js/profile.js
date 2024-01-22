  //File Viewer 
  // Get the button and the modal elements
  $j('.tabMainContent').on('click',function(e){

    let target = e.target;
    let tagName = target.tagName;
   
    if(tagName == "VIDEO" || tagName == "IMG"){
      fileViwerModal.show();

      $j('#btnPostComment').prop("disabled",true);

      const postId = target.getAttribute('data-pid'); // Replace this with the actual post ID
      PostManager.getData(postId)
        .then(response => {
          // Use the response data as needed
          $j('.btn-like').attr('data-pid',target.getAttribute('data-pid'));
          $j('#btnPostComment').attr('data-pid',target.getAttribute('data-pid'));
         
          let like_text =(response.like_count == 1)? "like":"likes";
         $j('#noOfLikes').text(`${response.like_count}`);
         $j('#likeText').text(like_text);
        
         //caption 
         $j('#captionText').text(response.caption);
         
         if(response.liked_by_me){
            $j('.btn-like').addClass("liked");   
            $j('.btn-like').html(`<i class="fas fa-heart" style="color:red"></i>`);
          } else {
            $j('.btn-like').removeClass("liked")
            $j('.btn-like').html(`<i class="far fa-heart"></i>`)

          }
         $j('#btnPostComment').prop("disabled",false);

        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      
         let tagFigure = $j('figure');
        tagFigure.empty();
        if(tagName == 'VIDEO'){
            tagFigure.append(`<video src="${target.src}" data-pid="${target.getAttribute('data-pid')}" class="w-100"  controls="play" autoplay></video>`)
        }
        else if(tagName == 'IMG'){
            tagFigure.append(`<img src="${target.src}" data-pid="${target.getAttribute('data-pid')}" class="w-100">`)
        }

   }
   });


  var fileViwerModal = new bootstrap.Modal(document.getElementById('fileViewer'));
  

  $j('.btn-like').on('click',function(e){
    const likeButton = document.getElementsByClassName('btn-like')[0];
    let noOfLikes = parseInt($j('#noOfLikes').text());

    if(likeButton.classList.contains('liked')){
        //unliked
        likeButton.innerHTML = `<i class="far fa-heart"></i>`;
        noOfLikes -= 1 ;

    }
    else {
        //liked
        noOfLikes += 1;
        likeButton.innerHTML = `<i class="fas fa-heart" style="color:red"></i>`;
    }
    let like_text = (noOfLikes == 1) ? "like":"likes";
    $j('#likeText').text(like_text);
    $j('#noOfLikes').text(noOfLikes)

    likeButton.classList.toggle('liked'); // Toggle the color of the heart button
    $j.ajax({
      url:`/like-post?post_id=${e.currentTarget.getAttribute("data-pid")}`,
      method:'GET',
      success:function(data){

      },
      error:function(error){

      }
    })
  });

  $j('#btnPostComment').on("click",function(e){
    PostManager.addComment(e.target.getAttribute('data-pid'),$j('#commentInput').val())
    .then(response =>{
      console.log(response)
      $j('#commentInput').val(' ')
    })
    .catch(error=>{
      console.log(error)
    })
  });
