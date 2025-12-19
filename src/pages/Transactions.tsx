import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  createTransaction,
  Transaction,
  TransactionPayload,
} from "@/services/transactionService";
import {
  getCategories,
  Category as ApiCategory,
} from "@/services/categoryService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTemplates } from "@/contexts/TemplateContext";
import { z } from "zod";

const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount must be less than 1,000,000"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
});

const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount must be less than 1,000,000"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
});

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: apiTransactions, isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const { data: apiCategories, isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const transactions: Transaction[] = apiTransactions || [];

  const categories = useMemo(
    () =>
      (apiCategories || []).map((c: ApiCategory) => ({
        id: c.id,
        name: c.name,
      })),
    [apiCategories]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
  } = useTemplates();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
  });

  const createTransactionMutation = useMutation({
    mutationFn: (payload: TransactionPayload) => createTransaction(payload),
    onSuccess: () => {
      toast.success("Transaction added successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => {
      toast.error("Failed to add transaction");
    },
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = transactionSchema.parse({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
      });

      const payload: TransactionPayload = {
        description: validated.description,
        amount: validated.amount,
        type: validated.type,
        date: formData.date,
        // category id from select, if any
        category: formData.category ? Number(formData.category) : undefined,
      };

      await createTransactionMutation.mutateAsync(payload);

      setIsOpen(false);
      setFormData({
        description: "",
        amount: "",
        category: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleUseTemplate = (templateId: string) => {
    const template = getTemplate(templateId);
    if (template) {
      setFormData({
        description: template.description,
        amount: template.amount.toString(),
        category: template.category,
        type: template.type,
        date: new Date().toISOString().split("T")[0],
      });
      setIsOpen(true);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      toast.error("Please fill all transaction fields first");
      return;
    }

    setTemplateFormData({
      name: formData.description,
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      type: formData.type,
    });
    setIsTemplateOpen(true);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = templateSchema.parse({
        name: templateFormData.name,
        description: templateFormData.description,
        amount: parseFloat(templateFormData.amount),
        category: templateFormData.category,
        type: templateFormData.type,
      });

      if (editTemplateId) {
        updateTemplate(editTemplateId, {
          name: validated.name,
          description: validated.description,
          amount: validated.amount,
          category: validated.category,
          type: validated.type,
        });
        toast.success("Template updated successfully!");
      } else {
        addTemplate({
          name: validated.name,
          description: validated.description,
          amount: validated.amount,
          category: validated.category,
          type: validated.type,
        });
        toast.success("Template saved successfully!");
      }

      setIsTemplateOpen(false);
      setEditTemplateId(null);
      setTemplateFormData({
        name: "",
        description: "",
        amount: "",
        category: "",
        type: "expense",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = getTemplate(templateId);
    if (template) {
      setEditTemplateId(templateId);
      setTemplateFormData({
        name: template.name,
        description: template.description,
        amount: template.amount.toString(),
        category: template.category,
        type: template.type,
      });
      setIsTemplateOpen(true);
    }
  };

  const handleDeleteTemplate = () => {
    if (deleteTemplateId) {
      deleteTemplate(deleteTemplateId);
      toast.success("Template deleted successfully!");
      setDeleteTemplateId(null);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory =
      filterCategory === "all" ||
      (transaction.category !== null &&
        String(transaction.category) === filterCategory);

    return matchesSearch && matchesType && matchesCategory;
  });

  if (isTxLoading || isCatLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Manage all your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditTemplateId(null);
              setTemplateFormData({
                name: "",
                description: "",
                amount: "",
                category: "",
                type: "expense",
              });
              setIsTemplateOpen(true);
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Add a new transaction or use a template below
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="templates">Use Template</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <form onSubmit={handleAddTransaction} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: "income" | "expense") =>
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-primary"
                      >
                        Add Transaction
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAsTemplate}
                      >
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save as Template
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="templates" className="mt-4">
                  <div className="space-y-3">
                    {templates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No templates yet. Create one from the manual entry tab!
                      </p>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                template.type === "income"
                                  ? "bg-success/10"
                                  : "bg-destructive/10"
                              }`}
                            >
                              {template.type === "income" ? (
                                <ArrowUpRight className="h-5 w-5 text-success" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {template.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {template.description} • {template.category} • $
                                {template.amount}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template.id)}
                            className="bg-gradient-primary"
                          >
                            Use Template
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === "income"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(transaction as any).category_name || "Uncategorized"} •{" "}
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Management Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTemplateId ? "Edit Template" : "Save as Template"}
            </DialogTitle>
            <DialogDescription>
              Create a reusable template for quick transaction entry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Monthly Rent"
                value={templateFormData.name}
                onChange={(e) =>
                  setTemplateFormData({
                    ...templateFormData,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter description"
                value={templateFormData.description}
                onChange={(e) =>
                  setTemplateFormData({
                    ...templateFormData,
                    description: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={templateFormData.amount}
                  onChange={(e) =>
                    setTemplateFormData({
                      ...templateFormData,
                      amount: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={templateFormData.type}
                  onValueChange={(value: "income" | "expense") =>
                    setTemplateFormData({ ...templateFormData, type: value })
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
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={templateFormData.category}
                onValueChange={(value) =>
                  setTemplateFormData({ ...templateFormData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              {editTemplateId ? "Update Template" : "Save Template"}
            </Button>
          </form>

          {!editTemplateId && templates.length > 0 && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Existing Templates
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${template.amount} • {template.category}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTemplateId(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Template Confirmation */}
      <AlertDialog
        open={deleteTemplateId !== null}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction template. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
