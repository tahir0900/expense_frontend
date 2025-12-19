import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type TransactionTemplate = {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
};

type TemplateContextType = {
  templates: TransactionTemplate[];
  addTemplate: (template: Omit<TransactionTemplate, "id">) => void;
  updateTemplate: (id: string, template: Omit<TransactionTemplate, "id">) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => TransactionTemplate | undefined;
};

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const STORAGE_KEY = "expense-tracker-templates";

const defaultTemplates: TransactionTemplate[] = [
  { id: "1", name: "Monthly Rent", description: "Rent payment", amount: 1200, category: "Home", type: "expense" },
  { id: "2", name: "Salary", description: "Monthly salary", amount: 5000, category: "Income", type: "income" },
  { id: "3", name: "Grocery Shopping", description: "Weekly groceries", amount: 150, category: "Food", type: "expense" },
];

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<TransactionTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultTemplates;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (template: Omit<TransactionTemplate, "id">) => {
    const newTemplate: TransactionTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id: string, template: Omit<TransactionTemplate, "id">) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...template, id } : t)));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const getTemplate = (id: string) => {
    return templates.find((t) => t.id === id);
  };

  return (
    <TemplateContext.Provider
      value={{ templates, addTemplate, updateTemplate, deleteTemplate, getTemplate }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplateProvider");
  }
  return context;
};
