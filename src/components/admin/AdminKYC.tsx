import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Check, X, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const AdminKYC = () => {
  const [kycDocuments, setKycDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKycDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [kycDocuments, searchTerm, statusFilter]);

  const fetchKycDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKycDocuments(data || []);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch KYC documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = kycDocuments;

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const updateKycStatus = async (documentId: string, status: string, reason?: string) => {
    try {
      const updateData: any = { status };
      
      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('kyc_documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      // Also update profile KYC status
      const document = kycDocuments.find(d => d.id === documentId);
      if (document && status === 'approved') {
        await supabase
          .from('profiles')
          .update({ kyc_status: 'approved' })
          .eq('user_id', document.user_id);
      }

      toast({
        title: 'Success',
        description: `KYC document ${status} successfully`,
      });

      fetchKycDocuments();
      setSelectedDocument(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update KYC status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search KYC documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Documents Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.profiles?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.document_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          document.status === 'approved'
                            ? 'default'
                            : document.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {document.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(document.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.document_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {document.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateKycStatus(document.id, 'approved')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject KYC Document</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting this KYC document.
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Enter rejection reason..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => 
                                      updateKycStatus(selectedDocument?.id, 'rejected', rejectionReason)
                                    }
                                  >
                                    Reject Document
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No KYC documents found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};