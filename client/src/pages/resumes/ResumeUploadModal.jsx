import { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { resumeApi } from "@/api/resumes";
import { getErrorMessage } from "@/api/axios";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ResumeUploadModal = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const validateAndSetFile = (candidate) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      toast.error("File must be 5MB or smaller.");
      return;
    }
    setFile(candidate);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await resumeApi.upload(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      toast.success("Resume uploaded and analyzed for skills!");
      onUploaded?.(data);
      reset();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Upload failed"));
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Upload resume">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-brand-400 bg-brand-50" : "border-slate-300 hover:border-brand-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
        />
        {file ? (
          <>
            <FileText size={28} className="mb-2 text-brand-600" />
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="mt-1 text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <UploadCloud size={28} className="mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Drag & drop your resume here, or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-400">PDF only, up to 5MB</p>
          </>
        )}
      </div>

      {uploading && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!file} loading={uploading}>
          Upload & analyze
        </Button>
      </div>
    </Modal>
  );
};

export default ResumeUploadModal;
