"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function SettingsPanel() {
  // Check environment variables (client-side safe checks)
  const hasDatabase = typeof process.env.NEXT_PUBLIC_DATABASE_URL !== "undefined";
  const hasAuth = typeof process.env.NEXT_PUBLIC_BETTER_AUTH_URL !== "undefined";
  const hasEmail = typeof process.env.NEXT_PUBLIC_RESEND_API_KEY !== "undefined";
  const hasPayment = typeof process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY !== "undefined";

  const settings = [
    {
      category: "Authentication",
      items: [
        {
          name: "Better Auth",
          status: hasAuth ? "configured" : "not configured",
          description: "Authentication system",
        },
        {
          name: "OAuth Providers",
          status: "configured",
          description: "Google & Discord OAuth",
        },
      ],
    },
    {
      category: "Payment",
      items: [
        {
          name: "UddoktaPay",
          status: hasPayment ? "configured" : "not configured",
          description: "Payment gateway (bKash, Nagad, Rocket, Upay)",
        },
      ],
    },
    {
      category: "Email",
      items: [
        {
          name: "Resend",
          status: hasEmail ? "configured" : "not configured",
          description: "Email service provider",
        },
      ],
    },
    {
      category: "Database",
      items: [
        {
          name: "PostgreSQL",
          status: hasDatabase ? "configured" : "not configured",
          description: "Primary database",
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "configured") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Configured
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not Configured
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Current application settings and service status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settings.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.name}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Instructions</CardTitle>
          <CardDescription>
            Settings are configured via environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables</h4>
              <p className="text-muted-foreground mb-2">
                All configuration is done through the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file.
                Update the environment variables and restart the server to apply changes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Required Variables</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>DATABASE_URL - PostgreSQL connection string</li>
                <li>BETTER_AUTH_SECRET - Authentication secret key</li>
                <li>BETTER_AUTH_URL - Application base URL</li>
                <li>RESEND_API_KEY - Email service API key</li>
                <li>UDDOKTAPAY_API_KEY - Payment gateway API key</li>
              </ul>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Security Notice
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  Never commit your <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">.env</code> file
                  to version control. Keep all API keys and secrets secure.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

