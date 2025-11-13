
'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/firebase/auth/use-user';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Upload } from 'lucide-react';


export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  const userAvatarPlaceholder = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || 'SIDDHARTHA HOSPITAL & TRAUMA CENTRE PVT.LTD.');
      setUserEmail(user.email || 'hospital@siddhartha.health');
      setUserPhone(user.phoneNumber || '+977 9841234567');
      setLocalAvatarUrl(user.photoURL);
    }
  }, [user]);

  const handleSaveChanges = () => {
    // In a real app, this would be an API call to update the user profile.
    // This would also include uploading the new image if one was selected.
    toast({
      title: 'Profile Saved',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalAvatarUrl(e.target?.result as string);
        toast({
          title: 'Image Selected',
          description: 'Click "Save Changes" to update your profile picture.',
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemovePhoto = () => {
    setLocalAvatarUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
     toast({
        title: 'Image Removed',
        description: 'Your profile picture will be removed when you save changes.',
      });
  };

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <Header title="User Profile" />
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
            <p>Loading profile...</p>
        </main>
      </div>
    )
  }

  const currentAvatar = localAvatarUrl || userAvatarPlaceholder?.imageUrl;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="User Profile">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
               <div className="relative group">
                <Avatar className="h-24 w-24">
                  {currentAvatar && <AvatarImage src={currentAvatar} alt={userName} />}
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                    onClick={handleAvatarClick}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Upload className="h-8 w-8 text-white" />
                </button>
                 <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                 />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl">{userName}</CardTitle>
                <CardDescription>
                  View and edit your personal information.
                </CardDescription>
                {localAvatarUrl && <Button variant="outline" size="sm" onClick={handleRemovePhoto}>Remove Photo</Button>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+977-..."
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value="Hospital Administrator"
                  readOnly
                   className="cursor-not-allowed bg-muted/50"
                />
              </div>
            </div>
          </CardContent>
           <CardFooter>
                <Button onClick={handleSaveChanges}>Save Profile</Button>
              </CardFooter>
        </Card>
      </main>
    </div>
  );
}
