from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Concert, TicketStub
from .serializers import ConcertSerializer, TicketStubSerializer
from .services import (
    find_artist_exact_match,
    get_artist_setlists,
    parse_setlist,
    save_parsed_setlist,
    enrich_concert,
)


class ConcertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Concert.objects.all()  # Will have to change when auth is set up
    serializer_class = ConcertSerializer

    @action(detail=False, methods=["post"])
    def create_from_setlist(self, request):
        artist_name = request.data.get("artist_name")

        if not artist_name:
            return Response(
                {"error": "artist_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        artist = find_artist_exact_match(artist_name)
        if artist is None:
            return Response(
                {"error": f"No exact match found for artist '{artist_name}'"},
                status=status.HTTP_404_NOT_FOUND,
            )

        setlists_data = get_artist_setlists(artist["mbid"])
        if not setlists_data or not setlists_data.get("setlist"):
            return Response(
                {"error": f"No setlists found for '{artist_name}'"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # TODO: currently always takes the most recent setlist (index 0).
        # Should eventually let the user pick which specific show they attended.
        raw_setlist = setlists_data["setlist"][0]

        parsed = parse_setlist(raw_setlist)
        concert = save_parsed_setlist(parsed)

        enrichment = enrich_concert(concert)
        concert.mood_tags = enrichment["mood_tags"]
        concert.genre_tags = enrichment["genre_tags"]
        concert.energy_score = enrichment["energy_score"]
        concert.save()

        serializer = self.get_serializer(concert)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TicketStubViewSet(viewsets.ModelViewSet):
    queryset = TicketStub.objects.all()
    serializer_class = TicketStubSerializer
