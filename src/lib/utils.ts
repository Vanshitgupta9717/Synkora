import { clsx, type ClassValue } from "clsx";
import { addHours, intervalToDuration, isAfter, isBefore, isWithinInterval } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Doc } from "../../convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Interview = Doc<"interviews">;
type User = Doc<"users">;

export const groupInterviews = (interviews: Interview[]) => {
  if (!interviews) return {};

  return interviews.reduce((acc: any, interview: Interview) => {
    const date = new Date(interview.startTime);
    const now = new Date();

    // First check for final statuses
    if (interview.status === "succeeded") {
      acc.succeeded = [...(acc.succeeded || []), interview];
    } else if (interview.status === "failed") {
      acc.failed = [...(acc.failed || []), interview];
    } else if (interview.status === "completed") {
      // Explicitly completed but not yet passed/failed
      acc.completed = [...(acc.completed || []), interview];
    } else {
      // For interviews without an explicit status
      if (isAfter(date, now)) {
        // Future interviews
        acc.upcoming = [...(acc.upcoming || []), interview];
      } else {
        // Past interviews without status should be marked as needing review
        const endTime = addHours(date, 1); // Assuming 1 hour duration
        if (isAfter(now, endTime)) {
          acc.completed = [...(acc.completed || []), { ...interview, status: "completed" }];
        } else if (isWithinInterval(now, { start: date, end: endTime })) {
          acc.upcoming = [...(acc.upcoming || []), interview];
        }
      }
    }

    return acc;
  }, {});
};

export const getCandidateInfo = (users: User[], candidateId: string) => {
  const candidate = users?.find((user) => user.clerkId === candidateId);
  return {
    name: candidate?.name || "Unknown Candidate",
    image: candidate?.image || "",
    initials:
      candidate?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "UC",
  };
};

export const getInterviewerInfo = (users: User[], interviewerId: string) => {
  const interviewer = users?.find((user) => user.clerkId === interviewerId);
  return {
    name: interviewer?.name || "Unknown Interviewer",
    image: interviewer?.image,
    initials:
      interviewer?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "UI",
  };
};

export const calculateRecordingDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const duration = intervalToDuration({ start, end });

  if (duration.hours && duration.hours > 0) {
    return `${duration.hours}:${String(duration.minutes).padStart(2, "0")}:${String(
      duration.seconds
    ).padStart(2, "0")}`;
  }

  if (duration.minutes && duration.minutes > 0) {
    return `${duration.minutes}:${String(duration.seconds).padStart(2, "0")}`;
  }

  return `${duration.seconds} seconds`;
};

export const getMeetingStatus = (interview: Interview) => {
  // If the interview has a final status, return it
  if (interview.status === "succeeded" || 
      interview.status === "failed" || 
      interview.status === "completed") {
    return interview.status;
  }

  const now = new Date();
  const startTime = new Date(interview.startTime);
  const endTime = addHours(startTime, 1); // Assuming 1 hour duration

  if (isWithinInterval(now, { start: startTime, end: endTime })) {
    return "live";
  }

  if (isBefore(now, startTime)) {
    return "upcoming";
  }

  // If the interview time has passed but no status is set
  return "completed";
};
