
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatToNpr, convertToNepaliDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { addSalaryPayment, type Staff, type SalaryHistoryItem } from '@/lib/firebase-services';


export default function StaffSalaryPage() {
  const { staffId } = useParams() as { staffId: string };
  const { data: staffMember, loading, error } = useDoc<Staff>('staff', staffId);
  const { toast } = useToast();

  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAddSalaryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription || !newAmount || !staffMember) return;

    const newSalaryItem: Omit<SalaryHistoryItem, 'id'> = {
      date: convertToNepaliDate(new Date()),
      description: newDescription,
      amount: parseFloat(newAmount),
      status: 'Paid',
    };

    try {
        await addSalaryPayment(staffMember.id, newSalaryItem, staffMember.salaryHistory || []);
        toast({
          title: 'Salary Payment Added',
          description: `A payment of ${formatToNpr(parseFloat(newAmount))} has been recorded for ${staffMember.name}.`,
        });
        setNewDescription('');
        setNewAmount('');
    } catch (err) {
        console.error("Error adding salary item:", err);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add salary payment.'
        });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading Staff Details..." />
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
            <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !staffMember) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Staff Not Found" />
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
          <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p>{error ? error.message : 'The requested staff member could not be found.'}</p></CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const totalPaid = staffMember.salaryHistory?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalDue = staffMember.salary - totalPaid;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Salary Details for ${staffMember.name}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={staffMember.avatar.imageUrl} alt={staffMember.name} data-ai-hint={staffMember.avatar.imageHint} />
                <AvatarFallback>{staffMember.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-3xl">{staffMember.name}</CardTitle>
                <CardDescription>
                    Staff ID: {staffMember.id} &bull; Profession: {staffMember.profession}
                </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Salary History</CardTitle>
                        <CardDescription>A complete record of all salary payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffMember.salaryHistory && staffMember.salaryHistory.length > 0 ? (
                                staffMember.salaryHistory.map((item) => (
                                    <TableRow key={item.id}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-right">{formatToNpr(item.amount)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-green-500/20 text-green-700 w-20 justify-center">
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No salary payment records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex-col items-end gap-2 pt-4">
                        <div className="flex justify-between w-full max-w-xs">
                           <span className="text-muted-foreground">Total Salary</span>
                           <span>{formatToNpr(staffMember.salary)}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-xs">
                           <span className="text-muted-foreground">Total Paid</span>
                           <span>-{formatToNpr(totalPaid)}</span>
                        </div>
                        <Separator className="my-2 max-w-xs"/>
                         <div className="flex justify-between w-full max-w-xs font-semibold text-lg">
                           <span>Remaining Salary</span>
                           <span>{formatToNpr(totalDue)}</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add Salary Payment</CardTitle>
                  <CardDescription>Record a new salary payment for this staff member.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddSalaryItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Monthly Salary"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (NPR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 50000"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Payment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
