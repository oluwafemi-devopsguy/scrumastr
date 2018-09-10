from rest_framework import serializers
from .models import *
        
class ScrumGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumGoal
        fields = ('visible', 'id', 'name', 'status', 'goal_project_id')
        
class ScrumUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumUser
        fields = ('nickname', 'id')
        
class ScrumProjectRoleSerializer(serializers.ModelSerializer):
    user = ScrumUserSerializer()
    scrumgoal_set = ScrumGoalSerializer(many=True)
    
    class Meta:
        model = ScrumProjectRole
        fields = ('role', 'user', 'id', 'scrumgoal_set')        
        
class ScrumProjectSerializer(serializers.HyperlinkedModelSerializer):
    scrumprojectrole_set = ScrumProjectRoleSerializer(many=True)
    class Meta:
        model = ScrumProject
        fields = ('name', 'id', 'scrumprojectrole_set', 'project_count')