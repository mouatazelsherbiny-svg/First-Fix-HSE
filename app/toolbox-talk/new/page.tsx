"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import FileUpload from "@/components/FileUpload";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { PROJECTS, TRAINING_TOPICS, LECTURE_DURATIONS } from "@/lib/mockData";
import { UploadedFile } from "@/types/toolboxTalk";

export default function NewToolboxTalkPage() {
  return (
    <ProtectedRoute>
      <NewToolboxTalkForm />
    </ProtectedRoute>
  );
}

function NewToolboxTalkForm() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addRecord } = useToolboxTalk();
  const router = useRouter();

  const inductedBy = user ? `${user.name} (${user.employeeCode})` : "";

  const [projectName, setProjectName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");
  const [sessions, setSessions] = useState("");
  const [attendees, setAttendees] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const trainingManHours = useMemo(() => {
    const a = Number(attendees);
    const d = Number(lectureDuration);
    if (!a || !d) return 0;
    return a * d;
  }, [attendees, lectureDuration]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addRecord({
        projectName,
        siteLocation,
        date,
        inductedBy,
        topic,
        sessions: Number(sessions) || 0,
        attendees: Number(attendees) || 0,
        lectureDuration: Number(lectureDuration) || 0,
        trainingManHours,
        details,
        attachments,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.toolbox.formTitle}
        </h1>
        <p className="mt-1 text-sm text-brand-gray">{t.toolbox.formSubtitle}</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.toolbox.success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">{t.toolbox.projectName} *</label>
            <select
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.toolbox.projectPlaceholder}
              </option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.toolbox.siteLocation} *</label>
            <input
              type="text"
              required
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.toolbox.date} *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.toolbox.inductedBy}</label>
            <input
              type="text"
              value={inductedBy}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>

          <div>
            <label className="label-field">{t.toolbox.topic} *</label>
            <select
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.toolbox.topicPlaceholder}
              </option>
              {TRAINING_TOPICS.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.toolbox.sessions} *</label>
            <input
              type="number"
              required
              min={0}
              value={sessions}
              onChange={(e) => setSessions(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.toolbox.attendees} *</label>
            <input
              type="number"
              required
              min={0}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.toolbox.lectureDuration} *</label>
            <select
              required
              value={lectureDuration}
              onChange={(e) => setLectureDuration(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.toolbox.lectureDurationPlaceholder}
              </option>
              {LECTURE_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} {t.toolbox.minutesSuffix}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.toolbox.trainingManHours}</label>
            <input
              type="text"
              value={trainingManHours}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>
        </div>

        <div>
          <label className="label-field">{t.toolbox.details}</label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t.toolbox.detailsPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <FileUpload
          label={t.toolbox.attachments}
          files={attachments}
          onChange={setAttachments}
        />

        <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
          <button
            type="button"
            onClick={() => router.push("/toolbox-talk")}
            className="btn-secondary"
          >
            {t.form.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {t.toolbox.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
