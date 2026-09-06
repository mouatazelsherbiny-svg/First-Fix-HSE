"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  employee_code: string;
  project: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute>
      <UserManagementView />
    </ProtectedRoute>
  );
}

function UserManagementView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, employee_code, project, role, is_approved, created_at")
      .order("created_at", { ascending: false });
    setProfiles((data as ProfileRow[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    loadProfiles();
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await supabase.from("profiles").update({ is_approved: true }).eq("id", id);
    await loadProfiles();
    setBusyId(null);
  };

  if (!isAdmin) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-brand-gray">{t.userManagement.accessDenied}</p>
      </div>
    );
  }

  const pending = profiles.filter((p) => !p.is_approved);
  const approved = profiles.filter((p) => p.is_approved);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.userManagement.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.userManagement.subtitle}</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gray">
          {t.userManagement.pendingSection}
          {pending.length > 0 && (
            <span className="ms-2 rounded-full bg-brand-orange/20 px-2 py-0.5 text-xs font-bold text-brand-orange">
              {pending.length}
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-brand-gray">{t.userManagement.noPending}</p>
          </div>
        ) : (
          <div className="card overflow-x-auto !p-0">
            <table className="w-full min-w-[900px] text-start text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <th className="px-4 py-3 text-start">{t.userManagement.colName}</th>
                  <th className="px-4 py-3 text-start">{t.userManagement.colEmail}</th>
                  <th className="px-4 py-3 text-start">{t.userManagement.colEmployeeCode}</th>
                  <th className="px-4 py-3 text-start">{t.userManagement.colProject}</th>
                  <th className="px-4 py-3 text-start">{t.userManagement.colRequestedAt}</th>
                  <th className="px-4 py-3 text-end">{t.userManagement.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                  >
                    <td className="px-4 py-3 font-semibold text-brand-black">{p.full_name || "—"}</td>
                    <td className="px-4 py-3 text-brand-grayDark">{p.email || "—"}</td>
                    <td className="px-4 py-3 text-brand-grayDark">{p.employee_code || "—"}</td>
                    <td className="px-4 py-3 text-brand-grayDark">{p.project || "—"}</td>
                    <td className="px-4 py-3 text-brand-grayDark">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => handleApprove(p.id)}
                        disabled={busyId === p.id}
                        className="btn-primary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="me-1.5 h-3.5 w-3.5" />
                        {busyId === p.id ? t.userManagement.approving : t.userManagement.approve}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gray">
          {t.userManagement.allApprovedSection}
        </h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[900px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start">{t.userManagement.colName}</th>
                <th className="px-4 py-3 text-start">{t.userManagement.colEmail}</th>
                <th className="px-4 py-3 text-start">{t.userManagement.colEmployeeCode}</th>
                <th className="px-4 py-3 text-start">{t.userManagement.colProject}</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 font-semibold text-brand-black">
                    {p.full_name || "—"}
                    {p.role === "admin" && (
                      <span className="ms-2 rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-gold">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{p.email || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{p.employee_code || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{p.project || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
