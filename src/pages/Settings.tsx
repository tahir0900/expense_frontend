// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  getProfile,
  updateProfile,
  changePassword,
  type Currency,
  type DateFormat,
  type ProfileUpdatePayload,
} from "@/services/settingsService";

export default function Settings() {
  const { user } = useAuth();

  // profile fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [dateFormat, setDateFormat] = useState<DateFormat>("YYYY-MM-DD");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // fetch current profile from backend
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // when profile loads, sync into local state
  useEffect(() => {
    if (data) {
      setName(data.user.name);
      setEmail(data.user.email);
      setCurrency(data.profile.currency);
      setDateFormat(data.profile.date_format);
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || "Failed to change password";
      toast.error(msg);
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ProfileUpdatePayload = {
      name,
      email,
      currency,
      date_format: dateFormat,
    };

    updateProfileMutation.mutate(payload);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-full">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateProfileMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateProfileMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      
    </div>
  );
}
