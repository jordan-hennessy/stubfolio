from django.db import models
from django.conf import settings


class Concert(models.Model):
    artist_name = models.CharField(max_length=255)
    venue_name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    date = models.DateField()

    setlistfm_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    musicbrainz_id = models.CharField(max_length=100, null=True, blank=True)

    mood_tags = models.JSONField(default=list)
    genre_tags = models.JSONField(default=list)
    energy_score = models.IntegerField(null=True, blank=True)  # Concert can exist before enrichment

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.artist_name} @ {self.venue_name} ({self.date})"


class Song(models.Model):
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE, related_name="songs")
    title = models.CharField(max_length=255)
    position = models.PositiveIntegerField()
    is_encore = models.BooleanField(default=False)
    info = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return f"{self.title} ({self.concert.artist_name})"


class TicketStub(models.Model):
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE, related_name="ticket_stubs")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ticket_stubs"
    )
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    design_seed = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stub for {self.concert.artist_name} ({self.concert.date})"
