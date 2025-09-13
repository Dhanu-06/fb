'use client';
import { Chatbot } from '@/components/dashboard/chatbot/chatbot';
import { useCheckRole } from '@/hooks/use-check-role';

export default function AnalysisPage() {
  useCheckRole(['Admin', 'Reviewer']);

  return (
    <div className="h-full">
      <Chatbot />
    </div>
  );
}
