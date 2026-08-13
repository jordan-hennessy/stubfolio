from rest_framework import serializers

from .constants import GENRE_CHOICES, MOOD_CHOICES
from .models import Concert, TicketStub


class TicketStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketStub
        fields = [  # noqa: RUF012
            "id",
            "concert",
            "user",
            "rating",
            "design_seed",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]  # noqa: RUF012


class ConcertSerializer(serializers.ModelSerializer):
    mood_tags = serializers.ListField(child=serializers.ChoiceField(choices=MOOD_CHOICES))
    genre_tags = serializers.ListField(child=serializers.ChoiceField(choices=GENRE_CHOICES))
    ticket_stub = serializers.SerializerMethodField()

    def get_ticket_stub(self, obj):
        user = self.context["request"].user
        stub = obj.ticket_stubs.filter(user=user).first()
        if stub is None:
            return None
        return {
            "id": stub.id,
            "design_seed": stub.design_seed,
        }

    class Meta:
        model = Concert
        fields = [  # noqa: RUF012
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
            "ticket_stub",
        ]
        read_only_fields = ["id", "created_at"]  # noqa: RUF012
