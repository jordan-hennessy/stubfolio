import pytest
from django.urls import reverse
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User


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


@pytest.mark.django_db
def test_search_setlists_returns_filtered_results(api_client, mocker):
    fake_response = {
        "setlist": [
            {"id": "abc123", "eventDate": "16-12-2025"},
        ],
        "total": 1,
        "page": 1,
        "itemsPerPage": 20,
    }

    mocker.patch("apps.concerts.views.search_setlists_service", return_value=fake_response)

    url = reverse("concert-search-setlists")
    response = api_client.get(
        url, {"artist_name": "Radiohead", "year": "2025", "country_code": "DK"}
    )

    assert response.status_code == 200
    assert response.data["total"] == 1
    assert response.data["setlist"][0]["id"] == "abc123"


@pytest.mark.django_db
def test_search_setlists_requires_artist_name(api_client):
    url = reverse("concert-search-setlists")
    response = api_client.get(url)

    assert response.status_code == 400


@pytest.mark.django_db
def test_create_from_setlist_uses_specific_setlist_id_when_provided(api_client, mocker):
    fake_setlist = {
        "id": "specific-show-456",
        "eventDate": "04-12-2025",
        "artist": {"name": "Radiohead", "mbid": "test-mbid"},
        "venue": {
            "name": "Royal Arena",
            "city": {
                "name": "Copenhagen",
                "country": {"name": "Denmark"},
            },
        },
        "sets": {"set": [{"song": [{"name": "Planet Telex"}]}]},
    }

    fake_enrichment = {
        "mood_tags": ["melancholic"],
        "genre_tags": ["rock"],
        "energy_score": 7,
    }

    mocker.patch("apps.concerts.views.get_setlist_by_id", return_value=fake_setlist)
    mocker.patch("apps.concerts.views.enrich_concert", return_value=fake_enrichment)

    url = reverse("concert-create-from-setlist")
    response = api_client.post(url, {"setlist_id": "specific-show-456"}, format="json")

    assert response.status_code == 201
    assert response.data["setlistfm_id"] == "specific-show-456"
    assert response.data["date"] == "2025-12-04"


@pytest.mark.django_db
def test_ticket_stub_requires_authentication(api_client):
    response = api_client.post("/api/ticket-stubs/", {}, format="json")
    assert response.status_code == 401


@pytest.mark.django_db
def test_ticket_stub_auto_assigns_logged_in_user(api_client):
    user = User.objects.create_user(username="testuser", password="testpass123")
    token = Token.objects.create(user=user)

    from apps.concerts.models import Concert

    concert = Concert.objects.create(
        artist_name="Test Artist",
        venue_name="Test Venue",
        city="Test City",
        country="Test Country",
        date="2026-01-01",
    )

    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = api_client.post(
        "/api/ticket-stubs/",
        {"concert": concert.id, "rating": 8, "design_seed": "abc"},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["user"] == user.id


@pytest.mark.django_db
def test_ticket_stub_list_only_shows_own_stubs(api_client):
    user1 = User.objects.create_user(username="user1", password="pass123")
    user2 = User.objects.create_user(username="user2", password="pass123")
    token1 = Token.objects.create(user=user1)
    token2 = Token.objects.create(user=user2)

    from apps.concerts.models import Concert

    concert = Concert.objects.create(
        artist_name="Test Artist",
        venue_name="Test Venue",
        city="Test City",
        country="Test Country",
        date="2026-01-01",
    )

    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token1.key}")
    api_client.post(
        "/api/ticket-stubs/",
        {"concert": concert.id, "rating": 9, "design_seed": "user1-stub"},
        format="json",
    )

    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token2.key}")
    response = api_client.get("/api/ticket-stubs/")

    assert response.status_code == 200
    assert len(response.data) == 0
