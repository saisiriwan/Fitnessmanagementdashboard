import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./AppContext";
import NewClientModal from "./NewClientModal";
import { toast } from "sonner@2.0.3";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Search,
  Plus,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  Clock,
  Users,
} from "lucide-react";

export default function ClientsList() {
  const { clients, sessions, deleteClient } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [showNewClientModal, setShowNewClientModal] =
    useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [clientToDelete, setClientToDelete] = useState<
    string | null
  >(null);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      client.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
    const matchesGoal =
      goalFilter === "all" || client.goal === goalFilter;

    return matchesSearch && matchesStatus && matchesGoal;
  });

  // Get unique goals for filter
  const uniqueGoals = [
    ...new Set(clients.map((client) => client.goal)),
  ];

  // Calculate stats
  const activeClients = clients.filter(
    (c) => c.status === "active",
  ).length;
  const pausedClients = clients.filter(
    (c) => c.status === "paused",
  ).length;
  const inactiveClients = clients.filter(
    (c) => c.status === "inactive",
  ).length;
  
  // Account status based on userId
  const accountActiveClients = clients.filter(
    (c) => c.userId !== null && c.userId !== undefined,
  ).length;
  const accountPendingClients = clients.filter(
    (c) => !c.userId,
  ).length;

  const getNextSession = (clientId: string) => {
    const nextSession = sessions
      .filter(
        (session) =>
          session.clientId === clientId &&
          session.status === "scheduled",
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime(),
      )[0];

    if (!nextSession) return null;

    return new Date(nextSession.date).toLocaleDateString(
      "th-TH",
      {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const handleNewClient = (clientId: string) => {
    setShowNewClientModal(false);
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    toast.success("ลบลูกเทรนเรียบร้อยแล้ว");
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: {
        label: "กำลังออกกำลัง",
        variant: "default" as const,
      },
      paused: {
        label: "พักชั่วคราว",
        variant: "secondary" as const,
      },
      inactive: {
        label: "ไม่ได้ใช้งาน",
        variant: "outline" as const,
      },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  return (
    <Card>
      {/* Clean Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาชื่อ หรือ อีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats + Add Button */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Stats Inline */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Active:
                </span>
                <span className="text-sm font-semibold text-accent">
                  {activeClients}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Paused:
                </span>
                <span className="text-sm font-semibold">
                  {pausedClients}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Stop:
                </span>
                <span className="text-sm font-semibold">
                  {inactiveClients}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Account Active:
                </span>
                <span className="text-sm font-semibold">
                  {accountActiveClients}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Account Pending:
                </span>
                <span className="text-sm font-semibold">
                  {accountPendingClients}
                </span>
              </div>
            </div>

            {/* Add Button */}
            <div className="flex gap-2">
              <Dialog
                open={showNewClientModal}
                onOpenChange={setShowNewClientModal}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-md"
                  aria-describedby="new-client-manual-description"
                >
                  <DialogHeader>
                    <DialogTitle>เพิ่มลูกเทรนใหม่</DialogTitle>
                    <DialogDescription id="new-client-manual-description">
                      กรอกข้อมูลลูกเทรนใหม่ของคุณ
                    </DialogDescription>
                  </DialogHeader>
                  <NewClientModal
                    onClientCreated={handleNewClient}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Clients Table */}
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกเทรน</TableHead>
                <TableHead>เป้าหมาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>นัดถัดไป</TableHead>
                <TableHead className="text-right">
                  การดำเนินการ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm ||
                    statusFilter !== "all" ||
                    goalFilter !== "all"
                      ? "ไม่พบข้อมูลที่ค้นหา"
                      : 'ยังไม่มีลูกเทรน คลิก "เพิ่มลูกเทรน" เพื่อเริ่มต้น'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const nextSession = getNextSession(client.id);
                  const statusBadge = getStatusBadge(
                    client.status,
                  );
                  
                  // ✅ นับจำนวนครั้งที่ลูกเทรนมาฝึกแล้ว
                  const completedCount = sessions.filter(s => 
                    s.clientId === client.id && s.status === 'completed'
                  ).length;

                  return (
                    <TableRow
                      key={client.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link
                          to={`/clients/${client.id}`}
                          className="flex items-center gap-3 hover:text-primary transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={client.avatar}
                              alt={client.name}
                            />
                            <AvatarFallback>
                              {client.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {client.name}
                              </p>
                              {/* ✅ แสดง Session Count */}
                              {completedCount > 0 && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30">
                                  {completedCount} ครั้ง
                                </Badge>
                              )}
                              {!client.userId && (
                                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-300">
                                  ⏳ รอสมัคร
                                </Badge>
                              )}
                              {client.userId && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300">
                                  ✓ ใช้งานแล้ว
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {client.email}
                            </p>
                            {/* ✅ แสดง Personal Notes ถ้ามี */}
                            {client.personalNotes && (
                              <p className="text-xs text-primary/70 italic mt-0.5 line-clamp-1">
                                💡 {client.personalNotes}
                              </p>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {client.goal}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nextSession ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {nextSession}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            ไม่มีนัด
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/clients/${client.id}`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไขข้อมูล
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/calendar?client=${client.id}`}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                จัดตารางเวลา
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => {
                                setClientToDelete(client.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบลูกเทรน
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent aria-describedby="delete-client-alert-description">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription id="delete-client-alert-description">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "
              {
                clients.find((c) => c.id === clientToDelete)?.name || "ลูกเทรนคนนี้"
              }
              "? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToDelete) {
                  handleDeleteClient(clientToDelete);
                  setClientToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}