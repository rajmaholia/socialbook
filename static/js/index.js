
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


class CommentManager {
    static commentContainer = '#comment-content';
    static pid = '';

    static load(postId){
        PostManager.getComments(postId)
        .then(response => {
            // console.log(response)
            $j(CommentManager.commentContainer).empty();
            $j('#comment-input').val(' ')
            $j("#commentCount").text(response.length);
            for (const comment of response){
                $j(CommentManager.commentContainer).append(`
                <div class="d-flex mb-3">
                    <div class="flex-shrink-0 rounded-circle p-0" style="width:30px;height:30px;overflow:hidden;border:2px solid purple">
                        <img src="${comment.user_image}" alt="photo" style="object-fit:cover" class="w-100 h-100">
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <b style="font-size:14px">${comment.user}</b>
                        <span style="font-size:15px" >${comment.comment_text}</span>
                    </div>
                </div>
                `);
            }
            CommentManager.pid = postId
        })
        .catch(error => {
           
        });
            
    }

    static post(){
        let commentText = $j('#comment-input').val();
        commentText = commentText.trim();
        if(commentText.length!=0){
            PostManager.addComment(CommentManager.pid,commentText)
            .then(response => {
                CommentManager.load(CommentManager.pid);
                $j('#comment-input').val(' ')
            }).catch(error => {

            });
        }
    }
}

    // Function to update the HTML with posts data
function updatePostsUI(posts) {
    const postsContainer = document.getElementById('posts-container');

    // ... (existing code)

    // Loop through posts data and update HTML
    posts.forEach(post => {
        const postHtml = `
            <div class="card mt-3">
                <div class="card-body">
                    <img src="${post.image_url}" alt="Post Image" class="img-fluid">
                    <div class="d-flex">
                        <!-- Like Button -->
                        <button id="like-btn-${post.id}" class="p-1 border-0 ${post.is_liked ? 'text-danger' : ''}" onclick="LikeManager.handleLike(${post.id})">
                            <i class="far fa-heart"></i>${post.like_count}
                        </button>

                        <!-- Comment Button -->
                        <button class="p-1 border-0" onclick="handleComment(${post.id})">
                            <i class="fas fa-comment"></i> Comment
                        </button>
                    </div>
                    <p class="mt-3">${post.caption}</p>
                </div>
            </div>
        `;

        // Append the post HTML to the container
        postsContainer.innerHTML += postHtml;
    });
}


// Add the following JavaScript to your existing script or create a new one
function showComment(){
    toggleCommentDrawer();
}

function toggleCommentDrawer() {
    const commentDrawer = document.getElementById('comment-drawer');
    // Toggle the transformation on click
    commentDrawer.style.transform = commentDrawer.style.transform === 'translateY(0)' ? 'translateY(100%)' : 'translateY(0)';
    alert(commentDrawer)

}

function handleAddComment() {
    // Your logic to handle adding a comment
    // You can make an AJAX request to your Django backend to save the comment
    // Update the comment content in the comment drawer
}

// Example: Call toggleCommentDrawer when the message icon is clicked

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
                            <div class="card-body">
                                ${mediaTag}                            
                                <div class="d-flex pb-0 mb-0">
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




