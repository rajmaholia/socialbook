

class PostManager {
        // Set your Django server's base URL
    static baseUrl = 'http://127.0.0.1:8000';

    // Fetch all posts
    static getAllPosts() {
        const url = `${PostManager.baseUrl}/posts/`;

        return $j.ajax({
            url: url,
            method: 'GET',
            dataType: 'json'
        })
        .done(data => {
            console.log('Fetched Posts:', data);
            return data;
        })
        .fail(error => {
            console.error('Error fetching posts:', error);
            throw error;
        });
    }

    static getAllPostOfUser(user){

    }

    static getAllPostForUser(user){

    }


    // Like a post
    static likePost(postId) {
        const url = `${PostManager.baseUrl}/like-post/`;

        return $j.ajax({
            url: url,
            method: 'POST',
            dataType: 'json'
        })
        .done(data => {
            console.log('Post Liked:', data);
            return data;
        })
        .fail(error => {
            console.error('Error liking post:', error);
            throw error;
        });
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