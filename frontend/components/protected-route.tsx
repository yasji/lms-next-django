'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'reader';
  restrictedRole?: 'admin' | 'reader';
}

export function ProtectedRoute({ children, requiredRole, restrictedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        // Attempt to verify current auth state
        await checkAuth();
        
        const currentUser = useAuth.getState().user;
        
        // If no user is authenticated, redirect to login
        if (!currentUser) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access this page",
            variant: "destructive",
          });
          router.push('/auth/login');
          return;
        }

        // If a specific role is required, check user's role
        if (requiredRole && currentUser.role !== requiredRole) {
          toast({
            title: "Access denied",
            description: `You need ${requiredRole} permissions to access this page`,
            variant: "destructive",
          });
          
          // Redirect based on current role
          if (currentUser.role === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/reader');
          }
          return;
        }
        
        // If a specific role is restricted, check if user has that role
        if (restrictedRole && currentUser.role === restrictedRole) {
          toast({
            title: "Access restricted",
            description: `${restrictedRole} users cannot access this page`,
            variant: "destructive",
          });
          
          // Redirect based on role
          if (restrictedRole === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/reader');
          }
          return;
        }

        // If all checks pass, set verified to true
        setVerified(true);
      } catch (error) {
        console.error("Auth verification error:", error);
        toast({
          title: "Authentication error",
          description: "There was a problem verifying your access. Please try logging in again.",
          variant: "destructive",
        });
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, requiredRole, restrictedRole, toast, checkAuth]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
