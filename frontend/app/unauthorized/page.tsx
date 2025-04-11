"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border p-8 shadow-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
            <Shield className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button asChild>
              <Link href="/dashboard/reader">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
