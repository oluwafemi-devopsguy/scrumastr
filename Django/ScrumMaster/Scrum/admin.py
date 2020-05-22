from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(ScrumUser)
admin.site.register(ScrumGoal)
admin.site.register(ScrumProject)
admin.site.register(ScrumProjectRole)
admin.site.register(ScrumDemoProject)
admin.site.register(ScrumChatRoom)
admin.site.register(ScrumChatMessage)
admin.site.register(ScrumSprint)
admin.site.register(ScrumGoalHistory)
admin.site.register(ChatscrumSlackApp)
admin.site.register(ScrumSlack)
admin.site.register(ScrumNote)
admin.site.register(Connection)
admin.site.register(ChatMessage)
admin.site.register(ChatSlack)
