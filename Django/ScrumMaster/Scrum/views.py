from django.core.mail import send_mail
from ScrumMaster import settings
from smtplib import SMTPException
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse, HttpRequest
from django.urls import reverse
from django.contrib import messages
from django.utils.dateparse import parse_datetime
from .models import *
from .serializer import *
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.serializers import ValidationError
from rest_framework.response import Response
from django.core import serializers
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from slackclient import SlackClient
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import random
import datetime
import re
import json
import hashlib

from Scrum.initials import *


from time import sleep

# Create your views here.

'''
def create_user(request):
    return render(request, "create_user.html")
    
def init_user(request):
    password = request.POST.get('password', None)
    rtpassword = request.POST.get('rtpassword', None)
    if password != rtpassword:
        messages.error(request, 'Error: Passwords Do Not Match.')
        return HttpResponseRedirect(reverse('Scrum:create_user'))
    user, created = User.objects.get_or_create(username=request.POST.get('username', None))
    if created:
        user.set_password(password)
        group = Group.objects.get(name=request.POST.get('usertype', None))
        group.user_set.add(user)
        user.save()
        scrum_user = ScrumUser(user=user, nickname=request.POST.get('full_name'), age=request.POST.get('age', None))
        scrum_user.save()
        messages.success(request, 'User Created Successfully.')
        return HttpResponseRedirect(reverse('Scrum:create_user'))
    else:
        messages.error(request, 'Error: Username Already Exists.')
        return HttpResponseRedirect(reverse('Scrum:create_user'))
        
def scrum_login(request):
    username = request.POST.get('username', None)
    password = request.POST.get('password', None)
    
    login_user = authenticate(request, username=username, password=password)
    if login_user is not None:
        login(request, login_user)
        return HttpResponseRedirect(reverse('Scrum:profile'))
    else:
        messages.error(request, 'Error: Invalid Credentials.')
        return HttpResponseRedirect(reverse('login'))
        
def profile(request):
    if request.user.is_authenticated:
        username = request.user.username
        user_info = request.user.scrumuser
        role = request.user.groups.all()[0].name
        goal_list = ScrumGoal.objects.order_by('user__nickname', '-id')
        nums = [x for x in range(4)]
        final_list = []
        item_prev = None
        
        for item in goal_list:
            if item.user != item_prev:
                item_prev = item.user
                final_list.append((item, goal_list.filter(user=item.user).count()))
            else:
                final_list.append((item, 0))
                
        context = {'username': username, 'user_info': user_info, 'role': role, 'goal_list': final_list, 'nums_list': nums}
        return render(request, "profile.html", context)
    else:
        messages.error(request, 'Error: Please login first.')
        return HttpResponseRedirect(reverse('login'))
    
def scrum_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse('login'))
    
def add_goal(request):
    if request.user.is_authenticated:
        name_goal = request.POST.get('name', None)
        group_name = request.user.groups.all()[0].name
        status_start = 0
        if group_name == 'Admin':
            status_start = 1
        elif group_name == 'Quality Analyst':
            status_start = 2
        goal = ScrumGoal(user=request.user.scrumuser, name=name_goal, status=status_start)
        goal.save()
        messages.success(request, 'Goal Added Successfully.')
        return HttpResponseRedirect(reverse('Scrum:profile'))
    else:
        messages.error(request, 'Error: Please login first.')
        return HttpResponseRedirect(reverse('login'))
        
def remove_goal(request, goal_id):
    if request.user.is_authenticated:
        if request.user.groups.all()[0].name == 'Developer':
            if request.user != ScrumGoal.objects.get(id=goal_id).user.user:
                messages.error(request, 'Permission Denied: Unauthorized Deletion of Goal.')
                return HttpResponseRedirect(reverse('Scrum:profile'))
                
        del_goal = ScrumGoal.objects.get(id=goal_id)
        del_goal.delete()
        messages.success(request, 'Goal Removed Successfully.')
        return HttpResponseRedirect(reverse('Scrum:profile'))
    else:
        messages.error(request, 'Error: Please login first.')
        return HttpResponseRedirect(reverse('login'))
        
def move_goal(request, goal_id, to_id):
    if request.user.is_authenticated:
        goal_item = ScrumGoal.objects.get(id=goal_id)
        group = request.user.groups.all()[0].name
        from_allowed = []
        to_allowed = []
        
        if group == 'Developer':
            if request.user != goal_item.user.user:
                messages.error(request, 'Permission Denied: Unauthorized Movement of Goal.')
                return HttpResponseRedirect(reverse('Scrum:profile'))
        
        if group == 'Owner':
            from_allowed = [0, 1, 2, 3]
            to_allowed = [0, 1, 2, 3]
        elif group == 'Admin':
            from_allowed = [1, 2]
            to_allowed = [1, 2]
        elif group == 'Developer':
            from_allowed = [0, 1]
            to_allowed = [0, 1]
        elif group == 'Quality Analyst':
            from_allowed = [2, 3]
            to_allowed = [2, 3]
            
        if (goal_item.status in from_allowed) and (to_id in to_allowed):
            goal_item.status = to_id
        elif group == 'Quality Analyst' and goal_item.status == 2 and to_id == 0:
            goal_item.status = to_id
        else:
            messages.error(request, 'Permission Denied: Unauthorized Movement of Goal.')
            return HttpResponseRedirect(reverse('Scrum:profile'))
        
        goal_item.save()
        messages.success(request, 'Goal Moved Successfully.')
        return HttpResponseRedirect(reverse('Scrum:profile'))
    else:
        messages.error(request, 'Error: Please login first.')
        return HttpResponseRedirect(reverse('login'))
'''

