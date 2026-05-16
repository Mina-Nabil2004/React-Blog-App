import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Trash2, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from '../../schemas/auth.schemas';
import { apiUpdateMe, apiUploadAvatar, apiDeleteAvatar } from '../../api/users';
import { apiChangePassword } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { resolveImageUrl } from '../../utils/imageUrl';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Profile form ────────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    setProfileLoading(true);
    try {
      const updated = await apiUpdateMe(data);
      updateUser(updated);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const updated = await apiUploadAvatar(fd);
      updateUser(updated);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarLoading(true);
    try {
      await apiDeleteAvatar();
      updateUser({ ...user!, avatarUrl: null });
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  // ── Change password form ────────────────────────────────────────────────────
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) });

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      await apiChangePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPwd();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to change password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const avatarUrl = resolveImageUrl(user?.avatarUrl);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content-primary">Profile Settings</h1>
        <p className="mt-1 text-sm text-content-secondary">Manage your account details and security.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── Avatar card ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-surface-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-content-primary">
            <User size={16} /> Avatar
          </h2>
          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative h-20 w-20 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover border-2 border-surface-border"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 border-2 border-surface-border">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
              >
                <Camera size={14} /> Upload photo
              </Button>
              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAvatarDelete}
                  disabled={avatarLoading}
                  className="text-danger-500 hover:text-danger-600"
                >
                  <Trash2 size={14} /> Remove photo
                </Button>
              )}
              <p className="text-xs text-content-tertiary">JPG, PNG or WEBP. Max 2 MB.</p>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* ── Profile info card ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-surface-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-content-primary">
            <User size={16} /> Personal Info
          </h2>
          <form onSubmit={handleProfile(onProfileSubmit)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              error={profileErrors.name?.message}
              {...regProfile('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={profileErrors.email?.message}
              {...regProfile('email')}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={profileLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* ── Change password card ──────────────────────────────────── */}
        <div className="rounded-2xl border border-surface-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-content-primary">
            <Lock size={16} /> Change Password
          </h2>
          <form onSubmit={handlePwd(onPasswordSubmit)} className="flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={pwdErrors.currentPassword?.message}
              {...regPwd('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              error={pwdErrors.newPassword?.message}
              {...regPwd('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              error={pwdErrors.confirmPassword?.message}
              {...regPwd('confirmPassword')}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
