import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react';

interface EmailSubmissionFormProps {
  cycleNumber: number;
}

export default function EmailSubmissionForm({ cycleNumber }: EmailSubmissionFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: round } = await supabase
        .from('game_rounds')
        .select('id')
        .eq('cycle_number', cycleNumber)
        .maybeSingle();

      if (!round) {
        const { data: newRound } = await supabase
          .from('game_rounds')
          .insert({
            cycle_number: cycleNumber,
            round_start_time: new Date().toISOString(),
          })
          .select()
          .single();

        if (!newRound) throw new Error('Failed to create round');

        const { error: submitError } = await supabase
          .from('game_submissions')
          .insert({
            round_id: newRound.id,
            cycle_number: cycleNumber,
            email,
            submission_order: 1,
          });

        if (submitError) {
          if (submitError.code === '23505') {
            setError('Email already submitted this round!');
          } else {
            setError('Failed to submit email');
          }
        } else {
          setSubmitted(true);
          setEmail('');
          setTimeout(() => setSubmitted(false), 2000);
        }
      } else {
        const { data: submissions } = await supabase
          .from('game_submissions')
          .select('id', { count: 'exact' })
          .eq('round_id', round.id);

        const { error: submitError } = await supabase
          .from('game_submissions')
          .insert({
            round_id: round.id,
            cycle_number: cycleNumber,
            email,
            submission_order: (submissions?.length || 0) + 1,
          });

        if (submitError) {
          if (submitError.code === '23505') {
            setError('Email already submitted this round!');
          } else {
            setError('Failed to submit email');
          }
        } else {
          setSubmitted(true);
          setEmail('');
          setTimeout(() => setSubmitted(false), 2000);
        }
      }
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          className="flex-1 px-4 py-3 bg-gray-900 border-2 border-cyan-500 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-colors font-mono text-sm"
          disabled={loading || submitted}
        />
        <button
          type="submit"
          disabled={loading || submitted}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold uppercase tracking-wider hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
        >
          <Send size={18} className="group-hover:translate-x-1 transition-transform" />
          {loading ? 'Sending...' : submitted ? 'Sent!' : 'Enter'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
      {submitted && (
        <p className="text-cyan-400 text-sm font-mono animate-pulse">Email submitted successfully!</p>
      )}
    </form>
  );
}
