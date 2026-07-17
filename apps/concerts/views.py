from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Concert, TicketStub
from .serializers import ConcertSerializer, TicketStubSerializer


class ConcertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Concert.objects.all()  # Will have to change when auth is set up
    serializer_class = ConcertSerializer    

    @action(detail=False, methods=["post"])
    def create_from_setlist(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class TicketStubViewSet(viewsets.ModelViewSet):
    queryset = TicketStub.objects.all()
    serializer_class = TicketStubSerializer
