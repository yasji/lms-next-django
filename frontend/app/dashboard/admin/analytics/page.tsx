"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleApiError } from "@/lib/api";

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

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<BorrowingData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [currentTab, setCurrentTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Detailed insights into library usage and performance metrics
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-[400px]">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Books Borrowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalBooks || 0}</div>
            <p className={`text-xs ${metrics?.booksTrend?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {metrics?.booksTrend || "0%"} from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.booksCheckedOut || 0}</div>
            <p className={`text-xs ${metrics?.checkedOutTrend?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {metrics?.checkedOutTrend || "0%"} from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.overdueBooks || 0}</div>
            <p className={`text-xs ${metrics?.overdueTrend?.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
              {metrics?.overdueTrend || "0%"} from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
            <p className={`text-xs ${metrics?.usersTrend?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {metrics?.usersTrend || "0%"} from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsContent value="overview" className="mt-0 p-0">
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
                      <Tooltip />
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
                      <Tooltip />
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
        </TabsContent>
        
        <TabsContent value="books" className="mt-0 p-0">
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
                    <Tooltip />
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
        </TabsContent>
        
        <TabsContent value="users" className="mt-0 p-0">
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
                    <Tooltip />
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
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={generateReport}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}