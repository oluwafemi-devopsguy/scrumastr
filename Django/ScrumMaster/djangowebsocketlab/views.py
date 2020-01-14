import boto3
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ChatMessage, Connection
# from websocketlab.models import ChatMessage, Connection

@csrf_exempt
def test(request):
    return JsonResponse(
        {'message': 'successfully'}, status=200
    )

@csrf_exempt
def connect(request):
    body = _parse_body(request.body)
    connection_id = body['connectionId']
    Connection(connection_id=connection_id).save()
    return JsonResponse(
        {'message': 'connect successfully'}, status=200
    )

@csrf_exempt
def disconnect(request):
    body = _parse_body(request.body)
    connection_id = body['connectionId']
    Connection.objects.filter(connection_id=connection_id).delete()
    return JsonResponse(
        {'message': 'disconnect successfully'}, status=200
    )

@csrf_exempt
def send_message(request):
    body = _parse_body(request.body)['body']

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
    
    return JsonResponse(
        {'message': 'successfully send'}, status=200
    )

@csrf_exempt
def get_recent_messages(request):
    connection_id = _parse_body(request.body)['connectionId']
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
        connection_id, data
    )

    return JsonResponse(
        {'message': 'successfully send'}, status=200
    )

#Helper
def _parse_body(body):
    body_unicode = body.decode('utf-8')
    return json.loads(body_unicode)

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