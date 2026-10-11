import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Map, Plus } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { roadmapApi } from "@/api/roadmaps";
import { getErrorMessage } from "@/api/axios";
import { PageHeader, ErrorBanner } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import GenerateRoadmapModal from "./GenerateRoadmapModal";

const completionOf = (roadmap) => {
  const total = roadmap.milestones?.length || 0;
  if (!total) return 0;
  const done = roadmap.milestones.filter((m) => m.status === "completed").length;
  return Math.round((done / total) * 100);
};

const RoadmapsPage = () => {
  const [searchParams] = useSearchParams();
  const { data, loading, error, refetch } = useAsync(() => roadmapApi.list());
  const [modalOpen, setModalOpen] = useState(false);
  const roadmaps = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Career Roadmaps"
        description="AI-generated, milestone-based plans to close your skill gaps for a target role."
        action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            New roadmap
          </Button>
        }
      />

      {error && <ErrorBanner message={getErrorMessage(error)} onRetry={refetch} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No roadmaps yet"
          description="Generate a personalized roadmap from one of your resume analyses."
          action={
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              New roadmap
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap) => {
            const pct = completionOf(roadmap);
            return (
              <Link key={roadmap._id} to={`/roadmaps/${roadmap._id}`} className="card transition hover:shadow-md">
                <p className="text-sm font-semibold text-slate-900">{roadmap.targetRole}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {roadmap.milestones?.length || 0} milestones · created{" "}
                  {new Date(roadmap.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <GenerateRoadmapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerated={refetch}
        defaultAnalysisId={searchParams.get("analysisId")}
      />
    </div>
  );
};

export default RoadmapsPage;
