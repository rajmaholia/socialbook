from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('settings', views.settings, name='settings'),
    path('upload/', views.upload, name='upload'),
    path('follow', views.follow, name='follow'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('signup', views.signup, name='signup'),
    path('signin', views.signin, name='signin'),
    path('signout/', views.signout, name='signout'),
    path('reels/',views.reels_view,name='reels_view'),
    path('reel/<str:id>',views.reel_view , name='reel_view'),

    path('search/', views.search_api, name='search'),
    path('get_users_suggestions_for_post/',views.suggested_user_for_post_api),
    path('like-post', views.like_post_api, name='like_post_api'),
    path('posts/comment',views.comment_api,name="comment"),
    path('get-posts',views.get_posts_api,name="get_posts_api"),
    path('posts/<str:id>/',views.post_data_api,name='post_data_api'),
    path('reels/',views.reels_api,name='reels_api'),
    path('get_reels/',views.get_reels_api,name='get_reels_api')
]