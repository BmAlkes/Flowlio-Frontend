import React, { useState } from "react";
import { X, Upload, Loader2, CheckCircle2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axios } from "@/configs/axios.config";
import { useFetchClients } from "@/hooks/usefetchclients";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ProposalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalUploadModal: React.FC<ProposalUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const queryClient = useQueryClient();
  const { data: clientsData, isLoading: isLoadingClients } = useFetchClients();
  const clients = clientsData?.data || [];

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit.");
        return;
      }
      const allowedExtensions = [".pdf", ".docx", ".doc"];
      const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        setError("Only PDF and DOCX formats are allowed.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file || !projectTitle || !selectedClientId) {
      setError("Please fill in all required fields and select a file.");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectTitle", projectTitle);
    formData.append("clientId", selectedClientId);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (selectedClient) {
      formData.append("clientName", selectedClient.name);
    }

    try {
      await axios.post("/proposals/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Proposal uploaded and client notified!");
      queryClient.invalidateQueries({ queryKey: ["org-proposals"] });
      handleClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.response?.data?.message || "Failed to upload proposal. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setProjectTitle("");
    setSelectedClientId("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0c89af]/10">
              <Upload className="w-5 h-5 text-[#0c89af]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Upload Proposal
              </h2>
              <p className="text-xs text-muted-foreground">
                Send a manual proposal to your client
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Project Title */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Website Development"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
              />
            </div>

            {/* Client Selector */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Select Client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40 appearance-none"
                >
                  <option value="">Select a client...</option>
                  {isLoadingClients ? (
                    <option value="" disabled>Loading clients...</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Proposal File (PDF or DOCX) <span className="text-red-500">*</span>
              </label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer
                  ${file ? 'border-green-200 bg-green-50' : 'border-border hover:border-[#0c89af]/50 hover:bg-[#0c89af]/5'}
                `}
                onClick={() => document.getElementById('proposal-file-input')?.click()}
              >
                <input
                  id="proposal-file-input"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-medium text-green-700 truncate max-w-full px-4">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600/90">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-muted">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Click to select file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max size: 20MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-[#0c89af] hover:bg-[#0a7a9e] text-white gap-2 rounded-xl"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Proposal"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
