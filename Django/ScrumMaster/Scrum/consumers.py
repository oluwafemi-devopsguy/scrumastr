from channels.generic.websocket import AsyncWebsocketConsumer
import json
import hashlib

#For when you don't have redis; You can only see your own chat.
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
    async def disconnect(self, close_code):
        pass
        
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user = text_data_json['user']
        message = text_data_json['message']
        print(user, message)
        await self.send(text_data=json.dumps({'user': user, 'message': message}))

'''        
#For when you do have redis; You can see everyone's chat.
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'chat'
        self.room_group_name = hashlib.sha256(b'._global_chat_.').hexdigest()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': 'INFO', 'message': 'A user has disconnected.'})
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user = text_data_json['user']
        message = text_data_json['message']
        print(message)
        print(message[:6])
        if message[:6] == '!join ':
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            self.room_group_name = hashlib.sha256(message[6:].encode('UTF-8')).hexdigest()
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': user, 'message': '<- This user has joined.'})
        else:
            print(message)
            await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': user, 'message': message})

    async def chat_message(self, event):
        user = event['user']
        message = event['message']
        await self.send(text_data=json.dumps({'user': user, 'message': message}))
'''