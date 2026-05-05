# Debugging Without DevTools (React Native)

## Issue 1: Registration Not Working (No Errors)

### Step 1: Add Console Logging
In `client/src/screens/parent/registration_form.js`, add:

```javascript
const handleSubmit = async () => {
  console.log('=== REGISTRATION START ===');
  console.log('Student data:', { student_name, age, parent_name, parent_email, parent_phone });
  
  try {
    const result = await apiClient.post('/students', studentData);
    console.log('Student API result:', result);
    
    const regResult = await apiClient.post('/registrations', registrationData);
    console.log('Registration API result:', regResult);
    
    console.log('=== REGISTRATION SUCCESS ===');
  } catch (error) {
    console.error('REGISTRATION FAILED:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
  }
};
```

### Step 2: Check Supabase Dashboard
After attempting registration, verify manually:

1. **Auth Users**: Check if user exists at https://supabase.com/dashboard/project/[project-id]/auth/users
2. **Students Table**: Check if student row exists at https://supabase.com/dashboard/project/[project-id]/database/tables?schema=public&table=students
3. **Registrations Table**: Check if registration exists at https://supabase.com/dashboard/project/[project-id]/database/tables?schema=public&table=registrations
4. **API Logs**: Check for failed requests at https://supabase.com/dashboard/project/[project-id]/logs/edge-logs

### Step 3: Check RLS Policies
Navigate to: https://supabase.com/dashboard/project/[project-id]/database/replicascans?schema=public

Verify policies allow:
- INSERT into students table (authenticated users as parents)
- INSERT into registrations table (authenticated users as parents)

## Issue 2: Time Slots Intermittent

### Step 1: Hardcode Test Data
In `client/src/controllers/timeSlotController.js`, temporarily bypass API:

```javascript
// Temporarily hardcode for testing
const listAvailable = async (req, res) => {
  return [{
    id: 'test-1',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    max_capacity: 10,
    current_count: 5
  }];
};
```

### Step 2: Console Log Data Fetching
In `client/src/screens/parent/registration_form.js`:

```javascript
const { data: timeSlots, isLoading, error } = useQuery({
  queryKey: ['timeSlots', selectedProgram, selectedMode, selectedLocation],
  queryFn: async () => {
    console.log('Fetching time slots for:', { selectedProgram, selectedMode, selectedLocation });
    const result = await timeSlotController.listAvailable(...);
    console.log('Time slots result:', result);
    return result;
  },
});

// Log rendering
console.log('Time slots in render:', timeSlots);
```

### Step 3: Verify Data Source
Check in Supabase dashboard: https://supabase.com/dashboard/project/[project-id]/database/tables?schema=public&table=time_slots

Verify rows have correct data for:
- max_capacity > current_count (otherwise filters out)
- program_id matches your test
- mode matches your test

## Step 4: React Query Debugging
Enable React Query dev tools console logging:

In `client/src/App.js` or main entry:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      cacheTime: 0,
      retry: 3,
      retryDelay: 1000,
    }
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }
});
```

## Quick Verification Commands

```bash
# Run Metro with verbose logging
npx react-native start --verbose

# Check Metro console for logs
# Look for: REGISTRATION START, REGISTRATION SUCCESS, API result, etc.

# Reset Metro cache if needed
npx react-native start --reset-cache
```

## Collect Debug Info

After running tests, collect:

1. **Console Logs**: Copy all logs from Metro terminal
2. **Database Screenshots**: Show tables (students, registrations, time_slots)
3. **API Logs**: Screenshot of any failed requests in Supabase dashboard

Then share these details and I'll help analyze!
