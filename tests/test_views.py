import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_create_from_setlist_creates_concert_and_songs(api_client, mocker):
    fake_search_response = {
        "artist": [
            {"mbid": "test-mbid-123", "name": "Test Band"},
        ]
    }

    fake_setlists_response = {
        "setlist": [
            {
                "id": "setlist-abc",
                "eventDate": "16-12-2025",
                "artist": {"name": "Test Band", "mbid": "test-mbid-123"},
                "venue": {
                    "name": "Test Venue",
                    "city": {
                        "name": "Test City",
                        "country": {"name": "Test Country"},
                    },
                },
                "sets": {"set": [{"song": [{"name": "Opening Song"}]}]},
            }
        ]
    }

    fake_enrichment = {
        "mood_tags": ["energetic"],
        "genre_tags": ["rock"],
        "energy_score": 7,
    }

    def fake_requests_get(url, headers=None, params=None):
        mock_response = mocker.Mock()
        mock_response.status_code = 200

        if "search/artists" in url:
            mock_response.json.return_value = fake_search_response
        else:
            mock_response.json.return_value = fake_setlists_response

        return mock_response

    mocker.patch("apps.concerts.services.requests.get", side_effect=fake_requests_get)
    mocker.patch("apps.concerts.views.enrich_concert", return_value=fake_enrichment)

    url = reverse("concert-create-from-setlist")
    response = api_client.post(url, {"artist_name": "Test Band"}, format="json")

    assert response.status_code == 201
    assert response.data["artist_name"] == "Test Band"
    assert response.data["mood_tags"] == ["energetic"]

    from apps.concerts.models import Concert

    concert = Concert.objects.get(setlistfm_id="setlist-abc")
    assert concert.songs.count() == 1
