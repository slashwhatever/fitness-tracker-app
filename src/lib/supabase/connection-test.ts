import { createSupabaseBrowserClient, supabaseClient } from "./client";
import { createSupabaseServerClient } from "./server";

/**
 * Test basic Supabase connection and authentication
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    // Test 1: Basic client initialization
    if (!supabaseClient) {
      return {
        success: false,
        message: "Supabase client not initialized",
      };
    }

    // Test 2: Environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !anonKey) {
      return {
        success: false,
        message: "Missing required environment variables",
        details: {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
        },
      };
    }

    // Test 3: Basic database connection (ping)
    const { data, error } = await supabaseClient
      .from("movement_templates")
      .select("count", { count: "exact", head: true });

    if (error) {
      return {
        success: false,
        message: "Database connection failed",
        details: { error: error.message },
      };
    }

    // Test 4: Authentication status
    const { data: authData } = await supabaseClient.auth.getSession();

    return {
      success: true,
      message: "Supabase connection successful",
      details: {
        databaseConnected: true,
        movementTemplatesCount: data || 0,
        authSessionExists: !!authData.session,
        userId: authData.session?.user?.id || null,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Connection test failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Test server-side client (for App Router server components)
 */
export async function testServerClient(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    const client = await createSupabaseServerClient();

    // Test basic query
    const { data, error } = await client
      .from("movement_templates")
      .select("count", { count: "exact", head: true });

    if (error) {
      return {
        success: false,
        message: "Server client connection failed",
        details: { error: error.message },
      };
    }

    return {
      success: true,
      message: "Server client connection successful",
      details: {
        movementTemplatesCount: data || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Server client test failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Test browser client (for App Router client components)
 */
export function testBrowserClient(): {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
} {
  try {
    const client = createSupabaseBrowserClient();

    if (!client) {
      return {
        success: false,
        message: "Browser client creation failed",
      };
    }

    return {
      success: true,
      message: "Browser client created successfully",
      details: {
        clientInitialized: true,
        authConfigured: !!client.auth,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Browser client test failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Test basic CRUD operations with type safety
 */
export async function testCRUDOperations(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  if (!supabaseClient) {
    return {
      success: false,
      message: "Supabase client not available",
      details: { error: "Please check your environment variables" },
    };
  }

  try {
    // Test 1: Read operation (SELECT)
    const { data: templates, error: selectError } = await supabaseClient
      .from("movement_templates")
      .select("id, name, muscle_group, tracking_type")
      .limit(1);

    if (selectError) {
      return {
        success: false,
        message: "SELECT operation failed",
        details: { error: selectError.message },
      };
    }

    // Test 2: Check if we can access user_profiles (requires auth)
    const { error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .limit(1);

    // This might fail if not authenticated, which is expected
    const profileAccessible = !profileError;

    return {
      success: true,
      message: "CRUD operations test completed",
      details: {
        selectWorking: true,
        templatesFound: templates?.length || 0,
        profileAccessible,
        profileError: profileError?.message || null,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "CRUD operations test failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Run comprehensive connection tests
 */
export async function runAllConnectionTests(): Promise<{
  success: boolean;
  message: string;
  results: Record<string, unknown>;
}> {
  const results: Record<string, unknown> = {};

  // Run all tests
  results.basicConnection = await testSupabaseConnection();
  results.serverClient = await testServerClient();
  results.browserClient = testBrowserClient();
  results.crudOperations = await testCRUDOperations();

  // Determine overall success
  const allTests = Object.values(results) as Array<{ success: boolean }>;
  const successCount = allTests.filter((test) => test.success).length;
  const totalTests = allTests.length;

  const success = successCount === totalTests;

  return {
    success,
    message: `Connection tests completed: ${successCount}/${totalTests} passed`,
    results,
  };
}
