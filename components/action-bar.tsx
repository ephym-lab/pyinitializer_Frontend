"use client";

import { Button } from "@/components/ui/button";
import { Download, FileTerminal, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProjectConfig } from "@/lib/types";
import { downloadZip, downloadScript } from "@/lib/api";
import { projectConfigSchema } from "@/lib/schema";
import { useState } from "react";

interface ActionBarProps {
  config: ProjectConfig;
  onValidationErrors: (errors: Record<string, string>) => void;
}

export function ActionBar({ config, onValidationErrors }: ActionBarProps) {
  const [zipLoading, setZipLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const validate = (): boolean => {
    const result = projectConfigSchema.safeParse(config);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      }
      onValidationErrors(errors);
      toast.error("Please fix the validation errors");
      return false;
    }
    onValidationErrors({});
    return true;
  };

  const handleDownloadZip = async () => {
    if (!validate()) return;
    setZipLoading(true);
    try {
      const { blob, venvExcluded } = await downloadZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.project_name}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      if (venvExcluded) {
        toast.warning(
          "Virtual environment was too large and excluded from the ZIP. Run the included setup.sh to create it."
        );
      } else {
        toast.success("Project downloaded successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setZipLoading(false);
    }
  };

  const handleDownloadScript = async () => {
    if (!validate()) return;
    setScriptLoading(true);
    try {
      const script = await downloadScript(config);
      const blob = new Blob([script], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `setup_${config.project_name}.sh`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Setup script downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Script generation failed");
    } finally {
      setScriptLoading(false);
    }
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      name: config.project_name,
      pm: config.package_manager,
      py: config.python_version,
      type: config.project_type,
      fw: config.framework ?? "",
      deps: config.dependencies.join(","),
      apps: config.django_apps?.join(",") ?? "",
    });
    const url = `${window.location.origin}/?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success("Shareable link copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2 border-t border-border p-4">
      <Button
        onClick={handleDownloadZip}
        disabled={zipLoading}
        className="relative flex-1 gap-2 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {zipLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        <span className="relative font-bold tracking-tight">Download ZIP</span>
      </Button>
      <Button
        variant="secondary"
        onClick={handleDownloadScript}
        disabled={scriptLoading}
        className="gap-2"
      >
        {scriptLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileTerminal className="size-4" />
        )}
        Script
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleShare}
        title="Copy shareable link"
      >
        <Share2 className="size-4" />
      </Button>
    </div>
  );
}
