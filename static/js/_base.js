
class ReelPlayer {

    static currentReelPid = '';
    static baseUrl = 'http://127.0.0.1:8000';
    static bundleNumber = 1;
    static currentReel = null;
    static muted = true;
    static playingId = '';
    static hasNextBundle = null;

    static createReel(reelObj) {
    
        const reelsContainer = $j('#contentArea');

        // Create reel container
        const reelContainer = $j(`<div class="reel-container" data-reel-id="${reelObj.id}"></div>`);

        const figure = $j('<figure  class="reelFigure"></figure>');
        
        // Create video element
        const video = $j('<video class="reel-video" loop></video>');
        const muteUnmuteButton = $j('<button class="mute-unmute-button"><i class="fas"></i></button>');
        const reelInfoHtml = `
                <div class="reel-info d-flex flex-column p-1">
                    <div class="reel-user-info d-flex pb-0">
                        <figure class="rounded-circle  mr-2" style="width:30px;height:30px;overflow:hidden">
                            <img class="user-image" src="${reelObj.creator_img}" alt="User Image" style='object-fit:cover;width:100%;height:100%'>
                        </figure>
                        <div style="font-size:14px;color:white;padding-bottom:0" class="">${reelObj.creator}</div>     
                    </div> 
                    <div class="reel-details"> 
                        ${reelObj.caption}
                    </div>       
                </div>
        `;
        const reelInfo = $j(reelInfoHtml);
        const userInfoClick = reelInfo.find('.reel-user-info');

        if(ReelPlayer.muted){
            muteUnmuteButton.find('i').addClass('fa-volume-mute');
            video.prop('muted',true)
        } else {
            muteUnmuteButton.find('i').addClass('fa-volume-high');
            video.prop('muted',false)
        }
        video.attr('src', reelObj.url);

        figure.append(video,muteUnmuteButton,reelInfo);

        const reelSidebar = $j('<div class="reel-sidebar"> </div>');
        
        let btnheart = `<button class="btn-reel-like"><i class="far fa-heart"></i></button>`;
        if(reelObj.liked_by_me){
            btnheart = `<button class="btn-reel-like liked"><i class="fas fa-heart" style="color:red"></i></button>`;
        }

        let like_count = PostManager.formattedNumber(reelObj.no_of_likes);
        let comment_count = PostManager.formattedNumber(reelObj.no_of_comments);

        const sideBarIcons = `
                <ul class="d-flex flex-column nav">
                    <li class="nav-item">${btnheart} <span class="like_count d-block text-center">${like_count}</span></li>
                    <li class="nav-item"><button class="btn-reel-comment"><i class="far fa-comment btn-reel-comment"></i> </button><span class="comment_count d-block text-center">${comment_count}</span></li>
                    <li class="nav-item"><button class="btn-reel-share"><i class="fas fa-paper-plane btn-reel-send"></i></button></li>  
                </ul>
                        `;
                 //   <li class="nav-item"><button class="btn-reel-moreoptions"><i class="fas fa-ellipsis-vertical btn-reel-more"></i></button></li>           
                
        reelSidebar.append(sideBarIcons);
        
        // Append video and overlay to the reel container
        reelContainer.append(figure, reelSidebar);

        // Append the reel container to the reels container
        reelsContainer.append(reelContainer);

        // Initialize Intersection Observer
        const observer = new IntersectionObserver(ReelPlayer.handleIntersection, { threshold: 0.8 });

        // Observe the reel container
        observer.observe(reelContainer[0]);

        // Add event listeners for various interactions
        ReelPlayer.addEventListeners(reelObj,video,muteUnmuteButton,reelSidebar,userInfoClick);
    }

    /**
     * Checks whether the current playin reel is second last .
     * 
     * @param {jQuery Object} container 
     * @returns true|false
     */
    static isSecondLastReel(container){
        const reels = $j('.reel-container');
        const index = reels.index(container)

        return index >= reels.length - 2;
    }

