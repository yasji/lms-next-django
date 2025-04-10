from ninja_extra import api_controller, route
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncDay, TruncWeek
from django.utils import timezone
from datetime import timedelta
from typing import List, Dict, Any
from core.models.book import Book, BookBorrowing, User
from core.models.event import Event, EventRegistration
from ..permissions import IsAdmin


is_admin = IsAdmin()

# Change the path to match what the frontend expects
@api_controller('/admin')
class AnalyticsController:
    
    @route.get('/analytics/metrics', response=Dict[str, Any], auth=is_admin)
    def get_metrics(self, request, timeRange: str = '6months'):
        """Get overall analytics metrics for the dashboard (admin only)"""
        # Map time range to days
        days_lookup = {
            '30days': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365,
        }
        days = days_lookup.get(timeRange, 180)  # Default to 6 months
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        prev_start_date = start_date - timedelta(days=days)  # Previous period for trends
        
        # Get current period metrics
        total_books = BookBorrowing.objects.filter(
            borrowed_date__gte=start_date
        ).count()
        
        books_checked_out = BookBorrowing.objects.filter(
            status='active'
        ).count()
        
        overdue_books = BookBorrowing.objects.filter(
            status='active',
            due_date__lt=end_date
        ).count()
        
        active_users = User.objects.filter(
            borrowed_books__borrowed_date__gte=start_date
        ).distinct().count()
        
        # Get previous period metrics for trends
        prev_total_books = BookBorrowing.objects.filter(
            borrowed_date__gte=prev_start_date,
            borrowed_date__lt=start_date
        ).count()
        
        prev_books_checked_out = BookBorrowing.objects.filter(
            borrowed_date__lt=start_date,
            status='active'
        ).count() if prev_start_date else 0
        
        prev_overdue_books = BookBorrowing.objects.filter(
            status='active',
            due_date__lt=start_date
        ).count() if prev_start_date else 0
        
        prev_active_users = User.objects.filter(
            borrowed_books__borrowed_date__gte=prev_start_date,
            borrowed_books__borrowed_date__lt=start_date
        ).distinct().count() if prev_start_date else 0
        
        # Calculate trends
        def calculate_trend(current, previous):
            if previous == 0:
                return "+100%" if current > 0 else "0%"
            change = ((current - previous) / previous) * 100
            return f"+{change:.1f}%" if change >= 0 else f"{change:.1f}%"
        
        books_trend = calculate_trend(total_books, prev_total_books)
        checked_out_trend = calculate_trend(books_checked_out, prev_books_checked_out)
        overdue_trend = calculate_trend(overdue_books, prev_overdue_books)
        users_trend = calculate_trend(active_users, prev_active_users)
        
        return {
            "totalBooks": total_books,
            "booksCheckedOut": books_checked_out,
            "overdueBooks": overdue_books,
            "activeUsers": active_users,
            "booksTrend": books_trend,
            "checkedOutTrend": checked_out_trend,
            "overdueTrend": overdue_trend,
            "usersTrend": users_trend
        }
    
    @route.get('/analytics/categories', response=List[Dict[str, Any]], auth=is_admin)
    def get_categories(self, request, timeRange: str = '6months'):
        """Get statistics by book category"""
        # Map time range to days
        days_lookup = {
            '30days': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365,
        }
        days = days_lookup.get(timeRange, 180)
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get books borrowed in the time period
        borrowed_books = BookBorrowing.objects.filter(
            borrowed_date__gte=start_date
        ).values_list('book_id', flat=True)
        
        # Get categories with their borrowing counts
        category_data = Book.objects.filter(
            id__in=borrowed_books
        ).values('category').annotate(
            value=Count('id')
        ).order_by('-value')
        
        # If no data, get overall book counts by category
        if not category_data:
            category_data = Book.objects.values('category').annotate(
                value=Count('id')
            ).order_by('-value')
        
        # Convert to list of dicts with proper naming
        result = []
        
        # Define colors for different categories (these match the frontend chart colors)
        colors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))"
        ]
        
        for i, item in enumerate(category_data):
            category_name = item['category'].capitalize() if item['category'] else "Uncategorized"
            result.append({
                "name": category_name,
                "value": item['value'],
                "color": colors[i % len(colors)]
            })
        
        return result
    
    @route.get('/analytics/activity', response=List[Dict[str, Any]], auth=is_admin)
    def get_activity(self, request, timeRange: str = '6months'):
        """Get borrowing and return activity over time"""
        # Map time range to days and truncation function
        time_config = {
            '30days': {'days': 30, 'trunc': TruncDay, 'date_format': '%d %b'},
            '3months': {'days': 90, 'trunc': TruncWeek, 'date_format': '%d %b'},
            '6months': {'days': 180, 'trunc': TruncMonth, 'date_format': '%b'},
            '1year': {'days': 365, 'trunc': TruncMonth, 'date_format': '%b'},
        }
        
        config = time_config.get(timeRange, time_config['6months'])
        days = config['days']
        trunc_function = config['trunc']
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Query for borrowed books grouped by time period
        borrowed = BookBorrowing.objects.filter(
            borrowed_date__gte=start_date,
            borrowed_date__lte=end_date
        ).annotate(
            period=trunc_function('borrowed_date')
        ).values('period').annotate(
            count=Count('id')
        ).order_by('period')

        # Query for returned books grouped by time period
        returned = BookBorrowing.objects.filter(
            returned_date__isnull=False,
            returned_date__gte=start_date,
            returned_date__lte=end_date
        ).annotate(
            period=trunc_function('returned_date')
        ).values('period').annotate(
            count=Count('id')
        ).order_by('period')
        
        # Convert to dictionaries for easier merging
        borrowed_dict = {item['period'].strftime(config['date_format']): item['count'] for item in borrowed}
        returned_dict = {item['period'].strftime(config['date_format']): item['count'] for item in returned}
        
        # Get all periods within the date range
        all_periods = []
        
        if timeRange == '30days':
            # Generate days for 30 days period
            for i in range(days):
                day = start_date + timedelta(days=i)
                all_periods.append(day.strftime(config['date_format']))
        elif timeRange == '3months':
            # Generate weeks for 3 months period
            current_date = start_date
            while current_date <= end_date:
                all_periods.append(current_date.strftime(config['date_format']))
                current_date += timedelta(days=7)
        else:
            # Generate months for 6 months or 1 year
            current_date = start_date.replace(day=1)
            while current_date <= end_date:
                all_periods.append(current_date.strftime(config['date_format']))
                
                # Move to next month
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
        
        # Combine the data
        activity = []
        for period in all_periods:
            activity.append({
                "month": period,  # Keep 'month' for compatibility
                "borrowed": borrowed_dict.get(period, 0),
                "returned": returned_dict.get(period, 0)
            })
            
        return activity
    
    @route.get('/analytics/users', response=List[Dict[str, Any]], auth=is_admin)
    def get_user_metrics(self, request, timeRange: str = '6months'):
        """Get user growth and activity metrics"""
        # Map time range to days and truncation function
        time_config = {
            '30days': {'days': 30, 'trunc': TruncDay, 'date_format': '%d %b'},
            '3months': {'days': 90, 'trunc': TruncWeek, 'date_format': '%d %b'},
            '6months': {'days': 180, 'trunc': TruncMonth, 'date_format': '%b'},
            '1year': {'days': 365, 'trunc': TruncMonth, 'date_format': '%b'},
        }
        
        config = time_config.get(timeRange, time_config['6months'])
        days = config['days']
        trunc_function = config['trunc']
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # New users: count users by join date
        new_users = User.objects.filter(
            date_joined__gte=start_date,
            date_joined__lte=end_date
        ).annotate(
            period=trunc_function('date_joined')
        ).values('period').annotate(
            count=Count('id')
        ).order_by('period')
        
        # Active users: count distinct users who borrowed books in each period
        active_users_by_period = {}
        
        if timeRange == '30days':
            # For each day, count users who borrowed books
            for i in range(days):
                day = start_date + timedelta(days=i)
                next_day = day + timedelta(days=1)
                
                active_count = User.objects.filter(
                    borrowed_books__borrowed_date__lt=next_day
                ).filter(
                    Q(borrowed_books__returned_date__isnull=True) | 
                    Q(borrowed_books__returned_date__gte=day)
                ).distinct().count()
                
                active_users_by_period[day.strftime(config['date_format'])] = active_count
        else:
            # For each month, count users who borrowed books
            current_date = start_date.replace(day=1)
            while current_date <= end_date:
                if current_date.month == 12:
                    next_month = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    next_month = current_date.replace(month=current_date.month + 1)
                
                active_count = User.objects.filter(
                    borrowed_books__borrowed_date__lt=next_month
                ).filter(
                    Q(borrowed_books__returned_date__isnull=True) | 
                    Q(borrowed_books__returned_date__gte=current_date)
                ).distinct().count()
                
                active_users_by_period[current_date.strftime(config['date_format'])] = active_count
                
                # Move to next month
                current_date = next_month
        
        # Convert new users to dictionary
        new_users_dict = {item['period'].strftime(config['date_format']): item['count'] for item in new_users}
        
        # Get all periods within the date range
        all_periods = []
        
        if timeRange == '30days':
            # Generate days for 30 days period
            for i in range(days):
                day = start_date + timedelta(days=i)
                all_periods.append(day.strftime(config['date_format']))
        elif timeRange == '3months':
            # Generate weeks for 3 months period
            current_date = start_date
            while current_date <= end_date:
                all_periods.append(current_date.strftime(config['date_format']))
                current_date += timedelta(days=7)
        else:
            # Generate months for 6 months or 1 year
            current_date = start_date.replace(day=1)
            while current_date <= end_date:
                all_periods.append(current_date.strftime(config['date_format']))
                
                # Move to next month
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
        
        # Combine the data
        user_metrics = []
        for period in all_periods:
            user_metrics.append({
                "month": period,  # Keep 'month' for compatibility
                "new_users": new_users_dict.get(period, 0),
                "active_users": active_users_by_period.get(period, 0)
            })
            
        return user_metrics

    @route.get('/analytics/events', response=Dict[str, Any], auth=is_admin)
    def get_event_analytics(self, request, timeRange: str = '6months'):
        """Get analytics related to events (admin only)"""
        # Map time range to days
        days_lookup = {
            '30days': 30,
            '3months': 90, 
            '6months': 180,
            '1year': 365,
        }
        days = days_lookup.get(timeRange, 180)
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get events in the time period
        events = Event.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        total_events = events.count()
        
        # Get event registrations
        registrations = EventRegistration.objects.filter(
            registration_date__gte=start_date,
            registration_date__lte=end_date
        )
        
        total_registrations = registrations.count()
        
        # Average registrations per event
        avg_registrations = total_registrations / total_events if total_events > 0 else 0
        
        # Events by category
        events_by_category = events.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Events over time (by month)
        events_over_time = events.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Registrations over time
        registrations_over_time = registrations.annotate(
            month=TruncMonth('registration_date')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Convert to response format
        events_by_category_list = [
            {
                "category": item['category'] if item['category'] else "Uncategorized",
                "count": item['count']
            }
            for item in events_by_category
        ]
        
        # Create a dictionary of months for more readable formats
        months_dict = {}
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            month_str = current_date.strftime('%b %Y')
            months_dict[month_str] = {
                "events": 0,
                "registrations": 0
            }
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        # Fill in actual data
        for item in events_over_time:
            month_str = item['month'].strftime('%b %Y')
            if month_str in months_dict:
                months_dict[month_str]["events"] = item['count']
        
        for item in registrations_over_time:
            month_str = item['month'].strftime('%b %Y')
            if month_str in months_dict:
                months_dict[month_str]["registrations"] = item['count']
        
        # Convert dictionary to list
        activity_over_time = [
            {
                "month": month,
                "events": data["events"],
                "registrations": data["registrations"]
            }
            for month, data in months_dict.items()
        ]
        
        return {
            "totalEvents": total_events,
            "totalRegistrations": total_registrations,
            "avgRegistrationsPerEvent": round(avg_registrations, 2),
            "eventsByCategory": events_by_category_list,
            "activityOverTime": activity_over_time
        }
