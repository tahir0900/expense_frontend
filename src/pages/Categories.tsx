import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Home,
  Car,
  DollarSign,
  Film,
  Heart,
  Utensils,
  Zap,
  Phone,
  Coffee,
  Gift,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryPayload,
} from "@/services/categoryService";

const iconOptions = [
  { value: "ShoppingCart", label: "Shopping Cart", icon: ShoppingCart },
  { value: "Utensils", label: "Utensils", icon: Utensils },
  { value: "Home", label: "Home", icon: Home },
  { value: "Car", label: "Car", icon: Car },
  { value: "DollarSign", label: "Dollar Sign", icon: DollarSign },
  { value: "Film", label: "Film", icon: Film },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Zap", label: "Utilities", icon: Zap },
  { value: "Phone", label: "Phone", icon: Phone },
  { value: "Coffee", label: "Coffee", icon: Coffee },
  { value: "Gift", label: "Gift", icon: Gift },
];

const getIconComponent = (iconName: string) => {
  const iconOption = iconOptions.find((opt) => opt.value === iconName);
  return iconOption ? iconOption.icon : ShoppingCart;
};

type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
  count: number;
  type?: string; // ok to leave like this
  budget?: number;
  spent?: number;
};

export default function Categories() {
  const queryClient = useQueryClient();

  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories: Category[] = useMemo(
    () =>
      (apiCategories || []).map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        type: c.type,
        budget: c.budget,
        count: c.count ?? 0,
        spent: c.spent ?? 0,
      })),
    [apiCategories]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    icon: "ShoppingCart",
    type: "expense",
    budget: 0,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Category added successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleOpenAdd = () => {
    setEditCategory(null);
    setFormData({
      name: "",
      color: "#3b82f6",
      icon: "ShoppingCart",
      type: "expense",
      budget: 0,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type || "expense",
      budget: category.budget || 0,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CategoryPayload = {
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
      type: formData.type as "income" | "expense",
      budget: formData.budget || 0,
    };

    try {
      if (editCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editCategory.id,
          payload,
        });
      } else {
        await createCategoryMutation.mutateAsync(payload);
      }
      setIsOpen(false);
    } catch {
      // toast already handled in onError
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteCategoryMutation.mutateAsync(deleteId);
      } finally {
        setDeleteId(null);
      }
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (filterType === "all") return true;
    if (filterType === "income") return category.type === "income";
    if (filterType === "expense") return category.type === "expense";
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-primary" onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          const budgetPercentage =
            category.budget && category.budget > 0
              ? Math.min(((category.spent || 0) / category.budget) * 100, 100)
              : 0;

          const getProgressColor = () => {
            if (budgetPercentage >= 100) return "bg-destructive";
            if (budgetPercentage >= 70) return "bg-yellow-500";
            return "bg-primary";
          };

          return (
            <Card
              key={category.id}
              className="bg-gradient-card border-border hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count ?? 0} transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {category.type === "expense" &&
                  category.budget &&
                  category.budget > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Budget Progress
                        </span>
                        <span
                          className={`font-medium ${
                            budgetPercentage >= 100
                              ? "text-destructive"
                              : budgetPercentage >= 70
                              ? "text-yellow-600 dark:text-yellow-500"
                              : "text-foreground"
                          }`}
                        >
                          ${category.spent} / ${category.budget}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getProgressColor()}`}
                          style={{ width: `${budgetPercentage}%` }}
                        />
                      </div>
                      {budgetPercentage >= 100 && (
                        <p className="text-xs text-destructive font-medium">
                          Over budget!
                        </p>
                      )}
                      {budgetPercentage >= 70 && budgetPercentage < 100 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">
                          {Math.round(100 - budgetPercentage)}% remaining
                        </p>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData({ ...formData, icon: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label>Monthly Budget (Optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.budget || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Set a monthly spending limit for this category
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              {editCategory ? "Update Category" : "Add Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-primary"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
