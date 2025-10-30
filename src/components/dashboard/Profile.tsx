import React, { useState, useEffect, useRef } from 'react'; // ADDED useRef
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Upload } from 'lucide-react'; // ADDED Upload icon

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    dateOfBirth: profile?.date_of_birth || ''
  });
  // NEW STATE: To manage the avatar URL and its local display
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  // NEW REF: To link the camera button to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile data and avatar URL when profile loads/updates
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        dateOfBirth: profile.date_of_birth || ''
      });
      // Sync local avatar state with global profile state
      setAvatarUrl(profile.avatar_url); 
    }
  }, [profile]);
  
  // Existing useEffect for initial load
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]); // Added refreshProfile to dependency array

  const handleInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Use current state for loading, which prevents other actions
    setIsLoading(true); 

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.fullName,
          phone: profileForm.phone,
          country: profileForm.country,
          date_of_birth: profileForm.dateOfBirth || null,
          // IMPORTANT: Ensure the latest avatarUrl is saved along with other fields
          avatar_url: avatarUrl 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });

      await refreshProfile();
      setIsEditing(false);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile changes.',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };
  
  const handleCancelEdit = () => {
    // Revert form state
    setProfileForm({
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      country: profile?.country || '',
      dateOfBirth: profile?.date_of_birth || ''
    });
    // Revert avatar URL state
    setAvatarUrl(profile?.avatar_url || null);
    setIsEditing(false);
  };

  // NEW FUNCTION: Triggers the hidden file input
  const handleAvatarButtonClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // NEW FUNCTION: Handles file upload to Supabase Storage and database update
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    setIsLoading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    // Unique path in Storage: user ID / random file name
    const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // !!! MUST be the name of your bucket !!!
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        const newAvatarUrl = publicUrlData.publicUrl;
        
        // 3. Update the profiles table with the new URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        
        // Update local state and refresh context
        setAvatarUrl(newAvatarUrl); 
        await refreshProfile(); 
        
        toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been updated successfully.',
        });
      }

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // Clear the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {/* USE avatarUrl STATE for immediate display */}
                <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name} /> 
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* HIDDEN FILE INPUT */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
                disabled={!isEditing || isLoading}
              />

              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                // ENABLED ONLY WHEN EDITING
                onClick={handleAvatarButtonClick}
                disabled={!isEditing || isLoading} 
              >
                {isLoading ? <Upload className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{profile?.full_name || 'User'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={profile?.is_verified ? 'default' : 'destructive'}>
                  {profile?.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="outline">
                  KYC: {profile?.kyc_status || 'pending'}
                </Badge>
              </div>
            </div>
          </div>
          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="country"
                    value={profileForm.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="United States"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    disabled
                    className="pl-10 bg-muted/50"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="btn-hero"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="btn-hero">
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Account Statistics */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your account activity and balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {profile?.kyc_status === 'approved' ? '✓' : '⏳'}
              </div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {profile?.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Security Settings */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Enable 2FA
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline" disabled>
              Change Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Login History</h4>
              <p className="text-sm text-muted-foreground">
                View recent login activity
              </p>
            </div>
            <Button variant="outline" disabled>
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Profile;
