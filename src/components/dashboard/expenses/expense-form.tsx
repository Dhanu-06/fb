'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClarity } from '@/context/clarity-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeReceipt } from '@/app/actions';
import { Loader2, Wand2 } from 'lucide-react';
import type { PaymentMode } from '@/lib/types';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

export function ExpenseForm() {
  const { addExpense, budgets, expenseCategories, paymentModes } = useClarity();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [budgetId, setBudgetId] = useState('');
  const [category, setCategory] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [transactionReference, setTransactionReference] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ categories: string[], tags: string[] } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setReceiptDataUrl(dataUri);
        handleAnalyzeReceipt(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeReceipt = async (dataUri: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeReceipt(dataUri);
    setIsAnalyzing(false);

    if ('error' in result) {
      toast({
        title: 'Analysis Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Analysis Complete',
        description: 'AI suggestions are now available.',
      });
      setAnalysisResult({
        categories: result.categorySuggestions,
        tags: result.tagSuggestions,
      });
      if (result.categorySuggestions.length > 0) {
        const suggestedCategory = result.categorySuggestions[0];
        if (expenseCategories.map(c => c.toLowerCase()).includes(suggestedCategory.toLowerCase())) {
            const properCasingCategory = expenseCategories.find(c => c.toLowerCase() === suggestedCategory.toLowerCase());
            if(properCasingCategory) setCategory(properCasingCategory);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !vendor || !budgetId || !category || !receiptDataUrl || !paymentMode) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields and upload a receipt.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    let receiptUrl = '';

    try {
        // Upload receipt to Firebase Storage
        const storage = getStorage();
        const storageRef = ref(storage, `receipts/${Date.now()}-${Math.random().toString(36).substring(2)}`);
        const uploadResult = await uploadString(storageRef, receiptDataUrl, 'data_url');
        receiptUrl = await getDownloadURL(uploadResult.ref);

        await addExpense({
          title,
          amount: Number(amount),
          vendor,
          budgetId,
          category,
          date: new Date().toISOString(),
          receiptUrl,
          paymentMode: paymentMode,
          transactionReference,
        });

        toast({
          title: 'Expense Submitted',
          description: `"${title}" has been submitted for review.`,
        });

        router.push('/dashboard/expenses');
    } catch(error: any) {
        toast({
            title: 'Submission Failed',
            description: error.message || "An error occurred while submitting the expense.",
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const getTransactionReferenceLabel = () => {
    switch (paymentMode) {
      case 'UPI': return 'UPI Reference Number';
      case 'Bank Transfer': return 'Transaction ID';
      case 'Cheque': return 'Cheque Number';
      case 'Card': return 'Card Transaction ID';
      default: return 'Transaction Reference';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>Fill in the details below and upload a receipt for verification.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Expense Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Catering for Annual Dinner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 50000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g., ABC Caterers" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Select onValueChange={setBudgetId} value={budgetId}>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="Select a budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select onValueChange={(v: PaymentMode) => setPaymentMode(v)} value={paymentMode}>
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {paymentMode && !['Cash', 'In-Kind'].includes(paymentMode) && (
                   <div className="grid gap-2">
                    <Label htmlFor="transactionReference">{getTransactionReferenceLabel()}</Label>
                    <Input id="transactionReference" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="Enter reference ID" />
                  </div>
                )}
              </div>

               {analysisResult && (
                <div className="grid gap-2 rounded-lg border p-4 bg-secondary/50">
                  <Label className="flex items-center gap-2 text-sm text-foreground"><Wand2 className="h-4 w-4 text-primary" /> AI Suggestions</Label>
                  {analysisResult.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       <p className="text-xs text-muted-foreground mr-2">Categories:</p>
                      {analysisResult.categories.map((cat, i) => (
                        <Button key={i} size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                            const properCaseCat = expenseCategories.find(c => c.toLowerCase() === cat.toLowerCase())
                            if (properCaseCat) setCategory(properCaseCat)
                        }}>{cat}</Button>
                      ))}
                    </div>
                  )}
                   {analysisResult.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       <p className="text-xs text-muted-foreground mr-2">Tags:</p>
                      {analysisResult.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="font-normal">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt">Receipt Upload</Label>
              <Input id="receipt" type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
              <div className="mt-2 flex h-[250px] items-center justify-center rounded-lg border border-dashed">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Analyzing Receipt...</span>
                  </div>
                ) : receiptDataUrl ? (
                  <img src={receiptDataUrl} alt="Receipt Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Preview will appear here.</p>
                    <p>Uploading will trigger AI analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isAnalyzing}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Expense
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
