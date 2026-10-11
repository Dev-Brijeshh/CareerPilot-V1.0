import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { analysisApi } from "@/api/analysis";
import { getErrorMessage } from "@/api/axios";
import { PageHeader, ErrorBanner } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const scoreVariant = (score) => (score >= 75 ? "success" : score >= 50 ? "warning" : "danger");

const AnalysisHistoryPage = () => {
  const { data, loading, error, refetch } = useAsync(() => analysisApi.history());
  const analyses = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Analysis History"
        description="Every resume analysis you've run, with ATS scores and AI feedback."
      />

      {error && <ErrorBanner message={getErrorMessage(error)} onRetry={refetch} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No analyses yet"
          description="Upload a resume and run an AI analysis to see your ATS score and feedback here."
          action={
            <Link to="/resumes">
              <Button>Go to resumes</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <Link
              key={analysis._id}
              to={`/analysis/${analysis._id}`}
              className="card flex flex-col justify-between gap-3 transition hover:shadow-md sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {analysis.resume?.fileName || "Deleted resume"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(analysis.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="neutral">
                  {analysis.matchedSkills?.length ?? 0} matched · {analysis.missingSkills?.length ?? 0} missing
                </Badge>
                <Badge variant={scoreVariant(analysis.atsScore)}>ATS {analysis.atsScore}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistoryPage;
