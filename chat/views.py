from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib import auth

from django.shortcuts import reverse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Message, ChatUser
from django.contrib.auth.models import User
import datetime
from django.utils.timezone import now as utcnow
from django.utils.safestring import mark_safe



def index(request):

	if request.user.username and request.user.profile.is_chat_user:
		# intial chat json data

		r = Message.objects.order_by('-time')[:20]
		res = []
		for msgs in reversed(r) :
			res.append({'id':msgs.id,'user':msgs.user,'msg':msgs.message,'time':msgs.time.strftime('%I:%M:%S %p').lstrip('0'),'gravatar':msgs.gravatar})
	
		data = json.dumps(res)
		# end json
		context = {'data':mark_safe(data)}
		return render(request, 'djangoChat/index.html', context)
	else:
		return HttpResponseRedirect(reverse('login'))

@csrf_exempt
def chat_api(request):
	if request.method == 'POST':
		d = json.loads(request.body)
		msg =  d.get('msg')
		user = request.user.username
		gravatar = request.user.profile.gravatar_url
		m = Message(user=user,message=msg,gravatar=gravatar)
		m.save()


		res = {'id':m.id,'msg':m.message,'user':m.user,'time':m.time.strftime('%I:%M:%S %p').lstrip('0'),'gravatar':m.gravatar}
		data = json.dumps(res)
		return HttpResponse(data,content_type="application/json")


	# get request
	r = Message.objects.order_by('-time')[:20]
	res = []
	for msgs in reversed(r) :
		res.append({'id':msgs.id,'user':msgs.user,'msg':msgs.message,'time':msgs.time.strftime('%I:%M:%S %p').lstrip('0'),'gravatar':msgs.gravatar})
	
	data = json.dumps(res)

	
	return HttpResponse(data,content_type="application/json")



def update_time(request):
	if request.user.username:
		u = request.user.profile
		u.last_accessed = utcnow()
		u.is_chat_user = True
		u.save()
		return HttpResponse('updated')
	return HttpResponse('who are you?')