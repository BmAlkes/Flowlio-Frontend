import { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAIUserLimits, useSetAIUserLimit } from "@/hooks/useAILogs";
import { TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import { Users, Pencil, X } from "lucide-react";

export const AIUserLimitsSection = () => {
  const { data: users, isLoading } = useAIUserLimits();
  const setLimit = useSetAIUserLimit();

  const [editUser, setEditUser] = useState<{ userId: string; name: string; current: number | null } | null>(null);
  const [limitValue, setLimitValue] = useState("");

  const openEdit = (userId: string, name: string, current: number | null) => {
    setEditUser({ userId, name, current });
    setLimitValue(current ? String(current) : "");
  };

  const handleSave = async () => {
    if (!editUser) return;
    const parsed = limitValue.trim() === "" ? null : parseInt(limitValue, 10);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      toast.error("Enter a valid number or leave empty for unlimited");
      return;
    }

    try {
      await setLimit.mutateAsync({ userId: editUser.userId, monthlyLimit: parsed });
      toast.success(`Token limit ${parsed ? `set to ${parsed.toLocaleString()}` : "removed"} for ${editUser.name}`);
      setEditUser(null);
    } catch (err: any) {
      toast.error("Failed to update limit", { description: err?.message });
    }
  };

  const handleRemoveLimit = async (userId: string, name: string) => {
    try {
      await setLimit.mutateAsync({ userId, monthlyLimit: null });
      toast.success(`Token limit removed for ${name}`);
    } catch (err: any) {
      toast.error("Failed to remove limit", { description: err?.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Per-User Token Limits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Set individual monthly AI token limits for team members. Empty = user follows the organisation's limit.
        </p>

        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <Box className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-right">Monthly Limit</TableHead>
                  <TableHead className="text-xs text-right">Used This Month</TableHead>
                  <TableHead className="text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => {
                    const usagePct = u.monthlyLimit
                      ? Math.round((u.tokensUsedThisMonth / u.monthlyLimit) * 100)
                      : null;
                    return (
                      <TableRow key={u.userId}>
                        <TableCell className="text-sm font-medium">{u.userName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.userEmail}</TableCell>
                        <TableCell className="text-sm text-right font-mono">
                          {u.monthlyLimit ? (
                            <span>{(u.monthlyLimit ?? 0).toLocaleString()}</span>
                          ) : (
                            <Badge variant="outline" className="text-xs">Org default</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          <Flex className="items-center justify-end gap-2">
                            <span className="font-mono">{(u.tokensUsedThisMonth ?? 0).toLocaleString()}</span>
                            {usagePct !== null && (
                              <Badge className={`text-xs ${usagePct >= 90 ? "bg-red-100 text-red-700" : usagePct >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                                {usagePct}%
                              </Badge>
                            )}
                          </Flex>
                        </TableCell>
                        <TableCell>
                          <Flex className="items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => openEdit(u.userId, u.userName, u.monthlyLimit)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {u.monthlyLimit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveLimit(u.userId, u.userName)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </Flex>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      No team members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Edit dialog */}
        <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Set Token Limit — {editUser?.name}</DialogTitle>
              <DialogDescription>
                Leave empty to use the organisation's default limit. Enter 0 for unlimited.
              </DialogDescription>
            </DialogHeader>
            <Box className="py-4">
              <Input
                type="number"
                min="0"
                placeholder="e.g. 50000 (empty = org default)"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                autoFocus
              />
              {editUser?.current && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current limit: {editUser.current.toLocaleString()} tokens/month
                </p>
              )}
            </Box>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUser(null)} disabled={setLimit.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={setLimit.isPending}>
                {setLimit.isPending ? "Saving…" : "Save Limit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
