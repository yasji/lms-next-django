from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
# from .auth_controller import AuthController
# from .book_controller import BookController, ReaderBookController
# from .user_controller import UserController
# from .analytics_controller import AnalyticsController
# from .events_controller import EventsController
from core.controllers.auth import AuthController
from core.controllers.book import BookController, ReaderBookController
from core.controllers.user import UserController
from core.controllers.analytics import AnalyticsController
from core.controllers.events import EventsController




from .permissions import JWTAuthBearer

api = NinjaExtraAPI(auth=JWTAuthBearer())
api.register_controllers(AuthController)
api.register_controllers(NinjaJWTDefaultController)
api.register_controllers(BookController)
api.register_controllers(ReaderBookController)
api.register_controllers(UserController)
api.register_controllers(AnalyticsController)
api.register_controllers(EventsController)
