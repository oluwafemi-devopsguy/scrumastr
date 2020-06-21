from django.core.mail import send_mail, EmailMessage, EmailMultiAlternatives
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
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.serializers import ValidationError
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.core import serializers
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from slack import WebClient
from django.template import Template, Context

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import random
import datetime
import re
import json
import hashlib
import boto3
import html

from Scrum.initials import *


from time import sleep


@csrf_exempt
def test(request): 
    return JsonResponse({'message': 'hello daud'}, status=200)
     

@csrf_exempt
def _parse_body(body):
    body_unicode = body.decode('utf-8')
    return json.loads(body_unicode)

@csrf_exempt
def connect(request):
    body = _parse_body(request.body)
    connection_id = body['connectionId']
    print('connect successful')
    # Connection(connection_id=connection_id, project_name="TestProj").save()

    return JsonResponse(
        {'message': 'connect successfully'}, status=200
    )


@csrf_exempt
def connect_to_project(request):
    body = _parse_body(request.body)
    connection_id = body['connectionId']
    project_id = body['body']['project_id']


    proj = ScrumProject.objects.get(pk=project_id)
    print("Connecting to project ", project_id, " with connect id ", connection_id )  
    Connection(connection_id=connection_id, project=proj).save()
    

    return JsonResponse(
        {'message': 'connect successfully'}, status=200
    )    


@csrf_exempt
def disconnect(request):
    body = _parse_body(request.body)
    connection_id = body['connectionId']

    Connection.objects.filter(connection_id=connection_id).delete()
    return JsonResponse(
        {'message': 'disconnect successfully'}, status=200
    )

def _send_to_connection(connection_id, data):
    gatewayapi = boto3.client( 
        "apigatewaymanagementapi",
        endpoint_url= settings.AWS_WS_GATEWAY, 
        region_name= settings.AWS_REGION, 
        aws_access_key_id= settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key= settings.AWS_SECRET_ACCESS_KEY, 
    )
    print(settings.AWS_WS_GATEWAY)
    return gatewayapi.post_to_connection(
        ConnectionId=connection_id,
        Data=json.dumps(data).encode('utf-8')
    )



# @csrf_exempt
# def send_message(project_id):
#     filtered_usr1 = filtered_users(project_id)
#     filtered_usr = json.dumps({'body': filtered_usr1})
#     print("Filter user 1:::::::::::::::::::::::::::::", filtered_usr1)
#     print("Filter user #########################", filtered_usr)
#     # # Get all current connections
#     connections = Connection.objects.filter(project=project_id)

#     output = {
#         'Message': "This is websocket",
#         'data':filtered_usr1
#     }

#     data = {'messages':output}
#     # # Send the message data to all connections
#     for connection in connections:
#         _send_to_connection(
#             connection.connection_id, data
#         )
    
#     return JsonResponse(
#         {'message': 'successfully send'}, status=200
#     )

def createHistory(name, status, goal_project_id, hours, time_created, user, project, file, goal, message):
        concat_message = message + self.request.user.username
        print(concat_message)
        goal = ScrumGoalHistory (name=name, status=status, time_created = time_created, goal_project_id=goal_project_id, user=user, project=project, file=file, goal_id=goal, done_by=self.request.user, message=concat_message)
        goal.save()
@csrf_exempt
def send_message(request):
    body = _parse_body(request.body)
    username = body['body']['username']
    project_name = body['body']['project_id']
    message = body['body']['message']
    timestamp = body['body']['timestamp']
    token = body['body']['token']

    print("Hello")

    try:
        Token.objects.get(key=token)

    
        #print('Bad token')
        #Save message sent in the database
        

    
        proj = ScrumProject.objects.get(pk=project_name)
       # chat = ChatMessage(username=username, message=message, project_name=proj, timestamp=timestamp)
       # chat.save()
        print(username)
        print("Project name :::::::", project_name)

        connections = Connection.objects.filter(project=proj)

        my_message = {"username":username, "project_name":project_name, "message":message, "timestamp":timestamp}

        data = {'messages':[my_message]}
        print(data)
        '''
        for connection in connections:
            _send_to_connection(connection.connection_id, data)
        '''

        slack_id = ChatSlack.objects.get(username=username, project=proj).slack_user_id

        print(slack_id)

        
        

        slack_details = ScrumSlack.objects.get(scrumproject=proj, user_id = slack_id)
        channel_id = slack_details.channel_id
        bot_access_token = slack_details.access_token
        scrumuser = ScrumUser.objects.get(nickname = username)
        scrum_proj_role = ScrumProjectRole.objects.get(project=proj, user=scrumuser)
        profile_picture = scrum_proj_role.slack_profile_picture 

        sc = WebClient(bot_access_token)

        sc.chat_postMessage(
        
            channel= channel_id,
            username = username,
            text = message,
            #as_user = True,
            #icon_url = profile_picture


        ).headers['X-Slack-No-Retry'] = 1
      
        return JsonResponse(
            {'message': 'successfully send'}, status=200
        )

    except:
        return JsonResponse({'message': 'Token not authenticated'})



    #Fetch all recent Messages for a particular project in the database
