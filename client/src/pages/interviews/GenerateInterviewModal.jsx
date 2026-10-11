import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { interviewApi } from "@/api/interviews";
import { getErrorMessage } from "@/api/axios";

const GenerateInterviewModal = ({ open, onClose, onGenerated }) => {
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("junior");
  const [questionCount, setQuestionCount] = useState(6);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!targetRole.trim()) {
      toast.error("Enter a target role");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await interviewApi.generate({
        targetRole: targetRole.trim(),
        experienceLevel,
        questionCount: Number(questionCount),
      });
      toast.success("Mock interview ready!");
      onGenerated?.(data);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate interview"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Start a mock interview">
      <div className="space-y-4">
        <Input
          label="Target role"
          placeholder="e.g. Frontend Engineer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
        <Select
          label="Experience level"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
        >
          <option value="entry">Entry level</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid level</option>
          <option value="senior">Senior</option>
        </Select>
        <Select
          label="Number of questions"
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
        >
          {[4, 6, 8, 10, 12].map((n) => (
            <option key={n} value={n}>
              {n} questions
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Start interview
        </Button>
      </div>
    </Modal>
  );
};

export default GenerateInterviewModal;
