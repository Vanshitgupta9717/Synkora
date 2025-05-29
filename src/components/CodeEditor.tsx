import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Timer, EyeIcon, PlayIcon, SendIcon, EyeOffIcon, LoaderIcon, LockIcon } from "lucide-react";
import Editor from "@monaco-editor/react";
import { CodeExecutionResult } from "@/types";
import CodeExecutionControls from "./CodeExecutionControls";
import CodeExecutionResults from "./CodeExecutionResults";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";

type Language = (typeof LANGUAGES)[number]["id"];
type Mode = "interviewer" | "candidate";

interface CodeEditorProps {
  mode?: Mode;
}

function CodeEditor({ mode = "candidate" }: CodeEditorProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0].id as Language);
  const [code, setCode] = useState(selectedQuestion.starterCode[language as keyof typeof selectedQuestion.starterCode]);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isSubmission, setIsSubmission] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "testcases">("editor");
  const [isBlurred, setIsBlurred] = useState(mode === "interviewer");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<Array<{
    timestamp: number;
    runtime: number;
    memory: number;
    passed: number;
    total: number;
  }>>([]);

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    setCode(question.starterCode[language as keyof typeof question.starterCode]);
    setExecutionResult(null);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(selectedQuestion.starterCode[newLanguage as keyof typeof selectedQuestion.starterCode]);
    setExecutionResult(null);
  };

  const validateCode = (code: string, language: string) => {
    // Remove comments and whitespace
    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
                         .replace(/\s+/g, '');
    
    // Get starter code template
    const starterTemplate = selectedQuestion.starterCode[language as keyof typeof selectedQuestion.starterCode];
    const cleanTemplate = starterTemplate.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
                                       .replace(/\s+/g, '');
    
    // If code is just the template or empty after removing template
    if (cleanCode === cleanTemplate || !cleanCode.replace(cleanTemplate, '').trim()) {
      return false;
    }

    // Basic validation for Two Sum
    if (selectedQuestion.id === "two-sum") {
      const solutions: Record<string, RegExp> = {
        cpp: /int\s*n\s*=\s*(?:arr|nums)\.size\(\);?\s*for\s*\(\s*int\s*i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\s*\+\+\s*\)\s*{\s*for\s*\(\s*int\s*j\s*=\s*i\s*\+\s*1\s*;\s*j\s*<\s*n\s*;\s*j\s*\+\+\s*\)\s*{\s*if\s*\(\s*(?:arr|nums)\s*\[\s*i\s*\]\s*\+\s*(?:arr|nums)\s*\[\s*j\s*\]\s*==\s*target\s*\)\s*{\s*return\s*{\s*i\s*,\s*j\s*}\s*;\s*}\s*}\s*}\s*return\s*{\s*}\s*;?/,
        python: /n\s*=\s*len\((?:arr|nums)\)\s*for\s+i\s+in\s+range\(n\):\s*for\s+j\s+in\s+range\(i\s*\+\s*1\s*,\s*n\):\s*if\s+(?:arr|nums)\[i\]\s*\+\s*(?:arr|nums)\[j\]\s*==\s*target:\s*return\s*\[i\s*,\s*j\]\s*return\s*\[\s*\]/,
        javascript: /(?:const|let|var)\s*n\s*=\s*(?:arr|nums)\.length\s*for\s*\(\s*(?:let|var)\s*i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\s*\+\+\s*\)\s*{\s*for\s*\(\s*(?:let|var)\s*j\s*=\s*i\s*\+\s*1\s*;\s*j\s*<\s*n\s*;\s*j\s*\+\+\s*\)\s*{\s*if\s*\(\s*(?:arr|nums)\s*\[\s*i\s*\]\s*\+\s*(?:arr|nums)\s*\[\s*j\s*\]\s*===?\s*target\s*\)\s*{\s*return\s*\[\s*i\s*,\s*j\s*\]\s*;\s*}\s*}\s*}\s*return\s*\[\s*\]\s*;?/,
        java: /int\s*n\s*=\s*(?:arr|nums)\.length\s*;\s*for\s*\(\s*int\s*i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\s*\+\+\s*\)\s*{\s*for\s*\(\s*int\s*j\s*=\s*i\s*\+\s*1\s*;\s*j\s*<\s*n\s*;\s*j\s*\+\+\s*\)\s*{\s*if\s*\(\s*(?:arr|nums)\s*\[\s*i\s*\]\s*\+\s*(?:arr|nums)\s*\[\s*j\s*\]\s*==\s*target\s*\)\s*{\s*return\s*new\s*int\s*\[\s*\]\s*{\s*i\s*,\s*j\s*}\s*;\s*}\s*}\s*}\s*return\s*new\s*int\s*\[\s*\]\s*;?/
      };

      const solution = solutions[language];
      if (!solution) return false;

      // Remove all whitespace for comparison
      const strippedCode = cleanCode.replace(/\s+/g, '');
      
      // For each language, check if the code matches the expected pattern
      return solution.test(code);
    }

    return false;
  };

  const generateTestCases = (count: number) => {
    const testCases = Array.from({ length: count }, (_, index) => {
      if (index === 0) {
        return {
          input: selectedQuestion.examples[0].input,
          expected: selectedQuestion.examples[0].output,
          output: selectedQuestion.examples[0].output,
          passed: true
        };
      }

      // Generate random test cases
      const nums = Array.from({ length: Math.floor(Math.random() * 8) + 2 }, 
        () => Math.floor(Math.random() * 20));
      const target = nums[0] + nums[1]; // Ensure at least one valid solution
      
      return {
        input: `nums = [${nums.join(',')}], target = ${target}`,
        expected: `[0,1]`,
        output: validateCode(code, language) ? `[0,1]` : `[${Math.floor(Math.random() * nums.length)},${Math.floor(Math.random() * nums.length)}]`,
        passed: validateCode(code, language)
      };
    });

    return testCases;
  };

  const runCode = async () => {
    setIsRunning(true);
    setIsSubmission(false);
    
    try {
      // Check if code is empty
      if (!code.trim()) {
        const result: CodeExecutionResult = {
          success: false,
          output: "Compilation Error: Empty code submission",
          runtime: 0,
          memory: 0,
          testCases: {
            passed: 0,
            total: 1,
            results: [{
              input: "N/A",
              expected: "N/A",
              output: "Empty code",
              passed: false
            }]
          }
        };
        setExecutionResult(result);
        setActiveTab("testcases");
        return result;
      }

      const testCases = generateTestCases(3);
      const passed = testCases.filter(t => t.passed).length;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: CodeExecutionResult = {
        success: passed === testCases.length,
        output: passed === testCases.length ? "All test cases passed" : `${passed}/${testCases.length} test cases passed`,
        runtime: Math.random() * 10 + 1,
        memory: Math.random() * 5000 + 5000,
        testCases: {
          passed,
          total: testCases.length,
          results: testCases,
        },
      };
      setExecutionResult(result);
      setActiveTab("testcases");
      return result;
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setIsSubmission(true);
    
    try {
      // Check if code is empty
      if (!code.trim()) {
        const result: CodeExecutionResult = {
          success: false,
          output: "Compilation Error: Empty code submission",
          runtime: 0,
          memory: 0,
          testCases: {
            passed: 0,
            total: 1,
            results: [{
              input: "N/A",
              expected: "N/A",
              output: "Empty code",
              passed: false
            }]
          }
        };
        setExecutionResult(result);
        setActiveTab("testcases");
        return result;
      }

      const totalTests = 2786;
      const isCorrect = validateCode(code, language);
      const passedTests = isCorrect ? totalTests : Math.floor(Math.random() * (totalTests - 200));
      const testCases = generateTestCases(5);
      
      // Generate random performance metrics that are likely to be good
      const runtime = Math.random() * 3 + 1; // 1-4ms
      const memory = Math.random() * 1000 + 5000; // 5000-6000KB
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: CodeExecutionResult = {
        success: isCorrect,
        output: isCorrect ? `All ${totalTests} test cases passed!` : `${passedTests}/${totalTests} test cases passed`,
        runtime,
        memory,
        testCases: {
          passed: passedTests,
          total: totalTests,
          results: testCases,
        },
      };

      // Add to submission history
      setSubmissionHistory(prev => [
        {
          timestamp: Date.now(),
          runtime,
          memory,
          passed: passedTests,
          total: totalTests,
        },
        ...prev,
      ].slice(0, 10)); // Keep last 10 submissions

      setExecutionResult(result);
      setActiveTab("testcases");
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {mode === "candidate" && (
        <Alert className="rounded-none border-t-0 border-x-0">
          <EyeIcon className="size-4 text-red-500 animate-pulse" />
          <AlertDescription className="text-red-500 font-medium">
            You are being proctored. Any suspicious activity will be flagged.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-[45%] border-r flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Select value={selectedQuestion.id} onValueChange={handleQuestionChange}>
                <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              <Badge
                variant="secondary"
                className={cn("font-medium", getDifficultyColor(selectedQuestion.difficulty))}
              >
                {selectedQuestion.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="size-4" />
              <span>{selectedQuestion.acceptance} Acceptance</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-4">Problem Description</h3>
                <p className="whitespace-pre-line">{selectedQuestion.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Examples</h3>
                {selectedQuestion.examples.map((example, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-2 font-mono text-sm">
                        <div>Input: {example.input}</div>
                        <div>Output: {example.output}</div>
                        {example.explanation && (
                          <div className="text-muted-foreground">
                            Explanation: {example.explanation}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedQuestion.constraints && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                    {selectedQuestion.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Code Editor and Results */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={(value) => mode === "candidate" && setActiveTab(value as "editor" | "testcases")} className="w-[400px]">
              <TabsList>
                <TabsTrigger value="editor" disabled={mode === "interviewer"}>Code Editor</TabsTrigger>
                <TabsTrigger value="testcases" disabled={mode === "interviewer"}>Test Cases</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/${language}.png`}
                            alt={language}
                            className="w-5 h-5 object-contain"
                          />
                          {LANGUAGES.find((l) => l.id === language)?.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`/${lang.id}.png`}
                              alt={lang.name}
                              className="w-5 h-5 object-contain"
                            />
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

              {mode === "interviewer" && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBlurred(!isBlurred)}
                >
                  {isBlurred ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "editor" ? (
        <div className="h-full relative">
                <div className={cn(
                  "h-full transition-all duration-200",
                  mode === "interviewer" && "filter blur-[6px] brightness-75"
                )}>
          <Editor
                    height="100%"
            defaultLanguage={language}
            language={language}
            theme="vs-dark"
            value={code}
                    onChange={(value) => mode === "candidate" && setCode(value || "")}
            options={{
              minimap: { enabled: false },
                      fontSize: 16,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              wordWrap: "on",
              wrappingIndent: "indent",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontLigatures: true,
                      readOnly: mode === "interviewer",
                    }}
                  />
                </div>

                {mode === "interviewer" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/95 shadow-lg border">
                      <LockIcon className="size-12 text-muted-foreground" />
                      <span className="font-medium text-lg">Code Editor Locked</span>
                      <span className="text-sm text-muted-foreground text-center">
                        You are in interviewer mode.<br />Switch to candidate mode to edit code.
                      </span>
                    </div>
                  </div>
                )}

                              {mode === "candidate" && (
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-end gap-2 bg-background/80 backdrop-blur-sm border-t">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={runCode}
                    disabled={isRunning || isSubmitting}
                  >
                    {isRunning ? (
                      <LoaderIcon className="size-4 animate-spin" />
                    ) : (
                      <PlayIcon className="size-4" />
                    )}
                    Run
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={submitCode}
                    disabled={isRunning || isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoaderIcon className="size-4 animate-spin" />
                    ) : (
                      <SendIcon className="size-4" />
                    )}
                    Submit
                  </Button>
                </div>
              )}
              </div>
            ) : (
              <div className="h-[calc(100vh-8rem)] overflow-auto">
                {mode === "interviewer" ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/95 shadow-lg border">
                      <LockIcon className="size-12 text-muted-foreground" />
                      <span className="font-medium text-lg">Test Cases Locked</span>
                      <span className="text-sm text-muted-foreground text-center">
                        You are in interviewer mode.<br />Switch to candidate mode to view test cases.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {executionResult ? (
                      <CodeExecutionResults
                        result={executionResult}
                        isSubmission={isSubmission}
                        submissionHistory={submissionHistory}
                      />
                    ) : (
                      <div className="h-full min-h-[400px] flex items-center justify-center text-muted-foreground">
                        Run your code to see test results
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
