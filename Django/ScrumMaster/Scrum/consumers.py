from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json

#For when you don't have redis; You can only see your own chat.
class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        
    def disconnect(self, close_code):
        pass
        
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user = text_data_json['user']
        message = text_data_json['message']
        print(user, message)
        self.send(text_data=json.dumps({'user': user, 'message': message}))

'''        
#For when you do have redis; You can see everyone's chat.
class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = '._global_chat_.'
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user = text_data_json['user']
        message = text_data_json['message']
        print(message)
        print(message[:5])
        if message[:5] == '!join':
            async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
            self.room_group_name = message[5:]
            async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
            async_to_sync(self.channel_layer.group_send)(self.room_group_name, {'type': 'chat_message', 'user': user, 'message': '<- This user has joined this group.'})
        else:
            print(message)
            async_to_sync(self.channel_layer.group_send)(self.room_group_name, {'type': 'chat_message', 'user': user, 'message': message})

    def chat_message(self, event):
        user = event['user']
        message = event['message']
        self.send(text_data=json.dumps({'user': user, 'message': message}))
'''