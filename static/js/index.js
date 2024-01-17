
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
        fetch(`/like_post/?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                const likeButton = document.getElementById(`like-btn-${postId}`);
                likeButton.innerHTML = `<i class="far fa-heart"></i>${data.like_count}`;
                
            
            });
    }

    static likeClicked(postId){
        const likeButton = document.getElementById(`like-btn-${postId}`);
        if(likeButton.classList.contains('liked')){
            //unliked
            likeButton.innerHTML = `<i class="far fa-heart"></i>`;
        }
        else {
            //liked
            likeButton.innerHTML = `<i class="fas fa-heart" style="color:red"></i>`;
        }
        likeButton.classList.toggle('liked');
                // Toggle the color of the heart button
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

