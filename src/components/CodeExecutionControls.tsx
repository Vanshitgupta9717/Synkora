import { Button } from "./ui/button";
import { PlayIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { CodeExecutionResult } from "@/types";

interface CodeExecutionControlsProps {
  onRun: () => Promise<CodeExecutionResult>;
  onSubmit: () => Promise<CodeExecutionResult>;
  language: string;
}

export default function CodeExecutionControls({
  onRun,
  onSubmit,
  language,
}: CodeExecutionControlsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await onRun();
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      <Button
        variant="secondary"
        className="gap-2"
        onClick={handleRun}
        disabled={isRunning || isSubmitting}
      >
        <PlayIcon className="size-4" />
        Run
      </Button>
      <Button
        className="gap-2"
        onClick={handleSubmit}
        disabled={isRunning || isSubmitting}
      >
        <SendIcon className="size-4" />
        Submit
      </Button>
    </div>
  );
} 