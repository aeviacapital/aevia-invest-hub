import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, CheckCircle, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

const KYCVerification = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documentType: 'passport',
    documentFile: null as File | null
  });

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setDocuments(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPEG, PNG, or PDF file.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive'
        });
        return;
      }

      setDocumentForm(prev => ({
        ...prev,
        documentFile: file
      }));
    }
  };

  const handleDocumentUpload = async () => {
    if (!user || !documentForm.documentFile) return;

    setIsLoading(true);

    try {
      // In a real application, you would upload to storage first
      // For this demo, we'll simulate the upload
      const mockDocumentUrl = `https://example.com/documents/${user.id}/${documentForm.documentType}_${Date.now()}.${documentForm.documentFile.name.split('.').pop()}`;

      const { error } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: documentForm.documentType,
          document_url: mockDocumentUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Document Uploaded',
        description: `Your ${documentForm.documentType.replace('_', ' ')} has been uploaded for review.`,
      });

      fetchDocuments();
      setDocumentForm({
        documentType: 'passport',
        documentFile: null
      });

      // Reset file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getKYCStatusMessage = () => {
    switch (profile?.kyc_status) {
      case 'approved':
        return {
          variant: 'default' as const,
          title: 'KYC Approved',
          description: 'Your identity has been verified. You can now access all platform features including withdrawals.'
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          title: 'KYC Rejected',
          description: 'Your verification was rejected. Please upload new documents or contact support.'
        };
      default:
        return {
          variant: 'default' as const,
          title: 'KYC Pending',
          description: 'Your verification is under review. This process typically takes 24-48 hours.'
        };
    }
  };

  const statusMessage = getKYCStatusMessage();

  const requiredDocuments = ['passport', 'drivers_license', 'national_id'];
  const uploadedDocumentTypes = documents.filter(doc => doc.status !== 'rejected').map(doc => doc.document_type);
  const missingDocuments = requiredDocuments.filter(type => !uploadedDocumentTypes.includes(type));

  return (
    <div className="space-y-6">
      {/* KYC Status */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            KYC Verification Status
          </CardTitle>
          <CardDescription>
            Complete identity verification to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={statusMessage.variant}>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>{statusMessage.title}:</strong> {statusMessage.description}
            </AlertDescription>
          </Alert>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-center mb-2">
                {profile?.kyc_status === 'approved' ? (
                  <CheckCircle className="w-8 h-8 text-success" />
                ) : profile?.kyc_status === 'rejected' ? (
                  <XCircle className="w-8 h-8 text-destructive" />
                ) : (
                  <Clock className="w-8 h-8 text-warning" />
                )}
              </div>
              <h3 className="font-medium">Identity Verification</h3>
              <Badge className={`mt-2 ${getStatusColor(profile?.kyc_status || 'pending')} text-white`}>
                {profile?.kyc_status || 'pending'}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-center mb-2">
                {documents.length > 0 ? (
                  <CheckCircle className="w-8 h-8 text-success" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-warning" />
                )}
              </div>
              <h3 className="font-medium">Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {documents.length} uploaded
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex justify-center mb-2">
                {profile?.is_verified ? (
                  <CheckCircle className="w-8 h-8 text-success" />
                ) : (
                  <Clock className="w-8 h-8 text-warning" />
                )}
              </div>
              <h3 className="font-medium">Account Status</h3>
              <Badge className={`mt-2 ${profile?.is_verified ? 'bg-success' : 'bg-warning'} text-white`}>
                {profile?.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload clear photos or scans of your identification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {missingDocuments.length > 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Please upload at least one form of identification: {missingDocuments.map(type => type.replace('_', ' ')).join(', ')}.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select 
                  value={documentForm.documentType} 
                  onValueChange={(value) => setDocumentForm(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document File</Label>
                <Input
                  id="document-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPEG, PNG, PDF (max 5MB)
                </p>
              </div>

              <Button 
                onClick={handleDocumentUpload}
                disabled={isLoading || !documentForm.documentFile}
                className="w-full btn-hero"
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium mb-2">Document Requirements</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Clear, high-quality image or scan</p>
                  <p>• All text must be readable</p>
                  <p>• Document must be valid and not expired</p>
                  <p>• Full document visible (no cropping)</p>
                  <p>• No filters or editing</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-warning/10 border-warning/20">
                <h4 className="font-medium text-warning mb-1">Privacy Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Your documents are encrypted and stored securely. We only use them for identity verification purposes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>
            Track the status of your submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Upload your first document above.
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        <span className="font-medium capitalize">
                          {document.document_type.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge className={`${getStatusColor(document.status)} text-white`}>
                        {document.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(document.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {document.rejection_reason && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-sm">
                        <strong>Rejection Reason:</strong> {document.rejection_reason}
                      </p>
                    </div>
                  )}

                  {document.updated_at !== document.created_at && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(document.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
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