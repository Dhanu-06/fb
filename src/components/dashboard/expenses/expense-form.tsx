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
import { Loader2 } from 'lucide-react';
import type { PaymentMode } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function ExpenseForm() {
  const { addExpense, budgets, expenseCategories, paymentModes } = useClarity();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [budgetId, setBudgetId] = useState('');
  const [category, setCategory] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [transactionReference, setTransactionReference] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setReceiptPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !vendor || !budgetId || !category || !paymentMode) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
        await addExpense({
          title,
          amount: Number(amount),
          vendor,
          budgetId,
          category,
          date: new Date().toISOString(),
          receiptUrl: receiptPreview || '', // Pass the data URI
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt">Receipt Upload</Label>
              <Input id="receipt" type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
              <div className="mt-2 flex h-[250px] items-center justify-center rounded-lg border border-dashed">
                {receiptPreview ? (
                  <img src={receiptPreview} alt="Receipt Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Preview will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Expense
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
