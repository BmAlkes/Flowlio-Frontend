import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { cn } from "@/lib/utils";

interface MentionCandidate {
  id: string;
  name: string;
}

/** Finds the `@word` run (if any) ending at `cursor`, so we know what to
 * filter suggestions by and what text range to replace on selection. */
export function findMentionTrigger(text: string, cursor: number): { start: number; query: string } | null {
  const upToCursor = text.slice(0, cursor);
  const match = upToCursor.match(/@([^\s@]*)$/);
  if (!match) return null;
  return { start: cursor - match[0].length, query: match[1] };
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called with the up-to-date set of mentioned user ids whenever it changes. */
  onMentionedUserIdsChange?: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
  autoFocus?: boolean;
  /** Fired for any keydown that isn't consumed by the suggestion dropdown
   * (e.g. Enter-to-submit, Escape-to-cancel) — same contract as a plain onKeyDown. */
  onSubmitKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function MentionInput({
  value,
  onChange,
  onMentionedUserIdsChange,
  placeholder,
  className,
  as = "input",
  rows = 2,
  autoFocus,
  onSubmitKeyDown,
}: MentionInputProps) {
  const { data: membersResponse } = useGetCurrentOrgUserMembers();
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const nameById = useRef<Map<string, string>>(new Map());
  const [trigger, setTrigger] = useState<{ start: number; query: string } | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const candidates: MentionCandidate[] = useMemo(
    () =>
      (membersResponse?.data?.userMembers ?? [])
        .filter((m) => m.user)
        .map((m) => ({ id: m.user!.id, name: m.user!.name })),
    [membersResponse],
  );

  const suggestions = useMemo(() => {
    if (!trigger) return [];
    const q = trigger.query.toLowerCase();
    return candidates.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [trigger, candidates]);

  const emitMentionIds = (text: string) => {
    if (!onMentionedUserIdsChange) return;
    const stillMentioned = Array.from(nameById.current.entries())
      .filter(([, name]) => text.includes(`@${name}`))
      .map(([id]) => id);
    onMentionedUserIdsChange(stillMentioned);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    emitMentionIds(text);
    const cursor = e.target.selectionStart ?? text.length;
    setTrigger(findMentionTrigger(text, cursor));
    setHighlightIndex(0);
  };

  const selectSuggestion = (candidate: MentionCandidate) => {
    if (!trigger) return;
    const cursor = inputRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, trigger.start);
    const after = value.slice(cursor);
    const inserted = `@${candidate.name} `;
    const nextValue = `${before}${inserted}${after}`;
    nameById.current.set(candidate.id, candidate.name);
    onChange(nextValue);
    emitMentionIds(nextValue);
    setTrigger(null);
    requestAnimationFrame(() => {
      const pos = before.length + inserted.length;
      inputRef.current?.setSelectionRange(pos, pos);
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>) => {
    if (trigger && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSuggestion(suggestions[highlightIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setTrigger(null);
        return;
      }
    }
    onSubmitKeyDown?.(e);
  };

  const Element = as === "textarea" ? "textarea" : "input";

  return (
    <div className="relative flex-1">
      <Element
        ref={inputRef as any}
        type={as === "input" ? "text" : undefined}
        rows={as === "textarea" ? rows : undefined}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setTrigger(null), 150)}
      />
      {trigger && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-56 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg py-1">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
              className={cn(
                "w-full text-start px-2.5 py-1.5 text-xs flex items-center gap-2 transition-colors",
                i === highlightIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
              )}
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {s.name.charAt(0).toUpperCase()}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
