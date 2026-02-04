import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy } from 'lucide-react';

interface Submission {
  id: string;
  email: string;
  submission_order: number;
  submitted_at: string;
}

interface SubmissionsListProps {
  cycleNumber: number;
}

export default function SubmissionsList({ cycleNumber }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from('game_submissions')
        .select('id, email, submission_order, submitted_at')
        .eq('cycle_number', cycleNumber)
        .order('submission_order', { ascending: true });

      if (data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();

    const subscription = supabase
      .channel(`submissions_${cycleNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_submissions',
          filter: `cycle_number=eq.${cycleNumber}`,
        },
        (payload) => {
          setSubmissions((prev) => {
            const newSubmission = payload.new as Submission;
            const exists = prev.some((s) => s.id === newSubmission.id);
            if (!exists) {
              return [...prev, newSubmission].sort((a, b) => a.submission_order - b.submission_order);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [cycleNumber]);

  if (loading) {
    return (
      <div className="text-center text-cyan-400 text-sm">
        Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
        <Trophy size={16} className="text-yellow-400" />
        Strikers ({submissions.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-gradient-to-r from-gray-800 to-gray-900 border border-cyan-500/30 hover:border-red-500/50 p-3 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="text-red-500 font-black text-lg pt-0.5 min-w-fit">
                #{submission.submission_order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cyan-400 text-xs font-mono break-all group-hover:text-red-400 transition-colors">
                  {submission.email}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {new Date(submission.submitted_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
