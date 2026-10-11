import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock3, MessagesSquare } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { useAsync } from "@/hooks/useAsync";
import { roadmapApi } from "@/api/roadmaps";
import { getErrorMessage } from "@/api/axios";
import { ErrorBanner } from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const statusMeta = {
  not_started: { label: "Not started", icon: Circle, className: "text-slate-400" },
  in_progress: { label: "In progress", icon: Clock3, className: "text-amber-500" },
  completed: { label: "Completed", icon: CheckCircle2, className: "text-emerald-500" },
};

const nextStatus = {
  not_started: "in_progress",
  in_progress: "completed",
  completed: "not_started",
};

const RoadmapDetailPage = () => {
  const { id } = useParams();
  const { data, loading, error, setData } = useAsync(() => roadmapApi.getById(id), [id]);
  const [updatingId, setUpdatingId] = useState(null);
  const roadmap = data?.data;

  const handleToggleStatus = async (milestone) => {
    const status = nextStatus[milestone.status];
    setUpdatingId(milestone._id);
    try {
      const { data: updated } = await roadmapApi.updateMilestone(id, milestone._id, status);
      setData((prev) => ({ ...prev, data: updated }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update milestone"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={getErrorMessage(error, "Couldn't load this roadmap")} />;
  }

  if (!roadmap) return null;

  return (
    <div>
      <Link to="/roadmaps" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back to roadmaps
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{roadmap.targetRole}</h1>
          <p className="mt-1 text-sm text-slate-500">{roadmap.summary}</p>
        </div>
        <Link to="/interviews" className="btn-secondary">
          <MessagesSquare size={16} />
          Practice interview for this role
        </Link>
      </div>

      {roadmap.missingSkills?.length > 0 && (
        <Card className="mb-6">
          <p className="mb-2 text-sm font-medium text-slate-700">Skills to build</p>
          <div className="flex flex-wrap gap-1.5">
            {roadmap.missingSkills.map((skill) => (
              <Badge key={skill} variant="brand">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {roadmap.milestones?.map((milestone, idx) => {
          const meta = statusMeta[milestone.status] || statusMeta.not_started;
          const Icon = meta.icon;
          return (
            <Card key={milestone._id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                  {idx + 1}
                </span>
                {idx < roadmap.milestones.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-slate-200" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{milestone.title}</h3>
                  <button
                    onClick={() => handleToggleStatus(milestone)}
                    disabled={updatingId === milestone._id}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium transition hover:bg-slate-50",
                      meta.className,
                    )}
                  >
                    <Icon size={14} />
                    {updatingId === milestone._id ? "Updating…" : meta.label}
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{milestone.description}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Est. {milestone.estimatedWeeks} week{milestone.estimatedWeeks === 1 ? "" : "s"}
                </p>
                {milestone.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {milestone.skills.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                {milestone.resources?.length > 0 && (
                  <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-slate-500">
                    {milestone.resources.map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapDetailPage;
