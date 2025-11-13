

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
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
import { patients, type BillingItem } from '@/lib/data'; // Import mutable patients array
import { labTests } from '@/lib/lab-tests';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatToNpr, convertToNepaliDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Invoice } from '@/components/invoice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const services = [
  { value: "OPD", label: "OPD", price: 350 },
  { value: "EMERGENCY", label: "EMERGENCY", price: 350 },
  { value: "IPD", label: "IPD", price: 1000 },
  { value: "FOLLOW_UP", label: "Follow-up Checkup" },
  { value: "USG", label: "USG", price: 1000 },
  { value: "XRAY", label: "X-RAY", price: 600 },
  { value: "LABORATORY", label: "LABORATORY" },
  { value: "ECG", label: "ECG" },
  { value: "MEDICATION", label: "MEDICATION" },
  { value: "OTHER", label: "Other" },
]

type LabTestEntry = {
    id: number;
    value: string;
    price: number;
    popoverOpen: boolean;
};


export default function PatientBillingPage() {
  const { patientId } = useParams() as { patientId: string };
  const { toast } = useToast();

  const [isInvoiceOpen, setInvoiceOpen] = useState(false);
  const [newService, setNewService] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [serviceComboboxOpen, setServiceComboboxOpen] = useState(false)
  const [labTestEntries, setLabTestEntries] = useState<LabTestEntry[]>([{ id: 1, value: '', price: 0, popoverOpen: false }]);


  // Use state to trigger re-renders when the shared patients array changes
  const [, setTriggerRender] = useState(0);

  const patient = patients.find((p) => p.id === patientId);

  // Effect to update total amount when lab tests change
  useEffect(() => {
    if (newService.toUpperCase() === 'LABORATORY') {
        const total = labTestEntries.reduce((sum, test) => sum + test.price, 0);
        setNewAmount(total.toString());
    }
  }, [labTestEntries, newService]);

  const handleServiceSelect = (currentValue: string) => {
    const selectedService = services.find(s => s.value.toLowerCase() === currentValue.toLowerCase());
    const serviceValue = selectedService ? selectedService.value : currentValue;
    setNewService(serviceValue);

    if (serviceValue.toUpperCase() !== 'LABORATORY') {
        setLabTestEntries([{ id: 1, value: '', price: 0, popoverOpen: false }]);
    }

    if (selectedService && selectedService.price) {
        setNewAmount(selectedService.price.toString());
    } else {
        setNewAmount(''); // Clear amount for custom or non-priced services
    }

    setServiceComboboxOpen(false);
  }

  const handleAddBillingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService || !newAmount || !patient) return;

    let finalService = newService;
    if (newService.toUpperCase() === 'LABORATORY' && labTestEntries.some(t => t.value.trim() !== '')) {
        const tests = labTestEntries.map(t => t.value).filter(name => name.trim() !== '').join(', ');
        if(tests) {
            finalService = `${newService} - ${tests}`;
        }
    }

    const newBillingItem: BillingItem = {
      id: `B-${Date.now()}`,
      date: convertToNepaliDate(new Date()),
      service: finalService,
      amount: parseFloat(newAmount),
      status: 'Unpaid',
    };

    // Find the patient in the global array and update their billing
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex > -1) {
        if (!patients[patientIndex].billing) {
            patients[patientIndex].billing = [];
        }
        patients[patientIndex].billing!.push(newBillingItem);
    }
    
    // Trigger a re-render
    setTriggerRender(prev => prev + 1);

    // Reset Form
    setNewService('');
    setLabTestEntries([{ id: 1, value: '', price: 0, popoverOpen: false }]);
    setNewAmount('');

    toast({
      title: 'Billing Item Added',
      description: `${finalService} has been added to ${patient.name}'s bill.`,
    });
  };

  const handleStatusChange = (itemId: string) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1 || !patients[patientIndex].billing) return;

    const billingItemIndex = patients[patientIndex].billing!.findIndex(item => item.id === itemId);
    if (billingItemIndex === -1) return;

    const currentItem = patients[patientIndex].billing![billingItemIndex];
    const newStatus = currentItem.status === 'Paid' ? 'Unpaid' : 'Paid';
    
    // Mutate the status
    patients[patientIndex].billing![billingItemIndex].status = newStatus;

    // Trigger a re-render
    setTriggerRender(prev => prev + 1);

    toast({
      title: 'Status Updated',
      description: `The status for ${currentItem.service} has been changed to ${newStatus}.`
    });
  };

  const handlePrintStatement = () => {
    setInvoiceOpen(true);
    // Allow time for the dialog to render before printing
    setTimeout(() => {
      window.print();
    }, 500);
  };
  
    const updateLabTestEntry = (id: number, updates: Partial<Omit<LabTestEntry, 'id'>>) => {
        setLabTestEntries(entries =>
            entries.map(entry => (entry.id === id ? { ...entry, ...updates } : entry))
        );
    };

    const addLabTestEntry = () => {
        setLabTestEntries(entries => [
            ...entries,
            { id: Date.now(), value: '', price: 0, popoverOpen: false },
        ]);
    };

    const removeLabTestEntry = (id: number) => {
        setLabTestEntries(entries => {
            const newEntries = entries.filter(entry => entry.id !== id);
            return newEntries.length > 0 ? newEntries : [{ id: 1, value: '', price: 0, popoverOpen: false }];
        });
    };

    const handleLabTestSelect = (id: number, testValue: string) => {
        const test = labTests.find(t => t.test.toLowerCase() === testValue.toLowerCase());
        updateLabTestEntry(id, {
            value: test ? test.test : testValue,
            price: test ? test.charge : 0,
            popoverOpen: false,
        });
    };

  if (!patient) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Patient Not Found" />
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested patient could not be found.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const totalAmount = patient.billing?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalPaid = patient.billing?.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalDue = totalAmount - totalPaid;

  const getStatusBadge = (status: 'Paid' | 'Unpaid' | 'Overdue') => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-700';
      case 'Unpaid':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'Overdue':
        return 'bg-red-500/20 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Billing for ${patient.name}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={patient.avatar.imageUrl} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-3xl">{patient.name}</CardTitle>
                <CardDescription>
                    Patient ID: {patient.id} &bull; Age: {patient.age} &bull; Gender: {patient.gender}
                </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Dialog open={isInvoiceOpen} onOpenChange={setInvoiceOpen}>
                  <DialogTrigger asChild>
                    <Button>Generate Invoice</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 border-none">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Invoice for {patient.name}</DialogTitle>
                    </DialogHeader>
                    <Invoice patient={patient} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handlePrintStatement}>Print Statement</Button>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>A complete record of all charges and payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Service/Item</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.billing && patient.billing.length > 0 ? (
                                patient.billing.map((item) => (
                                    <TableRow key={item.id}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="font-medium">{item.service}</TableCell>
                                    <TableCell className="text-right">{formatToNpr(item.amount)}</TableCell>
                                    <TableCell className="text-center">
                                      <button onClick={() => handleStatusChange(item.id)} className="w-full">
                                        <Badge variant="outline" className={`${getStatusBadge(item.status)} cursor-pointer w-20 justify-center`}>
                                            {item.status}
                                        </Badge>
                                      </button>
                                    </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No billing records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                    {patient.billing && patient.billing.length > 0 && (
                         <CardFooter className="flex-col items-end gap-2 pt-4">
                            <div className="flex justify-between w-full max-w-xs">
                               <span className="text-muted-foreground">Subtotal</span>
                               <span>{formatToNpr(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs">
                               <span className="text-muted-foreground">Total Paid</span>
                               <span>-{formatToNpr(totalPaid)}</span>
                            </div>
                            <Separator className="my-2 max-w-xs"/>
                             <div className="flex justify-between w-full max-w-xs font-semibold text-lg">
                               <span>Total Due</span>
                               <span>{formatToNpr(totalDue)}</span>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Bill</CardTitle>
                  <CardDescription>
                    Add a new service or charge for this patient.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBillingItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Service/Item</Label>
                      <Popover open={serviceComboboxOpen} onOpenChange={setServiceComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={serviceComboboxOpen}
                            className="w-full justify-between"
                          >
                            {newService
                              ? services.find((s) => s.value.toLowerCase() === newService.toLowerCase())?.label || newService
                              : "Select service or type custom"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 popover-content-width-full">
                          <Command>
                            <CommandInput 
                              placeholder="Search service or type custom..."
                              onValueChange={setNewService}
                              value={newService}
                            />
                            <CommandList>
                                <CommandEmpty>No service found.</CommandEmpty>
                                <CommandGroup>
                                  {services.map((service) => (
                                    <CommandItem
                                      key={service.value}
                                      value={service.value}
                                      onSelect={handleServiceSelect}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          newService.toLowerCase() === service.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {service.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {newService.toUpperCase() === 'LABORATORY' && (
                        <div className="space-y-3 rounded-md border p-4">
                            <Label>Test(s)</Label>
                            {labTestEntries.map((entry, index) => (
                               <div key={entry.id} className="flex items-start gap-2">
                                <Popover open={entry.popoverOpen} onOpenChange={(isOpen) => updateLabTestEntry(entry.id, { popoverOpen: isOpen })}>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between font-normal"
                                    >
                                        {entry.value ? labTests.find(t => t.test.toLowerCase() === entry.value.toLowerCase())?.test : "Select a test..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 md:w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search test..."
                                            onValueChange={(searchValue) => updateLabTestEntry(entry.id, { value: searchValue })}
                                            value={entry.value}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No test found.</CommandEmpty>
                                            <CommandGroup>
                                                {labTests.map((test) => (
                                                <CommandItem
                                                    key={test.test}
                                                    value={test.test}
                                                    onSelect={(currentValue) => handleLabTestSelect(entry.id, currentValue)}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", entry.value.toLowerCase() === test.test.toLowerCase() ? "opacity-100" : "opacity-0")} />
                                                    {test.test}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={entry.price || ''}
                                    onChange={(e) => updateLabTestEntry(entry.id, { price: parseFloat(e.target.value) || 0 })}
                                    className="w-24"
                                />
                                <Button variant="ghost" size="icon" type="button" onClick={() => removeLabTestEntry(entry.id)} disabled={labTestEntries.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                               </div>
                            ))}
                            <Button variant="outline" size="sm" type="button" onClick={addLabTestEntry}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Test
                            </Button>
                        </div>
                    )}
                     
                    <div className="space-y-2">
                      <Label htmlFor="amount">Total Amount (NPR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 1500"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        required
                        readOnly={newService.toUpperCase() === 'LABORATORY'}
                        className={newService.toUpperCase() === 'LABORATORY' ? "bg-muted/50" : ""}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add to Bill
                    </Button>
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
