import { useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAsync } from "@/hooks/useAsync";
import { resumeApi } from "@/api/resumes";
import { analysisApi } from "@/api/analysis";
import { getErrorMessage } from "@/api/axios";
import { ErrorBanner } from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const ResumeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, loading, error } = useAsync(() => resumeApi.getById(id), [id]);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get("analyze") === "1");

  const resume = data?.data;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data: analysis } = await analysisApi.analyze(id, jobDescription);
      toast.success("Analysis complete!");
      navigate(`/analysis/${analysis._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Analysis failed"));
    } finally {
      setAnalyzing(false);
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
    return <ErrorBanner message={getErrorMessage(error, "Couldn't load this resume")} />;
  }

  if (!resume) return null;

  return (
    <div>
      <Link to="/resumes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back to resumes
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{resume.fileName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Uploaded {new Date(resume.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Extracted text preview</h2>
            <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {resume.extractedText?.slice(0, 2000) || "No text extracted."}
              {resume.extractedText?.length > 2000 && "…"}
            </p>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Run AI analysis</h2>
              {!showForm && (
                <Button icon={Sparkles} onClick={() => setShowForm(true)}>
                  Analyze this resume
                </Button>
              )}
            </div>
            {showForm && (
              <div className="space-y-3">
                <Textarea
                  label="Job description (optional, but recommended for a more targeted score)"
                  placeholder="Paste the job description you're targeting…"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowForm(false)} disabled={analyzing}>
                    Cancel
                  </Button>
                  <Button icon={Sparkles} onClick={handleAnalyze} loading={analyzing}>
                    Run analysis
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Detected skills</h2>
          {resume.skills?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill) => (
                <Badge key={skill} variant="brand">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No skills detected in this resume.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResumeDetailPage;
