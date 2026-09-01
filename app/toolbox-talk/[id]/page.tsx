"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";

export default function ToolboxTalkDetailPage() {
  return (
    <ProtectedRoute>
      <ToolboxTalkDetail />
    </ProtectedRoute>
  );
}

function ToolboxTalkDetail() {
  const { t, locale } = useLanguage();
  const params = useParams<{ id: string }>();
  const { getById } = useToolboxTalk();

  const record = getById(params.id);

  if (!record) {
    return (
      <div className="card text-center">
        <p className="text-sm text-brand-gray">Record not found.</p>
        <Link href="/toolbox-talk" className="btn-primary mt-4 inline-flex">
          {t.toolbox.back}
        </Link>
      </div>
    );
  }

  const dateStr = new Date(record.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/toolbox-talk"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.toolbox.back}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.toolbox.detailTitle}
        </h1>
        <p className="mt-1 text-sm text-brand-gray">
          {t.toolbox.recordedOn} {dateStr}
        </p>
      </div>

      <div className="card space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t.toolbox.projectName} value={record.projectName} />
          <Field label={t.toolbox.siteLocation} value={record.siteLocation} />
          <Field
            label={t.toolbox.date}
            value={
              record.date
                ? new Date(record.date).toLocaleDateString(
                    locale === "ar" ? "ar-EG" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )
                : "—"
            }
          />
          <Field label={t.toolbox.inductedBy} value={record.inductedBy} />
          <Field label={t.toolbox.topic} value={record.topic} />
          <Field label={t.toolbox.sessions} value={String(record.sessions)} />
          <Field label={t.toolbox.attendees} value={String(record.attendees)} />
          <Field
            label={t.toolbox.lectureDuration}
            value={`${record.lectureDuration} ${t.toolbox.minutesSuffix}`}
          />
          <Field
            label={t.toolbox.trainingManHours}
            value={String(record.trainingManHours)}
          />
        </dl>

        {record.details && (
          <div>
            <p className="label-field">{t.toolbox.details}</p>
            <p className="whitespace-pre-wrap rounded-xl bg-brand-grayLight/50 px-4 py-3 text-sm text-brand-grayDark">
              {record.details}
            </p>
          </div>
        )}

        {record.attachments.length > 0 && (
          <div>
            <p className="label-field">{t.toolbox.attachments}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {record.attachments.map((file, i) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
                  >
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand-orangeLight text-brand-orange">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-5 w-5"
                        >
                          <path
                            d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <span className="truncate text-xs font-medium text-brand-grayDark">
                      {file.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-gray">
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-black">{value}</dd>
    </div>
  );
}
