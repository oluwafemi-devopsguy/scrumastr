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
        message = text_data_json['message']
        print(message)
        self.send(text_data=json.dumps({'message': message}))

'''        
#For when you do have redis; You can see everyone's chat.
class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'chat_global'
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print(message)
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {'type': 'chat_message', 'message': message})

    def chat_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps({'message': message}))
'''