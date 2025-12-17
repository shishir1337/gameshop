"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  listUsers,
  updateUserRole,
  deleteUser,
  toggleUserEmailVerification,
  banUser,
  unbanUser,
  type AdminUser,
  type ListUsersResponse,
} from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Shield, ShieldCheck, Trash2, Mail, MailCheck, Ban, Unlock } from "lucide-react";
import { getCurrentUser } from "@/app/actions/user";

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<ListUsersResponse["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Get current user ID
  useEffect(() => {
    getCurrentUser().then((result) => {
      if ("user" in result) {
        setCurrentUserId(result.user.id);
      }
    });
  }, []);

  const loadUsers = async (page: number = 1) => {
    startTransition(async () => {
      try {
        const params: Parameters<typeof listUsers>[0] = {
          page,
          limit: 10,
          search: search || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          emailVerified:
            emailVerifiedFilter !== "all"
              ? emailVerifiedFilter === "verified"
              : undefined,
        };

        const result = await listUsers(params);
        setUsers(result.users);
        setPagination(result.pagination);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load users"
        );
      }
    });
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, emailVerifiedFilter]);

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    if (userId === currentUserId && newRole === "user") {
      toast.error("You cannot remove your own admin role");
      return;
    }

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        toast.success("User role updated successfully");
        loadUsers(pagination.page);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update user role"
        );
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");
        loadUsers(pagination.page);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete user"
        );
      }
    });
  };

  const handleToggleEmailVerification = async (
    userId: string,
    currentStatus: boolean
  ) => {
    startTransition(async () => {
      try {
        await toggleUserEmailVerification(userId, !currentStatus);
        toast.success(
          `Email verification ${!currentStatus ? "enabled" : "disabled"}`
        );
        loadUsers(pagination.page);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to toggle email verification"
        );
      }
    });
  };

  const handleBanUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot ban your own account");
      return;
    }

    startTransition(async () => {
      try {
        await banUser(userId, "Banned by admin");
        toast.success("User banned successfully");
        loadUsers(pagination.page);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to ban user"
        );
      }
    });
  };

  const handleUnbanUser = async (userId: string) => {
    startTransition(async () => {
      try {
        await unbanUser(userId);
        toast.success("User unbanned successfully");
        loadUsers(pagination.page);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to unban user"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={emailVerifiedFilter}
            onValueChange={setEmailVerifiedFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Email status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || user.email}
                            width={32}
                            height={32}
                            className="size-8 rounded-full"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {user.name || "No name"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {user.banned ? (
                          <Badge variant="destructive">
                            <Ban className="size-3" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge
                            variant={user.emailVerified ? "default" : "secondary"}
                          >
                            {user.emailVerified ? (
                              <>
                                <MailCheck className="size-3" />
                                Verified
                              </>
                            ) : (
                              <>
                                <Mail className="size-3" />
                                Unverified
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as "user" | "admin")
                        }
                        disabled={user.id === currentUserId}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <Shield className="size-4" />
                              User
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="size-4" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        -
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.banned ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={isPending}
                            title="Unban user"
                          >
                            <Unlock className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBanUser(user.id)}
                            disabled={user.id === currentUserId || isPending}
                            title="Ban user"
                            className="text-destructive hover:text-destructive"
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleEmailVerification(
                              user.id,
                              user.emailVerified
                            )
                          }
                          disabled={isPending}
                          title={
                            user.emailVerified
                              ? "Mark as unverified"
                              : "Mark as verified"
                          }
                        >
                          {user.emailVerified ? (
                            <Mail className="size-4" />
                          ) : (
                            <MailCheck className="size-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={user.id === currentUserId || isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{user.name || user.email}</strong>? This
                                action cannot be undone and will delete all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page === 1 || isPending}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={!pagination.hasMore || isPending}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

