from channels import route

# This function will display all messages received in the console
def ws_message(message):
    print(message['text'])


channel_routing = [
    route('websocket.connect', ws_connect),
    route('websocket.disconnect', ws_disconnect),
    route("websocket.receive", ws_message),
]