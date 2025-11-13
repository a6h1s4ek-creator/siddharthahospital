
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
import type { Patient } from '@/lib/firebase-services';

export default function BillingPage() {
  const { data: patients, loading, error } = useCollection<Patient>('patients');

  const calculateTotalDue = (patient: Patient) => {
    if (!patient.billing) return 0;
    return patient.billing
      .filter((item) => item.status !== 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
  };
  
  const allPatientsTotalDue = patients ? patients.reduce((total, patient) => total + calculateTotalDue(patient), 0) : 0;


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Billing" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding Bills</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatToNpr(allPatientsTotalDue)}</div>
              <p className="text-xs text-muted-foreground">
                Total amount due from all patients.
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Billing</CardTitle>
            <CardDescription>
              Select a patient to view their billing details and add new charges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading patient bills...</TableCell>
                  </TableRow>
                ) : error ? (
                   <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-destructive">Error: {error.message}</TableCell>
                  </TableRow>
                ) : patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage
                              src={patient.avatar.imageUrl}
                              alt={patient.name}
                              data-ai-hint={patient.avatar.imageHint}
                            />
                            <AvatarFallback>
                              {patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/patients/${patient.id}/billing`} className="font-medium hover:underline">
                            {patient.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell className="text-right">{formatToNpr(calculateTotalDue(patient))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No patients found.</TableCell>
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
