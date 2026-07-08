import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border/20 px-4 py-3 text-center">
          <p className="text-[9px] text-muted-foreground/50 leading-relaxed max-w-3xl mx-auto">
            © {new Date().getFullYear()} Vigil Systems, LLC. All Rights
            Reserved. Founder &amp; Creator: Steven Gonzales. All content,
            systems, doctrine, and intellectual property are the exclusive
            property of Vigil Systems, LLC. Interaction with this platform
            constitutes acceptance of the NDA, Terms of Use, and Privacy Policy.
            No permission — inferred or otherwise — is granted to utilize any
            proprietary property.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
