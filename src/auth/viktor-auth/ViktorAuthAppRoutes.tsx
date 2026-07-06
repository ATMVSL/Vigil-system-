import { useCallback, useRef } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { beginViktorAuthentication } from "@/lib/viktor-spaces-access/client";
import {
  getViktorAuthBaseUrl,
  getViktorAuthClientId,
  getViktorSpacesSpaceId,
} from "@/lib/viktor-spaces-access/config";
import { SPACE_CALLBACK_PATH } from "@/lib/viktor-spaces-access/constants";
import type { ViktorAuthSession } from "@/lib/viktor-spaces-access/types";
import { ViktorAuthGlobalGate } from "@/lib/viktor-spaces-access/ViktorAuthGlobalGate";
import { ViktorProductAuthProvider } from "@/lib/viktor-spaces-access/ViktorProductAuthProvider";
import {
  useViktorAuthSession,
  useViktorSession,
  ViktorSessionProvider,
} from "@/lib/viktor-spaces-access/ViktorSessionProvider";
import { ViktorSpaceAccessProvider } from "@/lib/viktor-spaces-access/ViktorSpaceAccessProvider";
import { PublicLandingPage } from "@/pages/PublicLandingPage";
import { ProductAuthRoutes } from "../space-auth/SpaceAuthAppRoutes";

function ViktorPublicShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

function ViktorAppShell() {
  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 font-medium">Viktor Space</header>
      <main className="p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}

function ViktorDashboardPage() {
  // Session comes from context — the `me` fetch happens once at the route
  // root. Pages must never fetch `/__viktor_auth/me` themselves.
  const { user } = useViktorSession();

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      {user ? (
        <p className="text-muted-foreground text-sm">
          Signed in as {user.name ?? user.email ?? user.id}
        </p>
      ) : null}
    </div>
  );
}

function ViktorSettingsPage() {
  return <h1 className="text-2xl font-bold tracking-tight">Settings</h1>;
}

export function ViktorAuthAppRoutes({
  session,
  onSignInRequired,
  productAuthEnabled = false,
}: {
  session?: ViktorAuthSession;
  onSignInRequired?: () => void;
  productAuthEnabled?: boolean;
}) {
  const fetchedSession = useViktorAuthSession(session === undefined);
  const activeSession = session === undefined ? fetchedSession : session;
  const startedSignIn = useRef(false);
  const beginSignIn = useCallback(() => {
    if (startedSignIn.current) return;
    startedSignIn.current = true;
    if (onSignInRequired) {
      onSignInRequired();
      return;
    }
    const resourceId = getViktorSpacesSpaceId();
    const clientId = getViktorAuthClientId();
    const viktorAuthBaseUrl = getViktorAuthBaseUrl();
    if (!resourceId || !clientId || !viktorAuthBaseUrl) {
      return;
    }
    void beginViktorAuthentication({
      clientId,
      resourceId,
      viktorAuthBaseUrl,
      redirectUri: `${window.location.origin}${SPACE_CALLBACK_PATH}`,
    });
  }, [onSignInRequired]);

  return (
    <ViktorSpaceAccessProvider>
      <ViktorSessionProvider session={activeSession}>
        <ViktorAuthGlobalGate
          session={activeSession}
          onSignInRequired={beginSignIn}
        >
          {productAuthEnabled ? (
            <ViktorProductAuthProvider enabled>
              <ProductAuthRoutes />
            </ViktorProductAuthProvider>
          ) : (
            <Routes>
              <Route element={<ViktorPublicShell />}>
                <Route path="/" element={<PublicLandingPage />} />
              </Route>

              <Route element={<ViktorAppShell />}>
                <Route path="/dashboard" element={<ViktorDashboardPage />} />
                <Route path="/settings" element={<ViktorSettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </ViktorAuthGlobalGate>
      </ViktorSessionProvider>
    </ViktorSpaceAccessProvider>
  );
}
