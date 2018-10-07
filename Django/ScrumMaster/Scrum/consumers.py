from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import *
import json
import hashlib

#For when you don't have redis; You can only see your own chat.
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
    async def disconnect(self, close_code):
        print(close_code)
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
    def generate_room(name, hash):
        new_room = ScrumChatRoom(name=name, hash=hash)
        new_room.save()
        return new_room
        
    def generate_message(room, user, message):
        new_message = ScrumChatMessage(room=room, user=user, message=message)
        new_message.save()
    
    async def connect(self):
        self.room_group_name = hashlib.sha256(b'._global_chat_.').hexdigest()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': 'SERVER INFO', 'message': self.user + ' has left.'})
        await database_sync_to_async(generate_message)('SERVER INFO', str(self.user + 'has left.'))
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        self.user = text_data_json['user']
        message = text_data_json['message']
        if message[:6] == '!join ':
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            self.room_group_name = hashlib.sha256(message[6:].encode('UTF-8')).hexdigest()
            
            room = await database_sync_to_async(ScrumChatRoom.objects.filter)(hash=self.room_group_name)
            
            if room.count() == 0:
                new_room = await database_sync_to_async(generate_room)(name=message[6:66], hash=self.room_group_name)
                await database_sync_to_async(generate_message)(room=new_room, user='SERVER INFO', message='=== This is the beginning of the chatroom history. ===')
                self.room_object = new_room
            else:
                self.room_object = room[0]
                
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': 'SERVER INFO', 'message': self.user + ' has joined.'})
            await database_sync_to_async(generate_message)(room=self.room_object, user='SERVER INFO', message=(self.user + ' has joined.'))
        else:
            print(message)
            await self.channel_layer.group_send(self.room_group_name, {'type': 'chat_message', 'user': self.user, 'message': message})
            await database_sync_to_async(generate_message)(room=self.room_object, user=self.user, message=message)

    async def chat_message(self, event):
        user = event['user']
        message = event['message']
        await self.send(text_data=json.dumps({'user': user, 'message': message}))
        
'''