import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  Activity,
  Award,
  BookOpen,
  Code2,
  Eye,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Server,
  Settings,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { APP_NAME } from "@/lib/constants";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const coreNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mirror", label: "Mirror", icon: Eye },
  { href: "/community", label: "Community", icon: Users },
];

const academyNavItems = [
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/training", label: "Training", icon: Activity },
  { href: "/sql-lab", label: "SQL Lab", icon: Code2 },
  { href: "/infra-lab", label: "Infrastructure Lab", icon: Server },
  { href: "/certification", label: "Certification", icon: Award },
];

const systemNavItems = [
  { href: "/evidence", label: "Evidence", icon: FileText },
  { href: "/admin", label: "Administration", icon: Shield },
  { href: "/doctrine", label: "Doctrine", icon: BookOpen },
  { href: "/documentation", label: "Documentation", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  const location = useLocation();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
          Operations
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {coreNavItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={
                  location.pathname === item.href ||
                  location.pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
          Academy
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {academyNavItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={
                  location.pathname === item.href ||
                  location.pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
          System
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {systemNavItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={
                  location.pathname === item.href ||
                  location.pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const user = useQuery(api.auth.currentUser);
  const { signOut } = useAuthActions();
  const { theme, toggleTheme, switchable } = useTheme();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "V"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate">
                    {user?.name || "Operator"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={() => setOpenMobile(false)}>
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {switchable && (
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/home"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-3 px-2 py-1"
      >
        <div className="size-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Eye className="size-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-widest">
            {APP_NAME}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Mirror Systems
          </span>
        </div>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
