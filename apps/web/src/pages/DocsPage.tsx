import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DOCS: Record<string, { title: string; file: string }> = {
  sdk: {
    title: "SDK Documentation",
    file: "/docs/sdk.md",
  },
  components: {
    title: "Components Documentation",
    file: "/docs/components.md",
  },
};

export function DocsPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? DOCS[slug] : undefined;

  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!entry) return;
    setStatus("loading");
    fetch(entry.file)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
        return r.text();
      })
      .then((text) => {
        setContent(text);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [entry]);

  if (!entry) return <Navigate to="/docs/sdk" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Docs nav */}
      <nav className="flex gap-2 mb-8 border-b border-neutral-800 pb-4">
        <DocsTab to="/docs/sdk" active={slug === "sdk"}>
          SDK
        </DocsTab>
        <DocsTab to="/docs/components" active={slug === "components"}>
          Components
        </DocsTab>
      </nav>

      {status === "loading" && (
        <div className="text-neutral-500">Loading docs…</div>
      )}

      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
          Failed to load documentation.
        </div>
      )}

      {status === "ready" && (
        <article className="docs-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}

function DocsTab({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-white text-black"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800"
      }`}
    >
      {children}
    </Link>
  );
}
