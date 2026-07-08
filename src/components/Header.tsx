import { useConvexAuth } from "convex/react";
import { ArrowRight, Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { Button } from "./ui/button";

type HeaderViewProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthActions: boolean;
};

function HeaderView({
  isAuthenticated,
  isLoading,
  showAuthActions,
}: HeaderViewProps) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="size-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Eye className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-widest text-sm">
                {APP_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
                Mirror Systems
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {!showAuthActions || isLoading ? null : isAuthenticated ? (
              <Button size="sm" asChild>
                <Link to="/dashboard">
                  Command Center
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              !isAuthPage && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <HeaderView
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      showAuthActions
    />
  );
}
