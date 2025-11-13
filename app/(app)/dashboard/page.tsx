
'use client';

import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useAppearance } from '@/components/appearance-provider';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Header } from '@/components/header';
import { formatToNpr, convertToNepaliDate, formatToNepaliTime } from '@/lib/utils';
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
import { SmartSuggestionToolUI } from '@/components/smart-suggestion-tool-ui';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addAppointment, type Patient, type Appointment, type Staff } from '@/lib/firebase-services';


export default function Dashboard() {
  const { background, transparency } = useAppearance();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { data: patients, loading: patientsLoading } = useCollection<Patient>('patients');
  const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>('appointments');
  const { data: staff, loading: staffLoading } = useCollection<Staff>('staff');

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [department, setDepartment] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointmentTime, setAppointmentTime] = useState('');
  const { toast } = useToast();

  const todayNepali = convertToNepaliDate(new Date());

  const patientsRegisteredToday = patients?.filter(p => p.registrationDate && convertToNepaliDate(p.registrationDate) === todayNepali).length || 0;
  
  const revenueToday = patients?.reduce((total, patient) => {
    const paidTodayBillingItems = patient.billing?.filter(item => {
        if (item.status !== 'Paid') return false;
        return item.date === todayNepali;
    }) ?? [];
    const paidToday = paidTodayBillingItems.reduce((sum, item) => sum + item.amount, 0);
    return total + paidToday;
  }, 0) || 0;

  const pendingBillsCount = patients?.reduce((count, patient) => {
    const unpaidCount = patient.billing?.filter(item => item.status !== 'Paid').length ?? 0;
    return count + unpaidCount;
  }, 0) || 0;

  const appointmentsToday = appointments?.filter(apt => apt.date && convertToNepaliDate(apt.date) === todayNepali) || [];
  
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
      console.error("Error adding appointment:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add appointment.' });
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col relative">
       {background && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background})`,
            opacity: transparency,
          }}
        />
      )}
      <div className="relative z-10 flex flex-col flex-1">
        <Header title="Dashboard">
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
                       {staff?.filter(s => s.profession.toLowerCase().includes('doctor') || s.profession.toLowerCase().includes('ist') || s.profession.toLowerCase().includes('ian')).map(d => (
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
          <div className="text-center mb-4 bg-background/80 p-4 rounded-lg">
            <h1 className="text-3xl font-bold tracking-tight" style={{color: '#83A2D4'}}>
              SIDDHARTHA HOSPITAL &amp; TRAUMA CENTRE PVT.LTD.
            </h1>
            <svg
              className="w-full mt-1"
              viewBox="0 0 800 20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0 10 H200 L220 5 L240 15 L260 10 L300 10 L310 12 L320 8 L330 10 L380 10 L390 14 L400 6 L410 10 H600 L620 5 L640 15 L660 10 H800"
                stroke="black"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <p className="text-muted-foreground mt-2">Rangeli-7</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Patients Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientsRegisteredToday}</div>
                <p className="text-xs text-muted-foreground">
                  Total patients registered today.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments Today
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{appointmentsToday.length}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled for today.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingBillsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total outstanding bills.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatToNpr(revenueToday)}</div>
                <p className="text-xs text-muted-foreground">
                  Total income from payments today.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Recent Patients</CardTitle>
                  <CardDescription>
                    Recently registered patients in the system.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/patients">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead className="hidden xl:table-column">
                        Gender
                      </TableHead>
                      <TableHead className="hidden xl:table-column">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Last Visit
                      </TableHead>
                      <TableHead className="text-right">Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientsLoading ? (
                       <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">Loading recent patients...</TableCell>
                      </TableRow>
                    ) : patients && patients.length > 0 ? (
                      patients.slice(0, 5).map((patient) => (
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
                          <TableCell className="hidden xl:table-column">
                            {patient.gender}
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            <Badge
                              variant={
                                patient.status === 'Active' ? 'default' : 'secondary'
                              }
                              className={`${patient.status === 'Active' ? 'bg-green-500/20 text-green-700' : ''}`}
                            >
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {patient.lastVisit}
                          </TableCell>
                          <TableCell className="text-right">{patient.age}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No recent patients.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Appointments scheduled for today.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                 {appointmentsLoading ? (
                    <p className="text-sm text-muted-foreground text-center">Loading appointments...</p>
                 ) : appointmentsToday && appointmentsToday.length > 0 ? (
                    appointmentsToday.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4"
                      >
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
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            {appointment.patientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            with {appointment.doctorName}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{appointment.time}</div>
                      </div>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground text-center pt-4">No appointments for today.</p>
                 )}
                <Button asChild size="sm" className="w-full">
                  <Link href="/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <SmartSuggestionToolUI />
      </div>
    </div>
  );
}
