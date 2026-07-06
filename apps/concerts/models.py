from django.db import models


class Concert(models.Model):
    artist_name = models.CharField(max_length=255)
    venue_name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    date = models.DateField()

    setlistfm_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    musicbrainz_id = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.artist_name} @ {self.venue_name} ({self.date})"


class Song(models.Model):
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE, related_name="songs")
    title = models.CharField(max_length=255)
    position = models.PositiveIntegerField()
    is_encore = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.concert.artist_name})"


class TicketStub(models.Model):
    concert = models.OneToOneField(Concert, on_delete=models.CASCADE, related_name="ticket_stub")
    mood_tags = models.JSONField(default=list)
    energy_score = models.IntegerField()
    genre_tags = models.JSONField(default=list)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    design_seed = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stub for {self.concert.artist_name} ({self.concert.date})"
