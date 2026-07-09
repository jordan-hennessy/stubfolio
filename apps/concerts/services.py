import requests
from datetime import datetime
import json

from google import genai
from google.genai import types

from .constants import MOOD_CHOICES, GENRE_CHOICES

from django.conf import settings
from django.db import transaction

from apps.concerts.models import Concert, Song

SETLISTFM_BASE_URL = "https://api.setlist.fm/rest/1.0"


def search_artist(artist_name):
    """
    Search setlist.fm for an artist by name.
    Returns the raw JSON response from setlist.fm, or None if no results are found.
    """

    url = f"{SETLISTFM_BASE_URL}/search/artists"
    headers = {
        "x-api-key": settings.SETLISTFM_API_KEY,
        "Accept": "application/json",
    }
    params = {"artistName": artist_name}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 404:
        return None

    response.raise_for_status()

    return response.json()


def find_artist_exact_match(artist_name):
    """
    Search setlist.fm for an artist and return the exact name match, if one exists.
    Returns None if no exact match is found.
    """

    results = search_artist(artist_name)

    if results is None:
        return None

    artists = results.get("artist", [])

    for artist in artists:
        if artist["name"].lower() == artist_name.lower():
            return artist

    return None


def parse_setlist(raw_setlist):
    """
    Take a raw setlist dict from the setlist.fm API and shape it into
    clean data ready to create a Concert + Song rows from.
    """
    event_date = datetime.strptime(raw_setlist["eventDate"], "%d-%m-%Y").date()

    concert_data = {
        "artist_name": raw_setlist["artist"]["name"],
        "musicbrainz_id": raw_setlist["artist"]["mbid"],
        "venue_name": raw_setlist["venue"]["name"],
        "city": raw_setlist["venue"]["city"]["name"],
        "country": raw_setlist["venue"]["city"]["country"]["name"],
        "date": event_date,
        "setlistfm_id": raw_setlist["id"],
    }

    songs_data = []
    position = 1

    for set_block in raw_setlist["sets"]["set"]:
        is_encore = "encore" in set_block

        for song in set_block.get("song", []):
            songs_data.append(
                {
                    "title": song["name"],
                    "info": song.get("info", ""),
                    "position": position,
                    "is_encore": is_encore,
                }
            )
            position += 1

    return {
        "concert": concert_data,
        "songs": songs_data,
    }


def save_parsed_setlist(parsed_data):
    """
    Take the output of parse_setlist() and save it as real Concert + Song rows.
    Wrapped in a transaction so a failure partway through leaves no partial data.
    """
    concert_data = parsed_data["concert"]
    songs_data = parsed_data["songs"]

    with transaction.atomic():
        concert, created = Concert.objects.get_or_create(
            setlistfm_id=concert_data["setlistfm_id"],
            defaults=concert_data,
        )

        if not created:
            return concert

        for song_data in songs_data:
            Song.objects.create(concert=concert, **song_data)

    return concert


def enrich_concert(concert):
    """
    Call Gemini to generate mood/genre tags and an energy score for a concert,
    based on its setlist. Returns raw (unvalidated) data from the LLM.
    """
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    song_titles = list(concert.songs.values_list("title", flat=True))
    mood_values = [choice[0] for choice in MOOD_CHOICES]
    genre_values = [choice[0] for choice in GENRE_CHOICES]

    prompt = f"""
    A concert by {concert.artist_name} at {concert.venue_name} in {concert.city}.
    Setlist: {", ".join(song_titles)}

    Based on this setlist, suggest:
    - 1-3 mood tags from this exact list: {mood_values}
    - 1-2 genre tags from this exact list: {genre_values}
    - an energy score from 1 (mellow) to 10 (intense/high-energy)
    """

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "mood_tags": {"type": "array", "items": {"type": "string"}},
                    "genre_tags": {"type": "array", "items": {"type": "string"}},
                    "energy_score": {"type": "integer"},
                },
                "required": ["mood_tags", "genre_tags", "energy_score"],
            },
        ),
    )

    return json.loads(response.text)
