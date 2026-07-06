import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { APP_NAME } from "./constants";

declare const process: { env: Record<string, string | undefined> };

// Founder email for all approval notifications
const FOUNDER_NOTIFICATION_EMAIL = "steven.gonzales@vigilsysllc.com";

/**
 * Send a notification email to the Founder when a new applicant signs up.
 * Called as an internal action from the initProfile mutation.
 */
export const notifyFounderNewApplicant = internalAction({
  args: {
    applicantEmail: v.string(),
    applicantId: v.string(),
    timestamp: v.number(),
  },
  handler: async (_ctx, { applicantEmail, timestamp }) => {
    const apiUrl = process.env.VIKTOR_SPACES_API_URL;
    const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
    const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

    if (!apiUrl || !projectName || !projectSecret) {
      console.error("Viktor Spaces email env vars not configured — skipping notification");
      return;
    }

    const date = new Date(timestamp).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    try {
      const response = await fetch(`${apiUrl}/api/viktor-spaces/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          project_secret: projectSecret,
          to_email: FOUNDER_NOTIFICATION_EMAIL,
          subject: `New Academy Applicant — ${APP_NAME}`,
          html_content: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #4a7c59; padding-bottom: 10px;">
                🛡️ New Academy Applicant
              </h2>
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #4a7c59;">
                <p style="color: #333; margin: 0 0 8px 0;"><strong>Email:</strong> ${applicantEmail}</p>
                <p style="color: #666; margin: 0;"><strong>Applied:</strong> ${date}</p>
              </div>
              <p style="color: #666;">
                A new user has registered for the VIGIL Academy and is awaiting your approval. 
                Log in to your Founder Mirror to review and approve or deny access.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://preview-vigil-mirror-3ca2ac54.viktor.space/mirror" 
                   style="display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Review in Founder Mirror
                </a>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                ${APP_NAME} — Veteran Identity Garrison for Intentional Living
              </p>
            </div>
          `,
          text_content: `New Academy Applicant\n\nEmail: ${applicantEmail}\nApplied: ${date}\n\nLog in to your Founder Mirror to review and approve or deny access.\n\n---\n${APP_NAME}`,
          email_type: "notification",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send founder notification: ${error}`);
      }
    } catch (err) {
      console.error("Error sending founder notification:", err);
    }
  },
});

/**
 * Send approval/denial notification to the applicant.
 */
export const notifyApplicantDecision = internalAction({
  args: {
    applicantEmail: v.string(),
    approved: v.boolean(),
  },
  handler: async (_ctx, { applicantEmail, approved }) => {
    const apiUrl = process.env.VIKTOR_SPACES_API_URL;
    const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
    const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

    if (!apiUrl || !projectName || !projectSecret) {
      console.error("Viktor Spaces email env vars not configured — skipping notification");
      return;
    }

    const subject = approved
      ? `Access Approved — ${APP_NAME}`
      : `Application Update — ${APP_NAME}`;

    const htmlContent = approved
      ? `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🛡️ Welcome to the VIGIL Academy</h2>
          <p style="color: #666;">
            Your application has been approved by the Founder. You now have full access to the VIGIL Academy platform.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://preview-vigil-mirror-3ca2ac54.viktor.space" 
               style="display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Enter the Academy
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">${APP_NAME} — Veteran Identity Garrison for Intentional Living</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Application Update</h2>
          <p style="color: #666;">
            Your application to the VIGIL Academy has not been approved at this time. 
            If you believe this is an error, please contact the administrator.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center;">${APP_NAME}</p>
        </div>
      `;

    try {
      const response = await fetch(`${apiUrl}/api/viktor-spaces/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          project_secret: projectSecret,
          to_email: applicantEmail,
          subject,
          html_content: htmlContent,
          text_content: approved
            ? "Your VIGIL Academy application has been approved. Welcome!"
            : "Your VIGIL Academy application has not been approved at this time.",
          email_type: "notification",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send applicant notification: ${error}`);
      }
    } catch (err) {
      console.error("Error sending applicant notification:", err);
    }
  },
});
