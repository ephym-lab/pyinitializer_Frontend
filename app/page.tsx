"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { ConfigForm } from "@/components/config-form";
import { PreviewPanel } from "@/components/preview-panel";
import { ActionBar } from "@/components/action-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DEFAULT_CONFIG,
  type ProjectConfig,
  type PackageManager,
  type PythonVersion,
  type ProjectType,
  type Framework,
  type FileNode,
} from "@/lib/types";
import { getPreview } from "@/lib/api";
import { Toaster } from "sonner";

function useConfigFromURL(): ProjectConfig {
  const sp = useSearchParams();
  return {
    project_name: sp.get("name") ?? DEFAULT_CONFIG.project_name,
    package_manager: (sp.get("pm") ?? DEFAULT_CONFIG.package_manager) as PackageManager,
    python_version: (sp.get("py") ?? DEFAULT_CONFIG.python_version) as PythonVersion,
    project_type: (sp.get("type") ?? DEFAULT_CONFIG.project_type) as ProjectType,
    framework: (sp.get("fw") || undefined) as Framework | undefined,
    dependencies: sp.get("deps")?.split(",").filter(Boolean) ?? DEFAULT_CONFIG.dependencies,
    django_apps: (sp.get("apps")?.split(",").filter(Boolean)) || (sp.get("fw") === "django" ? ["core", "api"] : undefined),
  };
}

export default function HomePage() {
  const initialConfig = useConfigFromURL();
  const [config, setConfig] = useState<ProjectConfig>(initialConfig);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchPreview = useCallback(async (cfg: ProjectConfig) => {
    // Only fetch preview if project name is valid
    if (!cfg.project_name || !/^[a-zA-Z0-9_-]+$/.test(cfg.project_name)) return;
    setPreviewLoading(true);
    try {
      const data = await getPreview(cfg);
      setFiles(data.files);
      setTotalFiles(data.total_files);
    } catch (err) {
      console.error("Preview fetch failed:", err);
      // silently fail preview but log it
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Debounce preview fetch on config changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPreview(config);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config, fetchPreview]);

  // Sync config to URL
  useEffect(() => {
    const params = new URLSearchParams({
      name: config.project_name,
      pm: config.package_manager,
      py: config.python_version,
      type: config.project_type,
      fw: config.framework ?? "",
      deps: config.dependencies.join(","),
      apps: config.django_apps?.join(",") ?? "",
    });
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [config, router]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Left panel: config form */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border lg:w-96">
          <ScrollArea className="flex-1">
            <div className="p-5">
              <ConfigForm
                config={config}
                onChange={setConfig}
                errors={errors}
              />
            </div>
          </ScrollArea>
          <ActionBar config={config} onValidationErrors={setErrors} />
        </div>

        {/* Right panel: preview */}
        <div className="flex-1 min-w-0">
          <PreviewPanel
            files={files}
            totalFiles={totalFiles}
            loading={previewLoading}
          />
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </div>
  );
}
