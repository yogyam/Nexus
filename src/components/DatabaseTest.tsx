import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check if user is authenticated
      addResult(`User authenticated: ${!!user}`);
      addResult(`User ID: ${user?.id}`);

      // Test 2: Check Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        addResult(`Connection error: ${connectionError.message}`);
        addResult(`Error code: ${connectionError.code}`);
        addResult(`Error details: ${JSON.stringify(connectionError.details)}`);
      } else {
        addResult(`Supabase connection: OK`);
      }

      // Test 3: Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        addResult(`Profile error: ${profileError.message}`);
        addResult(`Profile error code: ${profileError.code}`);
      } else {
        addResult(`Profile found: ${profile.full_name}`);
        addResult(`Profile ID: ${profile.id}`);
      }

      // Test 4: Check if projects table is accessible
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title')
        .limit(1);

      if (projectsError) {
        addResult(`Projects error: ${projectsError.message}`);
        addResult(`Projects error code: ${projectsError.code}`);
      } else {
        addResult(`Projects accessible: ${projects?.length || 0} projects found`);
      }

      // Test 5: Check RLS policies - try to get owned projects
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('id, title')
        .eq('owner_id', user?.id);

      if (ownedError) {
        addResult(`Owned projects error: ${ownedError.message}`);
        addResult(`Owned projects error code: ${ownedError.code}`);
      } else {
        addResult(`Owned projects: ${ownedProjects?.length || 0} projects`);
      }

      // Test 6: Check project_members table
      if (profile) {
        const { data: memberProjects, error: memberError } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', profile.id);

        if (memberError) {
          addResult(`Member projects error: ${memberError.message}`);
          addResult(`Member projects error code: ${memberError.code}`);
        } else {
          addResult(`Member projects: ${memberProjects?.length || 0} projects`);
        }
      }

      // Test 7: Check if we can create a test project
      const testProjectTitle = `Test Project ${Date.now()}`;
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          title: testProjectTitle,
          description: 'Test project for debugging',
          owner_id: user?.id
        })
        .select()
        .single();

      if (createError) {
        addResult(`Create project error: ${createError.message}`);
        addResult(`Create project error code: ${createError.code}`);
      } else {
        addResult(`Test project created: ${newProject.title}`);
        
        // Clean up - delete the test project
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', newProject.id);
        
        if (deleteError) {
          addResult(`Delete test project error: ${deleteError.message}`);
        } else {
          addResult(`Test project cleaned up successfully`);
        }
      }

    } catch (error) {
      addResult(`General error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} disabled={loading} className="mb-4">
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </Button>
        
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
              {result}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 