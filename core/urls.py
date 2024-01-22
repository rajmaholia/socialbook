from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('settings', views.settings, name='settings'),
    path('upload/', views.upload, name='upload'),
    path('follow', views.follow, name='follow'),
    path('search/', views.search, name='search'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('like-post', views.like_post, name='like-post'),
    path('signup', views.signup, name='signup'),
    path('signin', views.signin, name='signin'),
    path('signout/', views.signout, name='signout'),
    path('posts/comment',views.comment,name="comment"),
    
    path('get-posts',views.get_posts,name="get_posts"),
    path('posts/<str:id>/',views.post_data,name='post_data'),
]