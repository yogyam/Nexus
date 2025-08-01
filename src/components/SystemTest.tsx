import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiClient } from '@/integrations/gemini/client';
import { Badge } from '@/components/ui/badge';

export const SystemTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp} ${icon} ${result}`]);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      addResult('Starting comprehensive system tests...');

      // Test 1: Authentication
      addResult(`User authenticated: ${!!user}`, user ? 'success' : 'error');
      if (user) {
        addResult(`User ID: ${user.id}`, 'info');
        addResult(`User email: ${user.email}`, 'info');
      }

      // Test 2: Database Connection
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`Database connection error: ${error.message}`, 'error');
        } else {
          addResult('Database connection: OK', 'success');
        }
      } catch (error) {
        addResult(`Database connection failed: ${error}`, 'error');
      }

      // Test 3: Check if invitations table exists
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`Invitations table error: ${error.message}`, 'error');
          addResult('You need to run the invitations migration in Supabase SQL Editor', 'error');
        } else {
          addResult('Invitations table: OK', 'success');
        }
      } catch (error) {
        addResult(`Invitations table failed: ${error}`, 'error');
      }

      // Test 4: Test invitation creation
      if (user) {
        try {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            addResult(`Profile fetch error: ${profileError.message}`, 'error');
          } else {
            addResult('Profile fetch: OK', 'success');
            
            // Test creating an invitation
            const testEmail = `test-${Date.now()}@example.com`;
            const { error: inviteError } = await supabase
              .from('invitations')
              .insert({
                project_id: '00000000-0000-0000-0000-000000000000', // dummy ID
                invited_by: profile.id,
                email: testEmail,
                token: `test_${Date.now()}`,
              });

            if (inviteError) {
              addResult(`Invitation creation error: ${inviteError.message}`, 'error');
            } else {
              addResult('Invitation creation: OK', 'success');
              
              // Clean up test invitation
              await supabase
                .from('invitations')
                .delete()
                .eq('email', testEmail);
            }
          }
        } catch (error) {
          addResult(`Invitation test failed: ${error}`, 'error');
        }
      }

      // Test 5: Gemini API
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          addResult('Gemini API key not configured', 'error');
          addResult('Please add your Gemini API key to .env file', 'error');
        } else {
          addResult('Gemini API key: Found', 'success');
          
          // Test Gemini API call with detailed error reporting
          try {
            addResult('Testing Gemini API models...', 'info');
            const response = await geminiClient.generateTasksFromAssignment(
              'Create a simple website with a homepage and contact form',
              2,
              'Test Project'
            );
            addResult('Gemini API call: OK', 'success');
            addResult(`Generated ${response.tasks.length} tasks`, 'info');
            addResult(`Total estimated hours: ${response.totalEstimatedHours}`, 'info');
            addResult(`Recommendations: ${response.recommendations.length}`, 'info');
          } catch (error) {
            addResult(`Gemini API call failed: ${error}`, 'error');
            addResult('This might be due to:', 'info');
            addResult('- Invalid API key', 'info');
            addResult('- API quota exceeded', 'info');
            addResult('- Network connectivity issues', 'info');
          }
        }
      } catch (error) {
        addResult(`Gemini API test failed: ${error}`, 'error');
      }

      // Test 6: Environment Variables
      addResult(`Environment check:`, 'info');
      addResult(`VITE_GEMINI_API_KEY: ${import.meta.env.VITE_GEMINI_API_KEY ? 'Set' : 'Not set'}`, 
        import.meta.env.VITE_GEMINI_API_KEY ? 'success' : 'error');
      addResult(`NODE_ENV: ${import.meta.env.NODE_ENV}`, 'info');

      addResult('All tests completed!', 'info');

    } catch (error) {
      addResult(`General test error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Diagnostics
          <div className="flex gap-2">
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted rounded">
              <strong>Database:</strong> {testResults.some(r => r.includes('Database connection: OK')) ? 
                <Badge variant="default" className="ml-2">Connected</Badge> : 
                <Badge variant="destructive" className="ml-2">Issues</Badge>}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Invitations:</strong> {testResults.some(r => r.includes('Invitations table: OK')) ? 
                <Badge variant="default" className="ml-2">Ready</Badge> : 
                <Badge variant="destructive" className="ml-2">Missing</Badge>}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Gemini API:</strong> {testResults.some(r => r.includes('Gemini API call: OK')) ? 
                <Badge variant="default" className="ml-2">Working</Badge> : 
                <Badge variant="destructive" className="ml-2">Issues</Badge>}
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                {result}
              </div>
            ))}
          </div>
          
          {testResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run All Tests" to diagnose system issues
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 