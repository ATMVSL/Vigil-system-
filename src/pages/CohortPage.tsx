import { useMutation, useQuery } from "convex/react";
import { FileSpreadsheet, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function CohortPage() {
  const [selectedCohortId, setSelectedCohortId] =
    useState<Id<"cohorts"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortType, setNewCohortType] = useState<
    "veterans" | "reentry" | "operators" | "agency_partners"
  >("veterans");
  const [newDescription, setNewDescription] = useState("");

  const cohorts = useQuery(api.cohorts.listCohorts);
  const createCohort = useMutation(api.cohorts.createCohort);
  const cohortReport = useQuery(
    api.cohorts.getCohortReport,
    selectedCohortId ? { cohortId: selectedCohortId } : "skip",
  );

  const handleCreate = async () => {
    if (!newCohortName.trim()) return;
    const now = Date.now();
    const id = await createCohort({
      name: newCohortName,
      type: newCohortType,
      description: newDescription,
      startDate: now,
      endDate: now + 1000 * 60 * 60 * 24 * 90, // 90 days
    });
    setNewCohortName("");
    setShowCreateModal(false);
    setSelectedCohortId(id);
  };

  const exportCSV = () => {
    if (!cohortReport) return;
    const headers =
      "Name,Email,Role,UserRole,CompletedCourses,AvgProgress,Certifications\n";
    const rows = cohortReport.members
      .map(
        (m: any) =>
          `"${m.name}","${m.email}","${m.role}","${m.userRole}",${m.completedCourses},${m.avgProgress}%,${m.totalCertifications}`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cohortReport.cohort.name.replace(/\s+/g, "_")}_Agency_Report.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-1">
            <Users className="size-4" />
            VIII. Cohort & Agency Management
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Cohort Tracking & Agency Reporting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage operator groups for Veterans, Reentry, Operators, and Agency
            Partners.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 bg-primary text-primary-foreground"
        >
          <Plus className="size-4" /> Create Cohort
        </Button>
      </div>

      {/* Cohort Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(cohorts as any)?.map((c: any) => (
          <Card
            key={c._id}
            onClick={() => setSelectedCohortId(c._id)}
            className={`cursor-pointer transition-all border ${
              selectedCohortId === c._id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 hover:border-primary/40 bg-card"
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-mono border-primary/30 text-primary"
                >
                  {c.type}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {c.status}
                </Badge>
              </div>
              <CardTitle className="text-sm font-semibold mt-2">
                {c.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>{c.memberCount} Members</span>
                <span>Active</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Cohort Agency Report */}
      {cohortReport ? (
        <div className="space-y-6 pt-4 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {cohortReport.cohort.name} — Agency Summary
              </h2>
              <p className="text-xs text-muted-foreground">
                Type:{" "}
                <span className="uppercase font-mono">
                  {cohortReport.cohort.type}
                </span>{" "}
                | Status: {cohortReport.cohort.status}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="gap-2"
            >
              <FileSpreadsheet className="size-4 text-emerald-500" />
              Export Agency Report (CSV)
            </Button>
          </div>

          {/* Metric Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/60">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">
                  Total Cohort Members
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {cohortReport.totalMembers}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">
                  Average Course Progress
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-primary">
                  {cohortReport.overallAvgProgress}%
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Progress
                  value={cohortReport.overallAvgProgress}
                  className="h-1.5 mt-2"
                />
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">
                  Certifications Issued
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-emerald-400">
                  {cohortReport.totalCertificationsIssued}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Members Table */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Operator Roster & Pathway Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground uppercase font-mono">
                      <th className="py-3 px-3">Operator Name</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Completed Courses</th>
                      <th className="py-3 px-3">Avg Progress</th>
                      <th className="py-3 px-3">Certifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {cohortReport.members.map((m: any) => (
                      <tr key={m.userId} className="hover:bg-muted/20">
                        <td className="py-3 px-3 font-medium text-foreground">
                          {m.name}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className="capitalize text-[10px]"
                          >
                            {m.userRole}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          {m.completedCourses} Courses
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={m.avgProgress}
                              className="w-16 h-1.5"
                            />
                            <span>{m.avgProgress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {m.totalCertifications} Certs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground text-sm border border-dashed border-border/60 rounded-xl">
          Select a cohort above to view agency reports and member progress.
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/70 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">
              Create New Cohort
            </h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="cohort-name-input"
                  className="text-xs font-medium text-muted-foreground block mb-1"
                >
                  Cohort Name
                </label>
                <input
                  id="cohort-name-input"
                  type="text"
                  value={newCohortName}
                  onChange={e => setNewCohortName(e.target.value)}
                  placeholder="e.g. Veterans Cohort Alpha-2026"
                  className="w-full p-2.5 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="cohort-type-select"
                  className="text-xs font-medium text-muted-foreground block mb-1"
                >
                  Cohort Type
                </label>
                <select
                  id="cohort-type-select"
                  value={newCohortType}
                  onChange={(e: any) => setNewCohortType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="veterans">Veterans</option>
                  <option value="reentry">Reentry</option>
                  <option value="operators">Operators</option>
                  <option value="agency_partners">Agency Partners</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cohort-description-input"
                  className="text-xs font-medium text-muted-foreground block mb-1"
                >
                  Description
                </label>
                <textarea
                  id="cohort-description-input"
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Cohort goals and partner details..."
                  className="w-full p-2.5 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-primary text-primary-foreground"
              >
                Create Cohort
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
