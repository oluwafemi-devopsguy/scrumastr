from django.db import models
from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage


# Create your models here.

fs = FileSystemStorage(location='/media')


class ChatscrumSlackApp(models.Model):        
    SLACK_VERIFICATION_TOKEN = models.CharField(blank=True, null=True, max_length=80)
    CLIENT_ID = models.CharField(blank=True, null=True, max_length=80)
    CLIENT_SECRET = models.CharField(blank=True, null=True, max_length=80)

    def __str__(self):
        return self.SLACK_VERIFICATION_TOKEN
    

class ScrumProject(models.Model):
    name = models.CharField(max_length=50)
    project_count = models.IntegerField(default=0)
    to_clear_TFT = models.BooleanField(default=True)
 
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class ScrumEmail(models.Model):
    email = models.CharField(max_length=50)  

    def __str__(self):
        return self.email
    
    class Meta:
        ordering = ['email']      
        
class ScrumUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)
    slack_user_id = models.CharField(blank=True, null=True, max_length=50)
    slack_email = models.CharField(blank=True, null=True, max_length=50)
    slack_username = models.CharField(blank=True, null=True, max_length=50)

    
    def __str__(self):
        return self.nickname
    
    class Meta:
        ordering = ['nickname']
        
class ScrumProjectRole(models.Model):
    role = models.CharField(max_length=20)
    color = models.CharField(max_length=50, default="white")
    user = models.ForeignKey(ScrumUser, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)

    slack_user_id = models.CharField(blank=True, null=True, max_length=50)
    slack_email = models.CharField(blank=True, null=True, max_length=50)
    slack_username = models.CharField(blank=True, null=True, max_length=50)
    slack_profile_picture = models.TextField(blank=True, null=True, default="https://secure.gravatar.com/avatar/8ca9b9d6ee37371cba9ee9362cdbbc9b.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F00b63%2Fimg%2Favatars%2Fava_0005-512.png")
    
    def __str__(self):
        return self.role
        return '{} {} '.format(self.role,self.user)

class ScrumDemoProject(models.Model):
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    expiration_date = models.DateTimeField()
    
    def __str__(self):
        return expiration_date
        
class ScrumGoal(models.Model):
    visible = models.BooleanField(default=True)
    moveable = models.BooleanField(default=True)
    name = models.TextField()
    status = models.IntegerField(default=-1)
    goal_project_id = models.IntegerField(default=0)
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    hours = models.IntegerField(default=-1)
    time_created = models.DateTimeField()
    file = models.ImageField(blank=True, null=True, storage=fs)
    days_failed = models.IntegerField(default=0)
    message_exist = models.BooleanField(default=False)
    push_id = models.CharField(max_length=100, default="Null Value")

    
    
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
    profile_picture = models.TextField(default="prof_pic")
    date_Time = models.DateTimeField(auto_now = True)
    room = models.ForeignKey(ScrumChatRoom, on_delete=models.CASCADE)


class ScrumSprint (models.Model):
    created_on = models.DateTimeField()
    ends_on = models.DateTimeField()
    goal_project_id = models.IntegerField(default=0)    

    def __str__(self):
        
        return '{} {} '.format(self.goal_project_id,self.created_on)

    class Meta:
        ordering = ['id']


class ScrumGoalHistory(models.Model):
    name = models.TextField()
    status = models.IntegerField(default=-1)
    goal_project_id = models.IntegerField(default=0)
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    hours = models.IntegerField(default=-1)
    time_created = models.DateTimeField()
    file = models.ImageField(blank=True, null=True)
    goal = models.ForeignKey(ScrumGoal, on_delete=models.CASCADE)
    done_by = models.TextField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['id']

# class ScrumProjectSlack(models.Model):
#     project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
#     slack_client_id = models.CharField(max_length=50)
#     slack_client_secret = models.CharField(max_length=50)
#     slack_verification_token = models.CharField(max_length=50)
#     slack_bot_user_token = models.CharField(max_length=50)
    
#     def __str__(self):
#         return self.slack_client_id
    
#     class Meta:
#         ordering = ['-id']

class ScrumSlack(models.Model):
    scrumproject = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    room = models.ForeignKey(ScrumChatRoom, on_delete=models.CASCADE)
    user_id  = models.CharField(max_length=500)
    team_name  = models.CharField(max_length=500)
    team_id  = models.CharField(max_length=500)
    channel_id  = models.CharField(max_length=500)
    access_token = models.CharField(max_length=500)
    bot_user_id  = models.CharField(max_length=500)
    bot_access_token = models.CharField(max_length=500)
    
    def __str__(self):
        return self.team_name
    
    class Meta:
        ordering = ['-id']


class ScrumNote(models.Model):
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    note = models.TextField(blank=True, null=True)
    priority  = models.CharField(max_length=500)    
    time_created = models.DateTimeField()
    
    def __str__(self):
        return self.note
    
    class Meta:
        ordering = ['-id']

class ScrumWorkId(models.Model):
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    workid = models.TextField(blank=True, null=True)
    branch = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.workid
        return self.branch   

    class Meta:
        ordering = ['-id'] 

class ScrumLog(models.Model):
    user = models.ForeignKey(ScrumProjectRole, on_delete=models.CASCADE)
    project = models.ForeignKey(ScrumProject, on_delete=models.CASCADE)
    log = models.TextField(blank=True, null=True)
    priority  = models.CharField(max_length=500)    
    time_created = models.DateTimeField()
    
    def __str__(self):
        return self.log
    
    class Meta:
        ordering = ['-id']         
