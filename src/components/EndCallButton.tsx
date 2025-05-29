import { PhoneOff } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface EndCallButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

function EndCallButton({ variant = "default", size = "default" }: EndCallButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push("/")}
      className="gap-2"
    >
      <PhoneOff className="size-4" />
      End Call
    </Button>
  );
}

export default EndCallButton;
