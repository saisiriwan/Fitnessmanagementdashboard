import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  Edit,
  Trash2,
  Users
} from 'lucide-react';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from 'src/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from 'src/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from 'src/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from 'src/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'src/components/ui/alert-dialog';
import { useApp } from './AppContext';
import NewClientModal from './NewClientModal';
import { toast } from 'sonner';

export default function ClientsList() {
  const { clients, sessions, deleteClient } = useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    goal: 'all',
  });
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter clients with useMemo for performance
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'all' || client.status === filters.status;
      const matchesGoal = filters.goal === 'all' || client.goal === filters.goal;
      
      return matchesSearch && matchesStatus && matchesGoal;
    });
  }, [clients, filters]);

  // Get unique goals for filter with useMemo
  const uniqueGoals = useMemo(() => 
    [...new Set(clients.map(client => client.goal))]
  , [clients]);

  const getNextSession = (clientId: string) => {
    const nextSession = sessions
      .filter(session => session.clientId === clientId && session.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    if (!nextSession) return null;
    
    return new Date(nextSession.date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNewClient = (clientId: string) => {
    setShowNewClientModal(false);
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    toast.success('ลบลูกเทรนเรียบร้อยแล้ว');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'อยู่ระหว่างการดูแล', variant: 'default' as const },
      paused: { label: 'พักชั่วคราว', variant: 'secondary' as const },
      inactive: { label: 'ไม่ได้ใช้งาน', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ลูกเทรน</h1>
          <p className="text-gray-600">จัดการข้อมูลลูกเทรนทั้งหมด</p>
        </div>
        
        <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มลูกเทรนใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มลูกเทรนใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลพื้นฐานของลูกเทรนใหม่
              </DialogDescription>
            </DialogHeader>
            <NewClientModal onClientCreated={handleNewClient} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อยู่ระหว่างการดูแล</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">พักชั่วคราว</CardTitle>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === 'paused').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ไม่ได้ใช้งาน</CardTitle>
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาชื่อ หรือ อีเมล..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="active">อยู่ระหว่างการดูแล</SelectItem>
                <SelectItem value="paused">พักชั่วคราว</SelectItem>
                <SelectItem value="inactive">ไม่ได้ใช้งาน</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.goal} onValueChange={(value) => handleFilterChange('goal', value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="เป้าหมาย" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">เป้าหมายทั้งหมด</SelectItem>
                {uniqueGoals.map(goal => (
                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อลูกเทรน ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกเทรน</TableHead>
                  <TableHead>เป้าหมาย</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>นัดถัดไป</TableHead>
                  <TableHead className="text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      ไม่พบข้อมูลลูกเทรน
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const nextSession = getNextSession(client.id);
                    const statusBadge = getStatusBadge(client.status);
                    
                    return (
                      <TableRow key={client.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Link 
                            to={`/clients/${client.id}`}
                            className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={client.avatar} alt={client.name} />
                              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.goal}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {nextSession ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {nextSession}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">ไม่มีนัด</span>
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
                                <Link to={`/clients/${client.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  แก้ไขข้อมูล
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/calendar?client=${client.id}`}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  จัดตารางเวลา
                                </Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    ลบลูกเทรน
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณแน่ใจหรือไม่ว่าต้องการลบ "{client.name}" การดำเนินการนี้ไม่สามารถยกเลิกได้
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteClient(client.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
      </Card>
    </div>
  );
}