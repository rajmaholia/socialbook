
$j(document).ready(function () {
    // Handle input in the search bar
    
    $j('#fileToUpload').on('change',function(){
        let file = this.files[0];
        $j('#fileToUpload').empty();
        if(file){
            if(!(file.type.startsWith('video/') || file.type.startsWith('image/'))){
                 $j("#fileErrors").append(`<li style="font-size:.8em;color:red">Only video or image is allowed</li>`);
            }
        }else{
            $j("#fileErrors").append(`<li style="font-size:.8em;color:red">This is required</li>`)
        }
    });

    $j('#btnPost').on('click', function () {
        
        // Make an AJAX request to fetch matching usernames
        var caption = $j('#captionForPost').val();
        let fileInput = $j('#fileToUpload')[0];

        let file = fileInput.files[0];

        let formData =new FormData();

        formData.append('file',file);
        formData.append('caption',caption);

        $j.ajax({
            method: 'POST',
            url: '/upload/',  // Replace with your Django endpoint for user search
            data: formData,
            contentType:false,
            processData:false,
            success: function (data) {
                // Update the search results container
               window.location.href = '/';
            },
            error: function (xhr) {
                console.log(xhr.responseJSON);
                if(xhr.status==400 && xhr.responseJSON){
                    let errors = xhr.responseJSON;
                    
                    if(errors.file){
                        $j("#fileErrors").empty();
                        $j("#captionErrors").empty();

                        errors.file.forEach((error)=>{
                            $j("#fileErrors").append(`<li style="font-size:.8em;color:red">${error}</li>`)
                        });
                    }

                    if(errors.caption){
                        errors.caption.forEach((error)=>{
                            $j("#captionErrors").append(`<li style="font-size:.8em;color:red">${error}</li>`)
                        });
                    }
                }
            }
        });
    });
    
});