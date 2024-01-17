from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from PIL import Image  # To check image dimensions

from .models import UserProfile, UserPost, PostLike, FollowRelation
from itertools import chain 
from .feed import Feed
from .user_suggestions import UserSuggestions
from .file_validation import validate_image,validate_video

@login_required(login_url='signin')
def index(request):
    user_profile = UserProfile.objects.get(user=request.user)
    # Fetch posts from users the current user is following using Feed class
    feed_list = Feed.get_user_feed(request.user)

    # User suggestions using UserSuggestions class
    suggestions = UserSuggestions.get_suggestions(request.user)

    return render(request, 'index.html', {'user_profile': user_profile, 'posts': feed_list, 'suggestions_username_profile_list': suggestions})


@csrf_exempt
@login_required(login_url='signin')
def upload(request):
    if request.method == 'POST':
        user = request.user
        file = request.FILES.get('file')
        caption = request.POST.get('caption')
        errors = {}
        if file is None:
            errors['file'] = ['File is required']

        elif file.content_type.startswith('image/'):
           if  not validate_image(file):
               errors['file'] = ['Invalid image file']              
               
        elif file.content_type.startswith('video/'):
           pass
           #validation = validate_video(file)
           #if not validation['is_valid']:
            #   errors['file'] = [validation['error']]
        else:
            errors['file'] = ['Unsupported file type']              
                    
        if len(caption.strip())==0:
            errors['caption'] = ['Caption is required']

        if len(errors)==0:          
            new_post = UserPost.objects.create(user=user, file=file, caption=caption)
            new_post.save()
            return JsonResponse({'message':"Uploaded"})
        else:
            return JsonResponse(errors,status=400)
    return redirect('/')

@login_required(login_url='signin')
@require_GET
def search(request):
    if 'query' in request.GET:
        query = request.GET['query']
        username_objects = User.objects.filter(username__icontains=query)
        username_profile_list = []

        for user in username_objects:
            profile = UserProfile.objects.filter(user=user).first()
            if profile:
                username_profile_list.append({
                    'username': user.username,
                    'profile_img': profile.profile_img.url,
                })
        return JsonResponse(username_profile_list, safe=False)

    # Handle other cases or render an HTML template if needed
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required(login_url='signin')
def like_post(request):
    username = request.user
    post_id = request.GET.get('post_id')

    post = UserPost.objects.get(id=post_id)

    like_filter = PostLike.objects.filter(post=post, user=username).first()

    if like_filter is None:
        new_like = PostLike.objects.create(post=post, user=username)
        new_like.save()
        post.no_of_likes += 1
        post.save()
    else:
        like_filter.delete()
        post.no_of_likes -= 1
        post.save()

    return redirect('/')

@login_required(login_url='signin')
def profile(request, username):
    user_object = User.objects.get(username=username)
    user_profile = UserProfile.objects.get(user=user_object)
    user_posts = UserPost.objects.filter(user=user_object)
    user_post_length = len(user_posts)

    follower = request.user

    if FollowRelation.objects.filter(follower=follower, following=user_object).first():
        button_text = 'Unfollow'
    else:
        button_text = 'Follow'

    user_followers = len(FollowRelation.objects.filter(following=user_object))
    user_following = len(FollowRelation.objects.filter(follower=user_object))

    context = {
        'user_object': user_object,
        'user_profile': user_profile,
        'user_posts': user_posts,
        'user_post_length': user_post_length,
        'button_text': button_text,
        'user_followers': user_followers,
        'user_following': user_following,
    }
    return render(request, 'profile.html', context)

@login_required(login_url='signin')
def follow(request):
    if request.method == 'POST':
        follower = request.user
        user = request.POST['user']

        if FollowRelation.objects.filter(follower=follower, user=user).first():
            delete_follower = FollowRelation.objects.get(follower=follower, user=user)
            delete_follower.delete()
        else:
            new_follower = FollowRelation.objects.create(follower=follower, user=user)
            new_follower.save()

    return redirect('/profile/' + user)

@login_required(login_url='signin')
def settings(request):
    user_profile = UserProfile.objects.get(user=request.user)

    if request.method == 'POST':
        image = request.FILES.get('image')
        bio = request.POST['bio']
        location = request.POST['location']

        user_profile.profile_img = image if image else user_profile.profile_img
        user_profile.bio = bio
        user_profile.location = location
        user_profile.save()

    return render(request, 'setting.html', {'user_profile': user_profile})

def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']

        if password == password2:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email Taken')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username Taken')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()

                user_login = authenticate(username=username, password=password)
                login(request, user_login)

                user_model = User.objects.get(username=username)
                new_profile = UserProfile.objects.create(user=user_model)
                new_profile.save()

                return redirect('settings')
        else:
            messages.info(request, 'Password Not Matching')

    return render(request, 'signup.html')

def signin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.info(request, 'Credentials Invalid')

    return render(request, 'signin.html')

@login_required(login_url='signin')
def logout(request):
    logout(request)
    return redirect('signin')
