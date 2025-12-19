// src/services/settingsService.ts
import apiClient from "@/services/apiClient";
import type { AuthUser } from "@/services/authService";

export type Currency = "USD" | "EUR" | "GBP";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

export type UserProfile = {
  currency: Currency;
  date_format: DateFormat;
};

export type MeResponse = {
  user: AuthUser;
  profile: UserProfile;
};

export type ProfileUpdatePayload = {
  name?: string;
  email?: string;
  currency?: Currency;
  date_format?: DateFormat;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export const getMe = async (): Promise<MeResponse> => {
  const res = await apiClient.get<MeResponse>("me/");
  return res.data;
};

export const getProfile = async (): Promise<MeResponse> => {
  const res = await apiClient.get<MeResponse>("settings/profile/");
  return res.data;
};

export const updateProfile = async (
  payload: ProfileUpdatePayload
): Promise<MeResponse> => {
  const res = await apiClient.put<MeResponse>("settings/profile/", payload);
  return res.data;
};

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  await apiClient.post("settings/change-password/", payload);
};
