import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Send, Eye } from "lucide-react";
import { motion } from "framer-motion";

const EDGE_FUNCTION_URL = "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-admin-email";

export const AdminSendEmailDialog = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  const [form, setForm] = useState({
    recipient_email: "",
    subject: "",
    body: "",
  });

const BRAND_ACCENT = "#b58900";

const templates = [
  {
    id: "default",
    name: "Aviacapital Classic",
    header: "Welcome to Aviacapital",
    footer:
      "© 2025 Aviacapital — Empowering your financial future. All rights reserved.",
    accent: BRAND_ACCENT,
    preview: "Professional greeting email template with simple design.",
  },
  {
    id: "investment",
    name: "Investment Update",
    header: "Your Aviacapital Investment Update",
    footer:
      "Aviacapital Investments — Growing wealth through smarter decisions.",
    accent: BRAND_ACCENT,
    preview: "Notify users about their investment performance or changes.",
  },
  {
    id: "security",
    name: "Security Notice",
    header: "Important Security Notice from Aviacapital",
    footer:
      "Stay secure. Aviacapital will never ask for your password or wallet keys.",
    accent: BRAND_ACCENT,
    preview: "Send important security alerts to users.",
  },
];
  

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  const fetchEmailHistory = async () => {
    const { data, error } = await supabase
      .from("email_history")
      .select("*")
      .order("sent_at", { ascending: false });
    if (!error) setEmails(data);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    setIsLoading(true);
    try {
      const tpl = templates.find((t) => t.id === selectedTemplate)!;
      const templateHtml = `
        <div style="font-family:Arial, sans-serif;">
          <h2 style="color:${tpl.accent};">${tpl.header}</h2>
        </div>
      `;

      const payload = {
        admin_id:adminUser.id || "admin", 
        email: form.recipient_email,
        subject: form.subject,
        body: form.body,
        templateHtml,
        template: selectedTemplate || "default"
      };

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send email.");
      }

      toast({
        title: "✅ Email Sent",
        description: `Email successfully sent to ${form.recipient_email}`,
      });

      setForm({ recipient_email: "", subject: "", body: "" });
      fetchEmailHistory();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("email_history").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Email record removed." });
      fetchEmailHistory();
    }
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplate)!;

  return (
    <div className="space-y-10">
      {/* Template Selection */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Choose Template</CardTitle>
          <CardDescription>
            Select a predefined email template. You’ll see a live preview below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <motion.div
                key={tpl.id}
                whileHover={{ scale: 1.02 }}
                className={`border rounded-xl p-4 cursor-pointer shadow-sm transition ${
                  selectedTemplate === tpl.id
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-muted hover:border-primary/50"
                }`}
                onClick={() => setSelectedTemplate(tpl.id)}
              >
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: tpl.accent }}
                >
                  {tpl.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {tpl.preview}
                </p>
                <div
                  className="border rounded-md p-3 bg-muted/10 text-sm"
                  style={{
                    borderLeft: `4px solid ${tpl.accent}`,
                    color: "#333",
                  }}
                >
                  <strong>{tpl.header}</strong>
                  <p className="text-muted-foreground text-xs mt-1">
                    [Email body preview...]
                  </p>
                  <hr className="my-2" />
                  <p className="text-xs text-gray-500">{tpl.footer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Form & Live Preview */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>
              Fill in the details below. The preview updates live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.recipient_email}
                  onChange={(e) =>
                    setForm({ ...form, recipient_email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  rows={6}
                  placeholder="Type your message..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Email"}
                  <Send className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="shadow-md bg-muted/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email Preview</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>
              How your email will appear to the recipient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md bg-white shadow-sm p-4 space-y-3">
              <h2
                className="text-lg font-semibold"
                style={{ color: activeTemplate.accent }}
              >
                {activeTemplate.header}
              </h2>
              <p className="text-sm">{form.subject || "Subject preview..."}</p>
              <hr />
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {form.body || "Start typing your email body to see the preview."}
              </p>
              <hr />
              <p className="text-xs text-gray-500">{activeTemplate.footer}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email History */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>All previously sent emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-md">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2">Recipient</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Template</th>
                  <th className="p-2">Sent At</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr
                    key={email.id}
                    className="border-t hover:bg-muted/50 transition"
                  >
                    <td className="p-2">{email.user_email}</td>
                    <td className="p-2">{email.subject}</td>
                    <td className="p-2 capitalize">{email.template_used}</td>
                    <td className="p-2">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(email.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-4 text-muted-foreground"
                    >
                      No emails sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

