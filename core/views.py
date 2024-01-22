from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.core.paginator import Paginator,EmptyPage

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from PIL import Image  # To check image dimensions

from .models import UserProfile, UserPost, PostLike, FollowRelation,Comment,Reply
from itertools import chain 
from .feed import Feed
from .user_suggestions import UserSuggestions
from .file_validation import validate_image,validate_video,is_video,is_image

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
        post.like_count += 1
        post.save()
        liked_or_unliked = "liked"
    else:
        like_filter.delete()
        post.like_count -= 1
        post.save()
        liked_or_unliked = "unliked"


    return JsonResponse({"status":liked_or_unliked})

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
    user_reels = [post for post in user_posts if is_video(post.file.url)]
    user_gallery = [post for post in user_posts if is_image(post.file.url)]
    context = {
        'user_object': user_object,
        'user_profile': user_profile,
        'user_posts': user_posts,
        'user_gallery':user_gallery,
        'user_reels':user_reels,
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
        username = request.POST['user']
        user = User.objects.get(username=username)
        if FollowRelation.objects.filter(follower=follower, following=user).first():
            delete_follower = FollowRelation.objects.get(follower=follower, following=user)
            delete_follower.delete()
        else:
            new_follower = FollowRelation.objects.create(follower=follower, following=user)
            new_follower.save()

    return redirect('/profile/' + username)

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
def signout(request):
    logout(request)
    return redirect('signin')

@login_required(login_url='signin')
def post_data(request,id):
    post =  UserPost.objects.get(id=id)
    
    if  PostLike.objects.filter(post=post,user=request.user).first() is not None:
        liked_by_me = True
    else :
        liked_by_me= False
    data = {'id':post.id,'caption':post.caption,'file':post.file.url,'created_at':post.created_at,'created_by':post.user.username,'like_count':post.like_count,'liked_by_me':liked_by_me}

    return JsonResponse(data)

@login_required(login_url='signin')
def get_posts(request):
    #define number of posts per page 
    posts_per_page = 10

    #get the current page from get request 
    page_number = request.GET.get('page',1)

    #Query all posts 
    all_posts = UserPost.objects.all()

    # Create a Paginator instance
    paginator = Paginator(all_posts, posts_per_page)

     # Ensure the requested page number is within a valid range
    try:
        page_number = int(page_number)
        if page_number < 1 or page_number > paginator.num_pages:
            raise EmptyPage
    except ValueError:
        raise EmptyPage
    
    except EmptyPage:
        return JsonResponse({'posts': []})
        
    
    try:
        # Get the current page's posts
        current_page_posts = paginator.page(page_number)
    except EmptyPage:
        # If the requested page is out of range, return an empty list
        return JsonResponse({'posts': []})

    
    serialized_posts = []
    for post in current_page_posts:
        is_video_file = is_video(post.file.url)
        liked_by_me = PostLike.objects.filter(post=post, user=request.user).exists()

    
        serialized_posts.append({'id': post.id, 'caption': post.caption,'url':post.file.url,'creator':post.user.username,'no_of_likes':post.like_count,'liked_by_me':liked_by_me,'is_video':is_video_file})
      # Return the serialized posts along with pagination information
    return JsonResponse({
        'posts': serialized_posts,
        'has_next': current_page_posts.has_next()
    })


@csrf_exempt
@login_required(login_url='signin')
def comment(request):
    if request.method=='GET':
        pid = request.GET.get('pid')
        comments = UserPost.objects.get(id=pid).comments.all()
        comments_serializable = [{'user':comment.user.username,'user_image':comment.user.userprofile.profile_img.url,"comment_text":comment.comment_text,"post":comment.post.id} for comment in comments]
        return JsonResponse(comments_serializable,safe=False)

    elif request.method=="POST":
        user = request.user 
        try:
            post = UserPost.objects.get(id=request.POST.get('pid'))
        except UserPost.DoesNotExist:
            return JsonResponse({"message":"Post Doesn't Exists"},status=404)
        comment_text = request.POST.get('comment_text')
        if(len(comment_text.strip())>0):
            Comment.objects.create(user=user,post=post,comment_text=comment_text)
            return JsonResponse({'message':"success"})
            
        return JsonResponse({"message":"Comment can't be empty"},status=400)
       
    return JsonResponse({"message":"error"},status=400)
            