@csrf_exempt
@permission_classes((IsAuthenticated, ))
@authentication_classes((JSONWebTokenAuthentication,))
def get_recentmessages(request):
    body = _parse_body(request.body)
    connectionId = body['connectionId']
    project_id = body['body']['project_id']
    token = body['body']['token']
    proj = ScrumProject.objects.get(pk=project_id)
    project_name = proj.name

    try:
        Token.objects.get(key=token)

        #Fetch all recent messages by their project name
        all_messages = ChatMessage.objects.filter(project_name=project_name).order_by('-id')[:80]
        result_list =(list(all_messages.values('username', 'project_name', 'message', 'timestamp', 'profile_picture')))
       
        data = {"type":"all_messages","messages":result_list[::-1]}
        
        
        _send_to_connection(
            connectionId,
            data
        )
 
        
        return JsonResponse(
            {"message":"all recent messages gotten"},
            status = 200
        )
    

    except:
        return JsonResponse({'message': 'Token not authenticated'})

class GetProjectGoals(viewsets.ModelViewSet):
    #queryset = ScrumProject.objects.all()
    #serializer_class = ScrumProjectSerializer

    def create(self, request, *args, **kwargs):
        
        print(request.body)
        body = _parse_body(request.body)
        connectionId = body['connectionId']
        project_id = body['body']['project_id']
        token = body['body']['token']

        try: 
            Token.objects.get(key=token)
            query = ScrumProject.objects.get(pk=project_id)
            slack_installed = query.scrumslack_set.all().exists()
        # slack_app_id = ChatscrumSlackApp.objects.all().first()
            my_data = {"type":"get_goals", "project_name":query.name, "data":filtered_users(project_id), "slack_installed":slack_installed}
            
            _send_to_connection(connectionId, my_data)
            return JsonResponse({"message":""})
        except ScrumProject.DoesNotExist:
            return JsonResponse({'detail': 'Not found.'})

    
class GetAllMessagesViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer


    def create(self, request):
        project_name = request.data['project_name']
        token = request.data['token']

        try:
            query= ChatMessage.objects.filter(project_name = project_name).order_by('-id')[:80]
            values = list(query.values('username', 'project_name', 'message', 'timestamp', 'profile_picture'))
            data = values[::-1]
           
            

        except:
            return JsonResponse({"message":"not found"})

        return JsonResponse({"message":data})


class ChangeGoalOwnerViewSet(viewsets.ModelViewSet):
    queryset = ScrumGoal.objects.all()
    serializer_class = ScrumGoalSerializer


    def create(self, request):
        body = _parse_body(request.body)
        connectionId = body['connectionId']
        project_id = body['body']['project_id']
        from_id = body['body']['from_id'][1:]
        to_id = body['body']['to_id'][1:]
        token = body['body']['token']

        try:
            Token.objects.get(key=token)
            scrum_project = ScrumProject.objects.get(id=project_id)
            scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)

            if (scrum_project_role.role == "Developer" or scrum_project_role.role == "Quality Analyst"):
                return JsonResponse({'message':"You are not allowed to move goal"})

            goal = scrum_project.scrumgoal_set.get(goal_project_id=from_id, moveable=True)
            if goal.moveable == True:
                print(to_id)
                author = ScrumProjectRole.objects.get(id=to_id)
                goal.user = author
                createHistory(goal.name, goal.status, goal.goal_project_id, goal.hours, goal.time_created, goal.user, goal.project, goal.file, goal.id, 'Goal Reassigned Successfully by')
                goal.save()
                data = {'message': 'Goal Reassigned Successfully!', 'data': filtered_users(project_id)}
                connection = Connection.objects.all()
                for connect in connection:
                    _send_to_connection(
                        connect.connection_id,
                        data
                    )
            # return JsonResponse({'message': 'Goal Reassigned Successfully!', 'data': filtered_users(project_id)})
            else:
                return JsonResponse({'message': 'Permission Denied: Sprint Period Elapsed!!!', 'data': filtered_users(request.data['project_id'])})

        except:
            return JsonResponse({'message':'You are not Authenticated'})


