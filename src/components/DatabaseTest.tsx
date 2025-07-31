import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Check if user is authenticated
      results.auth = {
        user: user ? 'Authenticated' : 'Not authenticated',
        userId: user?.id || 'No user ID'
      };

      // Test 2: Check if we can query the projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      results.projects = {
        data: projectsData,
        error: projectsError,
        success: !projectsError
      };

      // Test 3: Check if we can query projects for the current user
      if (user?.id) {
        const { data: userProjects, error: userProjectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id);

        results.userProjects = {
          data: userProjects,
          error: userProjectsError,
          success: !userProjectsError,
          count: userProjects?.length || 0
        };
      }

      // Test 4: Check profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id || '')
        .limit(1);

      results.profiles = {
        data: profilesData,
        error: profilesError,
        success: !profilesError
      };

    } catch (error) {
      results.generalError = error;
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </Button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 space-y-4">
            <h3 className="font-semibold">Test Results:</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 