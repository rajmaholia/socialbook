$j(document).ready(function () {
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
                console.log('Error fetching search results:', error);
            }
        });
    });

    // Handle click on a search result
    $j('#searchResults').on('click', 'li', function () {
        // Handle the selected username, you may redirect to the user's profile page
        var selectedUsername = $j(this).text();
        console.log('Selected username:', selectedUsername);

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

$j(document).ready(function() {
    let page = 1 ;

    function loadPosts() {
        $j.ajax({
            url: `/get-posts?page=${page}`,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                const posts = response.posts;
                if (posts.length > 0) {
                    // Update the HTML with the new posts
                    for (const post of posts) {
                        let mediaTag = ` <img src="${post.url}" alt="photo" style="object-fit:cover" class="w-100 h-100">`;
                        if(post.is_video){
                            mediaTag = `<video src="${post.url}" class="w-100 h-90" controls style="max-height:400px"></video>`;
                        } 

                        let likeBtn = `<i class="far fa-heart"></i>`;
                        let liked = '';
                        if (post.liked_by_me){
                            likeBtn = `<i class="fas fa-heart" style="color:red"></i>`;
                            liked = 'liked';
                        }
                        let liketext = (post.no_of_likes==1)?"like":"likes";
                        $j('.feed').append(`
                        <div class="card mt-3">
                            <a class="card-header d-flex py-0 my-0 align-items-center text-decoration-none" href="/profile/${post.creator}"> 
                                <figure class="rounded-circle border-1 my-auto" style="width:25px;height:25px;overflow:hidden">
                                    <img src="${post.creator_img}" alt="profile_img" class="w-100 h-100" style="object-fit:fill">
                                </figure>
                                <div class=" p-0 m-0 ">${post.creator}</div>
                            </a>
                            <div class="card-body p-0">
                                ${mediaTag} 
                            </div> 
                            <div class="card-footer">                          
                                <div class="d-flex p-0 m-0">
                                    <button id="like-btn-${post.id}" class="p-1 border-0 ${liked}" onclick="LikeManager.likeClicked('${post.id}')">
                                        ${likeBtn}
                                    </button>
                                    <button id='comment-btn-${post.id}' class="p-1 border-0" data-toggle="modal" onclick="CommentManager.load('${post.id}')" data-target="#commentDrawer">
                                        <i class="far fa-comment"></i>
                                    </button>                      
                                </div>
                                <div class="w-100 mb-0 pb-0" >
                                        <span id="like-count-${post.id}">${post.no_of_likes}</span> <span class="liketext">${liketext}</span>                   
                                </div>
                                <p class="mt-3">${post.caption}</p>  
                            </div>             
                        </div>
                        `);
                    }
                    // Increment the offset for the next batch of posts
                    page += 1 ;
                } else {
                    // No more posts to load
                    $j('#loadMoreButton').hide();
                }
            },
            error: function(error) {
                console.error('Error loading posts:', error);
            }
        });
    }

    // Load posts on page load
    loadPosts();

    // Load more posts when the user clicks a button
    $j('#loadMoreButton').on('click', function() {
        loadPosts();
    });



});







//change url without loading 