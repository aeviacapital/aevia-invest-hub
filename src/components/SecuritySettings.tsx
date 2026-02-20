import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SecuritySettings = () => {
  return (
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
  );
};

export default SecuritySettings;
