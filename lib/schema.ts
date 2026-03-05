import { z } from "zod";

export const projectConfigSchema = z
  .object({
    project_name: z
      .string()
      .min(1, "Project name is required")
      .max(80, "Project name must be at most 80 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Only letters, digits, hyphens, and underscores are allowed"
      ),
    package_manager: z.enum(["pip", "uv", "conda"]),
    python_version: z.enum(["3.10", "3.11", "3.12", "3.13"]),
    project_type: z.enum(["library", "cli", "web-api", "ml"]),
    framework: z.enum(["fastapi", "flask", "django"]).optional(),
    dependencies: z.array(z.string()),
    django_apps: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.project_type !== "web-api" && data.framework) {
        return false;
      }
      if (data.framework !== "django" && data.django_apps && data.django_apps.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Framework/Django configuration mismatch",
      path: ["framework"],
    }
  );
