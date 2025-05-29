import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon, Code2Icon, BrainIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [mode, setMode] = useState<"interviewer" | "candidate">("candidate");
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-1px)] bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Code2Icon className="size-5 text-primary" />
              <span className="font-semibold">Interview Session</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Tabs value={mode} onValueChange={(value: "interviewer" | "candidate") => setMode(value)}>
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="candidate" className="gap-2">
                  <BrainIcon className="size-4" />
                  Candidate Mode
                </TabsTrigger>
                <TabsTrigger value="interviewer" className="gap-2">
                  <UsersIcon className="size-4" />
                  Interviewer Mode
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <UsersIcon className="size-4" />
              Participants
            </Button>
            <EndCallButton variant="destructive" size="sm" />
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal">
        {/* VIDEO CALL SECTION */}
        <ResizablePanel defaultSize={35} minSize={30}>
          <div className="h-full flex flex-col">
            <Card className="flex-1 rounded-none border-x">
              <div className="h-full bg-muted/50">
                {layout === "grid" ? (
                  <PaginatedGridLayout />
                ) : (
                  <SpeakerLayout />
                )}
              </div>
            </Card>

            {/* CONTROLS */}
            <div className="p-4 border-t border-x bg-card">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <CallControls onLeave={() => router.push("/")} />

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="size-10">
                          <LayoutListIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setLayout("grid")}>
                          Grid View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLayout("speaker")}>
                          Speaker View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* CODE EDITOR SECTION */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full border-x">
            <CodeEditor mode={mode} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default MeetingRoom;
