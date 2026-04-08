import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface GlassHeaderActions {
  registerHeader: (id: string) => void;
  unregisterHeader: (id: string) => void;
}

// Stable context — register/unregister functions never change reference.
// The effect in GlassHeader depends only on this, so it never re-runs
// just because the active header changed.
const GlassHeaderActionsContext = createContext<GlassHeaderActions | null>(
  null
);

// Separate context for the active header ID. Changes frequently but only
// used for rendering (not in effects), so re-renders are harmless.
const GlassHeaderActiveContext = createContext<string | null>(null);

export function GlassHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeHeaderId, setActiveHeaderId] = useState<string | null>(null);
  const headerStackRef = useRef<string[]>([]);

  const registerHeader = useCallback((id: string) => {
    if (!headerStackRef.current.includes(id)) {
      headerStackRef.current.push(id);
    }
    setActiveHeaderId(
      headerStackRef.current[headerStackRef.current.length - 1]
    );
  }, []); // stable — no deps

  const unregisterHeader = useCallback((id: string) => {
    headerStackRef.current = headerStackRef.current.filter((h) => h !== id);
    setActiveHeaderId(
      headerStackRef.current.length > 0
        ? headerStackRef.current[headerStackRef.current.length - 1]
        : null
    );
  }, []); // stable — no deps

  return (
    <GlassHeaderActionsContext.Provider
      value={{ registerHeader, unregisterHeader }}
    >
      <GlassHeaderActiveContext.Provider value={activeHeaderId}>
        {children}
      </GlassHeaderActiveContext.Provider>
    </GlassHeaderActionsContext.Provider>
  );
}

export function useGlassHeaderActions() {
  return useContext(GlassHeaderActionsContext);
}

export function useGlassHeaderActiveId() {
  return useContext(GlassHeaderActiveContext);
}
