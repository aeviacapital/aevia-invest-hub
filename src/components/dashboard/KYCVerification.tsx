import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Upload, CheckCircle, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react'; 
import { toast } from 'sonner';

const KYCVerification = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documentType: 'passport',
    documentFile: null as File | null
  });

  // 🔹 Load current user + profile
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setDocuments(data || []);
  };

  // 🔹 File validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Please upload files under 5MB.');
      return;
    }

    setDocumentForm(prev => ({ ...prev, documentFile: file }));
  };

  // 🔹 Upload to Supabase Storage
  // 🔹 Upload to Supabase Storage
 // Inside KYCVerification.tsx

// ... (previous code remains the same)

// 🔹 Upload to Supabase Storage
  // Inside KYCVerification.tsx

// 🔹 Upload to Supabase Storage
const handleDocumentUpload = async () => {
    if (!user || !documentForm.documentFile) return;

    setIsLoading(true);
    const file = documentForm.documentFile;
    const fileExt = file.name.split('.').pop();
    // This is the permanent path in Storage, which we must save!
    const filePath = `${user.id}/${documentForm.documentType}_${Date.now()}.${fileExt}`;

    try {
        // 1. Upload to storage (same as before)
        const { error: uploadError } = await supabase.storage
            .from('kyc-bucket') 
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 2. Generate a permanent PUBLIC URL (No RLS needed, no expiration)
        const { data: publicData } = supabase.storage
            .from('kyc-bucket')
            .getPublicUrl(filePath); // 🟢 NEW: Use getPublicUrl

        // 3. Save record to DB: Save the permanent PUBLIC URL and the path
        const { error: insertError } = await supabase
            .from('kyc_documents')
            .insert({
                user_id: user.id,
                document_type: documentForm.documentType,
                // 🛑 CRITICAL CHANGE: Save the permanent Public URL here
                document_url: publicData.publicUrl, 
                file_path: filePath, 
                status: 'pending'
            });

        if (insertError) throw insertError;

        toast.success(`${documentForm.documentType.replace('_', ' ')} uploaded successfully!`);
        fetchDocuments(); // Re-fetch list to show the new document
        
    } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message || 'Check network.'}`);
    } finally {
        setIsLoading(false);
    }
};
  // 🔹 Utility: status icons and styles
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload KYC Documents
          </CardTitle>
          <CardDescription>
            Upload a valid ID document. Accepted: Passport, National ID, or Driver’s License.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={documentForm.documentType}
                  onValueChange={(value) =>
                    setDocumentForm((prev) => ({ ...prev, documentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload File</Label>
                <Input
                  id="document-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              <Button
                onClick={handleDocumentUpload}
                disabled={isLoading || !documentForm.documentFile}
                className="w-full"
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• JPEG, PNG, or PDF only</p>
              <p>• Max file size: 5MB</p>
              <p>• All text and photo must be visible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Your Uploaded Documents</CardTitle>
          <CardDescription>Track KYC review status below</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <span className="capitalize font-medium">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                      <Badge className={`${getStatusColor(doc.status)} text-white`}>
                        {doc.status}
                      </Badge>
                    </div>
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;

