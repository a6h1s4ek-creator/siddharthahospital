
'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Slider } from '@/components/ui/slider';
import { useAppearance } from '@/components/appearance-provider';
import { useUser } from '@/firebase/auth/use-user';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || 'SIDDHARTHA HOSPITAL & TRAUMA CENTRE PVT.LTD.');
      setUserEmail(user.email || 'hospital@siddhartha.health');
      setUserPhone(user.phoneNumber || '');
    }
  }, [user]);

  const [userSpecialization, setUserSpecialization] = useState('Paleontology');
  const { theme, setTheme } = useTheme();
  const { background, transparency, setBackground, setTransparency } = useAppearance();

  const handleSaveChanges = () => {
    // In a real app, this would be an API call.
    toast({
      title: 'Profile Saved',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handleAppearanceSave = () => {
    toast({
        title: 'Appearance Saved',
        description: 'Your theme and dashboard background preferences have been updated.',
    });
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Settings">
        <Button>Save All Changes</Button>
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+977-..." value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" value={userSpecialization} onChange={(e) => setUserSpecialization(e.target.value)}/>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Profile</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage how you receive notifications from the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via your registered email address.
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get real-time alerts on your devices.
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment-alerts" className="text-base">New Appointment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify me when a new appointment is scheduled.
                    </p>
                  </div>
                  <Switch
                    id="appointment-alerts"
                    defaultChecked
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="billing-reminders" className="text-base">Billing Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders for pending and overdue bills.
                    </p>
                  </div>
                  <Switch
                    id="billing-reminders"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Select a theme for the application dashboard.</p>
                  <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <RadioGroupItem value="light" id="light" className="peer sr-only" />
                      <Label
                        htmlFor="light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Light
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                      <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Dark
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="system" id="system" className="peer sr-only" />
                      <Label
                        htmlFor="system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                  <Label className="text-base">Dashboard Background</Label>
                  <div className="space-y-2">
                    <Label htmlFor="background-image">Background Image</Label>
                    <Input id="background-image" type="file" accept="image/*" onChange={handleFileChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="background-transparency">Background Transparency</Label>
                    <div className="flex items-center gap-4">
                       <Slider
                        id="background-transparency"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[transparency]}
                        onValueChange={(value) => setTransparency(value[0])}
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {(transparency * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
               <CardFooter>
                <Button onClick={handleAppearanceSave}>Save Appearance</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
