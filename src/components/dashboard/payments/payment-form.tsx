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

export function PaymentForm() {
  const { addPayment, paymentModes } = useClarity();
  const router = useRouter();
  const { toast } = useToast();

  const [payerName, setPayerName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [transactionReference, setTransactionReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName || !amount || !paymentMode) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out at least Payer Name, Amount, and Payment Mode.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      addPayment({
        payerName,
        studentId,
        amount: Number(amount),
        paymentMode,
        transactionReference,
        receiptUrl: receiptPreview || PlaceHolderImages.find(p => p.id === 'receipt-placeholder')?.imageUrl || '',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Payment Logged',
        description: `Payment from "${payerName}" has been successfully recorded.`,
      });
      
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1000);
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
        <CardTitle>Log Incoming Payment</CardTitle>
        <CardDescription>Record a new fee payment or grant received by the institution.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="payerName">Payer's Full Name</Label>
                    <Input id="payerName" value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="e.g., Ramesh Kumar" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="studentId">Student ID (Optional)</Label>
                    <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., S12345" />
                  </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 50000" required />
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select onValueChange={(v: PaymentMode) => setPaymentMode(v)} value={paymentMode} required>
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
                    <Input id="transactionReference" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="Enter reference ID" required />
                  </div>
                )}
              </div>

            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt">Receipt Upload (Optional)</Label>
              <Input id="receipt" type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
              <div className="mt-2 flex h-[250px] items-center justify-center rounded-lg border border-dashed">
                {receiptPreview ? (
                  <img src={receiptPreview} alt="Receipt Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Receipt preview will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
