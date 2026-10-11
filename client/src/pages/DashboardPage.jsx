import { Link } from "react-router-dom";
import { FileText, Sparkles, Map, MessagesSquare, Upload, ArrowRight } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { resumeApi } from "@/api/resumes";
import { analysisApi } from "@/api/analysis";
import { roadmapApi } from "@/api/roadmaps";
import { interviewApi } from "@/api/interviews";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, ErrorBanner } from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

const StatCard = ({ icon: Icon, label, value, to, accent }) => (
  <Link to={to} className="card flex items-center justify-between transition hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
      <Icon size={22} />
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const resumes = useAsync(() => resumeApi.list());
  const analyses = useAsync(() => analysisApi.history());
  const roadmaps = useAsync(() => roadmapApi.list());
  const interviews = useAsync(() => interviewApi.list());

  const loading = resumes.loading || analyses.loading || roadmaps.loading || interviews.loading;
  const anyError = resumes.error || analyses.error || roadmaps.error || interviews.error;

  const latestAnalysis = analyses.data?.data?.[0];
  const latestInterview = interviews.data?.data?.find((i) => i.status === "completed");

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's a snapshot of your job-search progress."
      />

      {anyError && (
        <div className="mb-6">
          <ErrorBanner message="Couldn't load some of your dashboard data." />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Resumes uploaded"
              value={resumes.data?.data?.length ?? 0}
              to="/resumes"
              accent="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Sparkles}
              label="Analyses run"
              value={analyses.data?.data?.length ?? 0}
              to="/analysis"
              accent="bg-violet-50 text-violet-600"
            />
            <StatCard
              icon={Map}
              label="Career roadmaps"
              value={roadmaps.data?.data?.length ?? 0}
              to="/roadmaps"
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={MessagesSquare}
              label="Mock interviews"
              value={interviews.data?.data?.length ?? 0}
              to="/interviews"
              accent="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Latest resume analysis</h2>
                <Link to="/analysis" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              </div>
              {latestAnalysis ? (
                <Link
                  to={`/analysis/${latestAnalysis._id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {latestAnalysis.resume?.fileName || "Resume"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={latestAnalysis.atsScore >= 75 ? "success" : latestAnalysis.atsScore >= 50 ? "warning" : "danger"}>
                    ATS {latestAnalysis.atsScore}
                  </Badge>
                </Link>
              ) : (
                <EmptyLink
                  text="No analyses yet. Upload a resume and run your first analysis."
                  to="/resumes"
                  cta="Upload a resume"
                  icon={Upload}
                />
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Latest completed interview</h2>
                <Link to="/interviews" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              </div>
              {latestInterview ? (
                <Link
                  to={`/interviews/${latestInterview._id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{latestInterview.targetRole}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {latestInterview.experienceLevel} level
                    </p>
                  </div>
                  <Badge variant={latestInterview.overallScore >= 75 ? "success" : latestInterview.overallScore >= 50 ? "warning" : "danger"}>
                    Score {latestInterview.overallScore}
                  </Badge>
                </Link>
              ) : (
                <EmptyLink
                  text="No completed interviews yet. Practice a mock interview to see feedback here."
                  to="/interviews"
                  cta="Start a mock interview"
                  icon={ArrowRight}
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyLink = ({ text, to, cta, icon: Icon }) => (
  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
    <p className="text-sm text-slate-500">{text}</p>
    <Link to={to} className="btn-secondary mt-4 inline-flex">
      <Icon size={16} />
      {cta}
    </Link>
  </div>
);

export default DashboardPage;
