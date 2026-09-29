"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, User, Save, Image as ImageIcon, Phone } from "lucide-react";

export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  currentName, 
  currentEmail,
  currentImage
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentName: string;
  currentEmail: string;
  currentImage?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState(currentImage || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const toastId = toast.loading("Uploading image...");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error("Failed to upload image");
      
      const uploadData = await uploadRes.json();
      setPhotoURL(uploadData.urls[0]);
      toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
      toast.error("Error uploading image", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, phoneNumber, photoURL }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      toast.success("Profile updated successfully!");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="flex flex-col items-center mb-6">
            <label className="h-24 w-24 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden relative group cursor-pointer mb-2">
              {uploadingImage ? (
                <div className="text-xs text-indigo-500 font-medium">Uploading...</div>
              ) : photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              ) : (
                <User className="w-10 h-10 text-indigo-300 group-hover:scale-110 transition-transform" />
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            <p className="text-xs text-slate-500">Click to upload photo</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Unchangeable)</label>
            <Input value={currentEmail} disabled className="bg-slate-50 text-slate-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name / Username</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></div>
              <Input 
                placeholder="John Doe" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-4 h-4" /></div>
              <Input 
                placeholder="+1 234 567 8900" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="pl-9"
              />
            </div>
          </div>
          
          

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

