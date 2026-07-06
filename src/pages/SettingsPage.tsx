import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Eye, EyeOff, Key, Loader2, Mic, Moon, Palette, Sun, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme, type ColorScheme } from "@/contexts/ThemeContext";
import { api } from "../../convex/_generated/api";

const COLOR_SCHEMES: { id: ColorScheme; label: string; description: string; swatch: string }[] = [
  { id: "vigil-green", label: "OD Green", description: "Military standard", swatch: "oklch(0.65 0.12 145)" },
  { id: "vigil-amber", label: "Tactical Amber", description: "Warm command", swatch: "oklch(0.72 0.14 75)" },
  { id: "vigil-blue", label: "Steel Blue", description: "Navy precision", swatch: "oklch(0.65 0.12 230)" },
  { id: "vigil-red", label: "Combat Red", description: "Alert readiness", swatch: "oklch(0.58 0.2 25)" },
  { id: "vigil-slate", label: "Tactical Gray", description: "Stealth neutral", swatch: "oklch(0.6 0.02 260)" },
  { id: "vigil-purple", label: "Royal Purple", description: "Sovereign command", swatch: "oklch(0.65 0.18 300)" },
  { id: "vigil-ember", label: "Ember Fire", description: "Forged resilience", swatch: "oklch(0.68 0.19 45)" },
];

