from django.db import models
from django.contrib.auth.models import User

# Comment Just to edit a file and push
# Create your models here.

class ScrumProject(models.Model):
    name = models.CharField(max_length=50)
    project_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        
class ScrumUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nickname
    
    class Meta:
        ordering = ['nickname']
        
class ScrumProjectRole(models.Model):
    role = models.CharField(max_length=20)
    user = models.ForeignKey(ScrumUser, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.role

class ScrumDemoProject(models.Model):
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    expiration_date = models.DateTimeField()
    
    def __str__(self):
        return expiration_date
        
class ScrumGoal(models.Model):
    visible = models.BooleanField(default=True)
    name = models.TextField()
    status = models.IntegerField(default=-1)
    goal_project_id = models.IntegerField(default=0)
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    hours = models.IntegerField(default=-1)
    time_created = models.DateTimeField(auto_now_add=True)
    
    '''
    0 = Weekly Goal
    1 = Daily Target
    2 = Verify
    3 = Done
    '''
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-id']
        
class ScrumChatRoom(models.Model):
    name = models.TextField()
    hash = models.CharField(max_length=64)
    
class ScrumChatMessage(models.Model):
    user = models.CharField(max_length=50)
    message = models.TextField()
    room = models.ForeignKey(ScrumChatRoom, on_delete=models.CASCADE)
    