import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Map } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { analysisApi } from "@/api/analysis";
import { getErrorMessage } from "@/api/axios";
import { ErrorBanner } from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ScoreGauge from "@/components/ui/ScoreGauge";

const SkillList = ({ title, skills, variant }) => (
  <div>
    <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
    {skills?.length ? (
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge key={skill} variant={variant}>
            {skill}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-400">None</p>
    )}
  </div>
);

const BulletList = ({ items, icon: Icon, iconClass }) => (
  <ul className="space-y-2.5">
    {items?.map((item, idx) => (
      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
        <Icon size={16} className={`mt-0.5 shrink-0 ${iconClass}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const AnalysisDetailPage = () => {
  const { id } = useParams();
  const { data, loading, error } = useAsync(() => analysisApi.getById(id), [id]);
  const analysis = data?.data;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={getErrorMessage(error, "Couldn't load this analysis")} />;
  }

  if (!analysis) return null;

  return (
    <div>
      <Link to="/analysis" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back to history
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {analysis.resume?.fileName || "Resume analysis"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyzed {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <Link to={`/roadmaps?analysisId=${analysis._id}`} className="btn-primary">
          <Map size={16} />
          Build a roadmap from this
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center lg:col-span-1">
          <ScoreGauge score={analysis.atsScore} size={140} />
          <p className="mt-4 text-center text-sm text-slate-600">{analysis.summary}</p>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} /> Strengths
                </p>
                <BulletList items={analysis.strengths} icon={CheckCircle2} iconClass="text-emerald-500" />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                  <XCircle size={16} /> Weaknesses
                </p>
                <BulletList items={analysis.weaknesses} icon={XCircle} iconClass="text-rose-500" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SkillList title="Matched skills" skills={analysis.matchedSkills} variant="success" />
              <SkillList title="Missing skills" skills={analysis.missingSkills} variant="danger" />
            </div>
          </Card>

          <Card>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
              <Lightbulb size={16} /> Suggestions
            </p>
            <BulletList items={analysis.suggestions} icon={Lightbulb} iconClass="text-amber-500" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;