export function SettingsPage() {
  const user = useQuery(api.auth.currentUser);
  const { theme, toggleTheme, switchable, colorScheme, setColorScheme } = useTheme();
  const { signIn, signOut } = useAuthActions();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const navigate = useNavigate();

  // Voice
  const voicePreference = useQuery(api.ai.getVoicePreference);
  const setVoicePreference = useMutation(api.ai.setVoicePreference);
  const autoVoice = useQuery(api.ai.getAutoVoice);
  const setAutoVoice = useMutation(api.ai.setAutoVoice);

  // API Key
  const apiKeyStatus = useQuery(api.ai.getApiKeyStatus);
  const setApiKey = useMutation(api.ai.setApiKey);
  const clearApiKey = useMutation(api.ai.clearApiKey);

  // Color scheme (also persists to backend)
  const backendColorScheme = useQuery(api.ai.getColorScheme);
  const setBackendColorScheme = useMutation(api.ai.setColorScheme);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStep, setPasswordStep] = useState<"request" | "verify">("request");

  // API Key input state
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeySaving, setApiKeySaving] = useState(false);

  // Sync color scheme from backend on load
  if (backendColorScheme && backendColorScheme !== colorScheme && backendColorScheme !== "vigil-green") {
    setColorScheme(backendColorScheme as ColorScheme);
  }

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setApiKeySaving(true);
    try {
      await setApiKey({ apiKey: apiKeyInput.trim() });
      setApiKeyInput("");
      setShowApiKeyInput(false);
    } finally {
      setApiKeySaving(false);
    }
  };

  const handleClearApiKey = async () => {
    setApiKeySaving(true);
    try {
      await clearApiKey();
    } finally {
      setApiKeySaving(false);
    }
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    setBackendColorScheme({ colorScheme: scheme });
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", user?.email || "");
    formData.append("flow", "reset");

    try {
      await signIn("password", formData);
      setPasswordStep("verify");
    } catch {
      setError("Could not send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("email", user?.email || "");
    formData.append("flow", "reset-verification");

    try {
      await signIn("password", formData);
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordStep("request");
        setSuccess("");
      }, 1500);
    } catch {
      setError("Invalid code or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteAccount();
      await signOut();
      navigate("/");
    } catch {
      setError("Could not delete account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="-mt-10 pb-6">
          <div className="flex items-end gap-4">
            <Avatar className="size-16 border-4 border-background shadow-lg">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || <User className="size-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <p className="font-semibold">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="size-4 text-muted-foreground" />
            API Configuration
          </CardTitle>
          <CardDescription>
            OpenAI API key for Mirror AI, voice, training, and all AI-powered features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">API Key Status</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {apiKeyStatus?.hasKey ? (
                  <span className="text-success">
                    {apiKeyStatus.source === "user" ? "✓ Personal key active" : "✓ System key active"}
                    {apiKeyStatus.maskedKey && apiKeyStatus.source === "user" && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{apiKeyStatus.maskedKey}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-destructive">✗ No API key configured — AI features disabled</span>
                )}
              </p>
            </div>
            {apiKeyStatus?.source === "user" && (
              <Button variant="ghost" size="sm" onClick={handleClearApiKey} disabled={apiKeySaving}>
                <Trash2 className="size-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>

          {/* Add/Update key */}
          {showApiKeyInput ? (
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <Label htmlFor="api-key" className="text-sm font-medium">OpenAI API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={apiKeyVisible ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10 font-mono text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {apiKeyVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveApiKey} disabled={!apiKeyInput.trim() || apiKeySaving} size="sm">
                  {apiKeySaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowApiKeyInput(false); setApiKeyInput(""); }}>
                  Cancel
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your key is stored securely and used only for VIGIL system operations. Never shared externally.
              </p>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(true)}>
              <Key className="size-3.5 mr-1.5" />
              {apiKeyStatus?.source === "user" ? "Update API Key" : "Add API Key"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Voice Instructor */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="size-4 text-muted-foreground" />
            Voice Instructor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-voice toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="size-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="auto-voice" className="font-medium">Auto-Voice</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically speak all Mirror responses and training feedback
                </p>
              </div>
            </div>
            <Switch
              id="auto-voice"
              checked={autoVoice ?? false}
              onCheckedChange={(checked) => setAutoVoice({ enabled: checked })}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Select the voice used for Mirror responses, lesson narration, and training scenarios.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setVoicePreference({ voiceGender: "male" })}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                voicePreference === "male"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center ${
                voicePreference === "male" ? "bg-primary/20" : "bg-secondary"
              }`}>
                <span className="text-xl">🎙️</span>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Male</p>
                <p className="text-[10px] text-muted-foreground">Authoritative, grounding</p>
              </div>
              {voicePreference === "male" && (
                <Badge variant="outline" className="text-[9px] border-primary text-primary">Active</Badge>
              )}
            </button>
            <button
              onClick={() => setVoicePreference({ voiceGender: "female" })}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                voicePreference !== "male"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center ${
                voicePreference !== "male" ? "bg-primary/20" : "bg-secondary"
              }`}>
                <span className="text-xl">🎙️</span>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Female</p>
                <p className="text-[10px] text-muted-foreground">Warm, confident</p>
              </div>
              {voicePreference !== "male" && (
                <Badge variant="outline" className="text-[9px] border-primary text-primary">Active</Badge>
              )}
            </button>
          </div>
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Tone adapts to cognitive state</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" />
                <span className="text-muted-foreground">Stable → Calm, reinforcing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Strain → Steady, grounding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-chart-5" />
                <span className="text-muted-foreground">Drift → Firm, direct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Critical → Clear, unwavering</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-muted-foreground" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Choose an accent color for the VIGIL interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleColorSchemeChange(scheme.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                  colorScheme === scheme.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div
                  className="size-8 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: scheme.swatch }}
                />
                <div className="text-center">
                  <p className="font-medium text-[11px]">{scheme.label}</p>
                  <p className="text-[9px] text-muted-foreground">{scheme.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Dark/Light toggle */}
          {switchable && (
            <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                  {theme === "light" ? <Moon className="size-5 text-foreground" /> : <Sun className="size-5 text-foreground" />}
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">Dark mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark interface</p>
                </div>
              </div>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-muted-foreground" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <button
            onClick={() => setChangePasswordOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 text-left"
          >
            <div>
              <p className="font-medium text-sm">Change password</p>
              <p className="text-sm text-muted-foreground">Update your password</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setDeleteAccountOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-destructive/20 p-4 transition-colors hover:bg-destructive/5 text-left"
          >
            <div>
              <p className="font-medium text-sm text-destructive">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account</p>
            </div>
            <ChevronRight className="size-4 text-destructive" />
          </button>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {passwordStep === "request"
                ? "We'll send a verification code to your email."
                : "Enter the code from your email and your new password."}
            </DialogDescription>
          </DialogHeader>

          {passwordStep === "request" ? (
            <form onSubmit={handleRequestPasswordReset}>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  A reset code will be sent to: <span className="font-medium text-foreground">{user?.email}</span>
                </p>
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Send Code
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input id="code" name="code" type="text" placeholder="Enter code from email" autoComplete="one-time-code" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" minLength={6} autoComplete="new-password" required />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-success bg-success/10 rounded-lg px-3 py-2">{success}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setPasswordStep("request"); setError(""); }}>Back</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete your account?</p>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
