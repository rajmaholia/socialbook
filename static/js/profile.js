$j('.tabMainContent').on('click',function(e){
    const fileViwerModal = document.getElementById('fileViewer');
   
    let target = e.target;
    let tagName = target.tagName; 
   
    if(tagName == "VIDEO" || tagName == "IMG"){
      const postId = target.getAttribute('data-pid');
      if(postId != null && postId.trim().length != 0){
          PostViewer.loadViewer(fileViwerModal,postId); 
      }
    }
  });