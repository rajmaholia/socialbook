from django.contrib import admin
from .models import UserProfile, UserPost, PostLike, FollowRelation

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(UserPost)
admin.site.register(PostLike)
admin.site.register(FollowRelation)