
'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { convertToNepaliDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { updatePatient, type Patient } from '@/lib/firebase-services';

export default function AdmissionsPage() {
  const { data: patients, error, loading } = useCollection<Patient>('patients');
  const { toast } = useToast();

  const admittedPatients = patients ? patients.filter(p => p.status === 'Admitted') : [];

  const handleDischargePatient = async (patientId: string, patientName: string) => {
    try {
      await updatePatient(patientId, { 
        status: 'Active',
        dischargeDate: new Date().toISOString(),
       });
      toast({
        title: 'Patient Discharged',
        description: `${patientName} has been discharged.`,
      });
    } catch(err) {
      console.error("Error discharging patient: ", err);
      toast({
        variant: 'destructive',
        title: 'Discharge Failed',
        description: 'An error occurred while discharging the patient.',
      });
    }
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Admitted Patients" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Admissions</CardTitle>
            <CardDescription>
              A list of all patients currently admitted to the hospital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading admitted patients...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                   <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : admittedPatients.length > 0 ? (
                  admittedPatients.map(patient => (
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
                          <Link
                            href={`/patients/${patient.id}/billing`}
                            className="font-medium hover:underline"
                          >
                            {patient.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.admissionDate ? convertToNepaliDate(patient.admissionDate) : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/20 text-blue-700"
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleDischargePatient(patient.id, patient.name)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Discharge
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No patients are currently admitted.
                    </TableCell>
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

    
