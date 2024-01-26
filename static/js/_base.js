

class PostManager {
        // Set your Django server's base URL
    static baseUrl = 'http://127.0.0.1:8000';
    static pid = '';

    static getAllPostOfUser(user){

    }

    static getAllPostForUser(user){

    }


    // Like a post
    static async likePost(postId) {
        const url = `${PostManager.baseUrl}/like-post?post_id=${postId}`;

        try {
            const data = await $j.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
            return data;
        } catch(error){
            throw error;
        }
    }

    // Add a comment to a post
    static async addComment(postId, commentText) {
        const url = `${PostManager.baseUrl}/posts/comment`;

        try {
            const data = await $j.ajax({
                url:url,
                method:'POST',
                dataType:'json',
                data:{pid:postId,comment_text:commentText}
            });
            return data;
        } catch(error){
            throw error;
        }

    }

    static async getComments(postId) {
        const url = `${PostManager.baseUrl}/posts/comment?pid=${postId}`;
        try {
            const data = await $j.ajax({
                url:url,
                method:'GET',
                dataType:'json',
            });
            return data;
        } catch(error){
            throw error;
        }

    }




    // Fetch data for a post by ID
    static async getData(postId) {
        const url = `${PostManager.baseUrl}/posts/${postId}/`;

        try {
            const data = await $j.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
            return data;
        } catch (error) {
            console.error(`Error fetching post with ID ${postId}:`, error);
            throw error;
        }
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
