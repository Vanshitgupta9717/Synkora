"use client";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  CodeIcon, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  Brain,
  GraduationCap,
  SparklesIcon,
  BellIcon,
  LucideIcon
} from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  hoverClass?: string;
}

function Navbar() {
  const { isInterviewer, isCandidate } = useUserRole();
  const pathname = usePathname();

  const interviewerLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: SparklesIcon, hoverClass: "hover:bg-emerald-500/10 hover:text-emerald-500" },
    { href: "/schedule", label: "Schedule", icon: Calendar, hoverClass: "hover:bg-blue-500/10 hover:text-blue-500" },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/recordings", label: "Recordings", icon: Clock },
  ];

  const candidateLinks: NavLink[] = [
    { href: "/practice", label: "Practice", icon: Brain },
    { href: "/problems", label: "Problems", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: GraduationCap },
  ];

  const links = isInterviewer ? interviewerLinks : candidateLinks;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 container mx-auto">
        {/* LEFT SIDE - LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-2xl mr-8 hover:opacity-90 transition-all duration-200"
        >
          <div className="relative">
            <CodeIcon className="size-8 text-emerald-500" />
            <div className="absolute inset-0 animate-ping bg-emerald-500/20 rounded-lg" />
          </div>
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent font-bold tracking-tight">
            SYNKORA
          </span>
        </Link>

        {/* CENTER - NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                link.hoverClass
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <Users className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <DropdownMenuItem className={cn("cursor-pointer", link.hoverClass)}>
                    <link.icon className="mr-2 size-4" />
                    {link.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* RIGHT SIDE - ACTIONS */}
        <SignedIn>
          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="size-5" />
              <span className="absolute top-1 right-1 size-2 bg-emerald-500 rounded-full" />
            </Button>

            <div className="h-5 w-px bg-border mx-1" />
            
            <ModeToggle />
            
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
