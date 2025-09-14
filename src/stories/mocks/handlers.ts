import { http, HttpResponse } from 'msw';

// Mock environment variables for Storybook
if (typeof window !== 'undefined') {
  // @ts-expect-error - Adding process to window for Storybook environment
  window.process = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    }
  };
}

// Mock data
const mockWorkout = {
  id: 'workout-123',
  name: 'Push Day Workout',
  created_at: '2025-01-10T08:00:00Z',
  updated_at: '2025-01-10T08:00:00Z',
  user_id: 'test-user-id',
  notes: 'Focus on chest and shoulders',
};

const mockWorkouts = [mockWorkout];

const mockWorkoutMovements = [
  {
    id: 'movement-1',
    workout_id: 'workout-123',
    user_movement_id: 'user-movement-1',
    order_index: 0,
    created_at: '2025-01-10T08:00:00Z',
    user_movement: {
      id: 'user-movement-1',
      name: 'Bench Press',
      movement_type: 'weight',
      muscle_groups: ['Chest', 'Triceps'],
      tracking_type: { name: 'weight' },
      user_movement_muscle_groups: [
        { muscle_group: { name: 'chest', display_name: 'Chest' } },
        { muscle_group: { name: 'triceps', display_name: 'Triceps' } }
      ]
    },
  },
  {
    id: 'movement-2', 
    workout_id: 'workout-123',
    user_movement_id: 'user-movement-2',
    order_index: 1,
    created_at: '2025-01-10T08:00:00Z',
    user_movement: {
      id: 'user-movement-2',
      name: 'Overhead Press',
      movement_type: 'weight',
      muscle_groups: ['Shoulders', 'Triceps'],
      tracking_type: { name: 'weight' },
      user_movement_muscle_groups: [
        { muscle_group: { name: 'shoulders', display_name: 'Shoulders' } },
        { muscle_group: { name: 'triceps', display_name: 'Triceps' } }
      ]
    },
  },
];

const mockUserMovements = [
  {
    id: 'user-movement-1',
    name: 'Bench Press',
    user_id: 'test-user-id',
    tracking_type_id: 'weight-type',
    tracking_type: { name: 'weight' },
    muscle_groups: ['Chest', 'Triceps'],
    user_movement_muscle_groups: [
      { muscle_group: { name: 'chest', display_name: 'Chest' } },
      { muscle_group: { name: 'triceps', display_name: 'Triceps' } }
    ]
  },
  {
    id: 'user-movement-2',
    name: 'Overhead Press',
    user_id: 'test-user-id',
    tracking_type_id: 'weight-type',
    tracking_type: { name: 'weight' },
    muscle_groups: ['Shoulders', 'Triceps'],
    user_movement_muscle_groups: [
      { muscle_group: { name: 'shoulders', display_name: 'Shoulders' } },
      { muscle_group: { name: 'triceps', display_name: 'Triceps' } }
    ]
  },
  {
    id: 'user-movement-3',
    name: 'Squat',
    user_id: 'test-user-id',
    tracking_type_id: 'weight-type',
    tracking_type: { name: 'weight' },
    muscle_groups: ['Legs', 'Glutes'],
    user_movement_muscle_groups: [
      { muscle_group: { name: 'legs', display_name: 'Legs' } },
      { muscle_group: { name: 'glutes', display_name: 'Glutes' } }
    ]
  },
];

const mockUserProfile = {
  id: 'profile-123',
  user_id: 'test-user-id',
  display_name: 'John Doe',
  default_rest_timer: 90,
  weight_unit: 'lbs',
  distance_unit: 'miles',
  timer_pin_enabled: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-10T00:00:00Z',
};

// Helper to extract table name and query from Supabase URL
function parseSupabaseUrl(url: URL) {
  const pathParts = url.pathname.split('/');
  const table = pathParts[pathParts.length - 1];
  const params = Object.fromEntries(url.searchParams);
  return { table, params };
}

export const handlers = [
  // Mock Supabase Auth API calls
  http.get('https://*.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_metadata: { display_name: 'Test User' },
      app_metadata: {},
      identities: [],
      factors: [],
    });
  }),

  http.post('https://*.supabase.co/auth/v1/token*', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }
    });
  }),

  // Mock Supabase REST API calls
  http.get('https://*.supabase.co/rest/v1/*', ({ request }) => {
    const url = new URL(request.url);
    const { table, params } = parseSupabaseUrl(url);
    
    console.log('MSW intercepted:', table, params);
    
    switch (table) {
      case 'workouts':
        if (params.id && params.id.includes('eq.')) {
          // Single workout by ID
          const workoutId = params.id.replace('eq.', '');
          const workout = mockWorkouts.find(w => w.id === workoutId);
          return HttpResponse.json(workout || null);
        } else {
          // All workouts for user
          return HttpResponse.json(mockWorkouts);
        }
        
      case 'workout_movements':
        return HttpResponse.json(mockWorkoutMovements);
        
      case 'user_movements':
        return HttpResponse.json(mockUserMovements);
        
      case 'user_profiles':
        return HttpResponse.json([mockUserProfile]);
        
      default:
        console.log('Unhandled table:', table);
        return HttpResponse.json([]);
    }
  }),

  // Mock POST requests (create operations)
  http.post('https://*.supabase.co/rest/v1/*', ({ request }) => {
    const url = new URL(request.url);
    const { table } = parseSupabaseUrl(url);
    
    switch (table) {
      case 'workouts':
        return HttpResponse.json({
          ...mockWorkout,
          id: `workout-${Date.now()}`,
        });
        
      case 'workout_movements':
        return HttpResponse.json({
          id: `movement-${Date.now()}`,
          workout_id: 'workout-123',
          user_movement_id: 'user-movement-1',
          order_index: 0,
          created_at: new Date().toISOString(),
        });
        
      default:
        return HttpResponse.json({ id: 'new-item' });
    }
  }),

  // Mock PATCH requests (update operations)
  http.patch('https://*.supabase.co/rest/v1/*', ({ request }) => {
    const url = new URL(request.url);
    const { table } = parseSupabaseUrl(url);
    
    switch (table) {
      case 'workouts':
        return HttpResponse.json({
          ...mockWorkout,
          updated_at: new Date().toISOString(),
        });
        
      case 'user_profiles':
        return HttpResponse.json({
          ...mockUserProfile,
          updated_at: new Date().toISOString(),
        });
        
      default:
        return HttpResponse.json({ id: 'updated-item' });
    }
  }),

  // Mock DELETE requests
  http.delete('https://*.supabase.co/rest/v1/*', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Mock auth state change
  http.get('https://*.supabase.co/auth/v1/session', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }
    });
  }),
];