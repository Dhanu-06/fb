
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClarity } from "@/context/clarity-provider";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PublicPage() {
  const { publicStats } = useClarity();

  return (
     <>
     <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-4">
             <Button variant="outline" asChild>
                <Link href="/">Home</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Admin Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
    <main className="flex-1 p-4 sm:p-6 bg-secondary/20 min-h-screen">
      <div className="container mx-auto">
        <div className="text-center my-8">
            <h1 className="text-4xl md:text-5xl font-bold">Public Transparency Dashboard</h1>
            <p className="mt-4 text-lg text-muted-foreground">An open view of our institution's financial commitments and expenditures.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Allocated Funds</CardTitle>
                    <CardDescription>Total budget across all departments for this fiscal period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(publicStats.totalAllocated)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Spent (Approved)</CardTitle>
                    <CardDescription>Total value of all approved expenses to date.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(publicStats.totalSpent)}</p>
                </CardContent>
            </Card>
        </div>

        {/* Department Breakdown */}
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Department-wise Financials</CardTitle>
                <CardDescription>A summary of allocated vs. spent funds for each department.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={publicStats.departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)}/>
                        <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                        }}
                        formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Bar dataKey="allocated" fill="hsl(var(--accent))" name="Allocated" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department</TableHead>
                                <TableHead className="w-[35%] text-center">Utilization</TableHead>
                                <TableHead className="text-right">Spent / Allocated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {publicStats.departmentData.map(d => (
                                <TableRow key={d.department}>
                                    <TableCell className="font-medium">{d.department}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={d.utilization} className="h-2" />
                                            <span className="text-xs text-muted-foreground w-12 text-right">{d.utilization.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-medium">{formatCurrency(d.spent)}</span>
                                        <span className="text-xs text-muted-foreground"> / {formatCurrency(d.allocated)}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </main>
    </>
  );
}
