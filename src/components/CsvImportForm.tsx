import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { clientsApi } from "@/api/clients";
import { useAdminStatus } from "@/hooks/use-admin";
import { Upload, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import type { Schema } from "@/lib/db-types";

export function CsvImportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    successful: Schema["clients"][];
    failed: { row: number; data: Record<string, unknown>; error: string }[];
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationId } = useAdminStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check file extension
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Please select a valid CSV file",
          variant: "destructive",
        });
        return;
      }
      
      // Import clients from CSV
      const results = await clientsApi.importClientsFromCsv(file, organizationId);
      setImportResults(results);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${results.successful.length} clients. ${results.failed.length} failed.`,
        variant: results.failed.length > 0 ? "destructive" : "default",
      });
      
      if (results.successful.length > 0 && results.failed.length === 0) {
        // If all successful, navigate back to clients list after a delay
        setTimeout(() => {
          navigate("/clients");
        }, 3000);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to import clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="ios-card w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-poppins">Import Clients from CSV</CardTitle>
        <CardDescription className="font-montserrat">
          Upload a CSV file with client data. Only the name field is required - any other available data will be imported automatically.
          <span className="block mt-1 text-green-600 font-medium">Square CSV exports are now supported!</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="csvFile" className="font-poppins">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="ios-touch-target ios-input"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground font-montserrat">
              The CSV file should include a column for client names. Additional columns will be imported if present.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 font-poppins flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Supported Fields
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm text-muted-foreground font-montserrat">
                <div>• name (required)</div>
                <div>• email</div>
                <div>• phone/phoneNumber</div>
                <div>• cellPhone/mobilePhone</div>
                <div>• workPhone/businessPhone</div>
                <div>• fax/faxNumber</div>
                <div>• address/location</div>
                <div>• city</div>
                <div>• state/province</div>
                <div>• zipCode/postalCode</div>
                <div>• country</div>
                <div>• dateOfBirth/dob</div>
                <div>• gender/sex</div>
                <div>• occupation/job</div>
                <div>• company/organization</div>
                <div>• referredBy/referral</div>
                <div>• emergencyContact</div>
                <div>• emergencyPhone</div>
                <div>• insuranceProvider</div>
                <div>• insuranceId/policyNumber</div>
                <div>• notes/comments</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium mb-2 font-poppins flex items-center text-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Square CSV Support
              </h3>
              <p className="text-sm text-blue-700 mb-2 font-montserrat">
                You can now directly import client data exported from Square! The importer will automatically:
              </p>
              <ul className="list-disc pl-5 text-sm text-blue-700 font-montserrat">
                <li>Combine First Name and Last Name fields</li>
                <li>Extract date of birth information from multiple fields</li>
                <li>Clean up phone number formatting</li>
                <li>Combine address fields</li>
                <li>Store Square-specific information in the notes field</li>
              </ul>
            </div>
          </div>
          
          {importResults && (
            <div className="space-y-4">
              <Alert variant="default" className={importResults.successful.length > 0 ? "border-green-500" : ""}>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Successfully imported {importResults.successful.length} clients</AlertTitle>
              </Alert>
              
              {importResults.failed.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Failed to import {importResults.failed.length} clients</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <ul className="list-disc pl-5 space-y-1">
                        {importResults.failed.map((failure, index) => (
                          <li key={index} className="text-sm">
                            Row {failure.row}: {failure.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pb-6">
          <IOSButton 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/clients")}
            disabled={isLoading}
            className="ios-touch-target font-montserrat"
          >
            Cancel
          </IOSButton>
          <IOSButton 
            type="submit" 
            disabled={isLoading || !file}
            className="ios-touch-target bg-coral text-white font-montserrat"
          >
            {isLoading ? (
              "Importing..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Clients
              </>
            )}
          </IOSButton>
        </CardFooter>
      </form>
    </Card>
  );
}