import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Pause, Play, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const AdminInvestmentPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    investment_type: 'crypto',
    risk_level: 'medium',
    min_deposit: 0,
    expected_return_min: 0,
    expected_return_max: 0,
    duration_days: 3,
    features: [''],
    is_active: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('investment_plans')
      .select('*')
      .order('created_at', { ascending: false });

    setPlans(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const features = formData.features.filter(f => f.trim() !== '');

      if (editingPlan) {
        const { error } = await supabase
          .from('investment_plans')
          .update({ ...formData, features })
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Investment plan updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('investment_plans')
          .insert([{ ...formData, features }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Investment plan created successfully',
        });
      }

      fetchPlans();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      investment_type: plan.investment_type,
      risk_level: plan.risk_level,
      min_deposit: plan.min_deposit,
      expected_return_min: plan.expected_return_min,
      expected_return_max: plan.expected_return_max,
      duration_days: plan.duration_days,
      features: plan.features || [''],
      is_active: plan.is_active,
    });
    setIsDialogOpen(true);
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('investment_plans')
      .update({ is_active: !currentStatus })
      .eq('id', planId);

    if (!error) {
      toast({
        title: 'Success',
        description: `Plan ${!currentStatus ? 'activated' : 'paused'} successfully`,
      });
      fetchPlans();
    }
  };

  // 🧨 NEW: Handle plan deletion safely
  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

    const { error } = await supabase.from('investment_plans').delete().eq('id', planId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Investment plan deleted successfully',
    });

    fetchPlans();
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      description: '',
      investment_type: 'crypto',
      risk_level: 'medium',
      min_deposit: 0,
      expected_return_min: 0,
      expected_return_max: 0,
      duration_days: 3,
      features: [''],
      is_active: true,
    });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ''],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Investment Plans Management</CardTitle>
              <CardDescription>Create and manage investment opportunities</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{plan.title}</h3>
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? 'Active' : 'Paused'}
                        </Badge>
                        <Badge variant="outline">{plan.risk_level} risk</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Min Deposit</p>
                          <p className="font-semibold">${plan.min_deposit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Returns</p>
                          <p className="font-semibold text-success">
                            {plan.expected_return_min}%-{plan.expected_return_max}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold">{plan.duration_days} days</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                      >
                        {plan.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      {/* 🗑️ NEW DELETE BUTTON */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog stays exactly the same */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit' : 'Create'} Investment Plan</DialogTitle>
            <DialogDescription>
              Fill in the details for the investment opportunity
            </DialogDescription>
          </DialogHeader>

            {/* FORM CONTENT (UNCHANGED) */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment_type">Investment Type</Label>
                <Select
                  value={formData.investment_type}
                  onValueChange={(value) => setFormData({ ...formData, investment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="oil_gas">Oil & Gas</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_level">Risk Level</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_deposit">Minimum Deposit ($)</Label>
                <Input
                  id="min_deposit"
                  type="number"
                  value={formData.min_deposit}
                  onChange={(e) => setFormData({ ...formData, min_deposit: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (Days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_return_min">Min Return (%)</Label>
                <Input
                  id="expected_return_min"
                  type="number"
                  step="0.1"
                  value={formData.expected_return_min}
                  onChange={(e) => setFormData({ ...formData, expected_return_min: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_return_max">Max Return (%)</Label>
                <Input
                  id="expected_return_max"
                  type="number"
                  step="0.1"
                  value={formData.expected_return_max}
                  onChange={(e) => setFormData({ ...formData, expected_return_max: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Features</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature"
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