class MoveGoalViewSet(viewsets.ModelViewSet):
    queryset = ScrumGoal.objects.all()
    serializer_class = ScrumGoalSerializer

    def create(self, request):
        body = _parse_body(request.body)
        username = body['body']['username']
        user = User.objects.get(username=username)
        request.user = user
        
        
        
        goal_id = body['body']['goal_id'][1:]
        to_id = int(body['body']['to_id'])
        project_id = body['body']['project_id']
        hours = body['body']['hours']
        push_id = body['body']['push_id']
        scrum_project = ScrumProject.objects.get(id=project_id)
        scrum_project_a = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True).user
       # goal_id = request.data['goal_id'][1:]
       # to_id = int(request.data['to_id'])
        goal_item = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True)
        connections = Connection.objects.filter(project=scrum_project)
        print(goal_id)
        print(scrum_project_b.user.user)
        print(connections)
        print(goal_item.status)
        
        
        

        
        if to_id == 4:
            if scrum_project_a.role == 'Developer':
                if request.user != scrum_project_b.user.user:
                    data = {'type':'move_goal','message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(project_id)}
                   
                    for connect in connections:
                        _send_to_connection(connect.connection_id, data)
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(project_id)})
                    
            del_goal = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True)
            del_goal.visible = False
            del_goal.save()         
            createHistory(goal_item.name, goal_item.status, goal_item.goal_project_id, goal_item.hours, goal_item.time_created, goal_item.user, goal_item.project, goal_item.file, goal_item.id, 'Goal Removed Successfully by')
            data = {'type':'move_goal','message': 'Goal Removed Successfully!'}

            for connect in connections:
                 _send_to_connection(connect.connection_id, data)
            return JsonResponse({'message': 'Goal Removed Successfully!'})
        else:           
            group = scrum_project_a.role
            from_allowed = []
            to_allowed = []
            if group == 'Developer':
                if request.user != scrum_project_b.user.user:
                    data = {'type':'move_goal','message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)}
                    for connect in connections:
                        _send_to_connection(connect.connection_id, data)
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)})
            
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
            print(body['body'])
            
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
                    print(request.user.scrumuser)
                    data = {'type':'move_goal','message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)}
                    
                    for connect in connections:
                        _send_to_connection(connect.connection_id, data)
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)})
            else:
                data = {'type':'move_goal','message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)}
                for connect in connections:
                    _send_to_connection(connect.connection_id, data)
                return JsonResponse({'message': 'Permission Denied: Unauthorized Movement of Goal.', 'data': filtered_users(project_id)})
            if goal_item.moveable == True:
                message = 'Goal Moved Successfully!'
                if to_id == 2 and hours :
                    goal_item.push_id = push_id
                    goal_item.status = to_id
                    goal_item.hours = goal_item.hours
                    goal_item.push_id = push_id
                    message = 'Goal Moved Successfully! Push ID is ' + push_id
                if hours > 8:
                    goal_item.status = state_prev
                    message = 'Error: Task cannot Exceeds 8hours or less than an hour of completion.'
                elif hours == -1 and goal_item.hours == -1 and to_id > 1:
                     goal_item.status = state_prev
                     message = 'Error: A Task must have hours assigned.'
                elif hours == -13:
                     goal_item.status = state_prev
                     if push_id == "Canceled":
                        message = "Error,  No Work ID assigned"
                     else:
                        message = 'Error: A Task must have hours assigned.'
                elif to_id == 2 and state_prev == 1 :
                    goal_item.hours = hours
                    message = 'Goal Moved Successfully! Hours Applied!'

                if to_id == 2 and hours < 8 and push_id == "Null Value":
                    goal_item.status = state_prev
                    message = 'Error: No PUSH-ID added.'               


                if state_prev == 1 and to_id == 0:
                    goal_item.days_failed = goal_item.days_failed + 1 
                
                self.createHistory(goal_item.name, goal_item.status, goal_item.goal_project_id, goal_item.hours, goal_item.time_created, goal_item.user, goal_item.project, goal_item.file, goal_item.id, 'Goal Moved Successfully by')          
                goal_item.save()
            else:
                message = "Sprint Period Elapsed, The Goal Cannot be Moved!"
            data = {'type':'move_goal','message': message, 'data': filtered_users(project_id)}
            for connect in connections:
                _send_to_connection(connect.connection_id, {'type':'move_goal', 'data':data})
            return JsonResponse({'message': message, 'data': filtered_users(project_id)})

    def createHistory(self, name, status, goal_project_id, hours, time_created, user, project, file, goal, message):
        concat_message = message + self.request.user.username
        print(concat_message)
        goal = ScrumGoalHistory (name=name, status=status, time_created = time_created, goal_project_id=goal_project_id, user=user, project=project, file=file, goal_id=goal, done_by=self.request.user, message=concat_message)
        goal.save()
        return


class DeleteUserViewSet(viewsets.ModelViewSet):
    queryset = ScrumProjectRole.objects.all()
    serializer_class = ScrumProjectRoleSerializer

    def create(self, request):
        project_id = request.data['project_id']
        user_role = request.data['user_role']
        intended_user = request.data['intended_user']

        project = ScrumProject.objects.get(pk=project_id)
        

        role = ScrumProjectRole.objects.get(project=project, user=request.user.scrumuser).role

        if role == 'Developer' or role == 'Quality Analyst' or role == 'Admin':
            return JsonResponse({"message":"Permission Denied", "data":filtered_users(project_id)})

       # del_user = User.objects.get(pk=intended_user)
        author = ScrumProjectRole.objects.get(project=project, id=intended_user)
        if author.role == "Owner":
            return JsonResponse({"message":"You cannot delete an Owner", "data":filtered_users(project_id)})
        author.delete()
        return JsonResponse({"message":"User deleted Successfully", "data":filtered_users(project_id)})


        

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

class ScrumFetchViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = ScrumUserFetchSerializer

    def create(self, request, username=None, *args, **kwargs):
        print("Okayyy")
        
        email = request.data['username']
        print(email)
       
            
        get_user = User.objects.get(username=email)
        scrum_details = ScrumUser.objects.get(user=get_user)
        full_name = scrum_details.nickname
        
        print('done')
        return JsonResponse(
            {
            'fullname': full_name,
            'message': 'Details gotten sucessfully'
        }
        )
        

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
                return JsonResponse({'message': 'User Removed from project'})
            else:
                print(instance.role)
                return JsonResponse({'message': 'Permission Denied: Unauthorized to Delete User.'})

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
        
        return JsonResponse({'message': 'User Role Changed!'})

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
        print(type(request.user))
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

        # send_message(request.data['project_id'])
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

        print(type(request.user))
        print(type(scrum_project_b.user.user))

        
        if to_id == 4:
            if scrum_project_a.role == 'Developer':
                if request.user != scrum_project_b.user.user:
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(request.data['project_id'])})
                    
            del_goal = scrum_project.scrumgoal_set.get(goal_project_id=goal_id, moveable=True)
            del_goal.visible = False
            del_goal.save()         
            self.createHistory(goal_item.name, goal_item.status, goal_item.goal_project_id, goal_item.hours, goal_item.time_created, goal_item.user, goal_item.project, goal_item.file, goal_item.id, 'Goal Removed Successfully by')
            return JsonResponse({'message': 'Goal Removed Successfully!'})
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
            print("noted")
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
            file_url = fs.url(filename)
            print(file_url)
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
                return JsonResponse({'message': 'Goal Deleted Successfully!'})
            else:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.'})
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
            return JsonResponse({'message': message, 'to_clear_board':scrum_project.to_clear_TFT})
        else:
            scrum_project_b = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True).user
            if scrum_project_role.role != 'Owner' and request.user != scrum_project_b.user.user:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Name Change of Goal.'})
            
            goal = scrum_project.scrumgoal_set.get(goal_project_id=request.data['goal_id'][1:], moveable=True)
            if goal.moveable == True:            
                goal.name = request.data['new_name']
                self.createHistory(goal.name, goal.status, goal.goal_project_id, goal.hours, goal.time_created, goal.user, goal.project, goal.file, goal.id,  'Goal Name Changed by')
                goal.save()
                return JsonResponse({'message': 'Goal Name Changed!'})
            else:
                 return JsonResponse({'message': 'Permission Denied: Sprint Period Elapsed!!!'})
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
    nickname = proj_role.user.nickname
    email = proj_role.user.user.username
    login = settings.LOGIN_URL

    owners_list = ScrumProjectRole.objects.filter(role="Owner", project=project)
    if project.scrumprojectrole_set.get(user=user.scrumuser).color == "white":
        
        proj_role.color = userBgColor()
        print("coloooooooooooooooooooooooooooor" + proj_role.color)
        proj_role.save()
        
    ws_token, created = Token.objects.get_or_create(user=user)
    # try:
    #     ws_token, created = Token.objects.get_or_create(user=user)
    #    # if (ws_token or created):  
    #     #    ws_token = Token.objects.get(user=user)
    #     print(ws_token.key)
    # except:
    #     pass
    context = Context({"nickname":nickname, "project":project, "email":email, "login":login})
    template = Template(
        '''
            <html>
                <head>
                </head>
                <body style="background-color:#f6f6f6;">
                <div style="margin:10px;padding:0; padding-top:20px;padding-bottom:25px;font-family:'Open Sans',Helvetica,Arial,sans-serif;min-width:100%;background-color:#f6f6f6">
                <center style="display:table;table-layout:fixed;width:100%;font-family:'Open Sans',Helvetica,Arial,sans-serif;background-color:#f6f6f6">
                    <table style="border-collapse:collapse;border-spacing:0;width:100%">
                    <tbody>
                    <tr>
                    <td style="padding:0;vertical-align:middle" align="center">
                    <table style="border-collapse:collapse;border-spacing:0;margin-left:auto;margin-right:auto;width:100%;max-width:600px;table-layout:fixed">
                    <tr>
                    <td style="padding:0 10px;vertical-align:middle;text-align:left">
                        <table style="border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%;background-color:#fff">
                        
                        <tbody>
                            <tr>
                            <td style="padding-top:10px;padding-left:0;vertical-align:middle">

                            <table style="border-collapse:collapse;border-spacing:0">
                                <tbody>
                                <tr>
                                <td style="padding:0;vertical-align:middle;padding-left:9%;padding-right:9%;word-break:break-word;word-wrap:break-word">
                                    <p style="margin-top:0;font-style:normal;font-weight:400;font-size:18px;line-height:24px;margin-bottom:10px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#414042">Hello  <strong style="font-size:20px;">{{nickname}}!<strong></p>
                                    <p style="margin-top:0;font-style:normal;font-weight:400;font-size:16px;line-height:24px;margin-bottom:10px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#414042">
                                    Thank you for signing up. Chatscrum  is a simple and organised way to plan and build software. <br> <br> 
                                    Project: {{project.name}} <br>
                                    Email: {{email}}
                                    </p> <br>
                                    <table style="border-collapse:collapse;border-spacing:0" width="100%%">
                                        <tbody>
                                        <tr> 
                                        <td style="padding:0;vertical-align:middle;padding-left:56px;padding-right:56px;word-break:break-word;word-wrap:break-word">
                                            <div style="margin-bottom:22px;margin-top:16px;text-align:center">
                                                <a href="{{login}}" style="border-radius:3px;display:inline-block;font-size:17px;font-weight:700;line-height:27px;padding:13px 35px 12px 35px;text-align:center;text-decoration:none!important;font-family:'Open Sans',Helvetica,Arial,sans-serif;background-color:#26A69A;color:#fff; cursor:pointer;">
                                
                                                    Login Here
                                                </a>
                                            </div>
                                        </td>
                                        </tr>
                                        </tbody>
                                    
                                    </table>

                                    <p style="margin-top:0;font-style:normal;font-weight:400;font-size:16px;line-height:24px;margin-bottom:10px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#414042">
                                        Welcome and Happy Building! <br><br>
                                        
                                        Thanks, <br>
                                        Chatscrum Team <br>
                                        © Copyright 2020.


                                    </p>
                                </td>
                                
                                </tr>
                                </tbody>
                            
                            </table>
                            
                            </td>
                            
                            </tr>
                        </tbody>
                        
                        </table>
                    </td>
                    </tr>
                    
                    </table>
                    
                    </td>
                    </tr>
                    </tbody>
                    
                    
                    </table>
                </center>
                </div>

                </body>
            </html>
        '''
    )
    content = template.render(context)

    

    if created:
        email = EmailMessage(
            'Welcome to ChatScrum',
            content,
            settings.DEFAULT_FROM_EMAIL, 
            [email]
        )
        email.content_subtype = "html" 
        email.send(fail_silently=False)

        for owner in owners_list:
            email=owner.user.user.username
            context = Context({"nickname":owner.user.nickname, "project":project, "email":owner.user.user.username, "user":nickname})
            template = Template(
                '''
                <html>
                <head>
                <style>
                p {
                    font-size = 18px
                }
                </style>
                </head>

                <body>
                <span> <p>Hi</p><h2>{{nickname}},</h2></span>
                <p>
                 {{user}} has just joined your project {{project.name}}. 
                </p> 
                

                <p>Thanks,</p> 
                <p>Chatscrum Team</p>
                <p> © Copyright 2020.</p>
                </body>
                
                </html>
                '''
            )

            content=template.render(context)
            owner_email = EmailMessage(
            'New User Added',
            content,
            settings.DEFAULT_FROM_EMAIL, 
            [email]
            )
            owner_email.content_subtype="html"
            owner_email.send(fail_silently=False)

        print('Email successfully sent')
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
        'project_name': project.name,
        'project_slack' : project_slack,
        "slack_username": slack_username,
        "to_clear_board": project.to_clear_TFT,
        "ws_token": ws_token.key
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
                    return JsonResponse({'message': 'Sprint Created Successfully.', 'data':queryset})
                else:
                    if (last_sprint.created_on.replace(tzinfo=None) + datetime.timedelta(seconds=20) > now_time):
                        queryset = self.get_project_sprint() 
                        return JsonResponse({'message': 'Not Allowed: Minimum Allowed Sprint Run is 60secs.', 'data':queryset})
                    elif (datetime.datetime.strftime(last_sprint.ends_on,  "%Y-%m-%d %H-%M-%S")) > datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d"): 
                        last_sprint.ends_on = datetime.datetime.now()
                        last_sprint.save()                        
                        sprint = ScrumSprint(goal_project_id=request.data['project_id'], created_on = now_time, ends_on=datetime.datetime.now() + datetime.timedelta(days=7))
                        sprint.save()                    
                        self.change_goal_moveability(sprint_goal_carry, scrum_project, scrum_project_role)
                        queryset = self.get_project_sprint()
                        return JsonResponse({'message': 'Last Sprint Ended and New Sprint Created Successfully.', 'data':queryset})  
                    else:
                        pass            
            else: 
                sprint = ScrumSprint(goal_project_id=request.data['project_id'], created_on = now_time, ends_on=datetime.datetime.now() + datetime.timedelta(days=7))
                sprint.save()
                self.change_goal_moveability(sprint_goal_carry, scrum_project, scrum_project_role)
                print(self.get_project_sprint())
                queryset = self.get_project_sprint()
                return JsonResponse({'message': 'Sprint Created Successfully.', 'data':queryset})            

        else:
            return JsonResponse({'message': 'Permission Denied: Unauthorized Permission to Create New Sprint.'})


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
                        scrum_project.project_count = scrum_project.project_count + 1                     
                        goal.save()
 
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
        sc = WebClient(settings.SLACK_APP_TOKEN)
        auth_code = request.GET.get('code', '')
        the_state = request.GET.get('state', '')
        splitter = the_state.find(">>>")
        splitter_s = the_state.find("<<") 
        project_id = the_state[:splitter] 
        user_email = the_state[(splitter+3):splitter_s]
        real_name = the_state[(splitter_s+3):]
        post_data = request.data

        if (project_id[10:] == "test"):
            project_id = "main_chat_testing"
        scrum_project, created = ScrumProject.objects.get_or_create(name = project_id[10:])


