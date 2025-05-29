import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus, getCandidateInfo, getInterviewerInfo } from "@/lib/utils";
import { format, differenceInMinutes } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  UsersIcon,
  VideoIcon,
  TimerIcon,
  ArrowRightIcon
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Interview = Doc<"interviews">;

function MeetingCard({ interview }: { interview: Interview }) {
  const { joinMeeting } = useMeetingActions();
  const users = useQuery(api.users.getUsers) ?? [];

  const status = getMeetingStatus(interview);
  const startTime = new Date(interview.startTime);
  const formattedDate = format(startTime, "EEEE, MMMM d · h:mm a");
  const isStartingSoon = status === "upcoming" && differenceInMinutes(startTime, new Date()) <= 60;

  const candidateInfo = getCandidateInfo(users, interview.candidateId);
  const interviewers = interview.interviewerIds.map(id => getInterviewerInfo(users, id));

  return (
    <Card className={cn(
      "bg-zinc-900/95 border-zinc-800 overflow-hidden transition-all hover:border-zinc-700",
      isStartingSoon && "border-orange-500/50"
    )}>
      <CardHeader className="space-y-3 p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarIcon className="h-4 w-4 text-blue-500" />
            {format(startTime, "MMM dd")}
            <span className="text-zinc-600">·</span>
            <ClockIcon className="h-4 w-4 text-blue-500" />
            {format(startTime, "h:mm a")}
          </div>

          <Badge
            variant={
              status === "live" 
                ? "default" 
                : status === "upcoming" 
                ? "secondary" 
                : "outline"
            }
            className={cn(
              "font-medium",
              status === "live" && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
              status === "upcoming" && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
              status === "completed" && "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20"
            )}
          >
            {status === "live" ? "Live Now" : status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg text-zinc-100">{interview.title}</CardTitle>
          {interview.description && (
            <CardDescription className="line-clamp-2 text-zinc-400">
              {interview.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {/* Participants */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <UserIcon className="h-4 w-4 text-blue-500" />
              <span>Candidate</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={candidateInfo.image} />
                <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-zinc-300">{candidateInfo.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <UsersIcon className="h-4 w-4 text-blue-500" />
              <span>Interviewers</span>
            </div>
            <div className="flex -space-x-2">
              {interviewers.map((interviewer, index) => (
                <Avatar 
                  key={index} 
                  className="h-8 w-8 border-2 border-background"
                  title={interviewer.name}
                >
                  <AvatarImage src={interviewer.image} />
                  <AvatarFallback>{interviewer.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Duration */}
        {interview.endTime && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <TimerIcon className="h-4 w-4 text-blue-500" />
            <span>Duration: {differenceInMinutes(interview.endTime, interview.startTime)} minutes</span>
          </div>
        )}

        {/* Action Button */}
        {status === "live" && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => joinMeeting(interview.streamCallId)}
          >
            <VideoIcon className="h-4 w-4" />
            Join Meeting
          </Button>
        )}

        {status === "upcoming" && (
          <Button 
            variant="outline" 
            className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-800/50" 
            disabled
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Waiting to Start
          </Button>
        )}

        {status === "completed" && (
          <Button 
            variant="outline"
            className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 gap-2"
          >
            <ArrowRightIcon className="h-4 w-4" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default MeetingCard;
