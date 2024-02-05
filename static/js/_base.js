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

    
    static createImg(imgObj,container=null) {
        if(container == null){
            container = $j('#contentArea');
        }


        
        // Create video element

        
        let btnheart = `<button class="btn-post-like"><i class="far fa-heart"></i></button>`;
        if(imgObj.liked_by_me){
            btnheart = `<button class="btn-post-like liked"><i class="fas fa-heart" style="color:red"></i></button>`;
        }
        let like_count = PostManager.formattedNumber(imgObj.no_of_likes);
        let comment_count = PostManager.formattedNumber(imgObj.no_of_comments);

        const postHtml  = `
            <div class="post-container card" data-post-id="${imgObj.id}">
                <a href="/profile/${imgObj.creator}" class="card-header d-flex">
                    <figure class="rounded-circle  mr-2" style="width:30px;height:30px;overflow:hidden">
                        <img class="user-image" src="${imgObj.creator_img}" alt="User Image" style='object-fit:cover;width:100%;height:100%'>
                    </figure>
                    <div style="font-size:14px;padding-bottom:0" class="">${imgObj.creator}</div>
                </a>
                <div class="card-body">
                    <img  alt="loading ..." src="${imgObj.url}" class="w-100" />
                </div>
                <div class="card-footer post-details ps-1 "> 
                        ${imgObj.caption}
                        <div class="post-actions p-0 m-0">
                            <ul class="d-flex nav p-0 m-0">
                                <li class="nav-item">${btnheart} <span class="like_count d-block text-center">${like_count}</span></li>
                                <li class="nav-item"><button class="btn-post-comment"><i class="far fa-comment"></i> </button><span class="comment_count d-block text-center">${comment_count}</span></li>
                            </ul>
                        </div>
                </div>  
            </div>
        `;
        const post = $j(postHtml);
 
        // Append the reel container to the reels container
        container.append(post);

        //like event handling
        let likeBtn = post.find('.btn-post-like');
        let likeCountEl = post.find('.like_count');
        likeBtn.on('click',function(){
            PostLikeManager.like(imgObj.id,likeBtn,likeCountEl)
        });

        //comment event handling
        let commenBtn = post.find('.btn-post-comment');
        commenBtn.on('click',function(){
            let drawer = $j('#commentDrawer')[0];
            let drawerObj = new bootstrap.Modal(drawer)
            drawerObj.show()
            CommentManager.load(imgObj.id)
        })


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
           PostLikeManager.like(reelObj.id,likeBtn,likeCountEl)
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
            ShareManager.pid = reelObj.id;
            ShareManager.route='/reel/';
            ShareManager.show()
        });
    }
}

class PostViewer {
    static pid = null;
    static liked = null ;

    static loadPost(postObj) {
      let tagFigure = $j('.file-figure');
      tagFigure.empty();

      let media;
      // handles when file is video or image 
      if(PostViewer.isVideoFile(postObj.file)) {
            media = $j(`<video src="${postObj.file}" class="w-100 h-100"  autoplay></video>`);
            PostViewer.handleEvents(tagFigure,media);
      } else {
            media = $j(`<img src="${postObj.file}"  class="w-100 h-100">`);
            PostViewer.handleEvents(tagFigure);
      }
      tagFigure.append(media);

      //set liked or unliked
      if(PostViewer.liked) {
        let likeBtn = $j('.btn-like');
        PostLikeManager.updateIcon(likeBtn,true);
      }

      let likeText = $j('.like-text');
      let likeCount = $j('.like-count');
      PostLikeManager.updateCount(postObj.like_count,likeCount,likeText)
    }

    static loadViewer(fileViwerModal,postId){
      // define the modal object for file viwer
      let fileViwerModalObj = new bootstrap.Modal(fileViwerModal);

      //getting post data of post with given id 
      PostManager.getData(postId)
        .then(response => {
          fileViwerModalObj.show();
          PostViewer.pid = postId;
          PostViewer.liked = response.liked_by_me;
          PostViewer.loadPost(response); 
          CommentManager.load(PostViewer.pid);
        }).catch(error=> {
        });     
    }

    static isVideoFile(file) {
      // Get the file extension
      const fileNameParts = file.split('.');
      const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();

      // List of video file extensions
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv'];

      // Check if the file extension is in the list of video extensions
      return videoExtensions.includes(fileExtension);
    }

    static handleEvents(figure,video=null){
        if(video != null){
            video.on('click',function(){
                if(video[0].paused){
                video[0].play();
                } else {
                video[0].pause();
                }
            });
        }

      const $btnPostComment = $j('#btnPostComment');
      CommentManager.pid = PostViewer.pid;

    
      $btnPostComment.off('click');
      $btnPostComment.on('click',function(){
        CommentManager.post();
      });


      //Actions
      let fileViewer = $j('#fileViewer');
      let btnShare = fileViewer.find('.btn-share');
      
      btnShare.on('click',function(){
        ShareManager.route = '/p/';
        ShareManager.pid = PostViewer.pid;
        ShareManager.show()
      });
    

      let btnLike = fileViewer.find('.btn-like');
      let likeCount = fileViewer.find('.like-count');
      let likeText = fileViewer.find('.like-text');
      btnLike.off('click');
      btnLike.on('click',function(){
        PostLikeManager.like(PostViewer.pid,btnLike,likeCount,likeText)
      })
    }

}

class CommentManager {
    static commentDrawer = '#commentDrawer';
    static commentContainer = '#comment-content';
    static pid = '';
    static commentCountObj = null;

    static show(){
        const commentDrawer = $j(CommentManager.commentDrawer)[0];
        const bsModalObj = new bootstrap.Modal(commentDrawer);
        bsModalObj.show();
    }

    static load(postId){
        PostManager.getComments(postId)
        .then(response => {

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
    static pid = '';
    static route = null;
    static shareDrawer = '#shareDrawer';

    static copyLink(){
        navigator.clipboard.writeText(`${PostManager.baseUrl}${ShareManager.route}${ShareManager.pid}`)
        .then(function(){
        })
        .catch(function(error){
        });
    }

    static show(){
        let shareModal = new bootstrap.Modal($j(ShareManager.shareDrawer)[0]);
        shareModal.show();
    }
}

class PostLikeManager {
    static liked = null;

    static updateIcon($likeBtn,liked){
        if(liked){
            $likeBtn[0].innerHTML = `<i class="fas fa-heart" style="color:red"></i>`;
        } else {
            $likeBtn[0].innerHTML = `<i class="far fa-heart" ></i>`;
        }
    }

    static updateCount(noOfLikes,$countEl,$likeTextEl){
        let formattedLikes = PostManager.formattedNumber(noOfLikes);
        $countEl.text(formattedLikes);
        if($likeTextEl != null) {
            let $likeText = (noOfLikes == 1)?"like":"likes";
            $likeTextEl.text($likeText);
        }
    }

    static handleLike(postId,$btnObj,$likeCountEl,$likeTextEl) {
        fetch(`/like-post?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                PostLikeManager.updateCount(data.no_of_likes,$likeCountEl,$likeTextEl);
                PostLikeManager.updateIcon($btnObj,data.liked);
            })
    }$

    static like(postId,$btnObj,$likeCountEl,$likeTextEl=null){
        PostLikeManager.handleLike(postId,$btnObj,$likeCountEl,$likeTextEl);
    }

}
