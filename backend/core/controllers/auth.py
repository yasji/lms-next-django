from django.conf import settings
from ninja_extra import api_controller, route
from ninja_jwt.tokens import RefreshToken
from ninja_jwt.authentication import JWTAuth
from django.contrib.auth import get_user_model, authenticate
from django.http import HttpResponse
from core.schemas.users import UserRegisterSchema, UserLoginSchema, UserSchema, TokenSchema, AuthResponseSchema
from ninja.errors import HttpError

User = get_user_model()

@api_controller('/auth')
class AuthController:
    
    @route.post('/register', response=AuthResponseSchema, auth=None)
    def register(self, request, data: UserRegisterSchema):
        if User.objects.filter(email=data.email).exists():
            raise HttpError(400, "Email already registered")
        
        user = User.objects.create_user(
            username=data.username,
            email=data.email,
            password=data.password,
            role=data.role
        )
        
        refresh = RefreshToken.for_user(user)
        user_data = UserSchema.from_orm(user)
        token_data = TokenSchema(
            access=str(refresh.access_token),
            refresh=str(refresh)
        )
        
        response = AuthResponseSchema(user=user_data, token=token_data)
        
        # Set HttpOnly cookies for auth tokens
        http_response = HttpResponse(response.json())
        http_response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False,
            max_age=60*30,
            path='/',
        )
        http_response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False,
            max_age=60*60*24,
            path='/',
        )
        
        return http_response
    
    @route.post('/login', response=AuthResponseSchema, auth=None)
    def login(self, request, data: UserLoginSchema):
        # First, check if user with this email exists
        try:
            user_obj = User.objects.get(email=data.email)
        except User.DoesNotExist:
            raise HttpError(401, "User with this email does not exist")
        
        # Check if the password is valid by directly using the check_password method
        if not user_obj.check_password(data.password):
            raise HttpError(401, "Invalid password")
            
        # Now that we've verified the password separately, check if account is active
        if not user_obj.is_active:
            raise HttpError(401, "Account is inactive. Please contact an administrator")
            
        # Now authenticate through the regular flow
        user = authenticate(email=data.email, password=data.password)
        
        if not user:
            # If we get here, something unusual happened
            # This could happen if the account is inactive since Django auth usually
            # won't authenticate inactive users
            raise HttpError(401, "Authentication failed. Please try again later.")
            
        # If we get here, authentication is successful
        refresh = RefreshToken.for_user(user)
        user_data = UserSchema.from_orm(user)
        token_data = TokenSchema(
            access=str(refresh.access_token),
            refresh=str(refresh)
        )
        
        response = HttpResponse(AuthResponseSchema(user=user_data, token=token_data).json())
        
        # Set access token as HttpOnly cookie
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False,
            max_age=60*30,
            path='/',
        )
        
        # Set refresh token as HttpOnly cookie
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False,
            max_age=60*60*24*7,
            path='/',
        )
        
        return response

    @route.post('/logout', auth=None)
    def logout(self, request):
        """Logout the user by clearing cookies without requiring authentication"""
        response = HttpResponse({"status": "success", "message": "Logged out successfully"})
        
        # Clear only the authentication cookies we're using
        for cookie_name in ['access_token', 'refresh_token']:
            response.delete_cookie(cookie_name, path='/')
        
        return response

    @route.get('/verify-role', response={200: dict}, auth=None)
    def verify_role(self, request):
        """Verify the current user's role from the token"""
        # Get token from cookies
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return {
                "authenticated": False,
                "role": None,
                "id": None,
                "username": None,
                "isAdmin": False
            }
        
        # Try to authenticate with the token
        jwt_auth = JWTAuth()
        try:
            # JWTAuth expects the token as a second arg, not inside the request
            user = jwt_auth.authenticate(request, access_token)
            if user:
                return {
                    "authenticated": True,
                    "role": user.role,
                    "id": user.id,
                    "username": user.username,
                    "isAdmin": user.role == 'admin'
                }
        except Exception as e:
            print(f"Role verification error: {str(e)}")
            
        return {
            "authenticated": False,
            "role": None,
            "id": None,
            "username": None,
            "isAdmin": False
        }

    @route.get('/verify', auth=None)
    def verify(self, request):
        """Verify the user's authentication and return their data"""
        # Get token from cookies
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return {"authenticated": False, "user": None}
        
        # Try to authenticate with the token
        jwt_auth = JWTAuth()
        try:
            # JWTAuth expects the token as a second arg, not inside the request
            user = jwt_auth.authenticate(request, access_token)
            if user:
                return {"authenticated": True, "user": UserSchema.from_orm(user)}
        except Exception as e:
            print(f"Auth verification error: {str(e)}")
            
        return {"authenticated": False, "user": None}

    @route.get('/check-admin-access', response={200: dict, 403: dict}, auth=None)
    def check_admin_access(self, request):
        """Check if the current user has admin access without requiring authentication"""
        # Extract token from cookies
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return 403, {
                "error": "authentication_required",
                "message": "Authentication is required to access this resource",
                "detail": "Please login to continue"
            }
        
        # Verify token and check role
        try:
            # Get user from token
            jwt_auth = JWTAuth()
            # JWTAuth expects the token as a second arg
            user = jwt_auth.authenticate(request, access_token)
            
            if not user:
                return 403, {
                    "error": "invalid_token", 
                    "message": "Your session has expired or is invalid",
                    "detail": "Please login again to continue"
                }
                
            if not user.is_admin():
                return 403, {
                    "error": "permission_denied",
                    "message": "You do not have permission to access the admin area",
                    "detail": "This area is restricted to administrative users only"
                }
                
            # User is admin, return success
            return 200, {
                "access": True,
                "role": user.role,
                "username": user.username
            }
            
        except Exception as e:
            return 403, {
                "error": "access_check_failed",
                "message": "Failed to verify your access permissions",
                "detail": str(e)
            }