class ScrumEmailViewSet(viewsets.ModelViewSet):
    queryset = ScrumEmail.objects.all()
    serializer_class = ScrumEmailSerializer

    def create(self, request):

        messageTo = request.data['messagebody']
        emailTo = request.data['email']
        sent = send_mail('Invitation Email', 'Hello, You are invited to join chatscrum by clicking this link https://chatscrum.com/createuser . You are required to type ' + messageTo + ' in the project area when logging in. Thanks and regards.', 'admin@linuxjobber.com', [emailTo])      
        if sent:
            return JsonResponse({'message': 'Email sent Successfully.'})
        else:
            return JsonResponse({'message': 'Error: Email not sent.'})


def createDemoUser(request):
    demo_user = User.objects.create(username='demouser' + str(random.random())[2:])
    demo_user_password = 'demopassword' + str(random.random())[2:]
    demo_user.set_password(demo_user_password)
    demo_user.save()
    
    demo_scrumuser = ScrumUser(user=demo_user, nickname='Demo User')
    demo_scrumuser.save()
    
    demo_project_name = 'Demo Project #' + str(demo_user.pk)
    demo_project = ScrumProject(name=demo_project_name)
    demo_project.save()
    
    demo_projectrole = ScrumProjectRole(role="Owner", user=demo_scrumuser, project=demo_project)
    demo_projectrole.save()
    
    demo_projectdemo = ScrumDemoProject(project=demo_project, expiration_date=datetime.datetime.now() + datetime.timedelta(hours=24))
    demo_projectdemo.save()
    
    return JsonResponse({'username': demo_user.username, 'password': demo_user_password, 'project': demo_project_name})
    
    
class ScrumUserViewSet(viewsets.ModelViewSet):
    queryset = ScrumUser.objects.all()
    serializer_class = ScrumUserSerializer
    
    def create(self, request):
        print("Testing New user create====================")
        slack_app_id = ChatscrumSlackApp.objects.all().first().CLIENT_ID
        print(slack_app_id)

        
        # Pattern Match For an Email: https://www.regular-expressions.info/email.html
        regex_pattern = re.compile(r'(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)')
        if regex_pattern.match(request.data['email']) == None:
            return JsonResponse({'message': 'Error: Invalid email specified.'})
        if request.data['usertype'] == 'Owner' and ScrumProject.objects.filter(name__iexact=request.data['projname']).count() > 0:
            return JsonResponse({'message': 'Error: That project name is already taken.'})
        if request.data['usertype'] == 'Owner' and len(request.data['projname']) > 50:
            return JsonResponse({'message': 'Error: A project name cannot go over 50 characters.'})
        if len(request.data['full_name']) > 50:
            return JsonResponse({'message': 'Error: A user nickname cannot go over 50 characters.'})
        
        user, created = User.objects.get_or_create(username=request.data['email'], email=request.data['email'])
        if created:
            scrum_user = ScrumUser(user=user, nickname=request.data['full_name'])
            scrum_user.save()
            if request.data['usertype'] == 'Owner':
                scrum_project = ScrumProject(name=request.data['projname'])
                scrum_project.save()
                print(slack_app_id)
                scrum_project_role = ScrumProjectRole(role="Owner", user=scrum_user, project=scrum_project)
                scrum_project_role.save()

            user.set_password(request.data['password'])
            user.save()
            return JsonResponse({'message': 'User Created Successfully.', 'client_id': slack_app_id })
        elif user:
            if not request.data['projname']:
                return JsonResponse({'message': 'user already existed as a User. Create new project', 'client_id': slack_app_id})
            print("Testing vreationssssssssssss")
            scrum_user = User.objects.get(email = request.data['email'])
            print(scrum_user.scrumuser.nickname)
            scrum_project = ScrumProject(name=request.data['projname'])
            scrum_project.save()
            scrum_project_role = ScrumProjectRole(role="Owner", user=scrum_user.scrumuser, project=scrum_project)
            scrum_project_role.save()
            print("User exist and project created")
            return JsonResponse({'message': 'Project Created Successfully for already existing User.', 'client_id': slack_app_id})
        else:
            return JsonResponse({'message': 'Error: User with that e-mail already exists.'})


def userBgColor():
    list = ["#ff8080", "#4d4dff","#ff7ff6", "#66ffb3", "#99ddff","#ffffff", "#ffcc80", "#ff99ff","#ff0000", "#b3ffff", "#ffff80","#dfdfdf","#1a8cff", "#e085c2","#ffffff","#739900", "#739900", "#ffad33",  "#75a3a3", "#1a1aff"]
    color = random.choice(list)
    return color


