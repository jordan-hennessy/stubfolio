import requests
from django.conf import settings

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
