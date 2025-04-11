import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccessDenied } from '@/components/ui/access-denied';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireReader?: boolean;
}

export const DashboardLayout = ({ 
  children, 
  requireAdmin = false,
  requireReader = false
}: DashboardLayoutProps) => {
  const { user, checkAuth } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyAccess = async () => {
      setIsLoading(true);
      
      try {
        if (!isAuthenticated) {
          // Call checkAuth and get latest auth state
          await checkAuth();
          const { user } = useAuth.getState();
          
          // If still not authenticated after check, redirect to login
          if (!user) {
            router.replace('/auth/login');
            return;
          }
        }
        
        // Get the current user
        const currentUser = useAuth.getState().user;
        
        // Enforce role-based restrictions
        if (requireAdmin && currentUser && currentUser.role !== 'admin') {
          console.log('Access denied: Admin privileges required');
          // Don't redirect - we'll show the access denied component
        }
        
        // If requiring reader role and user is admin, redirect to admin dashboard
        if (requireReader && currentUser && currentUser.role === 'admin') {
          console.log('Admin user restricted from reader area, redirecting to admin dashboard');
          router.replace('/dashboard/admin');
          return;
        }
      } catch (error) {
        console.error("Error verifying access:", error);
        router.replace('/auth/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAccess();
  }, [isAuthenticated, user, checkAuth, router, requireAdmin, requireReader]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Checking access permissions...</p>
      </div>
    );
  }
  
  // If requiring admin and no user or not admin, show access denied
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return (
      <AccessDenied 
        title="Administrator Access Required"
        message="You need administrative privileges to access this area. If you believe this is an error, please contact your system administrator."
        showHomeButton={true}
        showBackButton={true}
      />
    );
  }
  
  if (requireReader && user && user.role === 'admin') {
    // Should not reach here due to the redirect in useEffect, but just in case
    return (
      <AccessDenied 
        title="Reader Dashboard"
        message="As an administrator, you should use the admin dashboard instead."
        showHomeButton={true}
        showBackButton={true}
      />
    );
  }
  
  return (
    <div className="dashboard-layout">
      {/* Your dashboard layout components */}
      {children}
    </div>
  );
};