def filtered_users(project_id):
    project = ScrumProjectSerializer(ScrumProject.objects.get(id=project_id)).data
    time_check = datetime.datetime.utcnow().replace(tzinfo=None)
    for user in project['scrumprojectrole_set']:
        user['scrumgoal_set'] = [x for x in user['scrumgoal_set'] if x['visible'] == True]
        total_hours = 0

        try:
            latest_sprint = ScrumSprint.objects.filter(goal_project_id = project_id).latest('ends_on')
            for goal in user['scrumgoal_set']:
                if latest_sprint.ends_on > parse_datetime(goal['time_created']) and latest_sprint.created_on < parse_datetime(goal['time_created']):
                    if goal['hours'] != -1 and goal['status'] == 3:
                        total_hours += goal['hours']
                        print("condition Tested okay")
        except Exception as e:
            pass
        

        
        user['total_week_hours'] = total_hours            
        
    return project['scrumprojectrole_set']


class ScrumProjectViewSet(viewsets.ModelViewSet):
    queryset = ScrumProject.objects.all()
    serializer_class = ScrumProjectSerializer
    
    def retrieve(self, request, pk=None):
        try:
            queryset = ScrumProject.objects.get(pk=pk)
            slack_installed = queryset.scrumslack_set.all().exists()
            slack_app_id = ChatscrumSlackApp.objects.all().first()
            print("======================Slack exists=======================" )
            print(slack_installed)
            return JsonResponse({'project_name': queryset.name,"slack_app_id":slack_app_id.CLIENT_ID, "slack_installed":slack_installed, 'data': filtered_users(pk)})
        except ScrumProject.DoesNotExist:
            return JsonResponse({'detail': 'Not found.'})
        except ChatscrumSlackApp.DoesNotExist:
            return JsonResponse({'project_name': queryset.name, "slack_installed":slack_installed, 'data': filtered_users(pk)})
    
