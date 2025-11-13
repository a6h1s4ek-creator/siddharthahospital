
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { convertToNepaliDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { BedDouble, Edit, Trash2 } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  addPatient,
  updatePatient,
  deletePatient,
  admitPatient,
  type Patient,
} from '@/lib/firebase-services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

export default function PatientsPage() {
  const { data: patients, error: patientsError, loading: patientsLoading } = useCollection<Patient>('patients');
  const { toast } = useToast();

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [editPatientName, setEditPatientName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editAddress, setEditAddress] = useState('');


  const sortedPatients = patients
    ? [...patients].sort((a, b) => {
        const dateA = a.registrationDate
          ? new Date(a.registrationDate).getTime()
          : 0;
        const dateB = b.registrationDate
          ? new Date(b.registrationDate).getTime()
          : 0;
        return dateB - dateA;
      })
    : [];

  const filteredPatients = selectedDate && sortedPatients
    ? sortedPatients.filter(patient => {
        if (!patient.registrationDate) return false;
        const patientDate = new Date(patient.registrationDate);
        return patientDate.toDateString() === selectedDate.toDateString();
      })
    : sortedPatients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !age || !gender || !address) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill out all patient fields.',
      });
      return;
    }

    const newPatient: Omit<Patient, 'id' | 'patientId'> = {
      name: patientName,
      age: parseInt(age, 10),
      gender: gender as 'Male' | 'Female' | 'Other',
      address: address,
      lastVisit: convertToNepaliDate(new Date()),
      status: 'Active',
      avatar: PlaceHolderImages[Math.floor(Math.random() * 5) + 2],
      bloodType: 'N/A',
      email: 'N/A',
      phone: 'N/A',
      registrationDate: new Date().toISOString(),
      billing: [],
    };

    try {
      await addPatient(newPatient);
      toast({
        title: 'Patient Added',
        description: `${newPatient.name} has been added to the system.`,
      });

      // Reset form
      setPatientName('');
      setAge('');
      setGender('');
      setAddress('');
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add patient.',
      });
    }
  };

  const handleOpenEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditPatientName(patient.name);
    setEditAge(patient.age.toString());
    setEditGender(patient.gender);
    setEditAddress(patient.address || '');
    setEditDialogOpen(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !editPatientName || !editAge || !editGender || !editAddress) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please fill out all fields.',
        });
        return;
    }

    const updatedData: Partial<Patient> = {
        name: editPatientName,
        age: parseInt(editAge, 10),
        gender: editGender as 'Male' | 'Female' | 'Other',
        address: editAddress,
    };

    try {
        await updatePatient(selectedPatient.id, updatedData);
        toast({
            title: 'Patient Updated',
            description: `${editPatientName}'s information has been updated.`,
        });
        setEditDialogOpen(false);
        setSelectedPatient(null);
    } catch (error) {
        console.error("Error updating patient:", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update patient information.',
        });
    }
  };

  const handleRemovePatient = async (patientId: string, patientName: string) => {
    try {
      await deletePatient(patientId);
      toast({
        title: 'Patient Removed',
        description: `${patientName} has been removed from the system.`,
      });
    } catch (error) {
       console.error("Error removing patient:", error);
       toast({
        variant: 'destructive',
        title: 'Removal Failed',
        description: `Could not remove ${patientName}.`,
      });
    }
  };
  
  const handleAdmitPatient = async (patientId: string, patientName: string) => {
    try {
      await admitPatient(patientId);
      toast({
        title: 'Patient Admitted',
        description: `${patientName} has been admitted.`,
      });
    } catch (error) {
       console.error("Error admitting patient:", error);
       toast({
        variant: 'destructive',
        title: 'Admission Failed',
        description: `Could not admit ${patientName}.`,
      });
    }
  };
  
  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-700';
      case 'Admitted':
        return 'bg-blue-500/20 text-blue-700';
      case 'Inactive':
        return 'bg-gray-500/20 text-gray-700';
      default:
        return '';
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Patients" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add New Patient</CardTitle>
              <CardDescription>
                Fill out the form below to add a new patient record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="patient-name">Patient Name</Label>
                    <Input
                      id="patient-name"
                      placeholder="Enter patient's full name"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="reset"
                    onClick={() => {
                      setPatientName('');
                      setAge('');
                      setGender('');
                      setAddress('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Patient</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Filter by Date</CardTitle>
              <CardDescription>
                Select a date to view patients registered on that day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              {selectedDate && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setSelectedDate(undefined)}>
                  Clear Selection
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
            <CardDescription>A list of all patients in the system. {selectedDate && `Registered on ${selectedDate.toLocaleDateString()}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsLoading ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            Loading patients...
                        </TableCell>
                    </TableRow>
                ) : patientsError ? (
                     <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-destructive">
                            Error: {patientsError.message}
                        </TableCell>
                    </TableRow>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
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
                      <TableCell>{patient.patientId}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.address || 'N/A'}</TableCell>
                      <TableCell>{patient.registrationDate ? convertToNepaliDate(patient.registrationDate) : patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge
                          variant={'outline'}
                          className={getStatusBadge(patient.status)}
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right">
                         <div className="flex justify-end items-center gap-2">
                            {patient.status === 'Active' && (
                              <Button variant="outline" size="sm" onClick={() => handleAdmitPatient(patient.id, patient.name)}>
                                <BedDouble className="mr-2 h-4 w-4" />
                                Admit
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(patient)}>
                                <Edit className="h-4 w-4" />
                            </Button>
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
                                      This action cannot be undone. This will permanently remove {patient.name} from the records.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleRemovePatient(patient.id, patient.name)}
                                    >
                                      Yes, remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No patients found {selectedDate ? 'for the selected date' : ''}.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                    <DialogTitle>Edit Patient: {selectedPatient?.name}</DialogTitle>
                    <DialogDescription>
                        Update the patient's information below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdatePatient} className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-patient-name">Patient Name</Label>
                            <Input
                            id="edit-patient-name"
                            value={editPatientName}
                            onChange={(e) => setEditPatientName(e.target.value)}
                            required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-age">Age</Label>
                            <Input
                            id="edit-age"
                            type="number"
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                            required
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-gender">Gender</Label>
                            <Select value={editGender} onValueChange={setEditGender}>
                            <SelectTrigger id="edit-gender">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                            id="edit-address"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
