from django.contrib import admin

from .models import Concert, Song, TicketStub

admin.site.register(Concert)
admin.site.register(Song)
admin.site.register(TicketStub)
