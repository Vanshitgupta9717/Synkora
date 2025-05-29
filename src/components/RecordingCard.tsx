import { CallRecording } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { calculateRecordingDuration } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { 
  CalendarIcon, 
  ClockIcon, 
  CopyIcon, 
  PlayIcon,
  DownloadIcon,
  VideoIcon,
  MoreVerticalIcon
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { StreamCallRecording } from "@/types";

interface RecordingCardProps {
  recording: StreamCallRecording;
  layout?: "grid" | "list";
}

function RecordingCard({ recording, layout = "grid" }: RecordingCardProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recording.url);
      toast.success("Recording link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleDownload = () => {
    window.open(recording.url, "_blank");
  };

  const formattedStartTime = recording.start_time
    ? format(new Date(recording.start_time), "MMM d, yyyy, hh:mm a")
    : "Unknown";

  const duration =
    recording.start_time && recording.end_time
      ? calculateRecordingDuration(recording.start_time, recording.end_time)
      : "Unknown duration";

  if (layout === "list") {
    return (
      <Card className="group hover:shadow-md transition-all bg-zinc-900/95 border-zinc-800">
        <div className="flex items-center p-4 gap-6">
          {/* Thumbnail */}
          <div
            className="relative w-48 aspect-video bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer group/thumb overflow-hidden"
            onClick={() => window.open(recording.url, "_blank")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
            <VideoIcon className="size-8 text-muted-foreground group-hover/thumb:text-primary transition-colors" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg text-zinc-100 truncate">
              {recording.custom?.title || "Untitled Recording"}
            </h3>
            {recording.custom?.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                {recording.custom.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{formattedStartTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>{duration}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-zinc-800"
              onClick={() => window.open(recording.url, "_blank")}
            >
              <PlayIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-zinc-800"
              onClick={handleDownload}
            >
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-zinc-800"
              onClick={handleCopyLink}
            >
              <CopyIcon className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-all bg-zinc-900/95 border-zinc-800">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-muted/50 rounded-t-lg flex items-center justify-center cursor-pointer group/thumb overflow-hidden"
        onClick={() => window.open(recording.url, "_blank")}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
        <VideoIcon className="size-12 text-muted-foreground group-hover/thumb:text-primary transition-colors" />
        <Badge 
          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/50"
          variant="secondary"
        >
          {duration}
        </Badge>
      </div>

      {/* Content */}
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-lg text-zinc-100 line-clamp-1">
            {recording.custom?.title || "Untitled Recording"}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
              <DropdownMenuItem onClick={() => window.open(recording.url, "_blank")}>
                <PlayIcon className="mr-2 h-4 w-4" />
                Play Recording
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {recording.custom?.description && (
          <p className="text-sm text-zinc-400 line-clamp-2">
            {recording.custom.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formattedStartTime}</span>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => window.open(recording.url, "_blank")}
        >
          <PlayIcon className="size-4" />
          Play Recording
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RecordingCard;
