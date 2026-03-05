"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PACKAGE_MANAGERS,
  PYTHON_VERSIONS,
  PROJECT_TYPES,
  FRAMEWORKS,
  type ProjectConfig,
  type ProjectType,
  type PackageManager,
  type PythonVersion,
  type Framework,
} from "@/lib/types";
import { DependencySearch } from "./dependency-search";

interface ConfigFormProps {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
  errors?: Record<string, string>;
}

export function ConfigForm({ config, onChange, errors }: ConfigFormProps) {
  const update = (patch: Partial<ProjectConfig>) => {
    const next = { ...config, ...patch };
    // Clear framework when switching away from web-api
    if (patch.project_type && patch.project_type !== "web-api") {
      delete next.framework;
    }
    // Auto-set framework when switching to web-api
    if (patch.project_type === "web-api" && !next.framework) {
      next.framework = "fastapi";
    }

    // Django-specific logic
    if (next.framework === "django") {
      next.project_type = "web-api";
      if (!next.dependencies.includes("django")) {
        next.dependencies = [...next.dependencies, "django"];
      }
      if (!next.django_apps || next.django_apps.length === 0) {
        next.django_apps = ["core", "api"];
      }
    } else {
      // Clear django_apps if not django
      delete next.django_apps;
    }

    onChange(next);
  };

  const removeDependency = (dep: string) => {
    update({ dependencies: config.dependencies.filter((d) => d !== dep) });
  };

  const addDependency = (dep: string) => {
    if (!config.dependencies.includes(dep)) {
      update({ dependencies: [...config.dependencies, dep] });
    }
  };

  const addDjangoApp = (app: string) => {
    const trimmed = app.trim().toLowerCase();
    if (trimmed && /^[a-z][a-z0-9_]*$/.test(trimmed) && !config.django_apps?.includes(trimmed)) {
      update({ django_apps: [...(config.django_apps || []), trimmed] });
    }
  };

  const removeDjangoApp = (app: string) => {
    update({ django_apps: config.django_apps?.filter((a) => a !== app) });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Project Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-name" className="text-sm font-medium text-foreground">
          Project Name
        </Label>
        <Input
          id="project-name"
          value={config.project_name}
          onChange={(e) => update({ project_name: e.target.value })}
          placeholder="my-project"
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        {errors?.project_name && (
          <p className="text-xs text-destructive">{errors.project_name}</p>
        )}
      </div>

      {/* Python Version & Package Manager row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-foreground">Python</Label>
          <Select
            value={config.python_version}
            onValueChange={(v) => update({ python_version: v as PythonVersion })}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PYTHON_VERSIONS.map((pv) => (
                <SelectItem key={pv.value} value={pv.value}>
                  {pv.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-foreground">Package Manager</Label>
          <Select
            value={config.package_manager}
            onValueChange={(v) => update({ package_manager: v as PackageManager })}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_MANAGERS.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project Type */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-foreground">Project Type</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => update({ project_type: pt.value as ProjectType })}
              className={`group relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border px-2 py-3 text-xs font-semibold transition-all duration-300 ${config.project_type === pt.value
                ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.05] z-10"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-muted-foreground/50 hover:bg-secondary/80 hover:text-foreground"
                }`}
            >
              <span className="relative transition-transform duration-300 group-hover:scale-110">
                {pt.label}
              </span>
              {config.project_type === pt.value && (
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Framework (only for web-api) */}
      {config.project_type === "web-api" && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-foreground">Framework</Label>
          <Select
            value={config.framework || "fastapi"}
            onValueChange={(v) => update({ framework: v as Framework })}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRAMEWORKS.map((fw) => (
                <SelectItem key={fw.value} value={fw.value}>
                  {fw.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.framework && (
            <p className="text-xs text-destructive">{errors.framework}</p>
          )}
        </div>
      )}

      {/* Django Apps (only for Django) */}
      {config.framework === "django" && (
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-primary/5 blur-3xl" />

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-inner">
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <Label className="text-sm font-bold tracking-tight text-foreground">Django Modules</Label>
              <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold mt-0.5">
                Application Architecture
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                placeholder="Add app (e.g. users)"
                className="bg-background/50 border-primary/10 pl-3 h-9 text-sm focus-visible:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDjangoApp(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 pointer-events-none">
                ↵ Enter
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.django_apps?.map((app) => (
                <Badge
                  key={app}
                  variant="outline"
                  className="group gap-2 px-3 py-1.5 text-xs font-semibold border-primary/20 bg-primary/5 text-foreground cursor-default transition-all hover:border-primary/50 hover:bg-primary/10 shadow-sm"
                >
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  {app}
                  <button
                    type="button"
                    onClick={() => removeDjangoApp(app)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <svg
                      className="size-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Badge>
              ))}
              {(config.django_apps?.length || 0) === 0 && (
                <p className="text-[10px] text-muted-foreground italic py-1">
                  At least one app is recommended...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dependencies */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-foreground">
          Dependencies
          {config.dependencies.length > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({config.dependencies.length})
            </span>
          )}
        </Label>
        <DependencySearch
          onSelect={addDependency}
          selected={config.dependencies}
        />
        {config.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {config.dependencies.map((dep) => (
              <Badge
                key={dep}
                variant="secondary"
                className="gap-1 pr-1 text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                onClick={() => removeDependency(dep)}
              >
                {dep}
                <svg
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
