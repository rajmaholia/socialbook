from django.db.models import Count
from .models import UserPost, FollowRelation

class Feed:
    """Algorithm to prepare a post feed for the user."""

    @staticmethod
    def get_user_feed(user, max_posts=10):
        # Fetch posts from users the current user is following, ordered by created_at
        following_users_ids = FollowRelation.objects.filter(follower=user).values_list('following', flat=True)
        feed_list = (
            UserPost.objects
            .filter(user__in=following_users_ids)
            .order_by('-created_at')[:max_posts]
        )
        return feed_list
