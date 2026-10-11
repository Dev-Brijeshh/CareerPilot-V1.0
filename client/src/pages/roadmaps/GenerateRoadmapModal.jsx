import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { analysisApi } from "@/api/analysis";
import { roadmapApi } from "@/api/roadmaps";
import { getErrorMessage } from "@/api/axios";

const GenerateRoadmapModal = ({ open, onClose, onGenerated, defaultAnalysisId }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [analysisId, setAnalysisId] = useState(defaultAnalysisId || "");
  const [targetRole, setTargetRole] = useState("");
  const [currentSkillsText, setCurrentSkillsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingAnalyses(true);
    analysisApi
      .history()
      .then(({ data }) => {
        setAnalyses(data || []);
        const preset = defaultAnalysisId || data?.[0]?._id || "";
        setAnalysisId(preset);
        const match = data?.find((a) => a._id === preset);
        if (match?.matchedSkills?.length) {
          setCurrentSkillsText(match.matchedSkills.join(", "));
        }
      })
      .catch(() => toast.error("Couldn't load your analyses"))
      .finally(() => setLoadingAnalyses(false));
  }, [open, defaultAnalysisId]);

  const handleAnalysisChange = (id) => {
    setAnalysisId(id);
    const match = analyses.find((a) => a._id === id);
    if (match?.matchedSkills?.length) {
      setCurrentSkillsText(match.matchedSkills.join(", "));
    }
  };

  const handleSubmit = async () => {
    if (!analysisId) {
      toast.error("Select a resume analysis first");
      return;
    }
    if (!targetRole.trim()) {
      toast.error("Enter a target role");
      return;
    }
    setSubmitting(true);
    try {
      const currentSkills = currentSkillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { data } = await roadmapApi.generate({ analysisId, targetRole: targetRole.trim(), currentSkills });
      toast.success("Roadmap generated!");
      onGenerated?.(data);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate roadmap"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate a career roadmap">
      <div className="space-y-4">
        {loadingAnalyses ? (
          <p className="text-sm text-slate-500">Loading your analyses…</p>
        ) : analyses.length === 0 ? (
          <p className="text-sm text-slate-500">
            You need at least one resume analysis before generating a roadmap. Go to Resumes and
            run an analysis first.
          </p>
        ) : (
          <>
            <Select
              label="Base on which resume analysis?"
              value={analysisId}
              onChange={(e) => handleAnalysisChange(e.target.value)}
            >
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.resume?.fileName || "Resume"} — ATS {a.atsScore} (
                  {new Date(a.createdAt).toLocaleDateString()})
                </option>
              ))}
            </Select>
            <Input
              label="Target role"
              placeholder="e.g. Senior Frontend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Input
              label="Current skills (comma-separated)"
              placeholder="React, JavaScript, Node.js"
              value={currentSkillsText}
              onChange={(e) => setCurrentSkillsText(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={analyses.length === 0}>
          Generate roadmap
        </Button>
      </div>
    </Modal>
  );
};

export default GenerateRoadmapModal;
