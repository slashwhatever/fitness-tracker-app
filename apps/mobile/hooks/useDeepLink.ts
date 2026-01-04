import { createClient } from "@/lib/supabase/client";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

interface DeepLinkState {
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook to handle deep links for authentication flows.
 * Listens for incoming URLs and processes auth tokens (email confirmation, password reset, etc.)
 */
export function useDeepLink() {
  const [state, setState] = useState<DeepLinkState>({
    isProcessing: false,
    error: null,
  });
  const router = useRouter();

  const processAuthLink = useCallback(
    async (url: string) => {
      console.log("[DeepLink] Processing URL:", url);

      try {
        setState({ isProcessing: true, error: null });

        const parsed = Linking.parse(url);
        console.log("[DeepLink] Parsed URL:", parsed);

        // Supabase sends tokens in the URL fragment (after #), not as query params
        // Example: logset://confirm#access_token=...&type=signup
        // We need to parse the fragment manually
        let params: Record<string, string | undefined> = {
          ...parsed.queryParams,
        } as Record<string, string | undefined>;

        // Parse hash fragment if present
        const hashIndex = url.indexOf("#");
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          const fragmentParams = new URLSearchParams(fragment);
          fragmentParams.forEach((value, key) => {
            params[key] = value;
          });
          console.log("[DeepLink] Parsed fragment params:", params);
        }

        // Extract tokens from URL parameters
        // Supabase sends: token_hash, type, and sometimes access_token/refresh_token
        const {
          token_hash,
          type,
          access_token,
          refresh_token,
          error: urlError,
          error_description,
        } = params;

        // Check for errors in URL
        if (urlError) {
          throw new Error(error_description || urlError);
        }

        const supabase = createClient();

        // Handle different auth types
        if (type === "signup" || type === "email") {
          // Email confirmation flow
          if (token_hash) {
            console.log("[DeepLink] Verifying email with token_hash");
            const { error } = await supabase.auth.verifyOtp({
              token_hash,
              type: "email",
            });

            if (error) throw error;

            console.log("[DeepLink] Email verified successfully");
            router.replace("/");
          } else if (access_token && refresh_token) {
            // Direct session from magic link
            console.log("[DeepLink] Setting session from tokens");
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            router.replace("/");
          }
        } else if (type === "recovery") {
          // Password reset flow
          if (token_hash) {
            console.log("[DeepLink] Processing password recovery");
            const { error } = await supabase.auth.verifyOtp({
              token_hash,
              type: "recovery",
            });

            if (error) throw error;

            // Navigate to password update screen
            router.replace("/reset-password");
          } else if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            router.replace("/reset-password");
          }
        } else if (type === "magiclink") {
          // Magic link flow
          if (token_hash) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash,
              type: "magiclink",
            });

            if (error) throw error;

            router.replace("/");
          }
        } else {
          // Unknown type - try to handle generic token
          if (access_token && refresh_token) {
            console.log("[DeepLink] Setting session from generic tokens");
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            router.replace("/");
          }
        }

        setState({ isProcessing: false, error: null });
      } catch (error) {
        console.error("[DeepLink] Error processing auth link:", error);
        setState({
          isProcessing: false,
          error:
            error instanceof Error ? error.message : "Failed to verify link",
        });
      }
    },
    [router]
  );

  const handleDeepLink = useCallback(
    (event: { url: string }) => {
      const { url } = event;

      // Only process URLs with our scheme that look like auth links
      if (
        url.startsWith("logset://") &&
        (url.includes("token") ||
          url.includes("access_token") ||
          url.includes("confirm") ||
          url.includes("recovery"))
      ) {
        processAuthLink(url);
      }
    },
    [processAuthLink]
  );

  useEffect(() => {
    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for incoming links while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return state;
}
