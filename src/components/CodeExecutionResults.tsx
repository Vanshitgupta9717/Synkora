import { CodeExecutionResult } from "@/types";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2, XCircle, Zap, Brain, Trophy, ChevronUp, ChevronDown, Clock, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface CodeExecutionResultsProps {
  result: CodeExecutionResult;
  isSubmission: boolean;
  submissionHistory?: Array<{
    timestamp: number;
    runtime: number;
    memory: number;
    passed: number;
    total: number;
  }>;
}

function CodeExecutionResults({ result, isSubmission, submissionHistory = [] }: CodeExecutionResultsProps) {
  const getPerformanceGrade = (runtime: number): { grade: string; color: string } => {
    if (runtime < 2) return { grade: "S", color: "text-purple-500" };
    if (runtime < 4) return { grade: "A", color: "text-green-500" };
    if (runtime < 6) return { grade: "B", color: "text-blue-500" };
    if (runtime < 8) return { grade: "C", color: "text-yellow-500" };
    return { grade: "D", color: "text-red-500" };
  };

  const getMemoryGrade = (memory: number): { grade: string; color: string } => {
    if (memory < 5500) return { grade: "S", color: "text-purple-500" };
    if (memory < 6000) return { grade: "A", color: "text-green-500" };
    if (memory < 6500) return { grade: "B", color: "text-blue-500" };
    if (memory < 7000) return { grade: "C", color: "text-yellow-500" };
    return { grade: "D", color: "text-red-500" };
  };

  const generateDistributionData = (value: number, max: number, segments: number = 20) => {
    const distribution = Array.from({ length: segments }, () => Math.random());
    const total = distribution.reduce((a, b) => a + b, 0);
    const normalized = distribution.map(v => (v / total) * 100);
    
    // Find which segment the current value belongs to
    const valueSegment = Math.floor((value / max) * segments);
    
    return normalized.map((height, i) => ({
      height,
      isCurrent: i === valueSegment,
    }));
  };

  const runtimeDistribution = generateDistributionData(result.runtime, 10);
  const memoryDistribution = generateDistributionData(result.memory, 8000);

  const runtimeGrade = getPerformanceGrade(result.runtime);
  const memoryGrade = getMemoryGrade(result.memory);

  const betterThan = Math.floor(Math.random() * 30 + 70); // Random number between 70-100

  const getPerformanceTrend = () => {
    if (submissionHistory.length < 2) return null;
    
    const latest = submissionHistory[0];
    const previous = submissionHistory[1];
    
    const runtimeChange = ((previous.runtime - latest.runtime) / previous.runtime) * 100;
    const memoryChange = ((previous.memory - latest.memory) / previous.memory) * 100;
    
    return {
      runtime: {
        improved: runtimeChange > 0,
        percentage: Math.abs(runtimeChange).toFixed(1),
      },
      memory: {
        improved: memoryChange > 0,
        percentage: Math.abs(memoryChange).toFixed(1),
      },
    };
  };

  const trend = getPerformanceTrend();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={cn(
        "p-4 border-2",
        result.success ? "border-green-500/20" : "border-red-500/20"
      )}>
        <div className="flex items-center gap-3">
          {result.success ? (
            <CheckCircle2 className="size-5 text-green-500" />
          ) : (
            <XCircle className="size-5 text-red-500" />
          )}
          <span className={cn(
            "font-medium",
            result.success ? "text-green-500" : "text-red-500"
          )}>
            {result.output}
          </span>
        </div>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Runtime Analysis */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-yellow-500" />
              <span className="font-medium">Runtime</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{result.runtime.toFixed(2)} ms</span>
              <span className={cn("font-bold text-lg", runtimeGrade.color)}>
                {runtimeGrade.grade}
              </span>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  trend.runtime.improved ? "text-green-500" : "text-red-500"
                )}>
                  {trend.runtime.improved ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronUp className="size-3" />
                  )}
                  {trend.runtime.percentage}%
                </div>
              )}
            </div>
          </div>

          {/* Runtime Distribution Graph */}
          <div className="space-y-2">
            <div className="h-24 flex items-end gap-0.5">
              {runtimeDistribution.map((bar, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-full",
                    bar.isCurrent ? "bg-yellow-500" : "bg-muted"
                  )}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 ms</span>
              <span>10 ms</span>
            </div>
          </div>

          {/* Historical Performance */}
          {submissionHistory.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Historical Performance</div>
              <div className="space-y-1">
                {submissionHistory.slice(0, 5).map((submission, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(submission.timestamp).toLocaleTimeString()}
                    </span>
                    <span>{submission.runtime.toFixed(2)} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Memory Analysis */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-blue-500" />
              <span className="font-medium">Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{(result.memory / 1000).toFixed(2)} MB</span>
              <span className={cn("font-bold text-lg", memoryGrade.color)}>
                {memoryGrade.grade}
              </span>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  trend.memory.improved ? "text-green-500" : "text-red-500"
                )}>
                  {trend.memory.improved ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronUp className="size-3" />
                  )}
                  {trend.memory.percentage}%
                </div>
              )}
            </div>
          </div>

          {/* Memory Distribution Graph */}
          <div className="space-y-2">
            <div className="h-24 flex items-end gap-0.5">
              {memoryDistribution.map((bar, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-full",
                    bar.isCurrent ? "bg-blue-500" : "bg-muted"
                  )}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 MB</span>
              <span>8 MB</span>
            </div>
          </div>

          {/* Historical Performance */}
          {submissionHistory.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Historical Performance</div>
              <div className="space-y-1">
                {submissionHistory.slice(0, 5).map((submission, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(submission.timestamp).toLocaleTimeString()}
                    </span>
                    <span>{(submission.memory / 1000).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Performance Ranking */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Trophy className="size-5 text-yellow-500" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Performance Ranking</span>
              <span className="text-sm text-muted-foreground">
                Better than {betterThan}% of submissions
              </span>
            </div>
            <Progress value={betterThan} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-blue-500" />
            <span className="font-medium">Average Runtime</span>
          </div>
          <div className="text-2xl font-semibold">
            {(submissionHistory.reduce((acc, curr) => acc + curr.runtime, 0) / submissionHistory.length || result.runtime).toFixed(2)} ms
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="size-4 text-green-500" />
            <span className="font-medium">Success Rate</span>
          </div>
          <div className="text-2xl font-semibold">
            {Math.round((result.testCases.passed / result.testCases.total) * 100)}%
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="size-4 text-purple-500" />
            <span className="font-medium">Best Runtime</span>
          </div>
          <div className="text-2xl font-semibold">
            {Math.min(...submissionHistory.map(s => s.runtime), result.runtime).toFixed(2)} ms
          </div>
        </Card>
      </div>

      {/* Test Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Test Cases</h3>
          <span className="text-sm text-muted-foreground">
            {result.testCases.passed}/{result.testCases.total} passing
          </span>
        </div>

        <div className="space-y-2">
          {result.testCases.results.map((testCase, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                {testCase.passed ? (
                  <CheckCircle2 className="size-4 mt-1 text-green-500" />
                ) : (
                  <XCircle className="size-4 mt-1 text-red-500" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Test Case {index + 1}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {(Math.random() * 2).toFixed(2)} ms
                      </span>
                      <span className="text-muted-foreground">
                        {(Math.random() * 2 + 5).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="grid grid-cols-[100px,1fr] gap-4">
                      <span className="text-muted-foreground">Input:</span>
                      <span className="font-mono">{testCase.input}</span>
                    </div>
                    <div className="grid grid-cols-[100px,1fr] gap-4">
                      <span className="text-muted-foreground">Expected:</span>
                      <span className="font-mono">{testCase.expected}</span>
                    </div>
                    <div className="grid grid-cols-[100px,1fr] gap-4">
                      <span className="text-muted-foreground">Output:</span>
                      <span className="font-mono">{testCase.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodeExecutionResults; 