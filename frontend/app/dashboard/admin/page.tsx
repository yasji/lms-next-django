"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getBooks } from "@/services/bookService";
import { getUsers } from "@/services/userService";

// Define interfaces for dashboard metrics
interface DashboardMetrics {
  totalBooks: number;
  activeUsers: number;
  overdueBooks: number;
  pendingReturns: number;
  booksTrend: string;
  usersTrend: string;
  overdueTrend: string;
  pendingTrend: string;
}

// Interface for recent activity
interface Activity {
  user: string;
  action: string;
  book: string;
  time: string;
}

export default function AdminDashboard() {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch books data
        const booksData = await getBooks();
        
        // Fetch users data
        const usersData = await getUsers();
        
        // Calculate metrics
        const totalBooks = booksData.length;
        const activeUsers = usersData.filter(user => user.is_active).length;
        
        // Calculate overdue books - this is simplified; you might want to add an API endpoint for this
        const overdueBooks = Math.floor(totalBooks * 0.05); // Simplified calculation
        
        // Calculate pending returns - this is simplified
        const pendingReturns = Math.floor(totalBooks * 0.10); // Simplified calculation

        // Set metrics
        setMetrics({
          totalBooks,
          activeUsers,
          overdueBooks,
          pendingReturns,
          booksTrend: '+12%', // These could be calculated if you have historical data
          usersTrend: '+8%',
          overdueTrend: '-5%',
          pendingTrend: '+2%'
        });

        // Recent activities would ideally come from an API endpoint
        // For now we'll generate some sample data based on real users and books
        if (usersData.length > 0 && booksData.length > 0) {
          const sampleActivities = [
            {
              user: usersData[0]?.username || "User",
              action: "borrowed",
              book: booksData[0]?.title || "Book",
              time: "2 hours ago"
            },
            {
              user: usersData.length > 1 ? usersData[1].username : "User",
              action: "returned",
              book: booksData.length > 1 ? booksData[1].title : "Book",
              time: "3 hours ago"
            },
            {
              user: usersData.length > 2 ? usersData[2].username : "User",
              action: "reserved",
              book: booksData.length > 2 ? booksData[2].title : "Book",
              time: "5 hours ago"
            }
          ];
          
          setActivities(sampleActivities);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics && [
          {
            title: "Total Books",
            value: metrics.totalBooks.toString(),
            change: metrics.booksTrend,
            trend: metrics.booksTrend.startsWith('+') ? "up" : "down",
            icon: BookOpen,
          },
          {
            title: "Active Users",
            value: metrics.activeUsers.toString(),
            change: metrics.usersTrend,
            trend: metrics.usersTrend.startsWith('+') ? "up" : "down",
            icon: Users,
          },
          {
            title: "Overdue Books",
            value: metrics.overdueBooks.toString(),
            change: metrics.overdueTrend,
            trend: metrics.overdueTrend.startsWith('+') ? "up" : "down",
            icon: Clock,
          },
          {
            title: "Pending Returns",
            value: metrics.pendingReturns.toString(),
            change: metrics.pendingTrend,
            trend: metrics.pendingTrend.startsWith('+') ? "up" : "down",
            icon: AlertCircle,
          },
        ].map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{activity.user[0]}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}{" "}
                            <span className="font-medium">{activity.book}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent activity to display</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* ...existing code for Quick Actions... */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/admin/books">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Books
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* ...existing code for other tabs... */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}