class ScrumProjectRoleViewSet(viewsets.ModelViewSet):
    queryset = ScrumProjectRole.objects.all()
    serializer_class = ScrumProjectRoleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            scrum_project = ScrumProject.objects.get(id=instance.project.id)
            scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
            
            if scrum_project_role.role == "Owner":
                self.perform_destroy(instance)
                return JsonResponse({'message': 'User Removed from project', 'data': filtered_users(instance.project.id)})
            else:
                print(instance.role)
                return JsonResponse({'message': 'Permission Denied: Unauthorized to Delete User.', 'data': filtered_users(instance.project.id)})

        except:
            return JsonResponse({'message': 'User Do not exist'})
    
    def patch(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        to_id = request.data['id'][1:]
        
        print(request.data['role'])
        print(request.data['id'][1:])
        print(request.data['id'])

        author = ScrumProjectRole.objects.get(id=to_id)
        author.role = request.data['role'].capitalize()
        if request.data['role'] == 'quality analyst':
            author.role = 'Quality Analyst'
        author.save()
        
        return JsonResponse({'message': 'User Role Changed!', 'data': filtered_users(request.data['project_id'])})

class ScrumGoalViewSet(viewsets.ModelViewSet):
    queryset = ScrumGoal.objects.all()
    serializer_class = ScrumGoalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def create(self, request):
        user_id = request.data['user'][1:]
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        author = ScrumProjectRole.objects.get(id=user_id)
        sprint = ScrumSprint.objects.filter(goal_project_id = request.data['project_id'])
   
        if scrum_project_role != author and scrum_project_role.role != 'Owner': 
            return JsonResponse({'message': 'Permission Denied: Unauthorized Addition of a Goal.', 'data': filtered_users(request.data['project_id'])})
        
        if len(sprint) < 1:
             return JsonResponse({'message': 'Permission Denied: Sprint not yet started.', 'data': filtered_users(request.data['project_id'])})

        if (datetime.datetime.strftime(ScrumSprint.objects.latest('ends_on').ends_on, "%Y-%m-%d %H:%M:%S")) < datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"):
            return JsonResponse({'message': 'Permission Denied: Last Sprint Period Elapsed.', 'data': filtered_users(request.data['project_id'])})

        status_start = 0
        scrum_project.project_count = scrum_project.project_count + 1
        scrum_project.save()



        goal, created = ScrumGoal.objects.get_or_create(user=author, name=request.data['name'], project_id=request.data['project_id'], visible = True, moveable= True,
            defaults = {
                "user":author,
                "status":status_start,
                "time_created": datetime.datetime.now(),
                "goal_project_id":scrum_project.project_count,
            } )
        print("Test ::::::::::::::::::: Goal")
        print(request.data['name'])
        if created:
            return JsonResponse({'message': 'Goal created success.', 'data': filtered_users(request.data['project_id'])})

        if goal:
            return JsonResponse({'message': 'Goal already existed.', 'data': filtered_users(request.data['project_id'])})


    def patch(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_a = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True).user
        goal_id = request.data['goal_id'][1:]
        to_id = int(request.data['to_id'])
        goal_item = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True)

        
        if to_id == 4:
            if scrum_project_a.role == 'Developer':
                if request.user != scrum_project_b.user.user:
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(request.data['project_id'])})
                    
            del_goal = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True)
            del_goal.visible = False
            del_goal.save()         
            self.createHistory(goal_item.name, goal_item.status, goal_item.goal_project_id, goal_item.hours, goal_item.time_created, goal_item.user, goal_item.project, goal_item.file, goal_item.id, 'Goal Removed Successfully by')
            return JsonResponse({'message': 'Goal Removed Successfully!', 'data': filtered_users(request.data['project_id'])})
        else:           
            group = scrum_project_a.role
            from_allowed = []
            to_allowed = []
            if group == 'Developer':
                if request.user != scrum_project_b.user.user:
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(request.data['project_id'])})
            
            if group == 'Owner':
                from_allowed = [0, 1, 2, 3]
                to_allowed = [0, 1, 2, 3]
            elif group == 'Admin':
                from_allowed = [0, 1, 2]
                to_allowed = [0, 1, 2]
            elif group == 'Developer':
                from_allowed = [0, 1, 2]
                to_allowed = [0, 1, 2]
            elif group == 'Quality Analyst':
                from_allowed = [0, 1, 2, 3]
                to_allowed = [0, 1, 2, 3]
            
            state_prev = goal_item.status
            print("=======================PATCH REQUEST DATA======================")
            print(request.data)
            
            if (goal_item.status in from_allowed) and (to_id in to_allowed):
                goal_item.status = to_id
            elif group == 'Quality Analyst' and goal_item.status == 2 and to_id == 0:
                goal_item.status = to_id
            elif request.user == scrum_project_b.user.user:
                if goal_item.status == 1 and to_id == 0:
                    goal_item.status = to_id
                elif goal_item.status == 0 and to_id == 1:
                    goal_item.status = to_id
                else:
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(request.data['project_id'])})
            else:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(request.data['project_id'])})
            if goal_item.moveable == True:
                message = 'Goal Moved Successfully!'
                if to_id == 2 and request.data['hours'] :
                    goal_item.push_id = request.data['push_id']
                    goal_item.status = to_id
                    goal_item.hours = goal_item.hours
                    goal_item.push_id = request.data['push_id']
                    message = 'Goal Moved Successfully! Push ID is ' + request.data['push_id']
                if request.data['hours'] > 8:
                    goal_item.status = state_prev
                    message = 'Error: Task cannot Exceeds 8hours or less than an hour of completion.'
                elif request.data['hours'] == -1 and goal_item.hours == -1 and to_id > 1:
                     goal_item.status = state_prev
                     message = 'Error: A Task must have hours assigned.'
                elif request.data['hours'] == -13:
                     goal_item.status = state_prev
                     if request.data['push_id'] == "Canceled":
                        message = "Error,  No Work ID assigned"
                     else:
                        message = 'Error: A Task must have hours assigned.'
                elif to_id == 2 and state_prev == 1 :
                    goal_item.hours = request.data['hours']
                    message = 'Goal Moved Successfully! Hours Applied!'

                if to_id == 2 and request.data['hours'] < 8 and request.data['push_id'] == "Null Value":
                    goal_item.status = state_prev
                    message = 'Error: No PUSH-ID added.'               


                if state_prev == 1 and to_id == 0:
                    goal_item.days_failed = goal_item.days_failed + 1 
                
                self.createHistory(goal_item.name, goal_item.status, goal_item.goal_project_id, goal_item.hours, goal_item.time_created, goal_item.user, goal_item.project, goal_item.file, goal_item.id, 'Goal Moved Successfully by')          
                goal_item.save()
            else:
                message = "Sprint Period Elapsed, The Goal Cannot be Moved!"
            
            return JsonResponse({'message': message, 'data': filtered_users(request.data['project_id'])})
            
    def put(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        # scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:]).user
        if request.data['mode'] == 0:
            from_id = request.data['goal_id'][1:]
            to_id = request.data['to_id'][1:]
            
            if scrum_project_role.role == 'Developer' or scrum_project_role.role == 'Quality Analyst':
                return JsonResponse({'message': 'Permission Denied: Unauthorized Reassignment of Goal.', 'data': filtered_users(request.data['project_id'])})
                
            goal = scrum_project.scrumgoal_set.get(goal_project_id=from_id, moveable=True)
            if goal.moveable == True:
                print(to_id)
                author = ScrumProjectRole.objects.get(id=to_id)
                goal.user = author
                self.createHistory(goal.name, goal.status, goal.goal_project_id, goal.hours, goal.time_created, goal.user, goal.project, goal.file, goal.id, 'Goal Reassigned Successfully by')
                goal.save()
                return JsonResponse({'message': 'Goal Reassigned Successfully!', 'data': filtered_users(request.data['project_id'])})
            else:
                return JsonResponse({'message': 'Permission Denied: Sprint Period Elapsed!!!', 'data': filtered_users(request.data['project_id'])})
        elif request.data['mode'] == '1':
            goal = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True)
            # goal.file = request.FILES['image']
            

            myfile = request.FILES['image']
            fs = FileSystemStorage()
            print(myfile)
            print(myfile.name)
        
            filename = fs.save(myfile.name, myfile)
            goal.file = filename
            self.createHistory(goal.name, goal.status, goal.goal_project_id, goal.hours, goal.time_created, goal.user, goal.project, goal.file, goal.id, 'Image Added Successfully by')
            goal.save()
            
            return JsonResponse({'message': 'Image Added Successfully', 'data': filtered_users(request.data['project_id'])})
        elif request.data['mode'] == 2:
            goal = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True)
            scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True).user
            if (request.user == scrum_project_b.user.user or scrum_project_role.role == 'Owner') and goal.moveable == True and goal.status == 3:

                goal.visible = 0
                goal.save()
                print(request.user.id)
                return JsonResponse({'message': 'Goal Deleted Successfully!', 'data': filtered_users(request.data['project_id'])})
            else:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(request.data['project_id'])})
        elif request.data['mode'] == 3:
            print(scrum_project.id)
            if scrum_project.to_clear_TFT == True:
                message = "Auto Clear TFT toggle OFF!!! "
                scrum_project.to_clear_TFT = False
                print("This toggles============================")
            else:
                message = "Auto Clear TFT toggle ON successfully!!!" 
                scrum_project.to_clear_TFT = True
            scrum_project.save() 
            print(scrum_project.to_clear_TFT)
            return JsonResponse({'message': message, 'to_clear_board':scrum_project.to_clear_TFT, 'data': filtered_users(request.data['project_id'])})
        else:
            scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True).user
            if scrum_project_role.role != 'Owner' and request.user != scrum_project_b.user.user:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Name Change of Goal.', 'data': filtered_users(request.data['project_id'])})
            
            goal = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True)
            if goal.moveable == True:            
                goal.name = request.data['new_name']
                self.createHistory(goal.name, goal.status, goal.goal_project_id, goal.hours, goal.time_created, goal.user, goal.project, goal.file, goal.id,  'Goal Name Changed by')
                goal.save()
                return JsonResponse({'message': 'Goal Name Changed!', 'data': filtered_users(request.data['project_id'])})
            else:
                 return JsonResponse({'message': 'Permission Denied: Sprint Period Elapsed!!!', 'data': filtered_users(request.data['project_id'])})
    def createHistory(self, name, status, goal_project_id, hours, time_created, user, project, file, goal, message):
        concat_message = message + self.request.user.username
        print(concat_message)
        goal = ScrumGoalHistory (name=name, status=status, time_created = time_created, goal_project_id=goal_project_id, user=user, project=project, file=file, goal_id=goal, done_by=self.request.user, message=concat_message)
        goal.save()
        return

