
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { convertToNepaliDate, formatToNpr } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addStaff, type Staff } from '@/lib/firebase-services';


export default function StaffPage() {
  const { data: staff, loading, error: staffError } = useCollection<Staff>('staff');
  const [staffName, setStaffName] = useState('');
  const [profession, setProfession] = useState('');
  const [salary, setSalary] = useState('');
  const { toast } = useToast();

  const sortedStaff = staff ? [...staff].sort(
    (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
  ) : [];

  const totalSalary = sortedStaff.reduce((sum, member) => sum + member.salary, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !profession || !salary) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill out all staff fields.',
      });
      return;
    }

    const newStaffMember: Omit<Staff, 'id'> = {
      name: staffName,
      profession: profession,
      salary: parseFloat(salary),
      status: 'Active',
      avatar: PlaceHolderImages[Math.floor(Math.random() * 5) + 2],
      joinDate: new Date().toISOString(),
      salaryHistory: [],
    };
    
    try {
        await addStaff(newStaffMember);
        toast({
          title: 'Staff Member Added',
          description: `${newStaffMember.name} has been added to the system.`,
        });

        // Reset form
        setStaffName('');
        setProfession('');
        setSalary('');
    } catch(err) {
        console.error("Error adding staff:", err);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add staff member.',
        });
    }
  };

  const handleRemoveStaff = (staffId: string) => {
    // In a real Firestore app, you would call a delete function
    // For now, this is just a placeholder
    console.log("Removing staff:", staffId);
     toast({
        title: 'Action Not Implemented',
        description: `Deletion for ${staffId} is not connected to the database yet.`,
      });
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Staff Management" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
              <CardDescription>
                Fill out the form below to add a new staff member.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="staff-name">Staff Name</Label>
                    <Input
                      id="staff-name"
                      placeholder="Enter full name"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      placeholder="e.g., Doctor, Nurse"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Salary (NPR)</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="e.g., 50000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="reset"
                    onClick={() => {
                      setStaffName('');
                      setProfession('');
                      setSalary('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Staff</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatToNpr(totalSalary)}</div>
              <p className="text-xs text-muted-foreground">
                Total salary expense for all active staff members.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Staff Members</CardTitle>
            <CardDescription>
              A list of all staff in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">Loading staff...</TableCell>
                    </TableRow>
                ) : staffError ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-destructive">Error: {staffError.message}</TableCell>
                    </TableRow>
                ) : sortedStaff.length > 0 ? (
                  sortedStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage
                              src={member.avatar.imageUrl}
                              alt={member.name}
                              data-ai-hint={member.avatar.imageHint}
                            />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/staff/${member.id}`} className="font-medium hover:underline">
                            {member.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{member.profession}</TableCell>
                      <TableCell>
                        {convertToNepaliDate(member.joinDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === 'Active' ? 'default' : 'secondary'
                          }
                          className={`${
                            member.status === 'Active'
                              ? 'bg-green-500/20 text-green-700'
                              : ''
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatToNpr(member.salary)}
                      </TableCell>
                      <TableCell className="text-right">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove {member.name} from the staff records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleRemoveStaff(member.id)}
                            >
                              Yes, remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No staff found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
