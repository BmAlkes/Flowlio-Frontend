import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { format } from "date-fns";
import { Center } from "@/components/ui/center";
import { Loader2, X, Edit, Calendar, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { TableSkeleton } from "@/components/skeletons";

type DemoOrg = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  email: string | null;
  userName: string | null;
  userRole: string | null;
  userId: string | null;
  demoRole: string | null;
  demoCreatedAt: string | null;
};

const SuperAdminDemoAccountsPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [trialDays, setTrialDays] = useState(14);
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [demos, setDemos] = useState<DemoOrg[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingActions, setLoadingActions] = useState<
    Record<string, "toggle" | "delete" | "edit" | null>
  >({});
  const [fetchingDemos, setFetchingDemos] = useState(true);
  const [editingDemo, setEditingDemo] = useState<DemoOrg | null>(null);
  const [editTrialDays, setEditTrialDays] = useState(7);
  const [editTrialEndsAt, setEditTrialEndsAt] = useState("");
  const [convertToClient, setConvertToClient] = useState(false);

  const fetchDemos = async () => {
    setFetchingDemos(true);
    try {
      const res = await axios.get("/superadmin/demo-accounts");
      setDemos(res.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load demo accounts");
    } finally {
      setFetchingDemos(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, []);

  const handleCreate = async () => {
    if (!email || !name || !password) {
      toast.error("Name, Email, and Password are required");
      return;
    }

    // Set loading immediately
    setLoading(true);

    // Trigger shutter animation to close form
    setIsAnimating(true);
    setTimeout(() => {
      setShowForm(false);
      setIsAnimating(false);
    }, 300); // Wait for shutter animation to complete

    try {
      const res = await axios.post("/superadmin/demo-accounts", {
        email,
        name,
        password,
        trialDays,
        role,
      });
      toast.success("Demo account created successfully");
      // Display credentials for the super admin
      const credentials = `Email: ${res.data.data.email}\nPassword: ${res.data.data.password}`;
      navigator.clipboard.writeText(credentials).catch(() => {});
      toast.info(
        `Demo account created! Credentials copied to clipboard.\nEmail: ${res.data.data.email}\nPassword: ${res.data.data.password}`,
        { duration: 10000 }
      );
      setEmail("");
      setName("");
      setPassword("");
      setTrialDays(14);
      setRole("viewer");
      await fetchDemos();
      // Hide loading after success
      setLoading(false);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to create demo account"
      );
      // Show form again on error and stop loading
      setShowForm(true);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setShowForm(false);
    setIsAnimating(false);
    // Reset form fields when canceling
    setEmail("");
    setName("");
    setPassword("");
    setTrialDays(14);
    setRole("viewer");
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleToggleStatus = async (
    organizationId: string,
    currentStatus: string
  ) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [organizationId]: "toggle" }));
      await axios.post(
        `/superadmin/demo-accounts/${organizationId}/deactivate`
      );
      const isCurrentlySuspended =
        currentStatus === "suspended" || currentStatus === "inactive";
      const action = isCurrentlySuspended ? "reactivated" : "deactivated";
      toast.success(`Demo account ${action}`);
      await fetchDemos();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to toggle status");
    } finally {
      setLoadingActions((prev) => {
        const updated = { ...prev };
        delete updated[organizationId];
        return updated;
      });
    }
  };

  const handleDelete = async (organizationId: string) => {
    if (!confirm("Delete this demo organization? This cannot be undone."))
      return;
    try {
      setLoadingActions((prev) => ({ ...prev, [organizationId]: "delete" }));
      toast.loading("Deleting demo account and all associated data...", {
        id: `delete-${organizationId}`,
      });
      await axios.delete(`/superadmin/organizations/${organizationId}`);
      toast.success("Demo organization deleted successfully", {
        id: `delete-${organizationId}`,
      });
      await fetchDemos();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete demo account", {
        id: `delete-${organizationId}`,
      });
    } finally {
      setLoadingActions((prev) => {
        const updated = { ...prev };
        delete updated[organizationId];
        return updated;
      });
    }
  };

  const handleEditClick = (demo: DemoOrg) => {
    setEditingDemo(demo);
    setEditTrialDays(7); // Default to extending by 7 days
    if (demo.trialEndsAt) {
      // Set date picker to current trial end date
      const date = new Date(demo.trialEndsAt);
      setEditTrialEndsAt(date.toISOString().split("T")[0]);
    } else {
      setEditTrialEndsAt("");
    }
    setConvertToClient(false);
  };

  const handleUpdateDemo = async () => {
    if (!editingDemo) return;

    try {
      setLoadingActions((prev) => ({
        ...prev,
        [editingDemo.id]: "edit",
      }));

      const payload: {
        trialDays?: number;
        trialEndsAt?: string;
        convertToClient?: boolean;
      } = {};

      if (convertToClient) {
        payload.convertToClient = true;
      } else if (editTrialEndsAt) {
        // If date is provided, use it directly
        const date = new Date(editTrialEndsAt);
        payload.trialEndsAt = date.toISOString();
      } else if (editTrialDays > 0) {
        // If days are provided, extend the trial
        payload.trialDays = editTrialDays;
      } else {
        toast.error("Please provide either days to extend or a specific date");
        return;
      }

      await axios.put(`/superadmin/demo-accounts/${editingDemo.id}`, payload);

      if (convertToClient) {
        toast.success("Demo account converted to regular client successfully");
      } else {
        toast.success("Trial duration updated successfully");
      }

      setEditingDemo(null);
      await fetchDemos();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to update demo account"
      );
    } finally {
      setLoadingActions((prev) => {
        const updated = { ...prev };
        delete updated[editingDemo.id];
        return updated;
      });
    }
  };

  return (
    <Stack className="pt-5 gap-3 px-2">
      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {t("superadmin.demoAccounts.createDemoAccount", "Create Demo Account")}
            </h2>
            <p className="text-sm text-muted-foreground">
              Create a new demo account with temporary access credentials
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={handleShowForm}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 cursor-pointer"
            >
              {t("superadmin.demoAccounts.createDemoAccount", "Create Demo Account")}
            </Button>
          )}
        </div>

        {/* Form with shutter animation */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            showForm
              ? "max-h-[2000px] opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
          } ${isAnimating ? "transform scale-y-0 origin-top" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                The name of the demo organization
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Login email for the demo account
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Login password for the demo account
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="trialDays"
                className="text-sm font-medium text-foreground"
              >
                Trial Duration (Days)
              </Label>
              <Input
                id="trialDays"
                type="number"
                min={1}
                max={365}
                placeholder="14"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Number of days the demo account will be active (default: 14)
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-foreground"
              >
                User Role
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Permission level for the demo account
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleCreate}
              disabled={loading || !name || !email || !password || isAnimating}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 cursor-pointer"
            >
              {loading || isAnimating ? "Creating..." : "Create Demo Account"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={loading || isAnimating}
              className="border-border hover:bg-muted/50 h-10 px-6 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Loading section below form - shows when form is hidden and loading */}
        {!showForm && loading && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Box className="bg-gradient-to-r from-blue-500/5 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-8 border-2 border-blue-200 dark:border-blue-900/50 shadow-lg">
              <Center className="flex-col gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Creating Demo Account...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we set up your demo account
                  </p>
                </div>
              </Center>
            </Box>
          </div>
        )}
      </Box>

      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t("superadmin.demoAccounts.title", "Demo Accounts")}
        </h2>
        {fetchingDemos ? (
          <TableSkeleton rows={5} columns={7} withActions />
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg shadow-sm ">
            <Table className="w-full ">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>{t("superadmin.demoAccounts.table.organization", "Organization")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.user", "User")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.email", "Email")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.role", "Role")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.status", "Status")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.trialEnds", "Trial Ends")}</TableHead>
                  <TableHead>{t("superadmin.demoAccounts.table.created", "Created")}</TableHead>
                  <TableHead className="text-center">{t("superadmin.demoAccounts.table.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No demo accounts found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  demos.map((d) => (
                    <TableRow
                      key={d.id}
                      className={
                        loadingActions[d.id] === "delete"
                          ? "opacity-60 bg-muted/50"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {loadingActions[d.id] === "delete" && (
                          <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin text-red-600" />
                        )}
                        {d.name}
                      </TableCell>
                      <TableCell>{d.userName || "-"}</TableCell>
                      <TableCell>{d.email || "-"}</TableCell>
                      <TableCell className="capitalize">
                        {d.demoRole || d.userRole || "-"}
                      </TableCell>
                      <TableCell className="capitalize">{d.status}</TableCell>
                      <TableCell>
                        {d.trialEndsAt
                          ? format(new Date(d.trialEndsAt), "PPp")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {d.demoCreatedAt
                          ? format(new Date(d.demoCreatedAt), "PP")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Center className="gap-2">
                          <Button
                            variant="ghost"
                            className={`cursor-pointer border-2 shadow-sm transition-all duration-200 ${
                              d.status === "suspended" ||
                              d.status === "inactive"
                                ? "hover:bg-green-50 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40 dark:hover:bg-green-900/40"
                                : "hover:bg-yellow-50 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/40 dark:hover:bg-yellow-900/40"
                            }`}
                            onClick={() => handleToggleStatus(d.id, d.status)}
                            disabled={loadingActions[d.id] !== undefined}
                          >
                            {loadingActions[d.id] === "toggle" ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {d.status === "suspended" ||
                                d.status === "inactive"
                                  ? "Reactivating..."
                                  : "Deactivating..."}
                              </>
                            ) : (
                              <>
                                {d.status === "suspended" ||
                                d.status === "inactive"
                                  ? "Reactivate"
                                  : "Deactivate"}
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            className="hover:bg-blue-50 cursor-pointer border-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40 dark:hover:bg-blue-900/40 shadow-sm transition-all duration-200"
                            onClick={() => handleEditClick(d)}
                            disabled={loadingActions[d.id] !== undefined}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="hover:bg-red-50 cursor-pointer border-2 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/40 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDelete(d.id)}
                            disabled={loadingActions[d.id] !== undefined}
                          >
                            {loadingActions[d.id] === "delete" ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">Deleting...</span>
                              </span>
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </Button>
                        </Center>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Box>

      {/* Edit Demo Account Dialog */}
      <Dialog
        open={!!editingDemo}
        onOpenChange={(open) => !open && setEditingDemo(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Demo Account</DialogTitle>
            <DialogDescription>
              Extend trial duration or convert to regular client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Convert to Client</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="convertToClient"
                  checked={convertToClient}
                  onChange={(e) => setConvertToClient(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-border rounded focus:ring-blue-500"
                />
                <Label
                  htmlFor="convertToClient"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Convert this demo account to a regular client account
                </Label>
              </div>
            </div>

            {!convertToClient && (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="editTrialDays"
                    className="text-sm font-medium"
                  >
                    Extend Trial (Days)
                  </Label>
                  <Input
                    id="editTrialDays"
                    type="number"
                    min={1}
                    max={365}
                    placeholder="7"
                    value={editTrialDays}
                    onChange={(e) => setEditTrialDays(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days to extend from current trial end date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editTrialEndsAt"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Or Set Specific Date
                  </Label>
                  <Input
                    id="editTrialEndsAt"
                    type="date"
                    value={editTrialEndsAt}
                    onChange={(e) => setEditTrialEndsAt(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set a specific end date for the trial period
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingDemo(null)}
              disabled={loadingActions[editingDemo?.id || ""] === "edit"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDemo}
              disabled={
                loadingActions[editingDemo?.id || ""] === "edit" ||
                (!convertToClient && !editTrialEndsAt && editTrialDays <= 0)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingActions[editingDemo?.id || ""] === "edit" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : convertToClient ? (
                "Convert to Client"
              ) : (
                "Update Trial"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default SuperAdminDemoAccountsPage;