# def slack_details(project):
#     slack = project.scrumprojectslack_set.get(project=project)
#     channelObject = dict()
#     channelObject["slack_client_id"] = slack.slack_client_id
#     channelObject["slack_client_secret"] = slack.slack_client_secret
#     channelObject["slack_verification_token"] = slack.slack_verification_token
#     channelObject["slack_bot_user_token"] = slack.slack_bot_user_token
#     print(channelObject)
#     print("========================PROJECT======================")
#     return channelObject
            
def jwt_response_payload_handler(token, user=None, request=None):
    project = None
    
    try:
        project = ScrumProject.objects.get(name__iexact=request.data['project'])        
    except ScrumProject.DoesNotExist:
        raise ValidationError('The selected project does not exist.');

    
    
    if project.scrumprojectrole_set.filter(user=user.scrumuser).count() == 0:
        scrum_project_role = ScrumProjectRole(role="Developer", user=user.scrumuser, project=project, color=userBgColor())
        scrum_project_role.save()

    proj_role = project.scrumprojectrole_set.get(user=user.scrumuser)

    if project.scrumprojectrole_set.get(user=user.scrumuser).color == "white":
        
        proj_role.color = userBgColor()
        print("coloooooooooooooooooooooooooooor" + proj_role.color)
        proj_role.save()


    user_slack = bool(proj_role.slack_email)
    if project.scrumslack_set.all().exists():
        project_slack = "True"
        slack_username = proj_role.slack_username
    else:
        project_slack = "False"
        slack_username = "empty"


        
    return {
        'token': token,
        'name': user.scrumuser.nickname,
        'role': project.scrumprojectrole_set.get(user=user.scrumuser).role,
        'project_id': project.id,
        'role_id': project.scrumprojectrole_set.get(user=user.scrumuser).id,
        'user_slack' : user_slack,
        'project_slack' : project_slack,
        "slack_username": slack_username,
        "to_clear_board": project.to_clear_TFT
    }
    

