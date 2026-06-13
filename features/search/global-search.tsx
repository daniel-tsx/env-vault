"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAll, type SearchResults } from "@/features/search/actions";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Folder, KeyRound, Search } from "lucide-react";

const EMPTY: SearchResults = { projects: [], variables: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    // All state updates happen inside the deferred callback (not synchronously
    // in the effect body) to keep renders minimal and satisfy hook rules.
    const handle = setTimeout(
      async () => {
        if (!trimmed) {
          setResults(EMPTY);
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          setResults(await searchAll(trimmed));
        } catch {
          setResults(EMPTY);
        } finally {
          setLoading(false);
        }
      },
      trimmed ? 200 : 0
    );
    return () => clearTimeout(handle);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
    router.push(href);
  }

  const hasResults =
    results.projects.length > 0 || results.variables.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 h-9 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden sm:inline pointer-events-none ml-2 rounded border border-border bg-background px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search projects and variables"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search projects and variable keys…"
          />
          <CommandList>
            {!query.trim() ? (
              <CommandEmpty>Type to search across all projects.</CommandEmpty>
            ) : !hasResults && !loading ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : null}

            {results.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {results.projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project-${project.id}`}
                    onSelect={() => go(`/projects/${project.id}`)}
                  >
                    <Folder className="size-4 text-primary" />
                    <span>{project.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.variables.length > 0 && (
              <CommandGroup heading="Variables">
                {results.variables.map((variable) => (
                  <CommandItem
                    key={variable.id}
                    value={`var-${variable.id}`}
                    onSelect={() => go(`/projects/${variable.projectId}`)}
                  >
                    <KeyRound className="size-4 text-muted-foreground" />
                    <span className="font-mono">{variable.key}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {variable.projectName} / {variable.environmentName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
