import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/api/auth";
import { getErrorMessage } from "@/api/axios";
import { updateProfileSchema, changePasswordSchema } from "@/utils/validationSchemas";

const ProfilePage = () => {
  const { user, updateUserInPlace, logout } = useAuth();
  const navigate = useNavigate();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name || "", email: user?.email || "" },
  });

  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      const { data } = await userApi.updateProfile(values);
      updateUserInPlace(data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      await userApi.changePassword(values);
      toast.success("Password changed");
      passwordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userApi.deleteAccount();
      toast.success("Account deleted");
      await logout();
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete account"));
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details and security." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Account details</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register("name")}
            />
            <Input
              label="Email"
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register("email")}
            />
            <Button type="submit" loading={savingProfile}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Change password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register("currentPassword")}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword")}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.confirmNewPassword?.message}
              {...passwordForm.register("confirmNewPassword")}
            />
            <Button type="submit" loading={savingPassword}>
              Update password
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6 border-rose-200">
        <h2 className="mb-1 text-base font-semibold text-rose-700">Danger zone</h2>
        <p className="mb-4 text-sm text-slate-500">
          Deleting your account permanently removes all your resumes, analyses, roadmaps, and
          interviews. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete my account
        </Button>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>
              Yes, delete everything
            </Button>
          </>
        }
      >
        This will permanently delete your account and all associated data. This action cannot be
        undone.
      </Modal>
    </div>
  );
};

export default ProfilePage;