    /**
     * Handles intersections changes of reels .
     * 
     * @param {IntersectionObserverEntry} entries 
     */
    static handleIntersection(entries) {
        console.log(entries)
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const reelContainer = $j(entry.target);
                const reelId = reelContainer.data('reel-id');
                ReelPlayer.playingId = reelId;

                if(ReelPlayer.isSecondLastReel(reelContainer) && ReelPlayer.hasNextBundle){
                    ReelPlayer.loadMoreReels();
                }

               ReelPlayer.scrollReelContainer(reelContainer);

                // Find the video element within the visible reel container
                const videoElement = reelContainer.find('video');

                const previousReel = ReelPlayer.currentReel;
                const currentReel = videoElement;

                if(previousReel!=null) {
                    previousReel[0].pause();
                    previousReel[0].currentTime = 0;
                }

                let figure = reelContainer.find('figure');
                let muteUnmuteButton = figure.find('button')[0];
                let video = figure.find('video');
        

                if(ReelPlayer.muted){
                    video.prop('muted',true);
                    muteUnmuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    muteUnmuteButton.innerHTML = '<i class="fas fa-volume-high"></i>';
                    video.prop('muted',false);
                 }
                currentReel[0].play();
                ReelPlayer.currentReel = currentReel;

            }
            
        });
    }

      // Function to scroll the reel container to fully visible on the screen
    static scrollReelContainer(container) {
        // Implement the logic to scroll the container to fully visible on the screen
        // You can use window.scrollTo(), container.scrollTo(), or other scroll methods
        // Adjust the scroll amount based on your requirements
        const scrollAmount = container.height() * 0.4; // Example: Scroll 40% of the container height
        container.animate({ scrollTop: `+=${scrollAmount}px` }, 500);
    }


    /**
     * Makes ajax request to get more reels from server .
     * 
     * @returns object
     */
    static async getMoreReels(){
        const url = `${ReelPlayer.baseUrl}/get_reels?bn=${ReelPlayer.bundleNumber}`;
        try {
            const data = await $j.ajax(
                {
                    method:'GET',
                    url:url,
                    dataType:'json'
                }
            );
            return data;
        } catch(error){
            throw error;
        }
    }

    /**
     * Populates the reels in the page .
     */
    static loadMoreReels(){
        ReelPlayer.getMoreReels()
        .then(data => {
            ReelPlayer.bundleNumber += 1;
            ReelPlayer.hasNextBundle = data.has_next;
            data.reels.forEach(function(reel) {
                ReelPlayer.createReel(reel);
            });
        })
        .catch(error => {
            console.log("can't load more reels");
            console.log(error);
        })
    }

    /**
     * Applies events on every reel indivisually.
     * 
     * @param {jQuery  object} reelObj 
     * @param {jQuery video tag object} video 
     * @param {jQuery button object} muteUnmuteButton 
     * @param {*} reelSidebar 
     * @param {*} userInfoClick 
     */
    static addEventListeners(reelObj , video,muteUnmuteButton,reelSidebar,userInfoClick) {
        // Add event listener for tap to play/pause
        video.on('click', function() {
            if(ReelPlayer.playingId===reelObj.id) {
                if (video[0].paused) {
                    video[0].play();
                } else {
                    video[0].pause();
                }
            }
        });

        muteUnmuteButton.on('click',function(){
            ReelPlayer.muted = !(ReelPlayer.muted);

           
            if(ReelPlayer.muted){
                video.prop('muted',true);
                muteUnmuteButton[0].innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                muteUnmuteButton[0].innerHTML = '<i class="fas fa-volume-high"></i>';
                video.prop('muted',false);
            }
        });

       
        userInfoClick.on('click',function(){
            location.href= `${ReelPlayer.baseUrl}/profile/${reelObj.creator}`;
        });

        let likeBtn = reelSidebar.find('.btn-reel-like');
        likeBtn.on('click',function(){
           let likeCountEl = reelSidebar.find('.like_count');
           ReelLikeManager.like(reelObj.id,likeBtn,likeCountEl)
        });

        let commentBtn = reelSidebar.find('.btn-reel-comment');
        commentBtn.on('click',function(){
            let commentCountObj = reelSidebar.find('.comment_count');
            let commentViwerModal = new bootstrap.Modal(document.getElementById('commentDrawer'));
            commentViwerModal.show();
            CommentManager.pid = reelObj.id;
            CommentManager.commentCountObj = commentCountObj;
            CommentManager.load(reelObj.id);
        });

        let shareBtn = reelSidebar.find('.btn-reel-share');
        shareBtn.on('click',function(){
            let shareModal = new bootstrap.Modal(document.getElementById('shareDrawer'));
            shareModal.show();
            ShareManager.pid = reelObj.id;
            ShareManager.load();
        });

        let moreOptionsBtn = reelSidebar.find('.btn-reel-moreoptions');
        moreOptionsBtn.on('click',function(){
           
        });
    }

    static createPost(){
        
    }
}



class PostManager {
        // Set your Django server's base URL
    static baseUrl = 'http://127.0.0.1:8000';
    static pid = '';

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

    static formattedNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
          } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'k';
          } else {
            return number;
        }
    }
}


class CommentManager {
    static commentContainer = '#comment-content';
    static pid = '';
    static commentCountObj = null;

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
                if(CommentManager.commentCountObj != null){
                    CommentManager.commentCountObj.text(response.no_of_comments);
                }
            }).catch(error => {

            });
        }
    }
}

class ShareManager {
    static suggestUserContainer = '#suggest-or-search-users';
    static pid = '';

    static async getSuggested(){
        const url = `${PostManager.baseUrl}/get_users_suggestions_for_post/`;
        try {
           const data = await $j.ajax(
                {
                    method:'GET',
                    url:url,
                    dataType:'json'
                }
            );
            return data ;
        } catch(error){

        }

    }

    static copyLink(){
        navigator.clipboard.writeText(`${PostManager.baseUrl}/reel/${ShareManager.pid}`)
        .then(function(){
        })
        .catch(function(error){
        });
    }

    static searchUsers(){

    }

    static load(){
        const contentObj = $j(ShareManager.suggestUserContainer);
        ShareManager.getSuggested()
        .then(data => {
        
        })
        .catch(error =>{
        
        })
    }

}

class ReelLikeManager {
    static liked = null;

    static updateIcon(likeBtn){
        if(likeBtn[0].classList.contains('liked')){
            likeBtn[0].innerHTML = `<i class="far fa-heart"></i>`;
            ReelLikeManager.liked = false;
        } else {
            likeBtn[0].innerHTML = `<i class="fas fa-heart" style="color:red"></i>`;
            ReelLikeManager.liked = true;
        }
        likeBtn[0].classList.toggle('liked');
    }

    static updateCount(noOfLikes,countEl){
        let formattedLikes = PostManager.formattedNumber(noOfLikes);
        countEl.text(formattedLikes);
    }

    static handleLike(postId,likeCountEl) {
        fetch(`/like-post?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                ReelLikeManager.updateCount(data.no_of_likes,likeCountEl);
            })
    }

    static like(postid,btnObj,likeCountEl){
        ReelLikeManager.handleLike(postid,likeCountEl);
        ReelLikeManager.updateIcon(btnObj);
    }

}
