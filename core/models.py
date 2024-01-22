from django.db import models
from django.contrib.auth import get_user_model
import uuid
from django.utils import timezone

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_img = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    location = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.user.username

class UserPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='post_uploads')
    caption = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)

    def __str__(self):
        return self.caption

class PostLike(models.Model):
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.username}  Liked `{self.post}`'

class FollowRelation(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')

    def __str__(self):
        return f'{self.follower.username} follows {self.following.username}'
    
class Comment(models.Model):
    post = models.ForeignKey(UserPost,related_name="comments",on_delete=models.CASCADE)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    comment_text = models.CharField(max_length=255)

    def __str__(self):
        return f'@{self.user.username} Comments on {self.post} :  `{self.comment_text[:50]}`'
    
class Reply(models.Model):
    comment = models.ForeignKey(Comment,related_name="replies",on_delete=models.CASCADE)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    reply_text = models.CharField(max_length=255)    

    def __str__(self) -> str:
        return f'@{self.user.username} Replied to @{self.comment.user}\'s Comment ({self.comment.comment_text[:30]}): `{self.reply_text[:30]}`'