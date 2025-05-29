"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Code2, Users2, Sparkles, CheckCircle2, Timer, Trophy, Target, Laptop, BookOpen, GraduationCap, Flame, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  if (isInterviewer) {
  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full px-4 py-1 text-sm bg-blue-500/10 text-blue-500 mb-6">
                <Users2 className="mr-2 size-4" />
                Interviewer Dashboard
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Manage Your Interviews
        </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Schedule interviews, evaluate candidates, and make informed hiring decisions with our comprehensive tools.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/schedule">
                    Schedule Interview
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/candidates">
                    View Candidates
                  </Link>
                </Button>
              </div>
            </div>
          </div>
      </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4 -mt-12 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Interviews</h2>
            <p className="mt-2 text-muted-foreground">Manage your scheduled interviews and evaluations</p>
          </div>

          {interviews === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <MeetingCard key={interview._id} interview={interview} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto mb-4 size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="size-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">No Scheduled Interviews</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by scheduling your first interview or creating a new session.
              </p>
              <Button asChild className="mt-4 rounded-full" onClick={() => handleQuickAction("New Call")}>
                <Link href="/schedule">
                  Schedule Now
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </Card>
          )}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
      </div>
    );
  }

  if (isCandidate) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full px-4 py-1 text-sm bg-purple-500/10 text-purple-500 mb-6">
                <Brain className="mr-2 size-4" />
                Practice Hub
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Master Your Skills
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Practice coding problems, track your progress, and prepare for your upcoming interviews.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/practice">
                    Start Practice
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/problems">
                    Browse Problems
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="container mx-auto px-4 -mt-12 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 border-2">
              <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Target className="size-6 text-purple-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">48</h3>
                <p className="text-sm font-medium">Problems Solved</p>
                <p className="text-sm text-muted-foreground">+12 this week</p>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <Trophy className="size-6 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">76%</h3>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-sm text-muted-foreground">Above average</p>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="size-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Flame className="size-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">7</h3>
                <p className="text-sm font-medium">Day Streak</p>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Calendar className="size-6 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">2d</h3>
                <p className="text-sm font-medium">Next Interview</p>
                <p className="text-sm text-muted-foreground">12h remaining</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Your Interviews</h2>
            <p className="mt-2 text-muted-foreground">View and join your scheduled interviews</p>
          </div>

            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} />
                ))}
              </div>
            ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto mb-4 size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Calendar className="size-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">No Upcoming Interviews</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Continue practicing and preparing for your future interviews.
              </p>
              <Button asChild className="mt-4 rounded-full bg-purple-600 hover:bg-purple-700">
                <Link href="/practice">
                  Practice Now
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </Card>
            )}
          </div>
    </div>
  );
  }

  return <LoaderUI />;
}
