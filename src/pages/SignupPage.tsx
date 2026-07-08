import { Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SignUp } from "@/components/SignUp";
import { TestUserLoginSection } from "@/components/TestUserLoginSection";
import { Button } from "@/components/ui/button";

export function SignupPage() {
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState<
    "nda" | "terms" | "privacy" | null
  >(null);

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Shield className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">VIGIL Academy</h1>
          <p className="text-muted-foreground text-sm">
            Veteran Identity Garrison for Intentional Living
          </p>
        </div>

        {/* ─── LEGAL NOTICE — BOLD, UNMISTAKABLE ─── */}
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
          <h2 className="text-sm font-bold text-center uppercase tracking-wider text-primary">
            ⚠️ Legal Notice — Read Before Proceeding
          </h2>
          <div className="text-xs leading-relaxed space-y-2">
            <p className="font-bold text-foreground">
              INTERACTION WITH ANY AND ALL VIGIL SYSTEMS, LLC AND VIGIL SYSTEMS,
              LLC LIMITED LIABILITY CORPORATION PLATFORMS, PRODUCTS, SERVICES,
              OR MATERIALS IS CONSIDERED AND LEGALLY BINDING AND CONSTITUTES
              AGREED UPON USE. ALL USERS ARE SUBJECT TO LEGAL RAMIFICATIONS FOR
              VIOLATIONS.
            </p>
            <p className="font-bold text-foreground">
              NO USER IS GRANTED PERMISSION — INFERRED OR OTHERWISE — TO UTILIZE
              ANY OF FOUNDER AND CREATOR STEVEN GONZALES' CONCEPTS, INTELLECTUAL
              PROPERTY, OR PROPRIETARY PROPERTY.
            </p>
            <p className="font-bold text-foreground">
              ALL CONTENT, SYSTEMS, DOCTRINE, ARCHITECTURE, CODE, AND TRAINING
              MATERIALS ARE THE EXCLUSIVE INTELLECTUAL PROPERTY OF VIGIL
              SYSTEMS, LLC AND FOUNDER STEVEN GONZALES. ALL RIGHTS RESERVED.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-1">
            <button
              onClick={() => setShowTerms(showTerms === "nda" ? null : "nda")}
              className="text-[10px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Non-Disclosure Agreement
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              onClick={() =>
                setShowTerms(showTerms === "terms" ? null : "terms")
              }
              className="text-[10px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Terms of Use
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              onClick={() =>
                setShowTerms(showTerms === "privacy" ? null : "privacy")
              }
              className="text-[10px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Privacy Policy
            </button>
          </div>

          {/* Expandable legal text */}
          {showTerms === "nda" && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-card/80 border border-border/30 p-3 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground mb-2">
                NON-DISCLOSURE AGREEMENT
              </p>
              <p>
                By creating an account, you agree that all information, systems,
                doctrine, training content, source code, architecture, and
                methodologies encountered on this platform are Confidential
                Information belonging exclusively to Vigil Systems, LLC and
                Founder Steven Gonzales.
              </p>
              <p className="mt-2">
                You agree to NOT disclose, reproduce, distribute,
                reverse-engineer, or create derivative works from any VIGIL
                material. No permission — inferred or otherwise — is granted to
                use any proprietary property.
              </p>
              <p className="mt-2">
                This NDA is perpetual and survives termination of access.
                Violations are subject to legal action including injunctive
                relief, compensatory and punitive damages, and attorney's fees.
              </p>
              <p className="mt-2 text-[9px]">
                Full NDA available in Documentation → Founder Doctrine after
                login.
              </p>
            </div>
          )}
          {showTerms === "terms" && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-card/80 border border-border/30 p-3 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground mb-2">TERMS OF USE</p>
              <p>
                By accessing this platform, you unconditionally agree to use it
                solely for authorized training and self-development. All
                accounts require Founder approval. The Founder retains absolute
                authority over all access decisions.
              </p>
              <p className="mt-2">
                You agree NOT to share, redistribute, or publicly post any
                content. You agree NOT to reverse-engineer or create competing
                systems. All intellectual property belongs exclusively to Vigil
                Systems, LLC.
              </p>
              <p className="mt-2">
                Access may be revoked at any time without notice. The platform
                is provided "AS IS" without warranties.
              </p>
              <p className="mt-2 text-[9px]">
                Full Terms of Use available in Documentation → Founder Doctrine
                after login.
              </p>
            </div>
          )}
          {showTerms === "privacy" && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-card/80 border border-border/30 p-3 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground mb-2">PRIVACY POLICY</p>
              <p>
                We collect only essential account, training, and session data.
                Voice data is processed in real-time and immediately discarded —
                never stored.
              </p>
              <p className="mt-2">
                We do NOT sell, share, or provide your data to any third party.
                We do NOT use tracking cookies, analytics, or advertising. We do
                NOT use your data to train external AI systems.
              </p>
              <p className="mt-2">
                You have the right to access, correct, and delete your data.
                Per-user engine isolation ensures your Mirror experience is
                private to you alone.
              </p>
              <p className="mt-2 text-[9px]">
                Full Privacy Policy available in Documentation → Founder
                Doctrine after login.
              </p>
            </div>
          )}

          {/* Acceptance checkbox */}
          <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-primary/40 accent-primary cursor-pointer"
            />
            <span className="text-[11px] font-bold leading-snug text-foreground">
              I have read and agree to the Non-Disclosure Agreement, Terms of
              Use, and Privacy Policy. I understand that all interaction with
              Vigil Systems, LLC is legally binding and that no permission is
              granted to use any proprietary property or intellectual property.
            </span>
          </label>
        </div>

        {/* Sign up form — only shown after agreement */}
        {agreed ? (
          <>
            <TestUserLoginSection />
            <SignUp />
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground font-medium">
              You must accept the legal agreements above to create an account.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto font-medium" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </p>

        <p className="text-[8px] text-muted-foreground/50 text-center leading-relaxed">
          © {new Date().getFullYear()} Vigil Systems, LLC. All Rights Reserved.
          Founder & Creator: Steven Gonzales.
        </p>
      </div>
    </div>
  );
}
