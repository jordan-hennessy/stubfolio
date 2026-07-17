from rest_framework.routers import DefaultRouter

from .views import ConcertViewSet, TicketStubViewSet

router = DefaultRouter()
router.register("concerts", ConcertViewSet, basename="concert")
router.register("ticket-stubs", TicketStubViewSet, basename="ticketstub")

urlpatterns = router.urls
