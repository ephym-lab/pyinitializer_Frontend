export type PackageManager = "pip" | "uv" | "conda";
export type PythonVersion = "3.10" | "3.11" | "3.12" | "3.13";
export type ProjectType = "library" | "cli" | "web-api" | "ml";
export type Framework = "fastapi" | "flask" | "django";

export interface ProjectConfig {
  project_name: string;
  package_manager: PackageManager;
  python_version: PythonVersion;
  project_type: ProjectType;
  framework?: Framework;
  dependencies: string[];
  django_apps?: string[];
}

export interface FileNode {
  path: string;
  type: "file" | "directory";
  content?: string;
}

export interface PreviewResponse {
  project_name: string;
  total_files: number;
  files: FileNode[];
}

export interface SearchResponse {
  query: string;
  results: string[];
  index_loaded: boolean;
}

export const PACKAGE_MANAGERS: { value: PackageManager; label: string }[] = [
  { value: "uv", label: "uv" },
  { value: "pip", label: "pip" },
  { value: "conda", label: "Conda" },
];

export const PYTHON_VERSIONS: { value: PythonVersion; label: string }[] = [
  { value: "3.13", label: "3.13" },
  { value: "3.12", label: "3.12" },
  { value: "3.11", label: "3.11" },
  { value: "3.10", label: "3.10" },
];

export const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: "library", label: "Library", description: "Reusable Python package" },
  { value: "cli", label: "CLI", description: "Command-line application" },
  { value: "web-api", label: "Web API", description: "REST API server" },
  { value: "ml", label: "ML", description: "Machine learning project" },
];

export const FRAMEWORKS: { value: Framework; label: string }[] = [
  { value: "fastapi", label: "FastAPI" },
  { value: "flask", label: "Flask" },
  { value: "django", label: "Django" },
];

export const DEFAULT_CONFIG: ProjectConfig = {
  project_name: "my-project",
  package_manager: "uv",
  python_version: "3.12",
  project_type: "library",
  dependencies: [],
  django_apps: [],
};
