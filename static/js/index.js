
class LikeManager {
    static handleLike(postId) {
        fetch(`/like-post?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                     
            });
    }

    static likeClicked(postId){
        const likeButton = document.getElementById(`like-btn-${postId}`);
        const likeCountTag = $j(`#like-count-${postId}`);
        let likes = parseInt(likeCountTag.text());
        if(likeButton.classList.contains('liked')){
            //unliked
            // alert(222)
            likes -= 1;
            likeButton.innerHTML = `<i class="far fa-heart"></i>`;
            likeCountTag.text(likes);
        }
        else {
            //liked
            likes += 1;
            likeButton.innerHTML = `<i class="fas fa-heart" style="color:red"></i>`;
            likeCountTag.text(likes);
        }
        if(likes == 1 ){
            likeCountTag.next('span').text("like")
        } else {
            likeCountTag.next('span').text("likes")
        }
        likeButton.classList.toggle('liked');
        LikeManager.handleLike(postId);
                // Toggle the color of the heart button
    }
}

class Index {
    static page = 1;
    static hasNext = true;
    static $currentlyPlaying = null;
    static muted = true;

   static handleIntersection(entries){
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                let $target = $j(entry.target);
                let postId = $target.data('post-id');

                let $video = $target.find('video');
               
                if($video.length != 0){
                        if(Index.$currentlyPlaying != null){
                         let $previousPost = Index.$currentlyPlaying;
                         $previousPost[0].pause()
                         $previousPost[0].currentTime = 0;
                        }
                        $video[0].play();
                        Index.$currentlyPlaying = $video;  

                    let $muteUnmuteButton = $target.find('.btn-mute-unmute');

                    if(Index.muted){
                        $video.prop('muted',true);
                        $muteUnmuteButton[0].innerHTML = '<i class="fas fa-volume-mute"></i>';
                    } else {
                        $muteUnmuteButton[0].innerHTML = '<i class="fas fa-volume-high"></i>';
                        $video.prop('muted',false);
                    }
                } else {
                    if(Index.$currentlyPlaying != null){
                        Index.$currentlyPlaying[0].pause();
                    }
                }
            }

        });
   }

   static createPost(post) {
        let mediaTag = ` <img src="${post.url}" alt="photo" style="object-fit:cover" class="w-100 h-100">`;
        let muteBtn = '';
        if(post.is_video){
            mediaTag = `<video src="${post.url}" class="w-100 h-100" style="max-height:400px"  muted></video>`;
            muteBtn = `<button class='btn-mute-unmute border-0'></button>`;
            
        } 

        let likeIcon = `<i class="far fa-heart"></i>`;
        let liked = '';
        if (post.liked_by_me){
            likeIcon = `<i class="fas fa-heart" style="color:red"></i>`;
            liked = 'liked';
        }
        let liketext = (post.no_of_likes==1)?"like":"likes";
        let $postObj =  $j(`
            <div class="card mt-3" data-post-id="${post.id}">
                <a class="card-header d-flex p-0  m-0 align-items-center text-decoration-none" href="/profile/${post.creator}"> 
                    <figure class="rounded-circle border-1 my-auto" style="width:25px;height:25px;overflow:hidden">
                        <img src="${post.creator_img}" alt="profile_img" class=" img-fluid" style="object-fit:cover;width:100%;height:120%">
                    </figure>
                    <div class=" p-0 m-0 ">${post.creator}</div>
                </a>
                <div class="card-body p-0 text-center">
                    ${mediaTag} 
                    ${muteBtn}
                </div> 
                <div class="card-footer">                          
                    <div class="d-flex p-0 m-0">
                        <button id="like-btn-${post.id}" class="p-1 border-0 ${liked}" onclick="LikeManager.likeClicked('${post.id}')">
                            ${likeIcon}
                        </button>
                        <button id='comment-btn-${post.id}' class="p-1 border-0" data-toggle="modal" onclick="CommentManager.load('${post.id}')" data-target="#commentDrawer">
                            <i class="far fa-comment"></i>
                        </button>
                        
                        <button id='share-btn-${post.id}' class="p-1 border-0"  onclick="PostManager.handleShare('${post.id}','/p/')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="w-100 mb-0 pb-0" >
                            <span id="like-count-${post.id}">${post.no_of_likes}</span> <span class="liketext">${liketext}</span>                   
                    </div>
                    <p class="mt-3">${post.caption}</p>  
                </div>             
            </div>
        `);
        $j('.feed').append($postObj);


        if(post.is_video){
            Index.attachEvents($postObj.find('video'),$postObj.find('.btn-mute-unmute'));
        }
        const observer = new IntersectionObserver(Index.handleIntersection,{threshold:0.6});
        observer.observe($postObj[0]);
   }

   static loadPosts(){
        Index.getPosts()
        .then(data => {
            const posts = data.posts;
            if(posts.length > 0) {

                for (const post of posts) {
                    Index.createPost(post);
                }
            } else {
                // No more posts to load
                $j('#loadMoreButton').hide();
            }
        }).catch(error => {

        });
   }

   static async getPosts(){
        const url = `/get-posts?page=${Index.page}`;
        try {
            const data = await $j.ajax({url:url,method:"GET",dataType:'json'});
            Index.hasNext = data.has_next;
            Index.page += 1 ;
            return data;
        } catch(error){
            throw error;
        }
   }

   static attachEvents(video,btnmuteUnmute){
    video.on('click',function(){    
        if(video[0].paused){
            video[0].play()
        } else {
            video[0].pause()
        }
    });

    btnmuteUnmute.on('click',function(){
        Index.muted = !(Index.muted);
        if(Index.muted) {
            video.prop('muted',true);
            btnmuteUnmute[0].innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            video.prop('muted',false);
            btnmuteUnmute[0].innerHTML = '<i class="fas fa-volume-high"></i>';
        }
    })
   }
}


$j(document).ready(function () {
        
    Index.loadPosts();

    $j('#loadMoreButton').on('click', function() {
        Index.loadPosts();
    });

    // Handle input in the search bar
    $j('#searchUsername').on('input', function () {
        var query = $j(this).val();
        // Make an AJAX request to fetch matching usernames
        $j.ajax({
            method: 'GET',
            url: '/search/',  // Replace with your Django endpoint for user search
            data: { 'query': query },
            success: function (data) {
                // Update the search results container
                var resultsContainer = $j('#searchResults');
                resultsContainer.empty();

                // Display live suggestions
                if (data.length > 0) {
                    data.forEach(function (result) {
                        resultsContainer.append(`<li class="list-group-item"><a href="/profile/${result.username}">${result.username}</a></li>`);
                    });
                    resultsContainer.show();
                } else {
                    resultsContainer.hide();
                }
            },
            error: function (error) {
            }
        });
    });

    // Handle click on a search result
    $j('#searchResults').on('click', 'li', function () {
        // Handle the selected username, you may redirect to the user's profile page
        var selectedUsername = $j(this).text();

        // Clear the search bar and hide results
        $j('#searchUsername').val('');
        $j('#searchResults').hide();
    });

    // Close search results when clicking outside the search bar
    $j(document).on('click', function (e) {
        if (!$j(e.target).closest('#searchUsername').length) {
            $j('#searchResults').hide();
        }
    });
});
