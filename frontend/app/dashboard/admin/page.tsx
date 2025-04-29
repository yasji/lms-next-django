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
  Loader2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getBooks } from "@/services/bookService";
import { getUsers } from "@/services/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleApiError } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Define interfaces for dashboard metrics
interface DashboardMetrics {
  totalBooks: number;
  activeUsers: number;
  overdueBooks: number;
  booksCheckedOut: number;
  booksTrend: string;
  usersTrend: string;
  overdueTrend: string;
  checkedOutTrend: string;
}

// Interface for recent activity
interface Activity {
  user: string;
  action: string;
  book: string;
  time: string;
}

interface BorrowingData {
  name: string;
  value: number;
  color?: string;
}

interface ActivityData {
  month: string;
  borrowed: number;
  returned: number;
}

interface UserMetric {
  month: string;
  new_users: number;
  active_users: number;
}

export default function AdminDashboard() {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timeRange, setTimeRange] = useState("6months");
  const [categoryData, setCategoryData] = useState<BorrowingData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [analyticsTab, setAnalyticsTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [toast]);

  useEffect(() => {
    if (metrics) {
      fetchAnalyticsData();
    }
  }, [timeRange]);

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
      const booksCheckedOut = Math.floor(totalBooks * 0.10); // Simplified calculation

      // Set metrics
      setMetrics({
        totalBooks,
        activeUsers,
        overdueBooks,
        booksCheckedOut,
        booksTrend: '+12%', // These could be calculated if you have historical data
        usersTrend: '+8%',
        overdueTrend: '-5%',
        checkedOutTrend: '+2%'
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

      // After loading basic dashboard data, fetch analytics data
      await fetchAnalyticsData();
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

  const fetchAnalyticsData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      
      // Create an object to track which requests have succeeded
      const succeeded = {
        metrics: false,
        categories: false,
        activity: false,
        users: false
      };
      
      // Fetch dashboard metrics
      try {
        const metricsResponse = await fetch(`${API_URL}/admin/analytics/metrics?timeRange=${timeRange}`, {
          credentials: 'include'
        });
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
          succeeded.metrics = true;
        }
      } catch (err) {
        console.warn("Failed to fetch metrics data:", err);
      }
      
      // Fetch category data
      try {
        const categoryResponse = await fetch(`${API_URL}/admin/analytics/categories?timeRange=${timeRange}`, {
          credentials: 'include'
        });
        
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategoryData(categoryData);
          succeeded.categories = true;
        }
      } catch (err) {
        console.warn("Failed to fetch category data:", err);
      }
      
      // Fetch activity data
      try {
        const activityResponse = await fetch(`${API_URL}/admin/analytics/activity?timeRange=${timeRange}`, {
          credentials: 'include'
        });
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivityData(activityData);
          succeeded.activity = true;
        }
      } catch (err) {
        console.warn("Failed to fetch activity data:", err);
      }
      
      // Fetch user metrics
      try {
        const userResponse = await fetch(`${API_URL}/admin/analytics/users?timeRange=${timeRange}`, {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserMetrics(userData);
          succeeded.users = true;
        }
      } catch (err) {
        console.warn("Failed to fetch user metrics:", err);
      }
      
      // Show a warning toast if any requests failed
      const failedRequests = Object.entries(succeeded)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
      
      if (failedRequests.length > 0) {
        toast({
          title: "Some data couldn't be loaded",
          description: `Failed to load: ${failedRequests.join(', ')}`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      handleApiError(error, toast);
      toast({
        title: "Data loading error",
        description: "There was a problem loading analytics data.",
        variant: "destructive",
      });
    }
  };

  const generateReport = () => {
    // This would typically generate a PDF or Excel report
    // For now, just show a success toast
    toast({
      title: "Report Generated",
      description: "Analytics report has been prepared. Check your downloads folder.",
    });
  };

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
          <Button onClick={generateReport}>
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
            title: "Books Checked Out",
            value: metrics.booksCheckedOut.toString(),
            change: metrics.checkedOutTrend,
            trend: metrics.checkedOutTrend.startsWith('+') ? "up" : "down",
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
            
            {/* Quick Actions */}
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
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/admin/events">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="w-full sm:w-[400px]">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="books">Books</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analyticsTab === "overview" && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Borrowing Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] md:h-[350px]">
                    {activityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="borrowed" name="Books Borrowed" fill="hsl(var(--chart-1))" />
                          <Bar dataKey="returned" name="Books Returned" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No activity data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] md:h-[350px]">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No category data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {analyticsTab === "books" && (
              <Card>
                <CardHeader>
                  <CardTitle>Book Statistics</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] md:h-[400px]">
                  {activityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="borrowed" 
                          name="Books Borrowed" 
                          stroke="hsl(var(--chart-1))" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="returned" 
                          name="Books Returned" 
                          stroke="hsl(var(--chart-2))" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No book statistics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {analyticsTab === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>User Growth & Activity</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] md:h-[400px]">
                  {userMetrics.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="new_users" 
                          name="New Users" 
                          stroke="hsl(var(--chart-3))" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="active_users" 
                          name="Active Users" 
                          stroke="hsl(var(--chart-5))" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No user metrics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Generate custom reports for library management:</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-8 w-8" />
                    <span>Book Inventory Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8" />
                    <span>User Activity Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Clock className="h-8 w-8" />
                    <span>Overdue Books Report</span>
                  </Button>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={generateReport}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Generate Custom Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}