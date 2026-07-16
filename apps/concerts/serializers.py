from rest_framework import serializers

from .constants import MOOD_CHOICES, GENRE_CHOICES
from .models import TicketStub, Concert


class TicketStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketStub
        fields = [
            "id",
            "concert",
            "rating",
            "design_seed",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ConcertSerializer(serializers.ModelSerializer):
    mood_tags = serializers.ListField(child=serializers.ChoiceField(choices=MOOD_CHOICES))
    genre_tags = serializers.ListField(child=serializers.ChoiceField(choices=GENRE_CHOICES))

    class Meta:
        model = Concert
        fields = [
            "id",
            "artist_name",
            "venue_name",
            "city",
            "country",
            "date",
            "setlistfm_id",
            "musicbrainz_id",
            "mood_tags",
            "genre_tags",
            "energy_score",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
