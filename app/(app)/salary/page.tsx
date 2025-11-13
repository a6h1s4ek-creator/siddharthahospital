
'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatToNpr } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Staff } from '@/lib/firebase-services';

export default function SalaryPage() {
  const { data: staff, loading, error } = useCollection<Staff>('staff');

  const calculateTotalDue = (staffMember: Staff) => {
    if (!staffMember.salary) return 0;
    const totalPaid = staffMember.salaryHistory?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
    return staffMember.salary - totalPaid;
  };
  
  const allStaffTotalDue = staff ? staff.reduce((total, staffMember) => total + calculateTotalDue(staffMember), 0) : 0;


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Staff Salary" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatToNpr(allStaffTotalDue)}</div>
              <p className="text-xs text-muted-foreground">
                Total amount due to all staff members.
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Salary Dues</CardTitle>
            <CardDescription>
              Select a staff member to view their salary details and make payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead className="text-right">Due Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading staff salaries...</TableCell>
                  </TableRow>
                ) : error ? (
                   <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-destructive">Error: {error.message}</TableCell>
                  </TableRow>
                ) : staff && staff.length > 0 ? (
                  staff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage
                              src={staffMember.avatar.imageUrl}
                              alt={staffMember.name}
                              data-ai-hint={staffMember.avatar.imageHint}
                            />
                            <AvatarFallback>
                              {staffMember.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/staff/${staffMember.id}`} className="font-medium hover:underline">
                            {staffMember.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{staffMember.profession}</TableCell>
                      <TableCell>{formatToNpr(staffMember.salary)}</TableCell>
                      <TableCell className="text-right">{formatToNpr(calculateTotalDue(staffMember))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No staff found.</TableCell>
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
