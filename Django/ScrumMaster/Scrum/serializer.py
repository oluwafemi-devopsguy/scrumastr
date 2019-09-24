from rest_framework import serializers
from .models import *

class ScrumSlackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumSlack
        fields = ('id','bot_access_token', 'access_token')

class ScrumWorkIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumWorkId
        fields = ('id','user','workid', 'branch') 

class ScrumNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumNote
        fields = ('id','user', 'note', 'priority', 'time_created')

class ScrumLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumLog
        fields = ('id', 'user', 'log', 'priority', 'time_created')          

# class ScrumProjectSlackSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ScrumProjectSlack
#         fields = ('slack_client_id', 'slack_client_secret', 'slack_verification_token', 'slack_bot_user_token')

class ScrumGoalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumGoalHistory
        fields = ('id', 'name', 'status', 'goal_project_id', 'hours', 'time_created', 'user', 'project', 'file', 'goal', 'done_by', 'message')
        
class ScrumGoalSerializer(serializers.ModelSerializer):
    scrumgoalhistory_set = ScrumGoalHistorySerializer(many=True)
    class Meta:
        model = ScrumGoal
        fields = ('message_exist', 'visible', 'id', 'name', 'status', 'goal_project_id', 'hours', 'time_created', 'user', 'project', 'file', 'scrumgoalhistory_set', 'days_failed', 'push_id')
        
class ScrumUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumUser
        fields = ('nickname', 'id')

class ScrumEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumEmail
        fields = ('email', 'id')        

class ScrumSprintSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ScrumSprint
        fields = ('id', 'created_on', 'ends_on', 'goal_project_id')
        
class ScrumProjectRoleSerializer(serializers.ModelSerializer):     
    scrumnote_set = ScrumNoteSerializer(many=True)
    scrumworkid_set = ScrumWorkIdSerializer(many=True)
    scrumlog_set = ScrumLogSerializer(many=True)
    user = ScrumUserSerializer()
    scrumgoal_set = ScrumGoalSerializer(many=True)    
    class Meta:
        model = ScrumProjectRole
        fields = ('role', 'color', 'user', 'slack_user_id', 'slack_email', 'slack_username', 'slack_profile_picture', 'id', 'scrumgoal_set', 'scrumnote_set', 'scrumworkid_set', 'scrumlog_set')        
        
class ScrumProjectSerializer(serializers.HyperlinkedModelSerializer):
    scrumprojectrole_set = ScrumProjectRoleSerializer(many=True)
    scrumslack_set = ScrumSlackSerializer(many=True)
    class Meta:
        model = ScrumProject
        fields = ('name', 'id', 'scrumprojectrole_set','scrumslack_set', 'project_count')