# =================================Get Auth code response from slack==============================================
        if(created or scrum_project):
            scrum_project = ScrumProject.objects.get(name=project_id[10:])
        print("====================================auth code=================" + auth_code)
        print(auth_code)
        print(splitter_s)
        print(project_id)
        print(user_email)
        print("\n")
        print(real_name)
        
        print("====================================auth code=================" )
        if auth_code:
            encoding = {"Content-Type":"text/html", "charset":"utf-8"}
            print(encoding)
            client = WebClient("")
            auth_response = client.oauth_v2_access(

                client_id=settings.SLACK_CLIENT_ID,
                client_secret= settings.SLACK_CLIENT_SECRET,
                code=auth_code,
                scope="channels:read users:read chat:write groups:read channels:history groups:history"  
              )


            if auth_response["ok"] == True:
                print(auth_response)
                print("====================Get usermail etc==========================")
              #  print(auth_response['authed_user']['access_token'])
                print('========this token===========')
                print(auth_response["access_token"])
                print('========this token===========')
                user_sc = WebClient(auth_response['authed_user']["access_token"])
                user_response = user_sc.users_info( 
                    user=auth_response['authed_user']["id"]
                )
                
                print("=============USER DETAILS============" )
                
                
                
                # print( user_response["user"]["email"])
                try:
                    print("============= INSIDE TRY GET USER============" )
                    my_user, created = User.objects.get_or_create(username=user_email)
                    if (my_user or created):
                        my_user = User.objects.get(username=user_email)
                    user, created= ScrumUser.objects.get_or_create(user__username=user_email)
                    if(user or created):
                        user = ScrumUser.objects.get(user__username=user_email)
                        print(user)
                    user_role, created = user.scrumprojectrole_set.get_or_create(user=user, project = scrum_project)
                    if (user_role or created):
                        user_role = user.scrumprojectrole_set.get(user=user, project=scrum_project)
                        print(user_role)
                    
                    print("============= AFTER TRY GET USER============" )
                except:
                   
                    html = "<html><body>An error occured!!!</body></html>" 
                    return HttpResponse(html)

                try:
                   get, created = ChatSlack.objects.get_or_create(username=real_name, slack_user_id= auth_response['authed_user']['id'], project=scrum_project)
                   if created:
                       print(ChatSlack.objects.get(username=real_name, slack_user_id= auth_response['authed_user']['id']).username)
                       print('Successsssssss')

                except:
                    print('failedddd')
                
                 
                
                

