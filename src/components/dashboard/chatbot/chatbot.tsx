'use client';

import { useState } from 'react';
import { useClarity } from '@/context/clarity-provider';
import { queryFinancials } from '@/ai/flows/query-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function Chatbot() {
  const { budgets, expenses, isLoading: isClarityLoading } = useClarity();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const approvedExpenses = expenses.filter(e => e.status === 'Approved');
      const response = await queryFinancials({ query: input, budgets, expenses: approvedExpenses });

      const botMessage: Message = { role: 'bot', content: response.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      toast({
        title: 'An Error Occurred',
        description: 'The AI assistant could not process your request. Please try again.',
        variant: 'destructive',
      });
      setMessages((prev) => prev.slice(0, -1)); // Remove the user's message on error
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const hasData = budgets.length > 0 || expenses.length > 0;

  if (isClarityLoading) {
      return (
          <Card className="flex flex-col h-full max-h-[80vh]">
               <CardHeader>
                    <CardTitle>Financial Assistant</CardTitle>
                    <CardDescription>Ask questions about your budgets and expenses.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                     <div className="text-center">
                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading financial data...</p>
                    </div>
                </CardContent>
          </Card>
      )
  }

  return (
    <Card className="flex flex-col h-full max-h-[80vh]">
      <CardHeader>
        <CardTitle>Financial Assistant</CardTitle>
        <CardDescription>
          Ask questions about your institution's budgets and approved expenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.length === 0 && !isThinking && (
              <div className="text-center text-muted-foreground pt-10">
                <Bot className="h-12 w-12 mx-auto" />
                <p className="mt-2">
                  {hasData ? "I'm ready to answer your questions." : "There is no financial data to analyze yet."}
                </p>
                {hasData && (
                    <p className="text-sm mt-4">Try asking:
                        <em className="block mt-1">&quot;Which department has spent the most?&quot;</em>
                        <em className="block mt-1">&quot;Summarize the spending for the Sports department.&quot;</em>
                    </p>
                )}
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                   <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="relative w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Where did the sports budget go?"
            className="pr-12"
            disabled={isThinking || !hasData}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isThinking || !hasData}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
