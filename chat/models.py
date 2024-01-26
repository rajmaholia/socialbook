from django.db import models
from datetime import datetime
from django.contrib.auth.signals import user_logged_in, user_logged_out  
from django.contrib.auth.models import User
import urllib, hashlib, binascii

class Message(models.Model):
	user = models.foreignKey(User,on_delete=models.CASCADE)
	message = models.CharField(max_length=200)
	time = models.DateTimeField(auto_now_add=True)
	to = models.ForeignKey(User,on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.user.username}'