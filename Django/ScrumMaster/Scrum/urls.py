from django.urls import path
from django.conf.urls import url, include
from django.conf.urls.static import static
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_jwt.views import obtain_jwt_token
from ScrumMaster import settings

app_name = "Scrum"

def_router = DefaultRouter()
def_router.register('scrumlog', views.ScrumLogViewSet)
def_router.register('scrumemail', views.ScrumEmailViewSet)
def_router.register('scrumusers', views.ScrumUserViewSet)
def_router.register('scrumgoals', views.ScrumGoalViewSet)
def_router.register('scrumnotes', views.ScrumNoteViewSet)
def_router.register('scrumworkid', views.ScrumWorkIdViewSet)
def_router.register('scrumprojects', views.ScrumProjectViewSet)
def_router.register('scrumprojectroles', views.ScrumProjectRoleViewSet)
def_router.register('scrumuserfetch', views.ScrumFetchViewSet)
def_router.register(r'scrumsprint', views.SprintViewSet, base_name='scrumsprint')
def_router.register('get_messages', views.GetAllMessagesViewSet)
def_router.register('delete_user', views.DeleteUserViewSet)
def_router.register('get_all_usernames', views.GetAllUsernames)


'''
    path('create-user/', views.create_user, name="create_user"),
    path('init-user/', views.init_user, name="init_user"),
    path('scrum-login/', views.scrum_login, name="scrum_login"),
    path('profile/', views.profile, name="profile"),
    path('scrum-logout/', views.scrum_logout, name="scrum_logout"),
    path('add-goal/', views.add_goal, name="add_goal"),
    path('remove-goal/<int:goal_id>/', views.remove_goal, name="remove_goal"),
    path('move-goal/<int:goal_id>/<int:to_id>/', views.move_goal, name="move_goal"),
'''
    
urlpatterns = [
    url(r'api/', include(def_router.urls)),
    url(r'^api-token-auth/', obtain_jwt_token),
    path(r'create-demo/', views.createDemoUser),
    url(r'^events/', views.Events.as_view()),
    
    path('test/', views.test, name='test'),
    path('connect/', views.connect, name='connect'),
    path('disconnect/', views.disconnect, name='disconnect'),
    path('send_message/', views.send_message, name='sendmessage'),
    path('get_recentmessages/', views.get_recentmessages, name='get_recentmessages'),
    path('connect_to_project/', views.connect_to_project, name='connecttoproject'),
    path('change_goalowner/', views.ChangeGoalOwnerViewSet.as_view({'post':'create'}), name="moveGoal"),
    path('move_goal/', views.MoveGoalViewSet.as_view({'post':'create'}), name="moveGoal"),
    path('get_project_goals/', views.GetProjectGoals.as_view({'post':'create'}), name='getProjectGoals'),
]




if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)