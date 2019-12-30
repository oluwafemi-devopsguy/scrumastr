import boto3
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage, Connection


class AwsWebsocketApiView(APIView):
    permission_classes = [] 

    def get(self, request):
        return Response(
            {'message':'get worked.'},
            status.HTTP_200_OK
        )
        
    #connect
    def post(self, request):
        connection_id = request.data['connectionId']
        Connection(connection_id=connection_id).save()
        return Response(
            {'message':'Connect successful.'},
            status.HTTP_200_OK
        )

    #send_message
    def put(self, request):
        body = request.data['body']

        # Add the new message to the database
        ChatMessage(
            username=body['username'],
            message=body['content'],
            timestamp=body['timestamp'],
        ).save()

        # # Get all current connections
        connections = Connection.objects.all()

        data = {'messages':[body]}
        # # Send the message data to all connections
        for connection in connections:
            _send_to_connection(
                connection.connection_id, data
            )

        return Response({'message':'successful'},status.HTTP_200_OK)

    #get_recent_messages
    def patch(self, request):
        recent_messages = ChatMessage.objects.order_by('-pk')[:30]

        # Extract the relevant data and order chronologically
        messages = [
            {
                "username":m.username,
                "content": m.message,
                "timestamp": m.timestamp,
            } for m in recent_messages
        ]

        messages.reverse()

        data = {"messages":messages}
        # Send them to the client who asked for it
        _send_to_connection(
            request.data['connectionId'], data
        )
            
        return Response(
            {'message':'successfully send'},
            status.HTTP_200_OK
        )

    #disconnect
    def delete(self, request):
        connection_id = request.data['connectionId']
        Connection.objects.filter(connection_id=connection_id).delete()
        return Response(
            {'message':'successfully disconnect'},
            status.HTTP_200_OK
        )



#Helper
def _send_to_connection(connection_id, data):
    gatewayapi = boto3.client(
        "apigatewaymanagementapi",
        endpoint_url=str(settings.AWS_WS_GATEWAY),
        region_name=str(settings.REGION),
        aws_access_key_id=str(settings.AWS_ACCESS_KEY_ID),
        aws_secret_access_key=str(settings.AWS_SECRET_ACCESS_KEY),
    )
    return gatewayapi.post_to_connection(
        ConnectionId=connection_id,
        Data=json.dumps(data).encode('utf-8')
    )