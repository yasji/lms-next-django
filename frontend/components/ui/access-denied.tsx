import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  className?: string;
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'You do not have permission to access this resource.',
  showHomeButton = true,
  showBackButton = true,
  className = '',
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="w-full max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          {showBackButton && (
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          )}
          
          {showHomeButton && (
            <Button onClick={() => router.push('/dashboard/reader')}>
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
