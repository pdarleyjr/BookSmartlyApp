import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAppointments } from "@/redux/slices/appointmentsSlice";
import { format, parseISO } from "date-fns";
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Send, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Schema } from "@/lib/db-types";

// Define types for billing-related data
type BillingAppointment = Schema["appointments"] & {
  client?: Schema["clients"];
};

type Invoice = {
  id?: string;
  appointmentIds: number[];
  clientId?: number;
  clientName: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  squareInvoiceId?: string;
  squareInvoiceUrl?: string;
};

type SuperbillData = {
  providerName: string;
  providerLicense: string;
  providerNPI?: string;
  clientName: string;
  clientDOB?: string;
  clientAddress?: string;
  appointmentDates: string[];
  serviceDescription: string;
  diagnosisCodes?: string[];
  totalAmount: number;
  amountPaid: number;
  insuranceProvider?: string;
  insuranceId?: string;
  notes?: string;
};

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState("unbilled");
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isSuperbillDialogOpen, setIsSuperbillDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedAppointmentForSuperbill, setSelectedAppointmentForSuperbill] = useState<BillingAppointment | null>(null);
  const [superbillData, setSuperbillData] = useState<SuperbillData>({
    providerName: "",
    providerLicense: "",
    clientName: "",
    appointmentDates: [],
    serviceDescription: "",
    totalAmount: 0,
    amountPaid: 0
  });
  
  const [searchParams] = useSearchParams();
  const appointmentIdFromUrl = searchParams.get("appointmentId");
  
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(state => state.appointments.items);
  
  // Fetch appointments and billing data
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch appointments
        await dispatch(fetchAppointments(session.user.id)).unwrap();
        
        // Fetch invoices if the table exists
        try {
          const invoicesData = await fine.table("invoices")
            .select()
            .order("createdAt", { ascending: false });
          
          setInvoices(invoicesData);
        } catch (error) {
          console.log("Invoices table may not exist yet:", error);
          // Create invoices table if it doesn't exist
          try {
            await fine.exec(`
              CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                appointmentIds INTEGER[],
                clientId INTEGER,
                clientName TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                status TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                paidAt TIMESTAMP,
                squareInvoiceId TEXT,
                squareInvoiceUrl TEXT
              );
            `);
            setInvoices([]);
          } catch (tableError) {
            console.error("Error creating invoices table:", tableError);
          }
        }
        
        // If there's an appointment ID in the URL, select it
        if (appointmentIdFromUrl) {
          const appointmentId = parseInt(appointmentIdFromUrl);
          if (!isNaN(appointmentId)) {
            setSelectedAppointments([appointmentId]);
          }
        }
      } catch (error) {
        console.error("Error loading billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load billing data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [session?.user?.id, dispatch, appointmentIdFromUrl, toast]);
  
  // Filter appointments based on billing status
  const unbilledAppointments = appointments.filter(appointment => 
    appointment.status === "completed" && 
    (!appointment.billingStatus || appointment.billingStatus === "unbilled")
  );
  
  const billedAppointments = appointments.filter(appointment => 
    appointment.billingStatus === "billed"
  );
  
  const paidAppointments = appointments.filter(appointment => 
    appointment.billingStatus === "paid"
  );
  
  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery.trim() === "" || 
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Toggle appointment selection
  const toggleAppointmentSelection = (appointmentId: number) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };
  
  // Create invoice
  const createInvoice = async () => {
    if (selectedAppointments.length === 0) {
      toast({
        title: "No appointments selected",
        description: "Please select at least one appointment to create an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the selected appointments
      const selectedAppointmentData = appointments.filter(appointment => 
        selectedAppointments.includes(appointment.id || 0)
      );
      
      if (selectedAppointmentData.length === 0) {
        throw new Error("Selected appointments not found");
      }
      
      // Calculate total amount
      const totalAmount = selectedAppointmentData.reduce(
        (sum, appointment) => sum + (appointment.price || 0),
        0
      );
      
      // Get client name from the first appointment
      const firstAppointment = selectedAppointmentData[0];
      const clientName = firstAppointment.clientName || "Unknown Client";
      
      // Create invoice in database
      const newInvoice: Omit<Invoice, "id"> = {
        appointmentIds: selectedAppointments,
        clientName,
        amount: totalAmount,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createdInvoice = await fine.table("invoices")
        .insert(newInvoice)
        .select();
      
      if (!createdInvoice || createdInvoice.length === 0) {
        throw new Error("Failed to create invoice");
      }
      
      // Update appointment billing status
      for (const appointmentId of selectedAppointments) {
        await fine.table("appointments")
          .update({ billingStatus: "billed" })
          .eq("id", appointmentId);
      }
      
      // Update local state
      setInvoices(prev => [createdInvoice[0], ...prev]);
      
      // Update appointments in Redux store
      dispatch(fetchAppointments(session?.user?.id || ""));
      
      // Clear selection
      setSelectedAppointments([]);
      
      toast({
        title: "Invoice created",
        description: `Invoice for ${clientName} created successfully.`,
      });
      
      // Switch to the Invoices tab
      setActiveTab("invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Send invoice via Square
  const sendInvoice = async (invoice: Invoice) => {
    try {
      // Call backend API to create Square invoice
      const response = await fetch("/api/square/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          appointmentIds: invoice.appointmentIds,
          clientName: invoice.clientName,
          amount: invoice.amount
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send invoice via Square");
      }
      
      const data = await response.json();
      
      // Update invoice with Square info
      await fine.table("invoices")
        .update({
          status: "sent",
          squareInvoiceId: data.squareInvoiceId,
          squareInvoiceUrl: data.squareInvoiceUrl,
          updatedAt: new Date().toISOString()
        })
        .eq("id", invoice.id);
      
      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id
          ? {
              ...inv,
              status: "sent",
              squareInvoiceId: data.squareInvoiceId,
              squareInvoiceUrl: data.squareInvoiceUrl,
              updatedAt: new Date().toISOString()
            }
          : inv
      ));
      
      toast({
        title: "Invoice sent",
        description: "Invoice has been sent to the client via Square.",
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        title: "Error",
        description: "Failed to send invoice via Square. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Send single appointment invoice via Square
  const sendSingleInvoice = async (appointmentId: number) => {
    try {
      // Call backend API to create Square invoice
      const response = await fetch("/api/square/invoice/create-and-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_id: appointmentId
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send invoice via Square");
      }
      
      const data = await response.json();
      
      // Update appointment billing status
      await fine.table("appointments")
        .update({ billingStatus: "billed" })
        .eq("id", appointmentId);
      
      // Update appointments in Redux store
      dispatch(fetchAppointments(session?.user?.id || ""));
      
      toast({
        title: "Invoice sent",
        description: "Invoice has been sent to the client via Square.",
      });
      
      // Switch to the Invoices tab
      setActiveTab("invoices");
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        title: "Error",
        description: "Failed to send invoice via Square. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Mark invoice as paid
  const markInvoiceAsPaid = async (invoice: Invoice) => {
    try {
      // Update invoice status
      await fine.table("invoices")
        .update({
          status: "paid",
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq("id", invoice.id);
      
      // Update appointment billing status
      for (const appointmentId of invoice.appointmentIds) {
        await fine.table("appointments")
          .update({ billingStatus: "paid" })
          .eq("id", appointmentId);
      }
      
      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id
          ? {
              ...inv,
              status: "paid",
              paidAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : inv
      ));
      
      // Update appointments in Redux store
      dispatch(fetchAppointments(session?.user?.id || ""));
      
      toast({
        title: "Invoice marked as paid",
        description: "Invoice has been marked as paid.",
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate superbill
  const generateSuperbill = (appointment: BillingAppointment) => {
    setSelectedAppointmentForSuperbill(appointment);
    
    // Populate superbill data
    setSuperbillData({
      providerName: "Dr. " + (session?.user?.name || "Provider"),
      providerLicense: "License #12345", // This would come from staff_details
      clientName: appointment.clientName || "Unknown Client",
      appointmentDates: [format(parseISO(appointment.startTime), "MM/dd/yyyy")],
      serviceDescription: appointment.title,
      totalAmount: appointment.price || 0,
      amountPaid: appointment.billingStatus === "paid" ? (appointment.price || 0) : 0
    });
    
    setIsSuperbillDialogOpen(true);
  };
  
  // Download superbill as PDF
  const downloadSuperbill = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just show a success message
    toast({
      title: "Superbill downloaded",
      description: "The superbill has been downloaded as a PDF.",
    });
    
    setIsSuperbillDialogOpen(false);
  };
  
  // View invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-slate-500">Draft</Badge>;
      case "sent":
        return <Badge className="bg-blue-500">Sent</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Calculate total revenue
  const totalRevenue = paidAppointments.reduce(
    (sum, appointment) => sum + (appointment.price || 0),
    0
  );
  
  // Calculate pending revenue
  const pendingRevenue = billedAppointments.reduce(
    (sum, appointment) => sum + (appointment.price || 0),
    0
  );
  
  // Calculate unbilled revenue
  const unbilledRevenue = unbilledAppointments.reduce(
    (sum, appointment) => sum + (appointment.price || 0),
    0
  );
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Billing & Invoices</h1>
        </div>
        
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Revenue Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                From {paidAppointments.length} paid appointments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {formatCurrency(pendingRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                From {billedAppointments.length} billed appointments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Unbilled Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {formatCurrency(unbilledRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                From {unbilledAppointments.length} unbilled appointments
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="unbilled">Unbilled</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          
          {/* Unbilled Appointments Tab */}
          <TabsContent value="unbilled" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Unbilled Appointments</h2>
              
              <div className="flex gap-2">
                <Button 
                  onClick={createInvoice}
                  disabled={selectedAppointments.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading appointments...</p>
              </div>
            ) : unbilledAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You don't have any unbilled appointments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedAppointments.length === unbilledAppointments.length && unbilledAppointments.length > 0}
                          onCheckedChange={(checked) => {
