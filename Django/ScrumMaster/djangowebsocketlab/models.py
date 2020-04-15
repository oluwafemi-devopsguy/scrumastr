from django.db import models


class ChatMessage(models.Model):
    username = models.CharField(max_length=50)
    message = models.CharField(max_length=400)
    timestamp=models.CharField(max_length=100,null=True)


class Connection(models.Model):
    connection_id = models.CharField(max_length=255)