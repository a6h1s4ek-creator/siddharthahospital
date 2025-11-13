'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSmartSuggestions } from '@/app/actions';
import { WandSparkles, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SmartSuggestionToolOutput } from '@/ai/flows/smart-suggestion-tool';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const defaultPatientRecord = `Patient Name: Jane Smith
Age: 34
Gender: Female
Blood Type: A-
Last Visit: 2024-07-12
Diagnosis: Hypertension, controlled with Lisinopril. Complains of occasional headaches. No other significant history.
Vitals: BP 130/85, HR 72, Temp 98.6°F`;

export function SmartSuggestionToolUI() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartSuggestionToolOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [patientRecord, setPatientRecord] = useState(defaultPatientRecord);
  const [userRole, setUserRole] = useState('Doctor');
  const [currentContext, setCurrentContext] = useState('Reviewing patient chart before consultation.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await getSmartSuggestions({
      patientRecord,
      userRole,
      currentContext,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'Failed to get suggestions.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-20"
        >
          <WandSparkles className="h-7 w-7" />
          <span className="sr-only">Smart Suggestions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WandSparkles className="text-primary" />
            Smart Suggestion Tool
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions based on the current patient and context.
          </DialogDescription>
        </DialogHeader>

        {!result && !isLoading && !error && (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientRecord">Patient Record</Label>
              <Textarea
                id="patientRecord"
                value={patientRecord}
                onChange={(e) => setPatientRecord(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Get Suggestions'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing information...</p>
          </div>
        )}

        {error && (
          <div className="py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {result && (
          <div className="py-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 mt-1 text-primary shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.reasoning}</p>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Try Again
              </Button>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
