'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useClarity } from "@/context/clarity-provider";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import type { Budget } from "@/lib/types";

export function FeedbackDialog({ budget }: { budget: Budget }) {
  const { addFeedback, currentUser } = useClarity();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) {
      setError('Please enter your feedback before submitting.');
      return;
    }
    
    addFeedback({
        budgetId: budget.id,
        comment,
        userId: currentUser?.id, // Can be undefined for public users
    });

    toast({
      title: "Feedback Submitted",
      description: `Thank you for your feedback on the "${budget.title}" budget.`,
    });
    
    // Reset form and close dialog
    setComment('');
    setError('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="sr-only">Leave Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
            <DialogDescription>
              Your thoughts on the budget: <span className="font-semibold">{budget.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="comment">Your Feedback</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your suggestion or comment here..."
                rows={4}
              />
            </div>
             {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Submit Feedback</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
