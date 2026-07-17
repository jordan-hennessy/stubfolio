from rest_framework.routers import DefaultRouter

from .views import ConcertViewSet, TicketStubViewSet

router = DefaultRouter()
router.register("concerts", ConcertViewSet, basename="concert")
router.register("ticket-stubs", TicketStubViewSet, basename="ticketstub")

urlpatterns = router.urls

# What we would do without router:
# path("concerts/", concert_list_view)
# path("concerts/<int:pk>/", concert_detail_view)
# path("concerts/create_from_setlist/", create_from_setlist_view)

# router.register("concerts", ConcertViewSet) generates the same thing.