import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Mail, Phone, Calendar, Briefcase, MapPin } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { IOSButton } from "@/components/ui/ios-button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { clientsApi } from "@/api/clients";
import type { Schema } from "@/lib/db-types";

type ClientCardProps = {
  client: Schema["clients"];
  onDelete: () => void;
};

export function ClientCard({ client, onDelete }: ClientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await clientsApi.deleteClient(client.id!);
      
      toast({
        title: "Client deleted",
        description: "Client has been successfully deleted.",
      });
      onDelete();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="ios-card w-full overflow-hidden border-none shadow-sm rounded-xl active:scale-[0.98] transition-transform">
      <div className="h-2 bg-primary w-full" />
      <CardHeader className="pt-4">
        <CardTitle className="text-xl font-poppins">{client.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.email && (
          <div className="flex items-center gap-2 font-montserrat">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
        )}
        
        {client.phone && (
          <div className="flex items-center gap-2 font-montserrat">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
        )}
        
        {client.cellPhone && (
          <div className="flex items-center gap-2 font-montserrat">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>Cell: {client.cellPhone}</span>
          </div>
        )}
        
        {client.dateOfBirth && (
          <div className="flex items-center gap-2 font-montserrat">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>DOB: {formatDate(client.dateOfBirth)}</span>
          </div>
        )}
        
        {client.company && (
          <div className="flex items-center gap-2 font-montserrat">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{client.company}</span>
          </div>
        )}
        
        {client.address && (
          <div className="flex items-start gap-2 font-montserrat">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <div>{client.address}</div>
              {(client.city || client.state || client.zipCode) && (
                <div>
                  {client.city}{client.city && (client.state || client.zipCode) ? ", " : ""}
                  {client.state}{client.state && client.zipCode ? " " : ""}
                  {client.zipCode}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pb-4">
        <IOSButton
          variant="outline"
          size="sm"
          onClick={() => navigate(`/clients/${client.id}`)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </IOSButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <IOSButton variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </IOSButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="ios-card rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-poppins">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-montserrat">
                This action cannot be undone. This will permanently delete this client.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-montserrat">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive font-montserrat">
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}