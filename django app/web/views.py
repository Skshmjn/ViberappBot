from django.http import HttpResponse
from django.shortcuts import render
from google.cloud import datastore


# Create your views here.

def index(request):
    client = datastore.Client()
    query = client.query(kind='Users')
    users = query.fetch()
    return render(request, "web/index.html", {"users": users})


def chat(request, room_id):
    client = datastore.Client()
    query = client.query(kind='Messages').add_filter('user', '=', room_id)
    texts = query.fetch(limit=10)
    response_list = []
    for text in texts:
        if text['in/out'] == "in":
            response_list.append("user : " + text['text'])
        else:
            response_list.append("you : " + text['text'])
    print(response_list)

    return render(request, "web/chat.html", {"room": room_id, "chats": response_list})
