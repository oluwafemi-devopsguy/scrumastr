from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib import messages
from .models import *
from .serializer import *
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.serializers import ValidationError
import random
import datetime

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

def createDemoUser(request):
    demo_user = User.objects.create(username='demouser' + str(random.random()))
    demo_user_password = 'demopassword' + str(random.random())
    demo_user.set_password(demo_user_password)
    demo_user.save()
    
    demo_scrumuser = ScrumUser(user=demo_user, nickname='Demo User')
    demo_scrumuser.save()
    
    demo_project_name = 'Demo Project #' + user.pk
    demo_project = ScrumProject(name='Demo Project #' + user.pk)
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
        if request.data['usertype'] == 'Owner' and ScrumProject.objects.filter(name__iexact=request.data['projname']).count() > 0:
            return JsonResponse({'message': 'Error: That project name is already taken.'})
        user, created = User.objects.get_or_create(username=request.data['email'], email=request.data['email'])
        if created:
            scrum_user = ScrumUser(user=user, nickname=request.data['full_name'])
            scrum_user.save()
            if request.data['usertype'] == 'Owner':
                scrum_project = ScrumProject(name=request.data['projname'])
                scrum_project.save()
                scrum_project_role = ScrumProjectRole(role="Owner", user=scrum_user, project=scrum_project)
                scrum_project_role.save()
            user.set_password(request.data['password'])
            user.save()
            return JsonResponse({'message': 'User Created Successfully.'})
        else:
            return JsonResponse({'message': 'Error: User with that e-mail already exists.'})
            
def filtered_users(project_id):
    project = ScrumProjectSerializer(ScrumProject.objects.get(id=project_id)).data
    
    for user in project['scrumprojectrole_set']:
        user['scrumgoal_set'] = [x for x in user['scrumgoal_set'] if x['visible'] == True]
        
    return project['scrumprojectrole_set']

class ScrumProjectViewSet(viewsets.ModelViewSet):
    queryset = ScrumProject.objects.all()
    serializer_class = ScrumProjectSerializer
    
    def retrieve(self, request, pk=None):
        try:
            queryset = ScrumProject.objects.get(pk=pk)
            return JsonResponse({'project_name': queryset.name, 'data': filtered_users(pk)})
        except ScrumProject.DoesNotExist:
            return JsonResponse({'detail': 'Not found.'})
    
class ScrumProjectRoleViewSet(viewsets.ModelViewSet):
    queryset = ScrumProjectRole.objects.all()
    serializer_class = ScrumProjectRoleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def patch(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        to_id = request.data['id']
        
        author = None
        if to_id[0] == 'u':
            author = ScrumProjectRole.objects.get(id=to_id[1:])
        else:
            author = ScrumGoal.objects.get(id=to_id).user
        
        author.role = request.data['role']
        author.save()
        
        return JsonResponse({'message': 'User Role Changed!', 'data': filtered_users(request.data['project_id'])})

class ScrumGoalViewSet(viewsets.ModelViewSet):
    queryset = ScrumGoal.objects.all()
    serializer_class = ScrumGoalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def create(self, request):
        user_id = request.data['user']
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        
        author = None
        if user_id[0] == 'u':
            author = ScrumProjectRole.objects.get(id=user_id[1:])
        else:
            author = ScrumGoal.objects.get(id=user_id).user
            
        if scrum_project_role != author and scrum_project_role.role != 'Owner': 
            return JsonResponse({'message': 'Permission Denied: Unauthorized Addition of a Goal.'})
        
        status_start = 0
        if author.role == 'Admin':
            status_start = 1
        elif author.role == 'Quality Analyst':
            status_start = 2
        scrum_project.project_count = scrum_project.project_count + 1
        scrum_project.save()
        goal = ScrumGoal(name=request.data['name'], status=status_start, goal_project_id=scrum_project.project_count, user=author)
        goal.save()
        return JsonResponse({'message': 'Goal Added!', 'data': filtered_users(request.data['project_id'])})
            
    def patch(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_a = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        scrum_project_b = ScrumGoal.objects.get(id=request.data['goal_id']).user
        goal_id = request.data['goal_id']
        to_id = request.data['to_id']
        
        if to_id == 4:
            if scrum_project_a.role == 'Developer':
                if request.user != scrum_project_b.user.user:
                    return JsonResponse({'message': 'Permission Denied: Unauthorized Deletion of Goal.', 'data': filtered_users(request.data['project_id'])})
                    
            del_goal = ScrumGoal.objects.get(id=goal_id)
            del_goal.visible = False
            del_goal.save()
            return JsonResponse({'message': 'Goal Removed Successfully!', 'data': filtered_users(request.data['project_id'])})
        else:
            goal_item = ScrumGoal.objects.get(id=goal_id)
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
                from_allowed = [0, 1]
                to_allowed = [0, 1]
            elif group == 'Quality Analyst':
                from_allowed = [2, 3]
                to_allowed = [2, 3]
            
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
            
            goal_item.save()
            return JsonResponse({'message': 'Goal Moved Successfully!', 'data': filtered_users(request.data['project_id'])})
            
    def put(self, request):
        scrum_project = ScrumProject.objects.get(id=request.data['project_id'])
        scrum_project_role = scrum_project.scrumprojectrole_set.get(user=request.user.scrumuser)
        if request.data['mode'] == 0:
            from_id = request.data['from_id']
            to_id = request.data['to_id']
            
            if scrum_project_role.role == 'Developer' or scrum_project_role.role == 'Quality Analyst':
                return JsonResponse({'message': 'Permission Denied: Unauthorized Reassignment of Goal.', 'data': filtered_users(request.data['project_id'])})
                
            goal = ScrumGoal.objects.get(id=from_id)
            
            author = None
            if to_id[0] == 'u':
                author = ScrumProjectRole.objects.get(id=to_id[1:])
            else:
                author = ScrumGoal.objects.get(id=to_id).user
            goal.user = author
            goal.save()
            return JsonResponse({'message': 'Goal Reassigned Successfully!', 'data': filtered_users(request.data['project_id'])})
        else:
            scrum_project_b = ScrumGoal.objects.get(id=request.data['goal_id']).user
            if scrum_project_role.role != 'Owner' and request.user != scrum_project_b.user.user:
                return JsonResponse({'message': 'Permission Denied: Unauthorized Name Change of Goal.', 'data': filtered_users(request.data['project_id'])})
            
            goal = ScrumGoal.objects.get(id=request.data['goal_id'])
            
            goal.name = request.data['new_name']
            goal.save()
            return JsonResponse({'message': 'Goal Name Changed!', 'data': filtered_users(request.data['project_id'])})
            
def jwt_response_payload_handler(token, user=None, request=None):
    project = None
    try:
        project = ScrumProject.objects.get(name__iexact=request.data['project'])
    except ScrumProject.DoesNotExist:
        raise ValidationError('The selected project does not exist.');
    
    if project.scrumprojectrole_set.filter(user=user.scrumuser).count() == 0:
        scrum_project_role = ScrumProjectRole(role="Developer", user=user.scrumuser, project=project)
        scrum_project_role.save()
        
    return {
        'token': token,
        'name': user.scrumuser.nickname,
        'role': project.scrumprojectrole_set.get(user=user.scrumuser).role,
        'project_id': project.id
    }
    