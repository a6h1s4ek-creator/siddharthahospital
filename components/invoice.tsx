
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { formatToNpr, convertToNepaliDate } from '@/lib/utils';
import type { Patient } from '@/lib/firebase-services';
import { Printer } from 'lucide-react';

interface InvoiceProps {
  patient: Patient;
}

export function Invoice({ patient }: InvoiceProps) {
  const totalAmount = patient.billing?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalPaid = patient.billing?.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalDue = totalAmount - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="m-4 print:m-0 print:border-none print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 print:pb-4">
        <div className="flex items-center gap-4">
            <Icons.Logo className="w-12 h-12 text-primary" />
            <div>
                <h1 className="text-xl font-bold">SIDDHARTHA HOSPITAL & TRAUMA CENTRE PVT. LTD.</h1>
                <p className="text-muted-foreground">Rangeli-7</p>
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-3xl font-bold">INVOICE</h2>
            <p className="text-muted-foreground">Invoice #INV-{patient.patientId}-{Date.now().toString().slice(-4)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-8 print:mb-6">
            <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p><span className="font-semibold">Name:</span> {patient.name}</p>
                <p><span className="font-semibold">Age:</span> {patient.age}</p>
                <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
                <p><span className="font-semibold">Address:</span> {patient.address}</p>
            </div>
            <div className="text-right">
                <p><span className="font-semibold">Patient ID:</span> {patient.patientId}</p>
                <p><span className="font-semibold">Invoice Date:</span> {convertToNepaliDate(new Date())}</p>
                <p><span className="font-semibold">Due Date:</span> {convertToNepaliDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}</p>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service/Item</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.billing?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.service}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right">{formatToNpr(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-4" />
        <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatToNpr(totalAmount)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span>-{formatToNpr(totalPaid)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Due</span>
                    <span>{formatToNpr(totalDue)}</span>
                </div>
            </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground print:hidden">
            <p>Thank you for choosing Siddhartha Hospital.</p>
        </div>
        <div className="mt-6 flex justify-end print:hidden">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
