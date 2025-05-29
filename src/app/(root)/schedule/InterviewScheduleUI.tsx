import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserInfo from "@/components/UserInfo";
import { Loader2Icon, XIcon, CalendarIcon, UserIcon, UsersIcon, ClockIcon, ListIcon, GridIcon, FilterIcon, SortAscIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS } from "@/constants";
import MeetingCard from "@/components/MeetingCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const interviews = useQuery(api.interviews.getAllInterviews) ?? [];
  const users = useQuery(api.users.getUsers) ?? [];
  const createInterview = useMutation(api.interviews.createInterview);

  const candidates = users?.filter((u) => u.role === "candidate");
  const interviewers = users?.filter((u) => u.role === "interviewer");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    candidateId: "",
    interviewerIds: user?.id ? [user.id] : [],
  });

  const scheduleMeeting = async () => {
    if (!client || !user) return;
    if (!formData.candidateId || formData.interviewerIds.length === 0) {
      toast.error("Please select both candidate and at least one interviewer");
      return;
    }

    setIsCreating(true);

    try {
      const { title, description, date, time, candidateId, interviewerIds } = formData;
      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);
      meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: meetingDate.toISOString(),
          custom: {
            description: title,
            additionalDetails: description,
          },
        },
      });

      await createInterview({
        title,
        description,
        startTime: meetingDate.getTime(),
        status: "upcoming",
        streamCallId: id,
        candidateId,
        interviewerIds,
      });

      setOpen(false);
      toast.success("Meeting scheduled successfully!");

      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
    }));
  };

  const selectedInterviewers = interviewers.filter((i) =>
    formData.interviewerIds.includes(i.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (i) => !formData.interviewerIds.includes(i.clerkId)
  );

  const getMeetingStatus = (interview: any) => {
    const now = new Date();
    const startTime = new Date(interview.startTime);
    const endTime = new Date(startTime.getTime() + interview.duration);

    if (now < startTime) {
      return "upcoming";
    } else if (now >= startTime && now <= endTime) {
      return "live";
    } else {
      return "completed";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interview Schedule
          </h1>
          <p className="text-lg text-muted-foreground">
            Plan and organize your upcoming interviews
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Schedule New Interview
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] h-[calc(100vh-100px)] overflow-auto">
            <DialogHeader className="space-y-4 pb-4 border-b">
              <DialogTitle className="text-2xl">Schedule Interview</DialogTitle>
              <DialogDescription>
                Fill in the details below to schedule a new interview session.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Interview Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interview Details</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="e.g., Frontend Developer Interview"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Brief description of the interview..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Participants</h3>
                <div className="grid gap-6">
                  {/* Candidate Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      Candidate
                    </label>
                    <Select
                      value={formData.candidateId}
                      onValueChange={(candidateId) => setFormData({ ...formData, candidateId })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.clerkId} value={candidate.clerkId}>
                            <UserInfo user={candidate} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Interviewers Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-blue-500" />
                      Interviewers
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-secondary/50 min-h-[60px]">
                      {selectedInterviewers.map((interviewer) => (
                        <div
                          key={interviewer.clerkId}
                          className="inline-flex items-center gap-2 bg-background px-3 py-1.5 rounded-full text-sm border shadow-sm"
                        >
                          <UserInfo user={interviewer} />
                          {interviewer.clerkId !== user?.id && (
                            <button
                              onClick={() => removeInterviewer(interviewer.clerkId)}
                              className="hover:text-destructive transition-colors"
                              aria-label={`Remove ${interviewer.name} from interviewers`}
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {availableInterviewers.length > 0 && (
                      <Select onValueChange={addInterviewer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add more interviewers" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableInterviewers.map((interviewer) => (
                            <SelectItem key={interviewer.clerkId} value={interviewer.clerkId}>
                              <UserInfo user={interviewer} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Calendar */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      Date
                    </label>
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-blue-500" />
                      Time
                    </label>
                    <Select
                      value={formData.time}
                      onValueChange={(time) => setFormData({ ...formData, time })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={scheduleMeeting} 
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Interviews</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{interviews.length}</div>
            <p className="text-xs text-zinc-500">Scheduled interviews</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Upcoming</CardTitle>
            <ClockIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {interviews.filter(i => getMeetingStatus(i) === "upcoming").length}
            </div>
            <p className="text-xs text-zinc-500">Interviews this week</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Candidates</CardTitle>
            <UserIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {new Set(interviews.map(i => i.candidateId)).size}
            </div>
            <p className="text-xs text-zinc-500">Unique candidates</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Completion Rate</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {Math.round((interviews.filter(i => i.status === "completed").length / interviews.length) * 100)}%
            </div>
            <p className="text-xs text-zinc-500">Average completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800">
              All Interviews
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-zinc-800">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-zinc-800">
              Completed
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live Now</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800">
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800">
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          {!interviews ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2Icon className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground">Loading interviews...</p>
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <MeetingCard key={interview._id} interview={interview} />
              ))}
            </div>
          ) : (
            <Card className="p-12 border-2 border-dashed border-zinc-800 bg-zinc-900/50">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <CalendarIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">No interviews scheduled</h3>
                <p className="text-zinc-400 max-w-sm">
                  Get started by scheduling your first interview using the button above.
                </p>
                <Button 
                  onClick={() => setOpen(true)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Schedule Interview
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews
              .filter(i => getMeetingStatus(i) === "upcoming")
              .map((interview) => (
                <MeetingCard key={interview._id} interview={interview} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews
              .filter(i => getMeetingStatus(i) === "completed")
              .map((interview) => (
                <MeetingCard key={interview._id} interview={interview} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card className="bg-zinc-900/95 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Recent Activity</CardTitle>
          <CardDescription>Your latest interview activities and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {interviews.slice(0, 5).map((interview, index) => (
            <div key={index} className="flex items-center gap-4 text-sm">
              <div className={cn(
                "p-2 rounded-full",
                getMeetingStatus(interview) === "completed" ? "bg-blue-500/10" : "bg-emerald-500/10"
              )}>
                {getMeetingStatus(interview) === "completed" ? (
                  <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-zinc-300">{interview.title}</p>
                <p className="text-zinc-500">{format(new Date(interview.startTime), "MMM dd, yyyy · h:mm a")}</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-medium",
                  getMeetingStatus(interview) === "completed" ? "border-blue-500/20 text-blue-500" : 
                  getMeetingStatus(interview) === "upcoming" ? "border-emerald-500/20 text-emerald-500" :
                  "border-zinc-500/20 text-zinc-500"
                )}
              >
                {getMeetingStatus(interview)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
export default InterviewScheduleUI;
