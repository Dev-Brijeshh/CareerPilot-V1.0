import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessagesSquare, Plus } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { interviewApi } from "@/api/interviews";
import { getErrorMessage } from "@/api/axios";
import { PageHeader, ErrorBanner } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import GenerateInterviewModal from "./GenerateInterviewModal";

const scoreVariant = (score) => (score >= 75 ? "success" : score >= 50 ? "warning" : "danger");

const InterviewsPage = () => {
  const { data, loading, error, refetch } = useAsync(() => interviewApi.list());
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const interviews = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Mock Interviews"
        description="Practice role-specific interview questions and get instant AI feedback."
        action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            New interview
          </Button>
        }
      />

      {error && <ErrorBanner message={getErrorMessage(error)} onRetry={refetch} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No mock interviews yet"
          description="Start a mock interview to practice for your target role."
          action={
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              New interview
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const answered = interview.questions?.filter((q) => q.score !== null).length ?? 0;
            return (
              <Link
                key={interview._id}
                to={`/interviews/${interview._id}`}
                className="card flex flex-col justify-between gap-3 transition hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{interview.targetRole}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {interview.experienceLevel} level · {answered}/{interview.questions?.length || 0} answered
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={interview.status === "completed" ? "success" : "warning"}>
                    {interview.status === "completed" ? "Completed" : "In progress"}
                  </Badge>
                  {interview.overallScore !== null && interview.overallScore !== undefined && (
                    <Badge variant={scoreVariant(interview.overallScore)}>
                      Score {interview.overallScore}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <GenerateInterviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerated={(interview) => navigate(`/interviews/${interview._id}`)}
      />
    </div>
  );
};

export default InterviewsPage;
