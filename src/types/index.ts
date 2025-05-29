import { Id } from "../../convex/_generated/dataModel";
import { CallRecording } from "@stream-io/video-react-sdk";

interface CodeSubmission {
  success: boolean;
  timestamp: number;
  code: string;
}

export interface Interview {
  _id: Id<"interviews">;
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
  status: InterviewStatus;
  streamCallId: string;
  candidateId: string;
  interviewerIds: string[];
  codeSubmissions?: CodeSubmission[];
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  runtime: number;
  memory: number;
  testCases: {
    passed: number;
    total: number;
    results: Array<{
      input: string;
      expected: string;
      output: string;
      passed: boolean;
    }>;
  };
}

export interface CodeAnalysis {
  runtime: {
    value: number;
    percentile: number;
    unit: string;
  };
  memory: {
    value: number;
    percentile: number;
    unit: string;
  };
}

export interface CodeQuestion {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  starterCode: Record<string, string>;
}

export type InterviewStatus = 
  | "upcoming"   // Interview is scheduled but hasn't started
  | "live"      // Interview is currently in progress
  | "completed" // Interview has ended but not yet evaluated
  | "succeeded" // Interview completed and candidate passed
  | "failed";   // Interview completed and candidate failed

export type ViewMode = "grid" | "list";
export type TimeRange = "all" | "week" | "month" | "quarter";

export interface StreamCallRecording extends CallRecording {
  custom?: {
    title?: string;
    description?: string;
  };
  start_time: string;
  end_time: string;
  url: string;
} 