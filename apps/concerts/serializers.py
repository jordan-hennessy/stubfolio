from rest_framework import serializers

from .constants import MOOD_CHOICES, GENRE_CHOICES
from .models import TicketStub


class TicketStubSerializer(serializers.ModelSerializer):
    mood_tags = serializers.ListField(child=serializers.ChoiceField(choices=MOOD_CHOICES))
    genre_tags = serializers.ListField(child=serializers.ChoiceField(choices=GENRE_CHOICES))

    class Meta:
        model = TicketStub
        fields = [
            "id",
            "concert",
            "mood_tags",
            "genre_tags",
            "energy_score",
            "rating",
            "design_seed",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
