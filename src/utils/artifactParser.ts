import { Artifact } from "../types";

export function parseArtifactsFromMarkdown(content: string): { textWithoutArtifacts: string; artifacts: Artifact[] } {
  const artifacts: Artifact[] = [];
  const codeBlockRegex = /```(html|tsx|typescript|jsx|javascript|svg|markdown|json|css)?\n([\s\S]*?)```/gi;

  let match;
  let counter = 1;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const rawLang = (match[1] || "plaintext").toLowerCase();
    const code = match[2].trim();

    // Only create artifact side panel items for substantial code blocks (> 3 lines or explicit html/svg/tsx)
    const isSubstantial = code.split("\n").length > 3 || ["html", "svg", "tsx", "jsx"].includes(rawLang);

    if (isSubstantial) {
      let lang: Artifact["language"] = "plaintext";
      let type: Artifact["type"] = "code";
      let title = `Artifact ${counter}`;

      if (rawLang === "html") {
        lang = "html";
        type = "preview";
        title = extractTitleFromHtml(code) || `HTML Preview ${counter}`;
      } else if (rawLang === "svg") {
        lang = "svg";
        type = "svg";
        title = `Vector Graphic ${counter}`;
      } else if (["tsx", "jsx", "typescript", "javascript"].includes(rawLang)) {
        lang = rawLang as Artifact["language"];
        type = "code";
        title = `Component / Script ${counter}`;
      } else if (rawLang === "markdown") {
        lang = "markdown";
        type = "document";
        title = `Document ${counter}`;
      } else if (rawLang === "json") {
        lang = "json";
        type = "code";
        title = `Data Schema ${counter}`;
      }

      artifacts.push({
        id: `artifact-${Date.now()}-${counter}`,
        title,
        language: lang,
        code,
        type,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      counter++;
    }
  }

  return {
    textWithoutArtifacts: content,
    artifacts,
  };
}

function extractTitleFromHtml(htmlContent: string): string | null {
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return h1Match[1].replace(/<[^>]+>/g, "").trim();
  }
  return null;
}
