from apps.concerts.services import parse_setlist, find_artist_exact_match


def test_parse_setlist_correctly_identifies_encore_songs():
    raw_setlist = {
        "id": "abc123",
        "eventDate": "16-12-2025",
        "artist": {"name": "Test Artist", "mbid": "test-mbid"},
        "venue": {
            "name": "Test Venue",
            "city": {
                "name": "Test City",
                "country": {"name": "Test Country"},
            },
        },
        "sets": {
            "set": [
                {"song": [{"name": "Opener"}, {"name": "Second Song"}]},
                {"encore": 1, "song": [{"name": "Encore Song"}]},
            ]
        },
    }

    result = parse_setlist(raw_setlist)

    songs = result["songs"]
    assert songs[0]["is_encore"] is False
    assert songs[1]["is_encore"] is False
    assert songs[2]["is_encore"] is True


def test_parse_setlist_correctly_parses_date():
    raw_setlist = {
        "id": "abc123",
        "eventDate": "16-12-2025",
        "artist": {"name": "Test Artist", "mbid": "test-mbid"},
        "venue": {
            "name": "Test Venue",
            "city": {
                "name": "Test City",
                "country": {"name": "Test Country"},
            },
        },
        "sets": {"set": [{"song": [{"name": "Opener"}]}]},
    }

    result = parse_setlist(raw_setlist)

    concert_date = result["concert"]["date"]
    assert concert_date.year == 2025
    assert concert_date.month == 12
    assert concert_date.day == 16


def test_parse_setlist_continues_position_count_through_encore():
    raw_setlist = {
        "id": "abc123",
        "eventDate": "16-12-2025",
        "artist": {"name": "Test Artist", "mbid": "test-mbid"},
        "venue": {
            "name": "Test Venue",
            "city": {
                "name": "Test City",
                "country": {"name": "Test Country"},
            },
        },
        "sets": {
            "set": [
                {"song": [{"name": "First"}, {"name": "Second"}]},
                {"encore": 1, "song": [{"name": "Third"}]},
            ]
        },
    }

    result = parse_setlist(raw_setlist)

    positions = [song["position"] for song in result["songs"]]
    assert positions == [1, 2, 3]


def test_find_artist_exact_match_filters_out_tribute_bands(mocker):
    fake_response_json = {
        "artist": [
            {"mbid": "fake-1", "name": "Just Radiohead"},
            {"mbid": "fake-2", "name": "Radiohead"},
            {"mbid": "fake-3", "name": "Fake Plastic Radiohead"},
        ]
    }

    mock_response = mocker.Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = fake_response_json

    mocker.patch("apps.concerts.services.requests.get", return_value=mock_response)

    result = find_artist_exact_match("Radiohead")

    assert result["mbid"] == "fake-2"
    assert result["name"] == "Radiohead"

