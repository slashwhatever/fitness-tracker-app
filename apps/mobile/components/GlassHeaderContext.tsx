import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface GlassHeaderContextType {
  registerHeader: (id: string) => void;
  unregisterHeader: (id: string) => void;
  isActiveHeader: (id: string) => boolean;
}

const GlassHeaderContext = createContext<GlassHeaderContextType | null>(null);

export function GlassHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeHeaderId, setActiveHeaderId] = useState<string | null>(null);
  const headerStackRef = useRef<string[]>([]);

  const registerHeader = useCallback((id: string) => {
    // Add to stack if not already present
    if (!headerStackRef.current.includes(id)) {
      headerStackRef.current.push(id);
    }
    // The last registered header is the active one
    setActiveHeaderId(
      headerStackRef.current[headerStackRef.current.length - 1]
    );
  }, []);

  const unregisterHeader = useCallback((id: string) => {
    // Remove from stack
    headerStackRef.current = headerStackRef.current.filter((h) => h !== id);
    // Update active to the last in stack, or null if empty
    setActiveHeaderId(
      headerStackRef.current.length > 0
        ? headerStackRef.current[headerStackRef.current.length - 1]
        : null
    );
  }, []);

  const isActiveHeader = useCallback(
    (id: string) => {
      return activeHeaderId === id;
    },
    [activeHeaderId]
  );

  return (
    <GlassHeaderContext.Provider
      value={{ registerHeader, unregisterHeader, isActiveHeader }}
    >
      {children}
    </GlassHeaderContext.Provider>
  );
}

export function useGlassHeaderContext() {
  return useContext(GlassHeaderContext);
}
