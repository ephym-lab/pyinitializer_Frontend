"use client";

import { useState } from "react";
import { FileNode } from "@/lib/types";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  children: TreeNode[];
}

function buildTree(files: FileNode[]): TreeNode[] {
  const root: TreeNode[] = [];

  const sorted = [...files].sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    return a.path.localeCompare(b.path);
  });

  for (const file of sorted) {
    const parts = file.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let existing = current.find((n) => n.name === part);
      if (!existing) {
        existing = {
          name: part,
          path: file.path,
          type: isLast ? file.type : "directory",
          content: isLast ? file.content : undefined,
          children: [],
        };
        current.push(existing);
      }
      current = existing.children;
    }
  }

  return root;
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    })
    .map((n) => ({ ...n, children: sortTree(n.children) }));
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string, content?: string) => void;
}

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const tree = sortTree(buildTree(files));

  return (
    <div className="flex flex-col text-sm">
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  selectedFile,
  onSelectFile,
}: {
  node: TreeNode;
  depth: number;
  selectedFile: string | null;
  onSelectFile: (path: string, content?: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "directory";
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (isDir) {
      setOpen(!open);
    } else {
      onSelectFile(node.path, node.content);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const iconColor = (() => {
      switch (ext) {
        case "py":
          return "text-[oklch(0.7_0.15_90)]";
        case "toml":
        case "cfg":
          return "text-[oklch(0.65_0.15_30)]";
        case "md":
          return "text-[oklch(0.6_0.1_240)]";
        case "sh":
          return "text-primary";
        case "txt":
          return "text-muted-foreground";
        default:
          return "text-muted-foreground";
      }
    })();
    return <File className={cn("size-4 shrink-0", iconColor)} />;
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
          isSelected && "bg-accent text-accent-foreground",
          !isSelected && "text-foreground"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
            {open ? (
              <FolderOpen className="size-4 shrink-0 text-primary" />
            ) : (
              <Folder className="size-4 shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="size-3.5 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>
      {isDir && open && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
          {node.children.length === 0 && (
            <div
              className="px-2 py-1 text-xs text-muted-foreground italic"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              empty
            </div>
          )}
        </div>
      )}
    </div>
  );
}
