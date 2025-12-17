import { SettingsPanel } from "@/components/admin/settings-panel";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          View application configuration and service status
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}

