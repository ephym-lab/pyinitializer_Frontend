"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  filePath: string;
  content: string;
}

export function CodeViewer({ filePath, content }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const lines = content.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{filePath}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-4 inline-block w-8 shrink-0 text-right font-mono text-xs text-muted-foreground/50 select-none">
                  {i + 1}
                </span>
                <span className="font-mono text-xs text-foreground whitespace-pre">
                  {line}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
