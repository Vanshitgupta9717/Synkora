"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";
import { getCandidateInfo, groupInterviews } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  XCircleIcon,
  BarChart3Icon,
  Users2Icon,
  TrendingUpIcon,
  StarIcon,
  SearchIcon,
  FilterIcon,
  SlidersHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
  BellIcon,
  DownloadIcon,
  RefreshCwIcon,
  LayoutGrid,
  LayoutList,
  PieChartIcon,
  AlertCircleIcon,
  CheckIcon,
  TimerIcon
} from "lucide-react";
import { format, subDays, differenceInMinutes, isBefore } from "date-fns";
import CommentDialog from "@/components/CommentDialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PerformanceMetrics from "@/components/PerformanceMetrics";
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
} from "recharts";

type Interview = Doc<"interviews">;
type TimeRange = "all" | "week" | "month" | "quarter";
type ViewMode = "grid" | "list";

function DashboardPage() {
  const users = useQuery(api.users.getUsers);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // const handleStatusUpdate = async (interviewId: Id<"interviews">, status: string) => {
  //   try {
  //     await updateStatus({ id: interviewId, status });
  //     toast.success(`Interview marked as ${status}`);
  //   } catch (error) {
  //     toast.error("Failed to update status");
  //   }
  // };
type InterviewStatus = "upcoming" | "live" | "completed" | "succeeded" | "failed";

  const handleStatusUpdate = async (
  interviewId: Id<"interviews">,
  status: InterviewStatus
) => {
  try {
    await updateStatus({ id: interviewId, status });
    toast.success(`Interview marked as ${status}`);
  } catch (error) {
    toast.error("Failed to update status");
  }
};
''
  const handleExport = () => {
    // Implementation for exporting data
    toast.success("Exporting dashboard data...");
  };

  if (!interviews || !users) return <LoaderUI />;

  // Filter interviews based on time range
  const filteredInterviews = interviews.filter(interview => {
    if (timeRange === "all") return true;
    const date = new Date(interview.startTime);
    const now = new Date();
    switch (timeRange) {
      case "week":
        return date >= subDays(now, 7);
      case "month":
        return date >= subDays(now, 30);
      case "quarter":
        return date >= subDays(now, 90);
      default:
        return true;
    }
  });

  // Filter interviews based on search query
  const searchedInterviews = filteredInterviews.filter(interview => {
    const candidateInfo = getCandidateInfo(users, interview.candidateId);
    const searchString = `${candidateInfo.name} ${interview.title} ${interview.description || ""}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Sort interviews
  const sortedInterviews = [...searchedInterviews].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return sortOrder === "desc" 
          ? b.startTime - a.startTime 
          : a.startTime - b.startTime;
      case "status":
        return sortOrder === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      case "name":
        const candidateA = getCandidateInfo(users, a.candidateId);
        const candidateB = getCandidateInfo(users, b.candidateId);
        return sortOrder === "desc"
          ? candidateB.name.localeCompare(candidateA.name)
          : candidateA.name.localeCompare(candidateB.name);
      default:
        return 0;
    }
  });

  const groupedInterviews = groupInterviews(sortedInterviews);
  
  // Calculate statistics
  const totalInterviews = sortedInterviews.length;
  const completedInterviews = (groupedInterviews.completed?.length || 0) + 
    (groupedInterviews.succeeded?.length || 0) + 
    (groupedInterviews.failed?.length || 0);
  const successRate = groupedInterviews.succeeded 
    ? Math.round((groupedInterviews.succeeded.length / completedInterviews) * 100) 
    : 0;
  const totalCandidates = new Set(sortedInterviews.map(i => i.candidateId)).size;

  // Calculate average interview duration
  const completedWithEndTime = sortedInterviews.filter(i => i.endTime && i.status === "completed");
  const avgDuration = completedWithEndTime.length > 0
    ? Math.round(completedWithEndTime.reduce((acc, i) => 
        acc + differenceInMinutes(i.endTime!, i.startTime), 0) / completedWithEndTime.length)
    : 0;

  const stats = [
    {
      title: "Total Interviews",
      value: totalInterviews,
      icon: BarChart3Icon,
      description: "All time interviews",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUpIcon,
      description: "Pass rate for completed interviews",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trend: "+5% from last month",
      trendUp: true,
      progress: successRate,
    },
    {
      title: "Total Candidates",
      value: totalCandidates,
      icon: Users2Icon,
      description: "Unique candidates interviewed",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "Same as last month",
      trendUp: null,
    },
    {
      title: "Avg. Duration",
      value: `${avgDuration}min`,
      icon: TimerIcon,
      description: "Average interview length",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "-2% from last month",
      trendUp: false,
    },
  ];

  // Calculate upcoming interview alerts
  const upcomingAlerts = groupedInterviews.upcoming?.filter((interview: Interview) => {
    const start = new Date(interview.startTime);
    const now = new Date();
    const minutesUntilStart = differenceInMinutes(start, now);
    return minutesUntilStart > 0 && minutesUntilStart <= 60;
  }) || [];

  // Calculate interview statistics by status
  const statusStats = [
    { name: "Succeeded", value: groupedInterviews.succeeded?.length || 0 },
    { name: "Failed", value: groupedInterviews.failed?.length || 0 },
    { name: "Completed", value: groupedInterviews.completed?.length || 0 },
    { name: "Upcoming", value: groupedInterviews.upcoming?.length || 0 },
  ];

  // Calculate weekly interview trends
  const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayInterviews = sortedInterviews.filter(interview => {
      const interviewDate = new Date(interview.startTime);
      return (
        interviewDate.getDate() === date.getDate() &&
        interviewDate.getMonth() === date.getMonth()
      );
    });
    
    return {
      date: format(date, "EEE"),
      total: dayInterviews.length,
      succeeded: dayInterviews.filter(i => i.status === "succeeded").length,
      failed: dayInterviews.filter(i => i.status === "failed").length,
    };
  });

  const COLORS = ["#10B981", "#EF4444", "#6366F1", "#F59E0B"];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your interviews and track candidate performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCwIcon className={cn(
                    "size-4",
                    isRefreshing && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExport}
                >
                  <DownloadIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export dashboard data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button size="lg" className="gap-2" asChild>
            <Link href="/schedule">
              <CalendarIcon className="size-4" />
              Schedule Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* ALERTS */}
      {upcomingAlerts.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <AlertCircleIcon className="size-4" />
            <h3 className="font-semibold">Upcoming Interviews</h3>
          </div>
          <div className="space-y-2">
            {upcomingAlerts.map((interview: Interview) => {
              const candidateInfo = getCandidateInfo(users, interview.candidateId);
              const minutesUntilStart = differenceInMinutes(
                new Date(interview.startTime),
                new Date()
              );
              return (
                <div
                  key={interview._id}
                  className="flex items-center justify-between text-sm p-2 rounded-md bg-orange-500/5"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={candidateInfo.image} />
                      <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                    </Avatar>
                    <span>{candidateInfo.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{interview.title}</span>
                  </div>
                  <Badge variant="outline" className="text-orange-500">
                    In {minutesUntilStart} minutes
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  {stat.trend && (
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trendUp === true && "text-emerald-500",
                      stat.trendUp === false && "text-red-500"
                    )}>
                      {stat.trendUp === true && <ArrowUpIcon className="inline size-3 mr-0.5" />}
                      {stat.trendUp === false && <ArrowDownIcon className="inline size-3 mr-0.5" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                {stat.progress && (
                  <Progress value={stat.progress} className="h-1" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* INTERVIEW STATISTICS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Weekly Interview Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="total" fill="#6366F1" />
                  <Bar dataKey="succeeded" fill="#10B981" />
                  <Bar dataKey="failed" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Interview Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusStats.map((stat, index) => (
                <div key={stat.name} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm">{stat.name}</span>
                  <span className="text-sm font-medium ml-auto">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search interviews..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(order => order === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? (
                    <ArrowUpIcon className="size-4" />
                  ) : (
                    <ArrowDownIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle sort order</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(mode => mode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <LayoutGrid className="size-4" />
                  ) : (
                    <LayoutList className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle view mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* INTERVIEW CATEGORIES */}
      <div className="space-y-8">
        {INTERVIEW_CATEGORY.map(
          (category) =>
            groupedInterviews[category.id]?.length > 0 && (
              <section key={category.id} className="space-y-4">
                {/* CATEGORY HEADER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{category.title}</h2>
                    <Badge variant={category.variant}>{groupedInterviews[category.id].length}</Badge>
                  </div>
                  {category.id === "upcoming" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/schedule">View Calendar</Link>
                    </Button>
                  )}
                </div>

                {/* INTERVIEW CARDS */}
                <div className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                )}>
                  {groupedInterviews[category.id].map((interview: Interview) => {
                    const candidateInfo = getCandidateInfo(users, interview.candidateId);
                    const startTime = new Date(interview.startTime);
                    const isStartingSoon = category.id === "upcoming" && 
                      differenceInMinutes(startTime, new Date()) <= 60;

                    return (
                      <Card 
                        key={interview._id} 
                        className={cn(
                          "hover:shadow-md transition-all",
                          isStartingSoon && "border-orange-500/50"
                        )}
                      >
                        {/* CANDIDATE INFO */}
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={candidateInfo.image} />
                              <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <CardTitle className="text-base">{candidateInfo.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">{interview.title}</p>
                                {interview.status === "succeeded" && (
                                  <Badge variant="default" className="text-xs">Passed</Badge>
                                )}
                                {interview.status === "failed" && (
                                  <Badge variant="destructive" className="text-xs">Failed</Badge>
                                )}
                                {isStartingSoon && (
                                  <Badge variant="outline" className="text-xs text-orange-500">
                                    Starting Soon
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        {/* DATE & TIME */}
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {format(startTime, "MMM dd")}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {format(startTime, "hh:mm a")}
                              </div>
                              {interview.endTime && (
                                <div className="flex items-center gap-1">
                                  <TimerIcon className="h-4 w-4" />
                                  {differenceInMinutes(interview.endTime, interview.startTime)}min
                                </div>
                              )}
                            </div>
                            {interview.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {interview.description}
                              </p>
                            )}
                          </div>
                          {interview.endTime && interview.status !== "upcoming" && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">
                                  {differenceInMinutes(interview.endTime, interview.startTime)}min
                                </span>
                              </div>
                              {interview.status === "succeeded" && (
                                <Progress 
                                  value={80} 
                                  indicatorClassName="bg-emerald-500" 
                                  className="h-1" 
                                />
                              )}
                              {interview.status === "failed" && (
                                <Progress 
                                  value={40} 
                                  indicatorClassName="bg-red-500" 
                                  className="h-1" 
                                />
                              )}
                            </div>
                          )}
                        </CardContent>

                        {/* ACTIONS */}
                        <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                          {interview.status === "completed" && (
                            <>
                              <div className="w-full p-3 rounded-md bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircleIcon className="size-4 text-orange-500" />
                                  <span className="font-medium">Pending Review</span>
                                </div>
                                <p className="text-muted-foreground mb-3">
                                  This interview has been completed but needs evaluation. Please review and mark as Pass/Fail.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate(interview._id, "succeeded")}
                                  >
                                    <CheckCircle2Icon className="h-4 w-4 mr-2" />
                                    Pass
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate(interview._id, "failed")}
                                  >
                                    <XCircleIcon className="h-4 w-4 mr-2" />
                                    Fail
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                          {(interview.status === "completed" || 
                            interview.status === "succeeded" || 
                            interview.status === "failed") && (
                            <div className="w-full">
                              <div className="flex items-center gap-2 mb-3">
                                <BarChart3Icon className="size-4 text-primary" />
                                <h3 className="font-medium">Performance Metrics</h3>
                              </div>
                              <PerformanceMetrics 
                                interview={interview}
                                candidateInfo={candidateInfo}
                              />
                            </div>
                          )}
                          <CommentDialog interviewId={interview._id} />
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