class SprintViewSet(viewsets.ModelViewSet):
    queryset = ScrumSprint.objects.all()
    serializer_class = ScrumSprintSerializer

    def get_queryset(self):
        queryset = self.get_project_sprint()
        return queryset

    def create(self, request):     
        user_id = request.user.id
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        # scrum_project.project_count = scrum_project.project_count + 1
        scrum_project.save()
        # Get the owner of project, the first item.project_id... 
        scrum_project_creator = scrum_project.scrumprojectrole_set.all()[0]

        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)

        print(user_id)

        author_role = ScrumUser.objects.get(user_id=user_id)
        author = author_role.scrumprojectrole_set .all()

        sprint_goal_carry = ScrumGoal.objects.filter(project_id = request.data['project_id'], moveable=True) 
        

        existence = ScrumSprint.objects.filter(goal_project_id = request.data['project_id']).exists()
        now_time = datetime.datetime.now().replace(tzinfo=None)  + datetime.timedelta(seconds=10)             



        if scrum_project_role.role == 'Admin' or scrum_project_role.role == 'Owner':
            if existence == True:   
                last_sprint = ScrumSprint.objects.filter(goal_project_id = request.data['project_id']).latest('ends_on')           
                if (datetime.datetime.strftime(last_sprint.ends_on, "%Y-%m-%d %H-%M-%S")) < datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H-%M-%S"):
                    sprint = ScrumSprint(goal_project_id=request.data['project_id'], created_on = now_time, ends_on=datetime.datetime.now() + datetime.timedelta(days=7))
                    sprint.save()
                    self.change_goal_moveability(sprint_goal_carry, scrum_project, scrum_project_role)
                    queryset = self.get_project_sprint()
                    return JsonResponse({'message': 'Sprint Created Successfully.', 'data':queryset,  'users': filtered_users(request.data['project_id'])})
                else:
                    if (last_sprint.created_on.replace(tzinfo=None) + datetime.timedelta(seconds=20) > now_time):
                        queryset = self.get_project_sprint() 
                        return JsonResponse({'message': 'Not Allowed: Minimum Allowed Sprint Run is 60secs.', 'data':queryset, 'users': filtered_users(request.data['project_id'])})
                    elif (datetime.datetime.strftime(last_sprint.ends_on,  "%Y-%m-%d %H-%M-%S")) > datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d"): 
                        last_sprint.ends_on = datetime.datetime.now()
                        last_sprint.save()                        
                        sprint = ScrumSprint(goal_project_id=request.data['project_id'], created_on = now_time, ends_on=datetime.datetime.now() + datetime.timedelta(days=7))
                        sprint.save()                    
                        self.change_goal_moveability(sprint_goal_carry, scrum_project, scrum_project_role)
                        queryset = self.get_project_sprint()
                        return JsonResponse({'message': 'Last Sprint Ended and New Sprint Created Successfully.', 'data':queryset, 'users': filtered_users(request.data['project_id'])})  
                    else:
                        pass            
            else: 
                sprint = ScrumSprint(goal_project_id=request.data['project_id'], created_on = now_time, ends_on=datetime.datetime.now() + datetime.timedelta(days=7))
                sprint.save()
                self.change_goal_moveability(sprint_goal_carry, scrum_project, scrum_project_role)
                print(self.get_project_sprint())
                queryset = self.get_project_sprint()
                return JsonResponse({'message': 'Sprint Created Successfully.', 'data':queryset, 'users': filtered_users(request.data['project_id'])})            

        else:
            return JsonResponse({'message': 'Permission Denied: Unauthorized Permission to Create New Sprint.', 'users': filtered_users(request.data['project_id'])})


    def change_goal_status(self,sprint_goal_carry):
        for each_goal in sprint_goal_carry:
            if each_goal.status == 0:
                each_goal.time_created = datetime.datetime.now()  + datetime.timedelta(seconds=12)
                each_goal.save()         
        return

    def get_project_sprint(self):        
        project_id = self.request.query_params.get('goal_project_id', None)
        if project_id is not None:
            proj_sprint = ScrumSprint.objects.filter(goal_project_id=project_id)
            serializer = ScrumSprintSerializer(proj_sprint, many = True)
            queryset = serializer.data
        return queryset

    def change_goal_moveability(self, sprint_goal_carry, scrum_project, scrum_project_role):
       
        if sprint_goal_carry :
            # scrum_project.project_count = scrum_project.project_count
            for each_goal in sprint_goal_carry:
                if each_goal.moveable != False:
                    each_goal.moveable = False
                    each_goal.save()
                    copy_status = [0,1,2]
                    if each_goal.status in copy_status and each_goal.visible == 1 :
                        goal = ScrumGoal(
                        name=each_goal.name,
                        status= 0,
                        time_created = datetime.datetime.now() + datetime.timedelta(seconds=10), 
                        # goal_project_id=scrum_project.project_count, 
                        user=each_goal.user, 
                        project_id=self.request.data['project_id'],
                        moveable = True,
                        goal_project_id=each_goal.goal_project_id)
                        print("inside if:::::: count")    
                        print(scrum_project.project_count)
                        scrum_project.project_count = scrum_project.project_count + 1 
                        print(scrum_project.project_count)                     
                        goal.save()


            print("Outside if:::::: count")    
            # # Save Total number of project goals
            print(scrum_project.project_count)
            scrum_project.save()

        else:
            pass  

        return


 


