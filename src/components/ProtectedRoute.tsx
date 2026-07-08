import { useConvexAuth, useQuery } from "convex/react";
import { GraduationCap, Shield, ShieldAlert } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

// Pages that don't require Academy completion
const UNGATED_PATHS = [
  "/home",
  "/academy",
  "/settings",
  "/documentation",
  "/doctrine",
];

function AppSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-16" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AccessDeniedGate({
  reason,
  approvalStatus,
  coursesTotal,
  coursesCompleted,
}: {
  reason: string;
  approvalStatus?: string;
  coursesTotal?: number;
  coursesCompleted?: number;
}) {
  const isPending = approvalStatus === "pending";
  const isDenied = approvalStatus === "denied";
  const isAcademy = !isPending && !isDenied;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          {isPending ? (
            <Shield className="size-8 text-primary" />
          ) : isDenied ? (
            <ShieldAlert className="size-8 text-destructive" />
          ) : (
            <GraduationCap className="size-8 text-primary" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            {isPending
              ? "Awaiting Founder Approval"
              : isDenied
                ? "Access Denied"
                : "Academy Required"}
          </h1>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>

        {isAcademy &&
          coursesTotal !== undefined &&
          coursesCompleted !== undefined && (
            <div className="space-y-2">
              <Progress
                value={(coursesCompleted / Math.max(coursesTotal, 1)) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {coursesCompleted} of {coursesTotal} courses completed
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {Math.round(
                    (coursesCompleted / Math.max(coursesTotal, 1)) * 100,
                  )}
                  %
                </Badge>
              </div>
              <Button asChild className="mt-4">
                <a href="/academy">Continue Academy</a>
              </Button>
            </div>
          )}

        {isPending && (
          <p className="text-xs text-muted-foreground">
            The Founder has been notified. You will receive access once
            approved.
          </p>
        )}

        <div className="pt-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/home">Return Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();
  const coreAccess = useQuery(
    api.roles.getCoreAccessStatus,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check Academy gate for gated pages
  const isUngated = UNGATED_PATHS.some(
    p =>
      location.pathname === p || location.pathname.startsWith(`${p}/`),
  );

  if (!isUngated && coreAccess && !coreAccess.allowed) {
    return (
      <AccessDeniedGate
        reason={coreAccess.reason}
        approvalStatus={
          "approvalStatus" in coreAccess
            ? (coreAccess.approvalStatus as string)
            : undefined
        }
        coursesTotal={
          "coursesTotal" in coreAccess
            ? (coreAccess.coursesTotal as number)
            : undefined
        }
        coursesCompleted={
          "coursesCompleted" in coreAccess
            ? (coreAccess.coursesCompleted as number)
            : undefined
        }
      />
    );
  }

  return <Outlet />;
}
