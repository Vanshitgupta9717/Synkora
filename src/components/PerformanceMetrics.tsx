"use client";

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  BrainCircuitIcon,
  ClockIcon,
  CodeIcon,
  CpuIcon,
  GitBranchIcon,
  HeartPulseIcon,
  LightbulbIcon,
  TimerIcon,
  TrendingUpIcon,
  UsersIcon,
  HistoryIcon,
  TargetIcon,
  ActivityIcon,
  BookIcon,
  PuzzleIcon,
  ZapIcon,
  BarChart3Icon,
  BrainIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  StarIcon,
  XCircleIcon,
  BeakerIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Interview } from "@/types";
import { Separator } from './ui/separator';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetricsProps {
  interview: Interview;
  candidateInfo: {
    name: string;
    image: string;
    initials: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AIAnalysis {
  recommendation: "Pass" | "Further Review Needed";
  confidence: "High" | "Medium" | "Low";
  reasoning: string[];
  keyStrengths: string[];
  keyWeaknesses: string[];
  detailedRecommendations: string[];
  codeQualityMetrics: {
    readability: number;
    efficiency: number;
    bestPractices: number;
    complexity: number;
  };
  skillLevels: {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    score: number;
  }[];
}

interface Metric {
  name: string;
  value: number;
  icon: LucideIcon;
  color: string;
  description: string;
}

const PerformanceMetrics = ({ interview, candidateInfo }: PerformanceMetricsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - In a real app, these would come from actual evaluations
  const overallScore = interview.status === "succeeded" ? 85 : interview.status === "failed" ? 45 : 65;
  
  const getMetricsBasedOnPerformance = () => {
    // If there's a successful code submission, boost the technical scores
    const hasSuccessfulSubmission = interview.codeSubmissions?.some(
      submission => submission.success
    );

    return [
      {
        name: "Problem Solving",
        value: hasSuccessfulSubmission ? 90 : 
               interview.status === "succeeded" ? 90 : 40,
        icon: BrainIcon,
        color: "text-purple-500",
        description: "Ability to break down and solve complex problems"
      },
      {
        name: "Code Quality",
        value: hasSuccessfulSubmission ? 85 :
               interview.status === "succeeded" ? 85 : 50,
        icon: CodeIcon,
        color: "text-blue-500",
        description: "Code organization, readability, and maintainability"
      },
      {
        name: "Communication",
        value: interview.status === "succeeded" ? 80 : 60,
        icon: MessageSquareIcon,
        color: "text-green-500",
        description: "Clarity in explaining thought process and solutions"
      },
      {
        name: "Technical Skills",
        value: hasSuccessfulSubmission ? 88 :
               interview.status === "succeeded" ? 88 : 45,
        icon: BarChart3Icon,
        color: "text-orange-500",
        description: "Knowledge of algorithms, data structures, and patterns"
      },
      {
        name: "Time Management",
        value: hasSuccessfulSubmission ? 85 :
               interview.status === "succeeded" ? 82 : 55,
        icon: TimerIcon,
        color: "text-red-500",
        description: "Efficient use of time and prioritization"
      },
    ];
  };

  const metrics = getMetricsBasedOnPerformance();

  const radarData = metrics.map(m => ({
    subject: m.name,
    A: m.value,
    fullMark: 100,
  }));

  // AI Analysis based on metrics
  const getAIAnalysis = (): AIAnalysis => {
    const hasSuccessfulSubmission = interview.codeSubmissions?.some(
      submission => submission.success
    );
    
    const avgScore = metrics.reduce((acc, curr) => acc + curr.value, 0) / metrics.length;
    const strengths = metrics.filter(m => m.value >= 80);
    const weaknesses = metrics.filter(m => m.value < 60);
    
    // Determine recommendation based on both metrics and code submission
    const recommendation = hasSuccessfulSubmission || avgScore >= 70 ? "Pass" : "Further Review Needed";
    
    // Calculate code quality metrics with boosted scores for successful submission
    const codeQualityMetrics = {
      readability: hasSuccessfulSubmission ? 88 : (interview.status === "succeeded" ? 88 : 55),
      efficiency: hasSuccessfulSubmission ? 90 : (interview.status === "succeeded" ? 85 : 50),
      bestPractices: hasSuccessfulSubmission ? 92 : (interview.status === "succeeded" ? 90 : 45),
      complexity: hasSuccessfulSubmission ? 85 : (interview.status === "succeeded" ? 82 : 60),
    };

    // Adjust skill levels based on code submission success
    const skillLevels = [
      {
        name: "Algorithms",
        level: hasSuccessfulSubmission ? "Expert" as const : 
               interview.status === "succeeded" ? "Advanced" as const : "Beginner" as const,
        score: hasSuccessfulSubmission ? 92 : (interview.status === "succeeded" ? 85 : 45)
      },
      {
        name: "Data Structures",
        level: hasSuccessfulSubmission ? "Expert" as const :
               interview.status === "succeeded" ? "Expert" as const : "Intermediate" as const,
        score: hasSuccessfulSubmission ? 95 : (interview.status === "succeeded" ? 90 : 60)
      },
      {
        name: "System Design",
        level: hasSuccessfulSubmission ? "Advanced" as const :
               interview.status === "succeeded" ? "Intermediate" as const : "Beginner" as const,
        score: hasSuccessfulSubmission ? 85 : (interview.status === "succeeded" ? 75 : 40)
      },
      {
        name: "Problem Analysis",
        level: hasSuccessfulSubmission ? "Expert" as const :
               interview.status === "succeeded" ? "Advanced" as const : "Intermediate" as const,
        score: hasSuccessfulSubmission ? 90 : (interview.status === "succeeded" ? 88 : 65)
      }
    ];

    const analysis: AIAnalysis = {
      recommendation,
      confidence: hasSuccessfulSubmission ? "High" : getConfidenceLevel(metrics),
      reasoning: [],
      keyStrengths: strengths.map(s => s.name),
      keyWeaknesses: weaknesses.map(w => w.name),
      detailedRecommendations: [],
      codeQualityMetrics,
      skillLevels
    };

    // Add success-based reasoning
    if (hasSuccessfulSubmission) {
      analysis.reasoning = [
        "Successfully completed all coding challenges with optimal solutions",
        "Demonstrated strong problem-solving abilities and technical expertise",
        "Showed excellent understanding of algorithms and data structures",
        "Maintained code quality while achieving desired outcomes"
      ];
    } else {
      // Add detailed reasoning based on metrics
      if (metrics.find(m => m.name === "Problem Solving")?.value! >= 80) {
        analysis.reasoning.push("Demonstrates excellent problem decomposition and solution approach");
      } else if (metrics.find(m => m.name === "Problem Solving")?.value! < 60) {
        analysis.reasoning.push("Needs improvement in breaking down complex problems");
      }

      if (metrics.find(m => m.name === "Code Quality")?.value! >= 80) {
        analysis.reasoning.push("Writes clean, maintainable code with good practices");
      } else if (metrics.find(m => m.name === "Code Quality")?.value! < 60) {
        analysis.reasoning.push("Code organization and clarity need improvement");
      }
    }

    return analysis;
  };

  const getConfidenceLevel = (metrics: Metric[]): AIAnalysis['confidence'] => {
    const consistencyScore = Math.max(...metrics.map(m => m.value)) - Math.min(...metrics.map(m => m.value));
    const avgScore = metrics.reduce((acc, curr) => acc + curr.value, 0) / metrics.length;
    
    if (consistencyScore <= 15 && (avgScore >= 80 || avgScore <= 40)) return "High";
    if (consistencyScore <= 25 && avgScore >= 60) return "Medium";
    return "Low";
  };

  const generateDetailedRecommendations = (
    metrics: Metric[],
    skillLevels: AIAnalysis['skillLevels']
  ): string[] => {
    const recommendations: string[] = [];

    // Add specific recommendations based on metrics
    metrics.forEach(metric => {
      if (metric.value < 60) {
        switch (metric.name) {
          case "Problem Solving":
            recommendations.push("Practice breaking down complex problems into smaller, manageable components");
            recommendations.push("Focus on identifying and handling edge cases systematically");
            break;
          case "Code Quality":
            recommendations.push("Review clean code principles and implement consistent naming conventions");
            recommendations.push("Focus on modular design and code reusability");
            break;
          case "Communication":
            recommendations.push("Practice explaining technical solutions using the STAR method");
            recommendations.push("Work on articulating trade-offs in your solution approaches");
            break;
          case "Technical Skills":
            recommendations.push("Review fundamental data structures and their time/space complexities");
            recommendations.push("Practice implementing common algorithms from scratch");
            break;
          case "Time Management":
            recommendations.push("Practice time-boxing different phases of problem-solving");
            recommendations.push("Work on quick prototype implementations before optimization");
            break;
        }
      }
    });

    // Add recommendations based on skill levels
    skillLevels.forEach(skill => {
      if (skill.score < 70) {
        switch (skill.name) {
          case "Algorithms":
            recommendations.push("Focus on mastering fundamental algorithmic patterns");
            break;
          case "Data Structures":
            recommendations.push("Practice implementing and using advanced data structures");
            break;
          case "System Design":
            recommendations.push("Study scalable system design patterns and trade-offs");
            break;
          case "Problem Analysis":
            recommendations.push("Improve problem analysis by considering multiple approaches");
            break;
        }
      }
    });

    return recommendations;
  };

  const aiAnalysis = getAIAnalysis();

  const handleStatusUpdate = (interviewId: string, status: "succeeded" | "failed") => {
    // Implement the logic to update the interview status in the database
    console.log(`Updating interview ${interviewId} to status: ${status}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <TrendingUpIcon className="mr-2 h-4 w-4" />
          View Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 z-50 bg-background pb-4 mb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
            Performance Analysis - {candidateInfo.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          {/* AI Analysis Section */}
          <Card className="bg-zinc-900/95 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <CardTitle className="flex items-center justify-between text-zinc-100">
                <div className="flex items-center gap-3">
                  <BarChart3Icon className="h-5 w-5 text-emerald-500" />
                  <span>Performance Analysis</span>
                  <Badge className="ml-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-800">
                    Based on {interview.codeSubmissions?.length || 0} code submissions
                  </Badge>
                </div>
                {aiAnalysis.recommendation === "Pass" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                    Recommended to Pass
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                    Further Review Needed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Success Rate</span>
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-semibold text-zinc-100">
                    {metrics.filter(m => m.value >= 80).length > 0 ? "100%" : "0%"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Overall success rate in code submissions
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Avg. Execution Time</span>
                    <ClockIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-semibold text-zinc-100">
                    193ms
                  </div>
                  <div className="text-xs text-zinc-500">
                    Average code execution time
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Test Coverage</span>
                    <BeakerIcon className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="text-2xl font-semibold text-zinc-100">
                    100%
                  </div>
                  <div className="text-xs text-zinc-500">
                    Average test cases passed
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Completion Rate</span>
                    <TargetIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-semibold text-zinc-100">
                    {Math.round((metrics.reduce((acc, m) => acc + m.value, 0) / (metrics.length * 100)) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">
                    Tasks completed vs expected
                  </div>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-base font-medium text-zinc-100">Overall Performance</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold text-blue-400">
                      {Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length)}%
                    </span>
                    <Badge className="bg-zinc-800 text-zinc-400">
                      {metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length >= 90 ? 'Excellent' : 
                       metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length >= 75 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 text-xs text-zinc-500">
                  <span>Needs Work (0-60)</span>
                  <span className="text-center">Good (61-75)</span>
                  <span className="text-right">Excellent (76-100)</span>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Technical Skills */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CodeIcon className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-base font-medium text-zinc-100">Technical Skills</h3>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      {metrics.find(m => m.name === "Technical Skills")?.value || 0}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${metrics.find(m => m.name === "Technical Skills")?.value || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500">
                    {interview.codeSubmissions?.length || 0} code submissions with {interview.codeSubmissions?.filter(s => s.success).length || 0} successful solutions
                  </div>
                </div>

                {/* Problem Solving */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrainIcon className="h-5 w-5 text-violet-500" />
                      <h3 className="text-base font-medium text-zinc-100">Problem Solving</h3>
                    </div>
                    <Badge className="bg-violet-500/10 text-violet-500">
                      {metrics.find(m => m.name === "Problem Solving")?.value || 0}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${metrics.find(m => m.name === "Problem Solving")?.value || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500">
                    Based on test case success rate and solution approach
                  </div>
                </div>

                {/* Code Quality */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranchIcon className="h-5 w-5 text-amber-500" />
                      <h3 className="text-base font-medium text-zinc-100">Code Quality</h3>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-500">
                      {metrics.find(m => m.name === "Code Quality")?.value || 0}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${metrics.find(m => m.name === "Code Quality")?.value || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500">
                    Based on code performance and efficiency
                  </div>
                </div>

                {/* Time Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                      <h3 className="text-base font-medium text-zinc-100">Time Management</h3>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500">
                      {metrics.find(m => m.name === "Time Management")?.value || 0}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${metrics.find(m => m.name === "Time Management")?.value || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500">
                    Completed {interview.codeSubmissions?.length || 0} challenges during the interview
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
                  <BrainCircuitIcon className="h-5 w-5 text-blue-500" />
                  AI Recommendation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn(
                    "p-4 rounded-lg",
                    aiAnalysis.recommendation === "Pass"
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-zinc-800/50 border border-zinc-700/50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className={cn(
                        "h-5 w-5",
                        aiAnalysis.recommendation === "Pass"
                          ? "text-emerald-500"
                          : "text-zinc-500"
                      )} />
                      <span className={cn(
                        "font-medium",
                        aiAnalysis.recommendation === "Pass"
                          ? "text-emerald-500"
                          : "text-zinc-500"
                      )}>
                        Pass
                      </span>
                    </div>
                    <div className="space-y-2">
                      {aiAnalysis.recommendation === "Pass" && (
                        <>
                          <p className="text-sm text-zinc-400">
                            Strong performance indicators:
                          </p>
                          <ul className="text-sm space-y-1">
                            {metrics.filter(m => m.value >= 75).map((m, i) => (
                              <li key={i} className="flex items-center gap-2 text-emerald-400">
                                <StarIcon className="h-3 w-3" />
                                {m.name}: {m.value}%
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "p-4 rounded-lg",
                    aiAnalysis.recommendation !== "Pass"
                      ? "bg-orange-500/10 border border-orange-500/20"
                      : "bg-zinc-800/50 border border-zinc-700/50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircleIcon className={cn(
                        "h-5 w-5",
                        aiAnalysis.recommendation !== "Pass"
                          ? "text-orange-500"
                          : "text-zinc-500"
                      )} />
                      <span className={cn(
                        "font-medium",
                        aiAnalysis.recommendation !== "Pass"
                          ? "text-orange-500"
                          : "text-zinc-500"
                      )}>
                        Needs Improvement
                      </span>
                    </div>
                    <div className="space-y-2">
                      {aiAnalysis.recommendation !== "Pass" && (
                        <>
                          <p className="text-sm text-zinc-400">
                            Areas needing improvement:
                          </p>
                          <ul className="text-sm space-y-1">
                            {metrics.filter(m => m.value < 60).map((m, i) => (
                              <li key={i} className="flex items-center gap-2 text-orange-400">
                                <AlertTriangleIcon className="h-3 w-3" />
                                {m.name}: {m.value}%
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Confidence Level:</span>
                      <Badge className={cn(
                        "font-medium",
                        aiAnalysis.confidence === "High" 
                          ? "bg-emerald-500/10 text-emerald-500"
                          : aiAnalysis.confidence === "Medium"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-orange-500/10 text-orange-500"
                      )}>
                        {aiAnalysis.confidence}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Overall Score:</span>
                      <span className={cn(
                        "font-medium",
                        overallScore >= 75 ? "text-emerald-400" :
                        overallScore >= 60 ? "text-amber-400" :
                        "text-orange-400"
                      )}>
                        {overallScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <h4 className="text-sm font-medium text-zinc-100 mb-2">Final Recommendation</h4>
                    <p className="text-sm text-zinc-400">
                      Based on {interview.codeSubmissions?.length || 0} code submissions and an overall score of {overallScore}%, we {aiAnalysis.recommendation === "Pass" ? "recommend" : "cannot recommend"} this candidate for the following reasons:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {aiAnalysis.reasoning.map((reason, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          {reason.includes("need") || reason.includes("should") ? (
                            <AlertTriangleIcon className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <span className="text-zinc-300">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className={cn(
                        "relative",
                        aiAnalysis.recommendation === "Pass"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      )}
                      onClick={() => handleStatusUpdate(interview._id, "succeeded")}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Pass Candidate
                    </Button>
                    <Button
                      className={cn(
                        "relative",
                        aiAnalysis.recommendation !== "Pass"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      )}
                      onClick={() => handleStatusUpdate(interview._id, "failed")}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Fail Candidate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Overall Score</h3>
              <span className={`font-bold ${
                overallScore >= 70 ? "text-emerald-500" : 
                overallScore >= 50 ? "text-orange-500" : 
                "text-red-500"
              }`}>
                {overallScore}/100
              </span>
            </div>
            <Progress 
              value={overallScore} 
              className="h-2"
              indicatorClassName={
                overallScore >= 70 ? "bg-emerald-500" : 
                overallScore >= 50 ? "bg-orange-500" : 
                "bg-red-500"
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Metrics */}
            <div className="space-y-4">
              <h3 className="font-medium">Key Metrics</h3>
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        <span>{metric.name}</span>
                      </div>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className="h-1"
                      indicatorClassName={`bg-current ${metric.color}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Radar */}
            <div>
              <h3 className="font-medium mb-4">Skills Breakdown</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
              <h3 className="font-medium text-emerald-500 mb-2">Strengths</h3>
              <ul className="space-y-1 text-sm">
                {metrics
                  .filter(m => m.value >= 80)
                  .map(m => (
                    <li key={m.name} className="flex items-center gap-2">
                      <m.icon className="h-4 w-4" />
                      {m.name}
                    </li>
                  ))
                }
              </ul>
            </Card>
            <Card className="p-4 bg-red-500/5 border-red-500/20">
              <h3 className="font-medium text-red-500 mb-2">Areas for Improvement</h3>
              <ul className="space-y-1 text-sm">
                {metrics
                  .filter(m => m.value < 60)
                  .map(m => (
                    <li key={m.name} className="flex items-center gap-2">
                      <m.icon className="h-4 w-4" />
                      {m.name}
                    </li>
                  ))
                }
              </ul>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceMetrics; 