class Events(APIView):
    print("Testing from slack=================")
    channel_layer = get_channel_layer()
    try:
        slack_app = ChatscrumSlackApp.objects.all().first()
    except:
        pass
    
    def get(self, request, *args, **kwargs):
        # Return code in Url parameter or empty string if no code
        sc = SlackClient("")
        auth_code = request.GET.get('code', '')
        the_state = request.GET.get('state', '')
        splitter = the_state.find(">>>") 
        project_id = the_state[:splitter] 
        user_email = the_state[(splitter+3):]
        post_data = request.data
        scrum_project = ScrumProject.objects.get(name = project_id[10:])


# =================================Get Auth code response from slack==============================================
        print("====================================auth code=================" + auth_code)
        print(project_id)
        print(user_email)
        print(self.slack_app.CLIENT_ID)
        print("====================================auth code=================" + self.slack_app.CLIENT_ID)
        if auth_code:
            auth_response = sc.api_call(
                "oauth.access",
                client_id=self.slack_app.CLIENT_ID,
                client_secret=self.slack_app.CLIENT_SECRET,
                code=auth_code,
                scope="identity.basic identity.email"
              )


            if auth_response["ok"] == True:
                print("====================Get usermail etc==========================")
                print(auth_response)
                print(auth_response["access_token"])
                user_sc = SlackClient(auth_response["access_token"])
                user_response = user_sc.api_call(
                    "users.identity" 
                                 )
                print("=============USER DETAILS============" )
                
                print(user_response)
                # print( user_response["user"]["email"])
                try:
                    print("============= INSIDE TRY GET USER============" )
                    user= ScrumUser.objects.get(user__username=user_email)
                    print(user)
                    user_role = user.scrumprojectrole_set.get(user=user, project = scrum_project)
                    print(user_role)
                    
                    print("============= AFTER TRY GET USER============" )
                except:
                    print(user_response)
                    html = "<html><body>An error occured!!!</body></html>" 
                    return HttpResponse(html)
                
                
                
                

# =========================================Get Room and project=====================================================================
        chat_room,created = ScrumChatRoom.objects.get_or_create(name=project_id, hash=hashlib.sha256(project_id.encode('UTF-8')).hexdigest())
          
        try:
            project_token, created = ScrumSlack.objects.get_or_create(
            scrumproject = scrum_project,
            room = chat_room, 
            user_id=auth_response["user_id"],
            team_name=auth_response["team_name"],
            team_id=auth_response["team_id"], 
            channel_id=auth_response["incoming_webhook"]["channel_id"], 
            bot_user_id=auth_response["bot"]["bot_user_id"],  
            access_token=auth_response["access_token"], 
            bot_access_token=auth_response["bot"]["bot_access_token"]
            )
            #===============================Update Scrumy user details for Add to slack======================================================================
            user_role.slack_user_id = user_response["user"]["id"]
            user_role.slack_email = user_response["user"]["email"]
            user_role.slack_username = user_response["user"]["name"]
            user_role.slack_profile_picture = user_response["user"]["image_512"]
            user_role.save()
            print("===================================================user channel add=========================")
        except KeyError as error:
            print(user_role.slack_user_id)
            user_role.slack_user_id = user_response["user"]["id"]
            user_role.slack_email = user_response["user"]["email"]
            user_role.slack_username = user_response["user"]["name"]
            user_role.slack_profile_picture = user_response["user"]["image_512"]
            user_role.save()            
            print("===================================================user add=========================")
            print(user_role)
       
        return redirect(settings.FRONTEND)


 
    def post(self, request):            
        print("=========================REQUEST DATA==================================")    
        post_data = request.data 
        print(post_data)
        print("========================================================================")


