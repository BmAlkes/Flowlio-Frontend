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
      await axios.delete(`/superadmin/organizations/${organizationId}`);
      toast.success("Demo organization deleted");
      await fetchDemos();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
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
      <Box className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Create Demo Account
            </h2>
            <p className="text-sm text-gray-600">
              Create a new demo account with temporary access credentials
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={handleShowForm}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 cursor-pointer"
            >
              Create Demo Account
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
                className="text-sm font-medium text-gray-700"
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
              <p className="text-xs text-gray-500">
                The name of the demo organization
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
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
              <p className="text-xs text-gray-500">
                Login email for the demo account
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
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
              <p className="text-xs text-gray-500">
                Login password for the demo account
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="trialDays"
                className="text-sm font-medium text-gray-700"
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
              <p className="text-xs text-gray-500">
                Number of days the demo account will be active (default: 14)
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
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
              <p className="text-xs text-gray-500">
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
              className="border-gray-300 hover:bg-gray-50 h-10 px-6 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Loading section below form - shows when form is hidden and loading */}
        {!showForm && loading && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Box className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200 shadow-lg">
              <Center className="flex-col gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Creating Demo Account...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please wait while we set up your demo account
                  </p>
                </div>
              </Center>
            </Box>
          </div>
        )}
      </Box>

      <Box className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Demo Accounts
        </h2>
        {fetchingDemos ? (
          <Center className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Loading demo accounts...</p>
            </div>
          </Center>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm ">
            <Table className="w-full ">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial Ends</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">No demo accounts found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  demos.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
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
                            className={`cursor-pointer border ${
                              d.status === "suspended" ||
                              d.status === "inactive"
                                ? "hover:bg-green-50 bg-green-50 text-green-700"
                                : "hover:bg-yellow-50 bg-yellow-50 text-yellow-700"
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
                            className="hover:bg-blue-50 cursor-pointer border bg-blue-50 text-blue-700"
                            onClick={() => handleEditClick(d)}
                            disabled={loadingActions[d.id] !== undefined}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="hover:bg-red-50 cursor-pointer border bg-red-50 text-red-700"
                            onClick={() => handleDelete(d.id)}
                            disabled={loadingActions[d.id] !== undefined}
                          >
                            {loadingActions[d.id] === "delete" ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash className="w-4 h-4" />
                              </>
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label
                  htmlFor="convertToClient"
                  className="text-sm text-gray-700 cursor-pointer"
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
                  <p className="text-xs text-gray-500">
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
                  <p className="text-xs text-gray-500">
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
