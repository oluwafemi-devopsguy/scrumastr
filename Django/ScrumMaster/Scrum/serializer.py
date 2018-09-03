from rest_framework import serializers
from .models import *
        
class ScrumGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrumGoal
        fields = ('visible', 'id', 'name', 'status', 'project')
        
class ScrumUserSerializer(serializers.ModelSerializer):
    scrumgoal_set = ScrumGoalSerializer(many=True)
    class Meta:
        model = ScrumUser
        fields = ('nickname', 'id', 'scrumgoal_set', 'projects')
        
class ScrumProjectSerializer(serializers.HyperlinkedModelSerializer):
    scrumuser_set = ScrumUserSerializer(many=True)
    class Meta:
        model = ScrumProject
        fields = ('name', 'id', 'scrumuser_set')