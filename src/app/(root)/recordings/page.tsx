"use client";

import LoaderUI from "@/components/LoaderUI";
import RecordingCard from "@/components/RecordingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGetCalls from "@/hooks/useGetCalls";
import { CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VideoIcon,
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  SortAscIcon,
  LayoutGridIcon,
  LayoutListIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StreamCallRecording } from "@/types";

function RecordingsPage() {
  const { calls, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<StreamCallRecording[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "duration">("date");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!calls) return;

      try {
        const callData = await Promise.all(calls.map((call) => call.queryRecordings()));
        const allRecordings = callData.flatMap((call) => call.recordings) as StreamCallRecording[];
        setRecordings(allRecordings);
      } catch (error) {
        console.log("Error fetching recordings:", error);
      }
    };

    fetchRecordings();
  }, [calls]);

  // Filter and sort recordings
  const filteredRecordings = recordings
    .filter(recording => 
      recording.custom?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.custom?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "date") {
        return multiplier * (new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      } else {
        const durationA = new Date(a.end_time).getTime() - new Date(a.start_time).getTime();
        const durationB = new Date(b.end_time).getTime() - new Date(b.start_time).getTime();
        return multiplier * (durationB - durationA);
      }
    });

  const totalDuration = recordings.reduce((acc, recording) => {
    const duration = new Date(recording.end_time).getTime() - new Date(recording.start_time).getTime();
    return acc + duration;
  }, 0);

  const hours = Math.floor(totalDuration / (1000 * 60 * 60));
  const minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

  if (isLoading) return <LoaderUI />;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interview Recordings
          </h1>
          <p className="text-lg text-muted-foreground">
            Review and manage your interview recordings
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Recordings</CardTitle>
            <VideoIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{recordings.length}</div>
            <p className="text-xs text-zinc-500">Available recordings</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Duration</CardTitle>
            <ClockIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {hours}h {minutes}m
            </div>
            <p className="text-xs text-zinc-500">Combined recording time</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/95 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Latest Recording</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {recordings.length > 0
                ? format(new Date(recordings[0].start_time), "MMM d, yyyy")
                : "N/A"}
            </div>
            <p className="text-xs text-zinc-500">Most recent interview</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(value: "date" | "duration") => setSortBy(value)}>
            <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="bg-zinc-900 border-zinc-800"
            onClick={() => setSortOrder(current => current === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDownIcon className="h-4 w-4" />
          </Button>

          <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-none rounded-l-md",
                layout === "grid" && "bg-zinc-800"
              )}
              onClick={() => setLayout("grid")}
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-none rounded-r-md",
                layout === "list" && "bg-zinc-800"
              )}
              onClick={() => setLayout("list")}
            >
              <LayoutListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recordings Grid */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        {filteredRecordings.length > 0 ? (
          <div className={cn(
            "grid gap-6 pb-6",
            layout === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredRecordings.map((recording) => (
              <RecordingCard 
                key={recording.end_time} 
                recording={recording} 
                layout={layout}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 border-2 border-dashed border-zinc-800 bg-zinc-900/50">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <VideoIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100">No recordings found</h3>
              <p className="text-zinc-400 max-w-sm">
                {searchQuery
                  ? "No recordings match your search criteria. Try adjusting your filters."
                  : "Start conducting interviews to build your recording library."}
              </p>
            </div>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}

export default RecordingsPage;
