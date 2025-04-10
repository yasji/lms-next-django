from ninja_extra.security import HttpBearer
from ninja_jwt.authentication import JWTAuth
from ninja.errors import HttpError

class BaseAuthPermission:
    """Base class that provides authentication checking for permission classes"""
    def authenticate(self, request):
        # Extract token from cookies
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None
            
        # Use JWTAuth to authenticate the request
        jwt_auth = JWTAuth()
        try:
            # JWTAuth needs the token as the second argument
            return jwt_auth.authenticate(request, access_token)
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return None

class IsAuthenticated(BaseAuthPermission):
    def __call__(self, request):
        # Authenticate the request
        user = self.authenticate(request)
        
        # Check if user is authenticated
        if user and user.is_authenticated:
            # Set user on request for later use
            request.user = user
            return True
            
        # Using a string for the error message instead of a dictionary
        raise HttpError(401, "Authentication required")

class IsAdmin(BaseAuthPermission):
    def __call__(self, request):
        # Authenticate the request
        user = self.authenticate(request)
        
        # Check if user is authenticated and is admin
        if user and user.is_authenticated:
            # Set user on request for later use
            request.user = user
            
            if user.is_admin():
                return True
                
            # User is authenticated but not an admin - use string message
            raise HttpError(403, "You do not have admin privileges to access this resource")
            
        # Using a string for the error message instead of a dictionary
        raise HttpError(401, "Authentication required")

class IsReader(BaseAuthPermission):
    def __call__(self, request):
        # Authenticate the request
        user = self.authenticate(request)
        
        # Check if user is authenticated and is reader
        if user and user.is_authenticated:
            # Set user on request for later use
            request.user = user
            
            if user.is_reader():
                return True
                
            # User is authenticated but not a reader - use string message
            raise HttpError(403, "You do not have reader privileges to access this resource")
            
        # Using a string for the error message instead of a dictionary
        raise HttpError(401, "Authentication required")

class JWTAuthBearer(HttpBearer):
    def authenticate(self, request, token):
        # Also check for token in cookies
        if not token:
            token = request.COOKIES.get('access_token')
            if not token:
                return None
        
        jwt_auth = JWTAuth()
        try:
            user_auth = jwt_auth.authenticate(request, token)
            if user_auth:
                # Set user on request for later use
                request.user = user_auth
                return user_auth
        except Exception as e:
            print(f"JWT Authentication error: {str(e)}")
        
        return None
    
    def __call__(self, request):
        # Skip authentication for specific paths that should be public
        if request.path.endswith('/events/'):
            # Set an anonymous user equivalent
            if not hasattr(request, 'user') or not request.user:
                request.user = None
            return True
            
        # Try normal authentication
        return super().__call__(request)
