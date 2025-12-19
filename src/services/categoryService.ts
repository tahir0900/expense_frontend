// src/services/categoryService.ts
import apiClient from "@/services/apiClient";

export type CategoryType = "income" | "expense";

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
  budget: number;
};

export type CategoryPayload = {
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
  budget: number;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get<Category[]>("categories/");
  return res.data;
};

export const createCategory = async (
  payload: CategoryPayload
): Promise<Category> => {
  const res = await apiClient.post<Category>("categories/", payload);
  return res.data;
};

export const updateCategory = async (
  id: number,
  payload: CategoryPayload
): Promise<Category> => {
  const res = await apiClient.put<Category>(`categories/${id}/`, payload);
  return res.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`categories/${id}/`);
};
