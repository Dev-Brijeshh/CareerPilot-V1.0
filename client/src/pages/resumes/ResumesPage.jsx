import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Upload, Trash2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAsync } from "@/hooks/useAsync";
import { resumeApi } from "@/api/resumes";
import { getErrorMessage } from "@/api/axios";
import { PageHeader, ErrorBanner } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import ResumeUploadModal from "./ResumeUploadModal";

const ResumesPage = () => {
  const { data, loading, error, refetch } = useAsync(() => resumeApi.list());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const resumes = data?.data || [];

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await resumeApi.remove(pendingDelete._id);
      toast.success("Resume deleted");
      setPendingDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete resume"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Resumes"
        description="Upload a PDF resume to extract your skills and run AI-powered analyses."
        action={
          <Button icon={Upload} onClick={() => setUploadOpen(true)}>
            Upload resume
          </Button>
        }
      />

      {error && <ErrorBanner message={getErrorMessage(error)} onRetry={refetch} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your first resume to get skill extraction and AI analysis."
          action={
            <Button icon={Upload} onClick={() => setUploadOpen(true)}>
              Upload resume
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume._id} className="card flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={20} />
                </div>
                <button
                  onClick={() => setPendingDelete(resume)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Delete ${resume.fileName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-slate-900" title={resume.fileName}>
                {resume.fileName}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Uploaded {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(resume.skills || []).slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="brand">
                    {skill}
                  </Badge>
                ))}
                {resume.skills?.length > 4 && (
                  <Badge variant="neutral">+{resume.skills.length - 4} more</Badge>
                )}
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <Link to={`/resumes/${resume._id}`} className="btn-secondary flex-1 text-sm">
                  View details
                </Link>
                <Link to={`/resumes/${resume._id}?analyze=1`} className="btn-primary flex-1 text-sm">
                  <Sparkles size={14} />
                  Analyze
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResumeUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={refetch}
      />

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete resume?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </>
        }
      >
        This will permanently delete <strong>{pendingDelete?.fileName}</strong> and all of its
        analyses. This can't be undone.
      </Modal>
    </div>
  );
};

export default ResumesPage;
