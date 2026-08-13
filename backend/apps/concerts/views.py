from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Concert, TicketStub
from .serializers import ConcertSerializer, TicketStubSerializer
from .services import (
    enrich_concert,
    find_artist_exact_match,
    get_artist_setlists,
    get_setlist_by_id,
    parse_setlist,
    save_parsed_setlist,
    search_artist,
    sort_artists_by_relevance,
)
from .services import (
    search_setlists as search_setlists_service,
)


class ConcertViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]  # noqa: RUF012
    serializer_class = ConcertSerializer

    def get_queryset(self):  # type: ignore
        return Concert.objects.filter(ticket_stubs__user=self.request.user)

    @action(detail=False, methods=["post"])
    def create_from_setlist(self, request):
        setlist_id = request.data.get("setlist_id")
        artist_name = request.data.get("artist_name")

        if setlist_id:
            raw_setlist = get_setlist_by_id(setlist_id)
            if raw_setlist is None:
                return Response(
                    {"error": f"No setlist found with id '{setlist_id}'"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        elif artist_name:
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

            raw_setlist = setlists_data["setlist"][0]
        else:
            return Response(
                {"error": "Either setlist_id or artist_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parsed = parse_setlist(raw_setlist)
        concert = save_parsed_setlist(parsed)

        enrichment = enrich_concert(concert)
        concert.mood_tags = enrichment["mood_tags"]
        concert.genre_tags = enrichment["genre_tags"]
        concert.energy_score = enrichment["energy_score"]
        concert.save()

        # Create ticket stub but set to `null`, until user generates stub

        TicketStub.objects.get_or_create(concert=concert, user=request.user)

        serializer = self.get_serializer(concert)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def search_setlists(self, request):
        artist_name = request.query_params.get("artist_name")

        if not artist_name:
            return Response(
                {"error": "artist_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        year = request.query_params.get("year")
        country_code = request.query_params.get("country_code")
        page = request.query_params.get("page", 1)

        results = search_setlists_service(
            artist_name=artist_name,
            year=int(year) if year else None,
            country_code=country_code,
            page=int(page),
        )

        if results is None:
            return Response(
                {"error": "No setlists found, or rate limited"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(results)

    @action(detail=False, methods=["get"])
    def search_artists(self, request):
        artist_name = request.query_params.get("artist_name")

        if not artist_name:
            return Response(
                {"error": "artist_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = search_artist(artist_name)

        if results is None:
            return Response(
                {"error": "No artists found, or rate limited"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if results.get("artist"):
            results["artist"] = sort_artists_by_relevance(results["artist"], artist_name)

        return Response(results)

    @action(detail=False, methods=["get"])
    def artist_setlists(self, request):
        mbid = request.query_params.get("mbid")

        if not mbid:
            return Response(
                {"error": "mbid is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = get_artist_setlists(mbid)

        if results is None:
            return Response(
                {"error": "No setlists found, or rate limited"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(results)


class TicketStubViewSet(viewsets.ModelViewSet):
    serializer_class = TicketStubSerializer
    permission_classes = [IsAuthenticated]  # noqa: RUF012

    def get_queryset(self):  # type: ignore
        return TicketStub.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        stub = self.get_object()
        stub.design_seed = f"placeholder-{stub.id}"
        stub.save()
        serializer = self.get_serializer(stub)
        return Response(serializer.data)
