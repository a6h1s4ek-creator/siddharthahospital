
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatToNepaliTime, convertToNepaliDate } from '@/lib/utils';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addAppointment, updateAppointmentStatus, type Appointment } from '@/lib/firebase-services';
import type { Patient, Staff } from '@/lib/firebase-services';


type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

export default function AppointmentsPage() {
  const { data: appointments, loading: appointmentsLoading, error: appointmentsError } = useCollection<Appointment>('appointments');
  const { data: patients } = useCollection<Patient>('patients');
  const { data: staff } = useCollection<Staff>('staff');

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [department, setDepartment] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointmentTime, setAppointmentTime] = useState('');
  const { toast } = useToast();
  
  const doctors = staff?.filter(s => s.profession.toLowerCase().includes('doctor') || s.profession.toLowerCase().includes('ist') || s.profession.toLowerCase().includes('ian'));
  
  const sortedAppointments = appointments ? [...appointments].sort((a,b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
  }) : [];


  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-700';
      case 'Confirmed':
        return 'bg-blue-500/20 text-blue-700';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-700';
      default:
        return '';
    }
  };

  const handleStatusChange = async (appointmentId: string, currentStatus: AppointmentStatus) => {
    let newStatus: AppointmentStatus = currentStatus;

    switch (currentStatus) {
        case 'Pending':
            newStatus = 'Confirmed';
            break;
        case 'Confirmed':
            newStatus = 'Completed';
            break;
        case 'Completed':
            newStatus = 'Pending';
            break;
        case 'Cancelled':
            return;
    }

    try {
        await updateAppointmentStatus(appointmentId, newStatus);
        toast({
            title: 'Status Updated',
            description: `Appointment is now ${newStatus}.`
        });
    } catch (error) {
        console.error("Error updating status:", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update appointment status.',
        });
    }
  };

  const handleNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !department || !appointmentDate || !appointmentTime) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please fill out all appointment fields.',
        });
        return;
    }

    const selectedPatient = patients?.find(p => p.id === patientId);
    const selectedDoctor = staff?.find(s => s.id === doctorId);

    if (!selectedPatient || !selectedDoctor) {
         toast({
            variant: 'destructive',
            title: 'Invalid Selection',
            description: 'Selected patient or doctor not found.',
        });
        return;
    }

    // Combine date and time
    const [hours, minutes] = appointmentTime.split(':');
    const finalAppointmentDateTime = new Date(appointmentDate);
    finalAppointmentDateTime.setHours(parseInt(hours, 10));
    finalAppointmentDateTime.setMinutes(parseInt(minutes, 10));

    const newAppointmentData: Omit<Appointment, 'id'> = {
        patientName: selectedPatient.name,
        patientAvatar: selectedPatient.avatar,
        doctorName: selectedDoctor.name,
        department,
        time: formatToNepaliTime(finalAppointmentDateTime),
        date: finalAppointmentDateTime.toISOString(),
        status: 'Pending',
    };
    
    try {
        await addAppointment(newAppointmentData);
        toast({
          title: 'Appointment Scheduled',
          description: `Appointment for ${selectedPatient.name} with ${selectedDoctor.name} has been scheduled.`,
        });

        // Reset form and close dialog
        setPatientId('');
        setDoctorId('');
        setDepartment('');
        setAppointmentDate(new Date());
        setAppointmentTime('');
        setDialogOpen(false);

    } catch (error) {
        console.error("Error scheduling appointment:", error);
         toast({
            variant: 'destructive',
            title: 'Scheduling Failed',
            description: 'Could not schedule the appointment.',
        });
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Appointments">
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new appointment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewAppointment} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} - {d.profession}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., Cardiology" />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={setAppointmentDate}
                        className="rounded-md border p-0"
                    />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} />
                 </div>
               </div>

               <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Schedule Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Scheduling</CardTitle>
            <CardDescription>
              View, schedule, and manage all appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsLoading ? (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                          Loading appointments...
                      </TableCell>
                  </TableRow>
                ) : appointmentsError ? (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-destructive">
                          Error: {appointmentsError.message}
                      </TableCell>
                  </TableRow>
                ) : sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage
                              src={appointment.patientAvatar.imageUrl}
                              alt={appointment.patientName}
                              data-ai-hint={appointment.patientAvatar.imageHint}
                            />
                            <AvatarFallback>
                              {appointment.patientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{appointment.patientName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.department}</TableCell>
                      <TableCell>{convertToNepaliDate(appointment.date)} - {appointment.time}</TableCell>
                      <TableCell className="text-center">
                       <button onClick={() => handleStatusChange(appointment.id, appointment.status)} className="w-full" disabled={appointment.status === 'Cancelled'}>
                            <Badge variant="outline" className={`${getStatusBadge(appointment.status)} w-24 justify-center ${appointment.status !== 'Cancelled' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                {appointment.status}
                            </Badge>
                       </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No appointments found.
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
