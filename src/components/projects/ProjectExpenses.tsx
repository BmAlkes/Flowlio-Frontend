import { useState } from "react";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Center } from "../ui/center";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  PiggyBank,
  Receipt,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  useFetchProjectExpenses,
  useCreateProjectExpense,
  useDeleteProjectExpense,
} from "@/hooks/useProjectExpenses";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const EXPENSE_CATEGORIES = [
  { value: "labour", label: "Labour", color: "bg-blue-100 text-blue-800" },
  {
    value: "materials",
    label: "Materials",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "software",
    label: "Software",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "travel", label: "Travel", color: "bg-orange-100 text-orange-800" },
  {
    value: "equipment",
    label: "Equipment",
    color: "bg-cyan-100 text-cyan-800",
  },
  {
    value: "subcontractor",
    label: "Subcontractor",
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "miscellaneous",
    label: "Miscellaneous",
    color: "bg-muted text-gray-800",
  },
];

interface ProjectExpensesProps {
  projectId: string;
  budget?: number;
  isClient?: boolean;
  isModal?: boolean;
}

export const ProjectExpenses = ({
  projectId,
  budget = 0,
  isClient = false,
  isModal = false,
}: ProjectExpensesProps) => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // API hooks
  const { data: expensesData, isLoading } = useFetchProjectExpenses(projectId);
  const { mutate: createExpense, isPending: isCreating } =
    useCreateProjectExpense();
  const { mutate: deleteExpense, isPending: isDeleting } =
    useDeleteProjectExpense();

  const expenses = expensesData?.data || [];
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = budget - totalSpent;
  const percentUsed =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const handleAddExpense = () => {
    if (!amount || !description || !category || !date) {
      toast.error(t("common.fillAllFields"));
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error(t("expenses.invalidAmount"));
      return;
    }

    createExpense(
      {
        projectId,
        amount: numAmount,
        description,
        category,
        date,
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
          setCategory("");
          setDate(new Date().toISOString().split("T")[0]);
          setShowAddForm(false);
        },
      },
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(
      { projectId, expenseId },
      {
        onSuccess: () => {
          setDeleteConfirmId(null);
        },
      },
    );
  };

  const getCategoryInfo = (cat: string) => {
    return (
      EXPENSE_CATEGORIES.find((c) => c.value === cat) || {
        value: cat,
        label: cat,
        color: "bg-muted text-gray-800",
      }
    );
  };

  const getBudgetStatusColor = () => {
    if (percentUsed >= 90) return "text-red-600";
    if (percentUsed >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (percentUsed >= 90) return "[&>div]:bg-red-500";
    if (percentUsed >= 70) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-green-500";
  };

  if (isLoading) {
    return (
      <Center className="h-48">
        <Box className="flex items-center justify-center p-8">
          <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></Box>
          <Box className="ml-2 text-muted-foreground">
            {t("expenses.loading")}
          </Box>
        </Box>
      </Center>
    );
  }

  const content = (
    <>
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg p-3">
        <CardTitle className="flex items-center justify-between text-white">
          <Flex className="items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("expenses.financialTracking")}
          </Flex>
          {!isClient && (
            <Button
              variant="outline"
              size="sm"
              className="bg-card/20 border-white/40 text-white hover:bg-card/30 cursor-pointer mr-8 text-xs"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t("expenses.addExpense")}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {/* Budget Summary Cards */}
        {budget > 0 && (
          <Box className="space-y-4">
            <Box className="grid grid-cols-3 gap-3">
              {/* Total Budget */}
              <Box className="p-3 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-900/40">
                <Flex className="items-center gap-2 mb-1">
                  <Box className="p-1.5 bg-blue-200 dark:bg-blue-900/50 rounded-lg">
                    <Wallet className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  </Box>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Budget
                  </span>
                </Flex>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-300">
                  $
                  {budget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </Box>

              {/* Total Spent */}
              <Box className="p-3 bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-900/40">
                <Flex className="items-center gap-2 mb-1">
                  <Box className="p-1.5 bg-orange-200 dark:bg-orange-900/50 rounded-lg">
                    <TrendingUp className="h-3.5 w-3.5 text-orange-700 dark:text-orange-400" />
                  </Box>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Spent
                  </span>
                </Flex>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-300">
                  $
                  {totalSpent.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </Box>

              {/* Remaining */}
              <Box className="p-3 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl border border-green-200 dark:border-green-900/40">
                <Flex className="items-center gap-2 mb-1">
                  <Box className="p-1.5 bg-green-200 dark:bg-green-900/50 rounded-lg">
                    <PiggyBank className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
                  </Box>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Remaining
                  </span>
                </Flex>
                <p
                  className={`text-xl font-bold ${remaining >= 0 ? "text-green-900 dark:text-green-300" : "text-red-600"}`}
                >
                  $
                  {Math.abs(remaining).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                  {remaining < 0 && (
                    <span className="text-xs ml-1 font-normal">(over)</span>
                  )}
                </p>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box className="px-1">
              <Flex className="justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">
                  Budget Usage
                </span>
                <span
                  className={`text-xs font-semibold ${getBudgetStatusColor()}`}
                >
                  {percentUsed.toFixed(1)}%
                </span>
              </Flex>
              <Progress
                value={percentUsed}
                className={`h-2.5 bg-muted rounded-full ${getProgressColor()}`}
              />
              {percentUsed >= 90 && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  ⚠️ Budget nearly exhausted!
                </p>
              )}
            </Box>
          </Box>
        )}

        {budget === 0 && (
          <Box className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg">
            <Flex className="items-center gap-2">
              <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                No budget set for this project.{" "}
                {!isClient && (
                  <span className="font-medium">
                    Edit the project to set a budget.
                  </span>
                )}
              </p>
            </Flex>
          </Box>
        )}

        <Separator />

        {/* Expenses List */}
        <Box>
          <Flex className="items-center justify-between mb-3">
            <Flex className="items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Expense Log ({expenses.length})
              </span>
            </Flex>
            {expenses.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Total: $
                {totalSpent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            )}
          </Flex>

          {expenses.length === 0 ? (
            <Box className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-gray-50/50 dark:bg-muted/20">
              <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">
                No expenses recorded yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {!isClient
                  ? 'Click "Add Expense" to log your first expense'
                  : "No expenses have been logged for this project"}
              </p>
            </Box>
          ) : (
            <Box className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {expenses.map((expense) => {
                const catInfo = getCategoryInfo(expense.category);
                return (
                  <Box
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-border transition-colors group"
                  >
                    <Flex className="items-center gap-3 flex-1 min-w-0">
                      <Box className="flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={`${catInfo.color} text-xs px-2 py-0.5 border-0`}
                        >
                          {t(`expenses.categories.${catInfo.value}`) ||
                            catInfo.label}
                        </Badge>
                      </Box>
                      <Stack className="gap-0 flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                          {expense.description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), "MMM d, yyyy")}
                          {expense.createdByName &&
                            ` • ${expense.createdByName}`}
                        </span>
                      </Stack>
                    </Flex>
                    <Flex className="items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-sm font-bold text-foreground">
                        $
                        {Number(expense.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      {!isClient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => setDeleteConfirmId(expense.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </CardContent>
    </>
  );

  return (
    <>
      {isModal ? (
        <Box className="space-y-5">{content}</Box>
      ) : (
        <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-emerald-50/30 dark:to-emerald-900/10 p-0">
          {content}
        </Card>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Add Expense
            </DialogTitle>
            <DialogDescription>
              Log a new expense for this project.
            </DialogDescription>
          </DialogHeader>

          <Stack className="gap-4 py-2">
            {/* Amount */}
            <Box>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Amount ($) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-card rounded-lg"
                min="0"
                step="0.01"
              />
            </Box>

            {/* Category */}
            <Box>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(`expenses.categories.${cat.value}`) || cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>

            {/* Description */}
            <Box>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Contractor payment for week 1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-card rounded-lg"
              />
            </Box>

            {/* Date */}
            <Box>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-card rounded-lg"
              />
            </Box>
          </Stack>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={isCreating || !amount || !description || !category}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              {isCreating ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId && handleDeleteExpense(deleteConfirmId)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
