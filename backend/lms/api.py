from ninja_jwt.controller import NinjaJWTDefaultController
from core.permissions import JWTAuthBearer
from ninja_extra import NinjaExtraAPI
from core.controllers.auth import AuthController
from core.controllers.book import BookController, ReaderBookController
from core.controllers.user import UserController
from core.controllers.analytics import AnalyticsController
from core.controllers.events import EventsController

# from django.conf import settings

# Create API instance - removing the invalid auto_auth parameter
api = NinjaExtraAPI(
    title="Library Management System API",
    version="1.0.0",
    urls_namespace="api",
    auth=JWTAuthBearer(),
    csrf=False
)

# Register controllers
api.register_controllers(
    NinjaJWTDefaultController,
    AuthController,
    BookController,
    ReaderBookController,
    UserController,
    AnalyticsController,
    EventsController
)