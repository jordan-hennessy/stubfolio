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
