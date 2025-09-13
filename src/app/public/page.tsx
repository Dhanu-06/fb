'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/public/public-header';
import { useClarity } from '@/context/clarity-provider';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Landmark, PiggyBank } from 'lucide-react';

export default function PublicPage() {
    const bannerImage = PlaceHolderImages.find((img) => img.id === 'public-banner');
    const { publicStats } = useClarity();

    return (
        <div className="relative min-h-screen bg-background">
            <PublicHeader />

            {/* Hero Section */}
            <div className="relative h-[400px] w-full">
                {bannerImage && (
                    <Image
                        src={bannerImage.imageUrl}
                        alt={bannerImage.description}
                        data-ai-hint={bannerImage.imageHint}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Financial Transparency</h1>
                    <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
                        An open look into our budget allocations and how funds are being utilized across departments.
                    </p>
                </div>
            </div>

            <main className="container mx-auto max-w-6xl -mt-20 relative z-10 px-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Allocated Budget</CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(publicStats.totalAllocated)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total funds allocated across all departments for this fiscal period.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Approved Spending</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(publicStats.totalSpent)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total funds spent from the allocated budget on approved expenses.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Spending Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Spending Breakdown</CardTitle>
                        <CardDescription>
                            An overview of allocated funds, approved spending, and utilization rate for each department.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-right">Allocated</TableHead>
                                    <TableHead className="text-right">Spent</TableHead>
                                    <TableHead className="w-[25%] text-center">Utilization</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {publicStats.departmentData.map((data) => (
                                    <TableRow key={data.department}>
                                        <TableCell className="font-medium">{data.department}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(data.allocated)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(data.spent)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Progress value={data.utilization} className="h-2 flex-1" />
                                                <span className="text-xs text-muted-foreground w-12 text-right">{data.utilization.toFixed(0)}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="mt-12 py-6 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} ClarityLedger. All rights reserved.</p>
            </footer>
        </div>
    );
}
