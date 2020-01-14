from django.urls import path
from . import views

urlpatterns = [
    path('',views.AwsWebsocketApiView.as_view()),
]