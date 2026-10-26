


"use client";

import { useRef, useState } from "react";
import {
  FileUp,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  BookOpen,
} from "lucide-react";

type StudyBlock = {
  type: "heading" | "bullet" | "paragraph";
  text: string;
};

export default function UploadBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const incoming = Array.from(selectedFiles);

    const invalid = incoming.find(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    );

    if (invalid) {
      setError(`"${invalid.name}" is not a PDF file.`);
      return;
    }

    const tooLarge = incoming.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (tooLarge) {
      setError(`"${tooLarge.name}" exceeds the 10 MB limit.`);
      return;
    }

    setError("");
    setAnalysis("");
    setAnalysisError("");
    setExtractedText("");
    setSearchQuery("");

    setFiles((previous) => {
      const combined = [...previous, ...incoming];

      return combined.filter(
        (file, index) =>
          combined.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size
          ) === index
      );
    });
  }

  async function extractPdfText(file: File): Promise<string> {
    const pdfjs = await import(
      "pdfjs-dist/legacy/build/pdf.mjs"
    );

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const data = new Uint8Array(await file.arrayBuffer());

    const pdf = await pdfjs.getDocument({
      data,
      isEvalSupported: false,
    }).promise;

    const pages: string[] = [];

    for (
      let pageNum = 1;
      pageNum <= pdf.numPages;
      pageNum++
    ) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const items = content.items.filter(
        (item): item is typeof item & {
          str: string;
          transform: number[];
        } =>
          "str" in item &&
          typeof item.str === "string" &&
          "transform" in item &&
          Array.isArray(item.transform)
      );

      let pageText = "";
      let previousY: number | null = null;

      for (const item of items) {
        const text = item.str.trim();
        if (!text) continue;

        const y = item.transform[5];

        if (
          previousY !== null &&
          Math.abs(y - previousY) > 3
        ) {
          pageText += "\n";
        } else if (
          pageText &&
          !pageText.endsWith("\n")
        ) {
          pageText += " ";
        }

        pageText += text;
        previousY = y;
      }

      pages.push(pageText);
    }

    return pages.join("\n\n").trim();
  }

  function formatStudyText(text: string): StudyBlock[] {
    const cleaned = text
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/[•●▪]\s*/g, "\nBULLET: ")
      .replace(
        /\s+(?=(?:Unit\s+[IVX0-9]+|Section\s+[A-Z]|(?:\d+)[.)]\s+[A-Z]))/gi,
        "\n"
      )
      .replace(
        /\s+(?=(?:Key characteristics|Service models|Deployment models|Virtualization|Scalability and elasticity|Storage and reliability|Security basics|Quick revision|Course objective|Instructions|Learning objectives)\b)/gi,
        "\n"
      )
      .replace(
        /\s+(?=(?:IaaS|PaaS|SaaS|Public cloud|Private cloud|Hybrid cloud|Community cloud|On-demand self-service|Broad network access|Resource pooling|Rapid elasticity|Measured service):)/gi,
        "\n"
      );

    const blocks: StudyBlock[] = [];

    for (const rawLine of cleaned.split(/\n+/)) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("BULLET:")) {
        const bulletText = line
          .replace(/^BULLET:\s*/, "")
          .trim();

        if (bulletText) {
          blocks.push({
            type: "bullet",
            text: bulletText,
          });
        }

        continue;
      }

      const isHeading =
        /^(Unit\s+[IVX0-9]+|Section\s+[A-Z]|(?:\d+)[.)]\s+[A-Z]|Key characteristics|Service models|Deployment models|Virtualization|Scalability and elasticity|Storage and reliability|Security basics|Quick revision|Course objective|Learning objectives|Instructions|Conclusion|Introduction|References)\b/i.test(
          line
        ) ||
        (/^[A-Z][A-Z\s&:-]{3,70}$/.test(line) &&
          !/^(DOCUMENT|BULLET):/.test(line));

      blocks.push({
        type: isHeading ? "heading" : "paragraph",
        text: line,
      });
    }

    return blocks;
  }

  async function handleExtractText() {
    if (files.length === 0) {
      setError("Please select at least one PDF.");
      return;
    }

    setIsExtracting(true);
    setError("");
    setAnalysis("");
    setAnalysisError("");
    setExtractedText("");
    setSearchQuery("");

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const text = await extractPdfText(file);

            return {
              name: file.name,
              text:
                text ||
                "No readable text found. This PDF may contain scanned images.",
            };
          } catch (err) {
            console.error(
              `Failed to read ${file.name}:`,
              err
            );

            return {
              name: file.name,
              text: "Could not read this PDF. Please check whether the file is valid.",
            };
          }
        })
      );

      const output = results
        .map(
          (result) =>
            `DOCUMENT: ${result.name}\n${result.text}`
        )
        .join("\n\n---DOCUMENT-SEPARATOR---\n\n");

      setExtractedText(output);

      if (
        results.every((result) =>
          result.text.startsWith("Could not read this PDF.")
        )
      ) {
        setError("None of the selected PDFs could be read.");
      }
    } catch (err) {
      console.error("PDF extraction failed:", err);
      setError("Something went wrong while reading the PDFs.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleAnalyze() {
    if (!extractedText.trim()) {
      setAnalysisError("Please read your PDFs first.");
      return;
    }

    const readableText = extractedText
      .split("\n\n---DOCUMENT-SEPARATOR---\n\n")
      .map((document) => {
        const firstNewline = document.indexOf("\n");

        return firstNewline >= 0
          ? document.slice(firstNewline + 1).trim()
          : document;
      })
      .filter(
        (text) =>
          text &&
          !text.startsWith("Could not read this PDF.") &&
          !text.startsWith("No readable text found.")
      )
      .join("\n\n");

    if (!readableText.trim()) {
      setAnalysisError(
        "No readable text was found. Please upload a text-based PDF."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");
    setAnalysisError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: readableText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI analysis failed. Please try again."
        );
      }

      setAnalysis(
        data.analysis || "No analysis was generated."
      );
    } catch (err) {
      console.error("AI analysis failed:", err);

      setAnalysisError(
        err instanceof Error
          ? err.message
          : "Could not analyze your PDFs. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function removeFile(name: string, size: number) {
    const remainingFiles = files.filter(
      (file) =>
        !(file.name === name && file.size === size)
    );

    setFiles(remainingFiles);
    setExtractedText("");
    setSearchQuery("");
    setError("");
    setAnalysis("");
    setAnalysisError("");
  }

  const documents = extractedText
    ? extractedText.split(
        /\n\n---DOCUMENT-SEPARATOR---\n\n/
      )
    : [];

  const filteredDocuments = documents
    .map((document, index) => {
      const firstNewline = document.indexOf("\n");

      const name =
        firstNewline >= 0
          ? document
              .slice(0, firstNewline)
              .replace(/^DOCUMENT:\s*/, "")
          : `Document ${index + 1}`;

      const content =
        firstNewline >= 0
          ? document.slice(firstNewline + 1).trim()
          : document;

      const blocks = formatStudyText(content);
      const query = searchQuery.trim().toLowerCase();

      const filteredBlocks = query
        ? blocks.filter((block) =>
            block.text.toLowerCase().includes(query)
          )
        : blocks;

      return {
        name,
        blocks: filteredBlocks,
      };
    })
    .filter(
      (document) =>
        !searchQuery.trim() ||
        document.blocks.length > 0
    );

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">
          Start learning smarter
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Upload your study material
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Upload your syllabus, class notes, textbooks,
          or previous question papers in PDF format.
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-400/40 bg-indigo-400/[0.04] px-5 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-400/[0.08]"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-300">
          <FileUp size={28} />
        </span>

        <span className="mt-5 font-semibold text-white">
          Click to select PDF files
        </span>

        <span className="mt-2 text-sm text-slate-400">
          You can also drag and drop files here
        </span>

        <span className="mt-3 text-xs text-slate-500">
          PDF only · Maximum 10 MB per file
        </span>
      </button>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className="mt-2 text-center text-xs text-slate-500"
      >
        Drag and drop PDFs onto the upload area.
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 text-sm text-rose-300"
        >
          <AlertCircle size={17} />
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">
              Selected documents
            </h3>

            <span className="text-sm text-slate-400">
              {files.length} file(s)
            </span>
          </div>

          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <FileText
                className="shrink-0 text-indigo-300"
                size={22}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <CheckCircle2
                className="shrink-0 text-emerald-400"
                size={18}
              />

              <button
                type="button"
                onClick={() =>
                  removeFile(file.name, file.size)
                }
                aria-label={`Remove ${file.name}`}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleExtractText}
            disabled={isExtracting || isAnalyzing}
            className="w-full rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExtracting
              ? "Reading PDFs..."
              : "Read PDFs"}
          </button>

          <p className="rounded-xl bg-indigo-400/[0.07] p-3 text-xs leading-5 text-indigo-200/80">
            Your PDF text is extracted in your browser.
            You can then send the readable text to Gemini
            for AI-powered study analysis.
          </p>
        </div>
      )}

      {extractedText && (
        <div className="mt-8 space-y-5">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Your Study Material
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Organized text from your uploaded PDFs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isExtracting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3.5 font-semibold text-white transition hover:from-violet-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles size={19} />

            {isAnalyzing
              ? "Analyzing your study material..."
              : "Analyze with AI"}
          </button>

          {isAnalyzing && (
            <p
              role="status"
              className="text-center text-sm text-indigo-300"
            >
              Gemini is finding key topics, revision areas,
              and quiz questions. Please wait...
            </p>
          )}

          {analysisError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm leading-6 text-rose-300"
            >
              <AlertCircle
                size={18}
                className="mt-1 shrink-0"
              />
              <p>{analysisError}</p>
            </div>
          )}

          {analysis && (
            <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-[#111c30]">
              <div className="flex items-center gap-3 border-b border-white/10 bg-violet-400/[0.06] p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                  <Sparkles size={21} />
                </span>

                <div>
                  <h4 className="font-semibold text-white">
                    AI Study Analysis
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    Generated from your uploaded study material
                  </p>
                </div>
              </div>

              <div className="whitespace-pre-wrap break-words p-5 text-sm leading-7 text-slate-200 sm:p-6">
                {analysis}
              </div>
            </div>
          )}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search a topic or keyword..."
              className="w-full rounded-xl border border-white/10 bg-[#111c30] py-3 pl-11 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
          </div>

          {filteredDocuments.length === 0 && (
            <p className="rounded-xl border border-white/10 p-5 text-center text-slate-300">
              No results found. Try another keyword.
            </p>
          )}

          {filteredDocuments.map((document, index) => (
            <article
              key={`${document.name}-${index}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#111c30]"
            >
              <div className="flex items-start gap-3 border-b border-white/10 bg-white/[0.02] p-5">
                <FileText
                  className="mt-1 shrink-0 text-indigo-300"
                  size={23}
                />

                <div className="min-w-0">
                  <h4 className="break-words text-lg font-bold text-white">
                    {document.name}
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    {document.blocks.length} content items
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {document.blocks.map(
                  (block, blockIndex) => {
                    if (block.type === "heading") {
                      return (
                        <h5
                          key={blockIndex}
                          className="border-b border-indigo-400/20 pb-2 pt-3 text-lg font-bold text-indigo-300"
                        >
                          {block.text}
                        </h5>
                      );
                    }

                    if (block.type === "bullet") {
                      return (
                        <div
                          key={blockIndex}
                          className="flex items-start gap-3 text-sm leading-7 text-slate-200 sm:text-base"
                        >
                          <span className="mt-0.5 text-indigo-400">
                            •
                          </span>

                          <p className="min-w-0 flex-1">
                            {block.text}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={blockIndex}
                        className="break-words text-sm leading-7 text-slate-300 sm:text-base"
                      >
                        {block.text}
                      </p>
                    );
                  }
                )}
              </div>
            </article>
          ))}

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <BookOpen
              size={19}
              className="mt-0.5 shrink-0 text-indigo-300"
            />

            <p className="text-xs leading-5 text-slate-400">
              Tip: Use the search box to find a specific topic.
              Use AI Study Analysis to identify important
              concepts and revision areas.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