# =========================================Get Room and project=====================================================================
        chat_room,created = ScrumChatRoom.objects.get_or_create(name=project_id, hash=hashlib.sha256(project_id.encode('UTF-8')).hexdigest())
        
        try:
            project_token, created = ScrumSlack.objects.get_or_create(
            scrumproject = scrum_project,
            room = chat_room, 
            user_id=auth_response['authed_user']["id"],
            team_name=auth_response['team']["name"],
            team_id=auth_response['team']["id"], 
            channel_id=auth_response["incoming_webhook"]["channel_id"], 
            bot_user_id=auth_response["bot_user_id"],  
            access_token=auth_response['authed_user']["access_token"], 
            bot_access_token=auth_response["access_token"]
            )
            print(SlackApps.objects.filter(scrumproject=scrum_project, user_id = auth_response['authed_user']['id']).exists())

            print(auth_response['authed_user']["id"])
            #===============================Update Scrumy user details for Add to slack======================================================================
            user_role.slack_user_id = user_response["user"]["id"]
            user_role.slack_email = str(user_response["user"]["real_name"]) + "@gmail.com"
            user_role.slack_username = user_response["user"]["name"]
            user_role.slack_profile_picture = user_response["user"]["profile"]["image_512"]
            user_role.save()

            print(user_response)
           
            
            print("===================================================user channel add=========================")
        except KeyError as error:
            #channel_info = user_sc.api_call(
              #  "channels.info"
           # )
            
            print(user_response)
            #print(channel_info)
            '''
            project_token, created = ScrumSlack.objects.get_or_create(
                scrumproject = scrum_project,
                room = chat_room, 
                user_id=auth_response['authed_user']["id"],
                team_name='',
                team_id=auth_response['team']["id"], 
                channel_id=channel_info['channels'][0]['id'], 
                bot_user_id='',  
                access_token=auth_response['authed_user']["access_token"], 
                bot_access_token=''
                )
            print(ScrumSlack.objects.filter(scrumproject=scrum_project, user_id = auth_response['authed_user']['id']).exists())
            '''
            print('Scrumslack add faileddddd')
            print(auth_response['authed_user']["id"])
            #===============================Update Scrumy user details for Add to slack======================================================================
            user_role.slack_user_id = user_response["user"]["id"]
            user_role.slack_email = str(user_response["user"]["real_name"]) + "@gmail.com"
            user_role.slack_username = user_response["user"]["name"]
            user_role.slack_profile_picture = user_response["user"]["profile"]["image_512"]
            user_role.save()
        
            
            print("===================================================user channel add=========================")
       
        return redirect(settings.FRONTEND)


 
    def post(self, request, *args, **kwargs):            
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
            retry_count = request.META.get('HTTP_X_SLACK_RETRY_NUM', None)

            if retry_count is None:
            

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
                    print(post_data['event']['user'])
                    scrumslack_details = ScrumSlack.objects.get(channel_id= post_data['event']['channel'], user_id=post_data['event']['user'], team_id=post_data['team_id'])
                    project_name = scrumslack_details.scrumproject.name
                    slack_details= ScrumSlack.objects.filter(channel_id=post_data["event"]["channel"]).first() 
                    print("========================================Slack details================================") 
                    print(post_data["event"]["channel"])
                    print(slack_details)  
                    if slack_details is not None: 
                        slack_message = post_data["event"]["text"]
                        

                        #slack_message_array = re.split(r'\s', slack_message)
                        print(slack_message)

                        #for each_word in slack_message_array:
                            #match =re.match(r'<@([\w\.-]+)>',each_word ) 
                            #if match:
                                #print(match.group(1))
                                #try:
                                #  a = ScrumProjectRole.objects.get(slack_user_id=match.group(1))
                                #   slack_message = slack_message.replace(each_word, a.user.nickname)
                                #  print(slack_message)
                                #  print("pattern matched")
                            #    except ScrumProjectRole.DoesNotExist as e:
                            #       slack_message = slack_message.replace(each_word, match.group(1))
                                
                                
                            #else:
                            #   print("pattern not matched") 
                        

                        chatRoom = ScrumChatRoom.objects.get(id = slack_details.room_id).hash
                    # new_message = ScrumChatMessage(room=slack_details.room, user=slack_user_nick, message=slack_message, profile_picture=slack_user.slack_profile_picture)
                        #new_message.save()

                        

                        
                        actual_message = ChatMessage(username=slack_user_nick, message=slack_message, project_name=project_name, timestamp=datetime.datetime.now().strftime("%I:%M %p . %d-%m-%Y"), profile_picture=slack_user.slack_profile_picture)
                        actual_message.save()
                       
                        proj = ScrumProject.objects.get(name=project_name)
                        my_messages = {"username":slack_user_nick, "message":slack_message, "project_name":project_name, "profile_picture":slack_user.slack_profile_picture, "timestamp":datetime.datetime.now().strftime("%I:%M %p . %d-%m-%Y")}
                        data = {"type":"all_messages", "messages":[my_messages]}

                        connections = Connection.objects.filter(project = proj)
                        print(connections)
                        for conn in connections:
                            _send_to_connection(conn.connection_id, data)

                        

                        return Response(data=post_data,
                                    status=status.HTTP_200_OK)

                except KeyError as error:
                    # ===========Response for when no client message id
                    pass

        
            
            
            

        return Response(status=status.HTTP_204_NO_CONTENT, headers={'X-Slack-No-Retry':1})

            

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
            return JsonResponse({'message': 'Note Created Successfully!'})
        except KeyError as error:
             return JsonResponse({'message': 'Priority or notes cannot be an empty field'})
    def put(self, request):
        print("This is note deleting")
        note = ScrumNote.objects.get(id=request.data['id'])
        note.delete()
        return JsonResponse({'message': 'Goal Added and note deleted Successfully!'})
            

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
            return JsonResponse({'message': 'Workid added Successfully!'})
        except KeyError as error:
             return JsonResponse({'message': 'Error adding workid'}) 

    
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
        return JsonResponse({'message': 'WorkId deleted Successfully!'})        

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
             return JsonResponse({'message': 'Priority or feature/bug cannot be an empty field'})    


    def put(self, request):
        print("This is log deleting")
        log = ScrumLog.objects.get(id=request.data['id'])
        log.delete()
        return JsonResponse({'message': 'Goal Assigned and log deleted Successfully!'})        