# =========================================URL verification challenge===============================================================
        if post_data.get('type') == 'url_verification':
            print("===================================url_verification===========================================================")
            print(post_data["challenge"])
            return Response(data=post_data,
                            status=status.HTTP_200_OK)

        if post_data.get('event')["type"] == "message":

            try:
                slack_user = ScrumProjectRole.objects.filter(slack_user_id=post_data["event"]["user"]).first()

                if slack_user is not None: 
                    print("==========================Slack user=================" + slack_user.user.nickname)
                    slack_user_nick = slack_user.user.nickname
                    slack_profile_picture = slack_user.slack_profile_picture
                else:
                    slack_user_nick = post_data["event"]["user"]
                    slack_profile_picture = "https://ca.slack-edge.com/T73UK2WNS-UKRNK9ULR-gd4dbac35d17-24"               
            except ScrumUser.DoesNotExist as error:
                print("User Not matched: failed")
                slack_user_nick = post_data["event"]["user"]
            except KeyError as error:
                slack_user = ScrumProjectRole.objects.filter(slack_user_id=post_data["event"]["username"]).first()
                return Response(data=post_data,
                                status=status.HTTP_200_OK)

            try:
                slack_details= ScrumSlack.objects.filter(channel_id=post_data["event"]["channel"]).first() 
                print("========================================Slack details================================") 
                print(post_data["event"]["channel"])
                print(slack_details)  
                if slack_details is not None: 
                    slack_message = post_data["event"]["text"]
                    

                    slack_message_array = re.split(r'\s', slack_message)
                    print(slack_message_array)

                    for each_word in slack_message_array:
                        match =re.match(r'<@([\w\.-]+)>',each_word ) 
                        if match:
                            print(match.group(1))
                            try:
                                a = ScrumProjectRole.objects.get(slack_user_id=match.group(1))
                                slack_message = slack_message.replace(each_word, slack_name.user.nickname)
                                print(slack_message)
                                print("pattern matched")
                            except ScrumProjectRole.DoesNotExist as e:
                                slack_message = slack_message.replace(each_word, match.group(1))
                            
                            
                        else:
                            print("pattern not matched") 


                    chatRoom = ScrumChatRoom.objects.get(id = slack_details.room_id).hash
                    new_message = ScrumChatMessage(room=slack_details.room, user=slack_user_nick, message=slack_message, profile_picture=slack_user.slack_profile_picture)
                    new_message.save()
            
                    async_to_sync(self.channel_layer.group_send)(
                        chatRoom,
                            {"type": "chat_message", 'user': slack_user_nick, 'message': slack_message, 'date_Time':datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"), 'profile_picture': slack_profile_picture},
                        )

            except KeyError as error:
                # ===========Response for when no client message id
                return Response(data=post_data,
                                status=status.HTTP_200_OK)
            
            
            

        return Response(status=status.HTTP_200_OK)

            

class ScrumNoteViewSet(viewsets.ModelViewSet):
    queryset = ScrumNote.objects.all()
    serializer_class = ScrumNoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    now_time = datetime.datetime.now().replace(tzinfo=None)
    
    def create(self, request):
        user_id = request.data['user'][1:]
        author = ScrumProjectRole.objects.get(id=user_id)
        print(author.role)
        print(request.data['project_id'])
        try:
            note = ScrumNote(user=author, note=request.data['note'], priority=request.data['priority'], time_created=self.now_time, project_id=request.data['project_id'])
            note.save()
            return JsonResponse({'message': 'Note Created Successfully!', 'data': filtered_users(request.data['project_id'])})
        except KeyError as error:
             return JsonResponse({'message': 'Priority or notes cannot be an empty field', 'data': filtered_users(request.data['project_id'])})
    def put(self, request):
        print("This is note deleting")
        note = ScrumNote.objects.get(id=request.data['id'])
        note.delete()
        return JsonResponse({'message': 'Goal Added and note deleted Successfully!', 'data': filtered_users(request.data['project_id'])})
            

class ScrumWorkIdViewSet(viewsets.ModelViewSet):
    queryset = ScrumWorkId.objects.all()
    serializer_class = ScrumWorkIdSerializer  
    
    def create(self, request):
        user_id = request.data['user'][1:]
        author = ScrumProjectRole.objects.get(id=user_id)
        print(author.role)
        print(request.data['project_id'])
        try:
            workid = ScrumWorkId(user=author, workid=request.data['workid'], branch=request.data['branch'], project_id=request.data['project_id'])
            workid.save()
            return JsonResponse({'message': 'Workid added Successfully!', 'data': filtered_users(request.data['project_id'])})
        except KeyError as error:
             return JsonResponse({'message': 'Error adding workid', 'data': filtered_users(request.data['project_id'])}) 

    
    def patch(self, request):
        print("This is WorkId Updating")
        workids = ScrumWorkId.objects.get(workid=request.data['workid'])
        print(workids)
        workids.workid = request.data['workid']
        workids.branch = request.data['branch']
        #workids = ScrumWorkId(user=author, workid=request.data['workid'], branch=request.data['branch'])
        workids.save()
        return JsonResponse({'message': 'WorkId Updated Successfully!'})                

    def put(self, request):
        print("This is WorkId deleting")
        workid = ScrumWorkId.objects.get(id=request.data['id'])
        workid.delete()
        return JsonResponse({'message': 'WorkId deleted Successfully!', 'data': filtered_users(request.data['project_id'])})        

class ScrumLogViewSet(viewsets.ModelViewSet):
    queryset = ScrumLog.objects.all()
    serializer_class = ScrumLogSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    now_time = datetime.datetime.now().replace(tzinfo=None)
    
    def create(self, request):
        user_id = request.data['user'][1:]
        author = ScrumProjectRole.objects.get(id=user_id)
        print(author.role)
        print(request.data['project_id'])
        try:
            log = ScrumLog(user=author, log=request.data['log'], priority=request.data['priority'], time_created=self.now_time, project_id=request.data['project_id'])
            log.save()
            return JsonResponse({'message': 'Created Successfully!', 'data': filtered_users(request.data['project_id'])})
        except KeyError as error:
             return JsonResponse({'message': 'Priority or feature/bug cannot be an empty field', 'data': filtered_users(request.data['project_id'])})    


    def put(self, request):
        print("This is log deleting")
        log = ScrumLog.objects.get(id=request.data['id'])
        log.delete()
        return JsonResponse({'message': 'Goal Assigned and log deleted Successfully!', 'data': filtered_users(request.data['project_id'])})        
