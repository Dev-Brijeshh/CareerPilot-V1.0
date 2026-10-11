import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAsync } from "@/hooks/useAsync";
import { interviewApi } from "@/api/interviews";
import { getErrorMessage } from "@/api/axios";
import { ErrorBanner } from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import ScoreGauge from "@/components/ui/ScoreGauge";

const difficultyVariant = { easy: "success", medium: "warning", hard: "danger" };

const QuestionCard = ({ question, index, interviewId, onAnswered, disabled }) => {
  const [draft, setDraft] = useState(question.answer || "");
  const [submitting, setSubmitting] = useState(false);
  const isAnswered = question.score !== null && question.score !== undefined;

  const handleSubmit = async () => {
    if (!draft.trim()) {
      toast.error("Write an answer before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await interviewApi.answerQuestion(interviewId, question._id, draft.trim());
      onAnswered(question._id, data);
      toast.success("Answer evaluated!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to evaluate answer"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
          {index + 1}
        </span>
        <Badge variant="neutral">{question.category}</Badge>
        <Badge variant={difficultyVariant[question.difficulty] || "neutral"}>{question.difficulty}</Badge>
        {isAnswered && (
          <Badge variant={question.score >= 75 ? "success" : question.score >= 50 ? "warning" : "danger"}>
            Score {question.score}
          </Badge>
        )}
      </div>
      <p className="mb-3 text-sm font-medium text-slate-900">{question.question}</p>

      {question.expectedFocus?.length > 0 && (
        <p className="mb-3 text-xs text-slate-400">
          Focus on: {question.expectedFocus.join(", ")}
        </p>
      )}

      {isAnswered ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Your answer</p>
            {question.answer}
          </div>
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-slate-700">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
              <Sparkles size={12} /> AI Feedback
            </p>
            {question.feedback}
          </div>
          {(question.strengths?.length > 0 || question.improvements?.length > 0) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.strengths?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-emerald-700">Strengths</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
                    {question.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {question.improvements?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-amber-700">Could improve</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
                    {question.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            placeholder="Type your answer here…"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={disabled}
          />
          <div className="flex justify-end">
            <Button icon={Send} onClick={handleSubmit} loading={submitting} disabled={disabled}>
              Submit answer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const InterviewSessionPage = () => {
  const { id } = useParams();
  const { data, loading, error, setData } = useAsync(() => interviewApi.getById(id), [id]);
  const [completing, setCompleting] = useState(false);
  const interview = data?.data;

  const handleAnswered = (questionId, updatedQuestion) => {
    setData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        questions: prev.data.questions.map((q) => (q._id === questionId ? updatedQuestion : q)),
      },
    }));
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const { data: completed } = await interviewApi.complete(id);
      setData((prev) => ({ ...prev, data: completed }));
      toast.success("Interview completed!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to complete interview"));
    } finally {
      setCompleting(false);
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
    return <ErrorBanner message={getErrorMessage(error, "Couldn't load this interview")} />;
  }

  if (!interview) return null;

  const answeredCount = interview.questions.filter((q) => q.score !== null && q.score !== undefined).length;
  const isCompleted = interview.status === "completed";

  return (
    <div>
      <Link to="/interviews" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back to interviews
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{interview.targetRole}</h1>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {interview.experienceLevel} level · {answeredCount}/{interview.questions.length} answered
          </p>
        </div>
        {!isCompleted && (
          <Button
            icon={CheckCircle2}
            onClick={handleComplete}
            loading={completing}
            disabled={answeredCount === 0}
          >
            Complete interview
          </Button>
        )}
      </div>

      {isCompleted && (
        <Card className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <ScoreGauge score={interview.overallScore || 0} label="Overall" size={120} />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900">Overall feedback</h2>
            <p className="mt-1.5 text-sm text-slate-600">{interview.summary}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {interview.overallStrengths?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-emerald-700">Strengths</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
                    {interview.overallStrengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {interview.overallImprovements?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-amber-700">Areas to improve</p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
                    {interview.overallImprovements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {interview.questions.map((question, idx) => (
          <QuestionCard
            key={question._id}
            question={question}
            index={idx}
            interviewId={interview._id}
            onAnswered={handleAnswered}
            disabled={isCompleted}
          />
        ))}
      </div>
    </div>
  );
};

export default InterviewSessionPage;
