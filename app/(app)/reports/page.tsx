
'use client';

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { formatToNpr } from '@/lib/utils';
import { Download, Users, DollarSign, Stethoscope } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import * as XLSX from 'xlsx';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Patient, Appointment } from '@/lib/firebase-services';
import { useMemo } from 'react';

export default function ReportsPage() {
  const { data: patients, loading: patientsLoading, error: patientsError } = useCollection<Patient>('patients');
  const { data: appointments, loading: appointmentsLoading, error: appointmentsError } = useCollection<Appointment>('appointments');


  // --- Data Processing for Charts ---
  const { totalRevenue, totalPatients, avgRevenuePerPatient, chartData, appointmentStatusData } = useMemo(() => {
    if (!patients || !appointments) {
        return { totalRevenue: 0, totalPatients: 0, avgRevenuePerPatient: 0, chartData: [], appointmentStatusData: [] };
    }

    // 1. Total Revenue, Patients, Average Revenue
    const totalRevenue = patients.reduce((acc, patient) => {
      return acc + (patient.billing?.reduce((sum, item) => sum + item.amount, 0) ?? 0);
    }, 0);
    const totalPatients = patients.length;
    const avgRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;

    // 2. Monthly Revenue and Patient Registrations
    const monthlyData: { [key: string]: { revenue: number; newPatients: number } } = {};

    patients.forEach(patient => {
      if (patient.registrationDate) {
          const date = new Date(patient.registrationDate);
          if (!isNaN(date.getTime())) {
              const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
              
              if (!monthlyData[month]) {
                  monthlyData[month] = { revenue: 0, newPatients: 0 };
              }
              monthlyData[month].newPatients += 1;

              patient.billing?.forEach(item => {
                  if (item.date) {
                    try {
                        const billingDate = new Date(item.date); // This can be risky if format is not standard
                        if (!isNaN(billingDate.getTime())) {
                            const billingMonth = billingDate.toLocaleString('default', { month: 'short', year: '2-digit' });
                            if(billingMonth === month){
                                monthlyData[month].revenue += item.amount;
                            }
                        }
                    } catch(e) {
                        // Could not parse date, skip
                    }
                  }
              });
          }
      }
    });

    const chartData = Object.entries(monthlyData)
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => new Date(`1 ${a.name}`) > new Date(`1 '${b.name}`) ? 1 : -1)
      .slice(-6);

    // 3. Appointment Status Data
    const statusCounts = appointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
    }, {} as Record<Appointment['status'], number>);
    
    const appointmentStatusData = [
      { name: 'Completed', value: statusCounts.Completed || 0, fill: 'hsl(var(--chart-1))' },
      { name: 'Confirmed', value: statusCounts.Confirmed || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'Cancelled', value: statusCounts.Cancelled || 0, fill: 'hsl(var(--chart-3))' },
      { name: 'Pending', value: statusCounts.Pending || 0, fill: 'hsl(var(--chart-4))' },
    ];

    return { totalRevenue, totalPatients, avgRevenuePerPatient, chartData, appointmentStatusData };

  }, [patients, appointments]);


  const revenueChartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const patientChartConfig = {
    newPatients: {
      label: 'New Patients',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;


  const handleExport = () => {
    if (!patients) return;
    // 1. Prepare Patient Data
    const patientDataForExport = patients.flatMap(p => {
      if (!p.billing || p.billing.length === 0) {
        return [{
          'Patient ID': p.id,
          'Name': p.name,
          'Age': p.age,
          'Gender': p.gender,
          'Address': p.address,
          'Registration Date': p.registrationDate ? new Date(p.registrationDate).toLocaleDateString() : 'N/A',
          'Billing ID': 'N/A',
          'Service': 'N/A',
          'Date': 'N/A',
          'Amount': 'N/A',
          'Status': 'N/A',
        }];
      }
      return p.billing.map(b => ({
        'Patient ID': p.id,
        'Name': p.name,
        'Age': p.age,
        'Gender': p.gender,
        'Address': p.address,
        'Registration Date': p.registrationDate ? new Date(p.registrationDate).toLocaleDateString() : 'N/A',
        'Billing ID': b.id,
        'Service': b.service,
        'Date': b.date,
        'Amount': b.amount,
        'Status': b.status,
      }));
    });

    const patientSheet = XLSX.utils.json_to_sheet(patientDataForExport);

    // 2. Prepare Summary Data
    const summaryData = [
        { Metric: "Total Revenue", Value: formatToNpr(totalRevenue) },
        { Metric: "Total Patients", Value: totalPatients },
        { Metric: "Average Revenue per Patient", Value: formatToNpr(avgRevenuePerPatient) },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    // 3. Create Workbook and Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, patientSheet, 'Patient History');
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Revenue Summary');
    XLSX.writeFile(wb, 'SiddharthaHospital_Report.xlsx');
  };

  const isLoading = patientsLoading || appointmentsLoading;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Reports & Analytics">
        <Button onClick={handleExport} disabled={isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{formatToNpr(totalRevenue)}</div>}
                    <p className="text-xs text-muted-foreground">All-time revenue generated</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalPatients}</div>}
                    <p className="text-xs text-muted-foreground">Total patients in the system</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Revenue/Patient</CardTitle>
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{formatToNpr(avgRevenuePerPatient)}</div>}
                    <p className="text-xs text-muted-foreground">Average all-time revenue per patient</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Revenue generated over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                {isLoading ? <div className="h-full w-full flex items-center justify-center">Loading chart...</div> : (
                  <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickFormatter={(value) => formatToNpr(value).replace('NPR', '')}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                      dataKey="revenue"
                      type="monotone"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      dot={true}
                    />
                  </LineChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>Distribution of all appointments.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={{}} className="h-[250px] w-full max-w-[250px]">
                 {isLoading ? <div className="h-full w-full flex items-center justify-center">Loading chart...</div> : (
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                 )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
         <Card>
            <CardHeader>
              <CardTitle>New Patient Registrations</CardTitle>
              <CardDescription>
                Number of new patients registered per month.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={patientChartConfig} className="h-[300px] w-full">
                 {isLoading ? <div className="h-full w-full flex items-center justify-center">Loading chart...</div> : (
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="newPatients"
                      fill="var(--color-newPatients)"
                      radius={4}
                    />
                  </BarChart>
                 )}
              </ChartContainer>
            </CardContent>
          </Card>
      </main>
    </div>
  );
}
