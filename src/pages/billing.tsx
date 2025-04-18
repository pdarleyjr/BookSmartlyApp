import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IOSButton } from "@/components/ui/ios-button";
import { CreditCard, Download } from "lucide-react";

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for invoices
  const invoices = [
    {
      id: "INV-001",
      date: "May 1, 2023",
      amount: "$15.00",
      status: "Paid"
    },
    {
      id: "INV-002",
      date: "April 1, 2023",
      amount: "$15.00",
      status: "Paid"
    },
    {
      id: "INV-003",
      date: "March 1, 2023",
      amount: "$15.00",
      status: "Paid"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-poppins">Billing</h1>
          <IOSButton>
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment Method
          </IOSButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Free Plan</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Basic features with limited appointments
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins">Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Appointments</span>
                  <span>12 / 20</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  60% of your monthly limit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins">Next Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Amount</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date</span>
                  <span>N/A</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free plan - no payments due
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview" className="font-poppins">
              Overview
            </TabsTrigger>
            <TabsTrigger value="invoices" className="font-poppins">
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins">Available Plans</CardTitle>
                <CardDescription>
                  Choose the plan that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">Free</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$0</span>
                        <span className="text-sm">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Up to 20 appointments</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Basic calendar features</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Email notifications</span>
                        </li>
                      </ul>
                      <IOSButton className="w-full" disabled>
                        Current Plan
                      </IOSButton>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pro</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$15</span>
                        <span className="text-sm">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Unlimited appointments</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Advanced calendar features</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>SMS notifications</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Client management</span>
                        </li>
                      </ul>
                      <IOSButton className="w-full" variant="outline">
                        Upgrade
                      </IOSButton>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold">$49</span>
                        <span className="text-sm">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Team management</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Advanced analytics</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>API access</span>
                        </li>
                      </ul>
                      <IOSButton className="w-full" variant="outline">
                        Upgrade
                      </IOSButton>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins">Invoices</CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell className="text-right">
                            <IOSButton size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </IOSButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedBillingPage = () => (
  <ProtectedRoute Component={BillingPage} />
);

export default ProtectedBillingPage;
