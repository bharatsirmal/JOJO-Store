
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const [photoURL, setPhotoURL] = useState("");`,
    `const [photoURL, setPhotoURL] = useState("");\n  const [uploadingImage, setUploadingImage] = useState(false);`
);

const uploadLogic = `  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };`;

content = content.replace(
    `const handleSave = async (e: React.FormEvent) => {`,
    `${uploadLogic}\n\n  const handleSave = async (e: React.FormEvent) => {`
);

const oldImageUI = `<div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden relative group cursor-pointer mb-2">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-indigo-300" />
              )}
            </div>
          </div>`;

const newImageUI = `<div className="flex flex-col items-center mb-6">
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
          </div>`;

content = content.replace(oldImageUI, newImageUI);

const oldPhotoUrlInput = `<div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><ImageIcon className="w-4 h-4" /></div>
              <Input 
                placeholder="https://example.com/photo.jpg" 
                value={photoURL} 
                onChange={(e) => setPhotoURL(e.target.value)} 
                className="pl-9"
              />
            </div>
          </div>`;

// Remove the manual text input entirely since they can now upload directly
content = content.replace(oldPhotoUrlInput, "");

fs.writeFileSync(path, content, "utf8");

