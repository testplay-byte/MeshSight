"use client";

import { useRef, useState } from "react";
import { IconCheck, IconCopy } from "./Icons";

/**
 * Code block with a one-tap copy button — guides are followed by typing
 * or pasting commands, so copying must be frictionless.
 */
export default function CodeBlock({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const text = ref.current?.textContent?.replace(/\n$/, "") ?? "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can be blocked; fall back to a selection copy
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="code-block">
      <pre ref={ref}>{children}</pre>
      <button className="code-copy" onClick={copy} aria-label="Copy code">
        {copied ? (
          <>
            <IconCheck className="ic s" /> Copied
          </>
        ) : (
          <>
            <IconCopy className="ic s" /> Copy
          </>
        )}
      </button>
    </div>
  );
}