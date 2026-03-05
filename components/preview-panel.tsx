"use client";

import { useState } from "react";
import { FileNode } from "@/lib/types";
import { FileTree } from "./file-tree";
import { CodeViewer } from "./code-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderTree, FileCode } from "lucide-react";

interface PreviewPanelProps {
  files: FileNode[];
  totalFiles: number;
  loading: boolean;
}

export function PreviewPanel({ files, totalFiles, loading }: PreviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const handleSelectFile = (path: string, content?: string) => {
    setSelectedFile(path);
    setSelectedContent(content || "");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg border border-dashed border-border p-4">
            <FolderTree className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Project Preview</p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your project to see the file tree
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <FolderTree className="size-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Files</span>
        <span className="text-xs text-muted-foreground">({totalFiles})</span>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* File tree sidebar */}
        <ScrollArea className="w-56 shrink-0 border-r border-border">
          <div className="py-2">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
            />
          </div>
        </ScrollArea>

        {/* Code viewer */}
        <div className="flex-1 min-w-0">
          {selectedFile && selectedContent ? (
            <CodeViewer filePath={selectedFile} content={selectedContent} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <FileCode className="size-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Select a file to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
