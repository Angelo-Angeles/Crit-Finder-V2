import { useState, useEffect } from "react";
import { User, Settings, MapPin, Calendar, Edit2, CheckCircle, Camera, Bell, Shield } from "lucide-react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function UserControlPage() {
  const [activeTab, setActiveTab] = useState("settings");
  const [user, setUser] = useState(auth.currentUser);
  
  // Basic Auth State
  const [displayName, setDisplayName] = useState("");
  
  // Custom Firestore State (Profile)
  const [locationPref, setLocationPref] = useState("Online");
  const [availability, setAvailability] = useState("Flexible Schedule");

  // Privacy State
  const [showProfile, setShowProfile] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [showOnline, setShowOnline] = useState(true);

  // Notifications State
  const [emailReplies, setEmailReplies] = useState(true);
  const [emailDMs, setEmailDMs] = useState(true);
  const [emailMatches, setEmailMatches] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);
  const [inAppQuests, setInAppQuests] = useState(true);
  const [inAppMessages, setInAppMessages] = useState(true);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 

  // Load user data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        setDisplayName(user.displayName || "Anonymous Adventurer");
        
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.locationPref) setLocationPref(data.locationPref);
            if (data.availability) setAvailability(data.availability);
            
            // Load Privacy
            if (data.showProfile !== undefined) setShowProfile(data.showProfile);
            if (data.allowDMs !== undefined) setAllowDMs(data.allowDMs);
            if (data.showOnline !== undefined) setShowOnline(data.showOnline);

            // Load Notifications
            if (data.emailReplies !== undefined) setEmailReplies(data.emailReplies);
            if (data.emailDMs !== undefined) setEmailDMs(data.emailDMs);
            if (data.emailMatches !== undefined) setEmailMatches(data.emailMatches);
            if (data.emailDigest !== undefined) setEmailDigest(data.emailDigest);
            if (data.inAppQuests !== undefined) setInAppQuests(data.inAppQuests);
            if (data.inAppMessages !== undefined) setInAppMessages(data.inAppMessages);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    };
    
    loadProfileData();
  }, [user]);

  // Handle Image Upload using Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "crit_finder_profiles");

    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dl4eeqx0i/image/upload";

    try {
      const response = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
      const data = await response.json();

      if (data.secure_url) {
        await updateProfile(user, { photoURL: data.secure_url });
        setUser({ ...auth.currentUser });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Save Settings to Auth AND Firestore
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile(auth.currentUser, { displayName: displayName });
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        locationPref, availability,
        showProfile, allowDMs, showOnline,
        emailReplies, emailDMs, emailMatches, emailDigest,
        inAppQuests, inAppMessages,
        updatedAt: new Date()
      }, { merge: true });

      setSaveSuccess(true);
      setUser({ ...auth.currentUser }); 
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="p-8 text-amber-500">Loading profile data...</div>;

  // Helper for Checkbox UI
  const CheckboxRow = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-amber-200 font-medium">{label}</span>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-amber-600 bg-stone-900 border-amber-800 rounded cursor-pointer"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-stone-800/80 border-4 border-amber-700 rounded-lg p-6 shadow-2xl">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">Control Center</h1>
          <p className="text-amber-200/70">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-4 space-y-2">
            <button 
              onClick={() => setActiveTab("profile")} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${activeTab === "profile" ? "bg-amber-600 text-white" : "text-amber-200 hover:bg-stone-700"}`}
            >
              <User className="w-5 h-5" /><span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("settings")} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${activeTab === "settings" ? "bg-amber-600 text-white" : "text-amber-200 hover:bg-stone-700"}`}
            >
              <Settings className="w-5 h-5" /><span>Settings</span>
            </button>
            <button 
              onClick={() => setActiveTab("notifications")} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${activeTab === "notifications" ? "bg-amber-600 text-white" : "text-amber-200 hover:bg-stone-700"}`}
            >
              <Bell className="w-5 h-5" /><span>Notifications</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          
          {/* PROFILE TAB (Unchanged visually) */}
          {activeTab === "profile" && (
            <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center justify-between">
                Public Profile
                <button onClick={() => setActiveTab("settings")} className="text-sm font-normal px-4 py-2 bg-stone-700 hover:bg-stone-600 text-amber-200 rounded-md transition-colors flex items-center gap-2 cursor-pointer">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full bg-stone-900 border-4 border-amber-700 flex items-center justify-center overflow-hidden group shrink-0">
                    {isUploading ? (
                      <div className="animate-pulse text-amber-500 text-xs font-semibold">Uploading...</div>
                    ) : user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-amber-600" />
                    )}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100">{user.displayName || "Anonymous Adventurer"}</h3>
                    <p className="text-amber-400/60">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-stone-900/50 p-4 rounded-md border border-amber-800/30">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><MapPin className="w-4 h-4" /> Location</div>
                    <p className="text-amber-100">{locationPref}</p> 
                  </div>
                  <div className="bg-stone-900/50 p-4 rounded-md border border-amber-800/30">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><Calendar className="w-4 h-4" /> Availability</div>
                    <p className="text-amber-100">{availability}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-6">Account Settings</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Profile Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-amber-200 mb-2">Display Name</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-2">Preferred Location</label>
                    <input type="text" value={locationPref} onChange={(e) => setLocationPref(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-2">Availability</label>
                    <input type="text" value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" />
                  </div>
                </div>

                {/* Email Read-Only */}
                <div className="border-t border-amber-800/30 pt-6">
                  <label className="block text-sm font-medium text-amber-200 mb-2">Email</label>
                  <input type="email" disabled value={user.email || ""} className="w-full px-4 py-2 bg-stone-900/50 border border-amber-800/50 rounded-md text-amber-100/50 cursor-not-allowed" />
                </div>

                {/* Password Change Button */}
                <div className="border-t border-amber-800/30 pt-6">
                  <label className="block text-sm font-medium text-amber-200 mb-2">Change Password</label>
                  <button type="button" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors cursor-pointer">
                    Update Password
                  </button>
                </div>

                {/* Privacy Settings Checkboxes */}
                <div className="border-t border-amber-800/30 pt-6">
                  <h3 className="text-xl font-bold text-amber-100 mb-4">Privacy Settings</h3>
                  <div className="space-y-1">
                    <CheckboxRow label="Show profile to other users" checked={showProfile} onChange={setShowProfile} />
                    <CheckboxRow label="Allow direct messages" checked={allowDMs} onChange={setAllowDMs} />
                    <CheckboxRow label="Show online status" checked={showOnline} onChange={setShowOnline} />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-amber-800/30 pt-6">
                  <h3 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" /> Danger Zone
                  </h3>
                  <button type="button" className="px-6 py-2 bg-red-950/40 border border-red-900 hover:bg-red-900/60 text-red-400 font-medium rounded-md transition-colors cursor-pointer">
                    Delete Account
                  </button>
                </div>
                
                {/* Save Button */}
                <div className="flex items-center gap-4 pt-4 pb-2">
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md transition-colors cursor-pointer disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
                  {saveSuccess && <span className="flex items-center gap-2 text-emerald-400 font-medium"><CheckCircle className="w-5 h-5" /> Saved!</span>}
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-6">Notification Preferences</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-amber-100 mb-4">Email Notifications</h3>
                  <div className="space-y-1">
                    <CheckboxRow label="New replies to my quests" checked={emailReplies} onChange={setEmailReplies} />
                    <CheckboxRow label="Direct messages" checked={emailDMs} onChange={setEmailDMs} />
                    <CheckboxRow label="New matching quests" checked={emailMatches} onChange={setEmailMatches} />
                    <CheckboxRow label="Weekly digest" checked={emailDigest} onChange={setEmailDigest} />
                  </div>
                </div>

                <div className="border-t border-amber-800/30 pt-6">
                  <h3 className="text-lg font-bold text-amber-100 mb-4">In-App Notifications</h3>
                  <div className="space-y-1">
                    <CheckboxRow label="Quest board activity" checked={inAppQuests} onChange={setInAppQuests} />
                    <CheckboxRow label="Message notifications" checked={inAppMessages} onChange={setInAppMessages} />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-6">
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md transition-colors cursor-pointer disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </button>
                  {saveSuccess && <span className="flex items-center gap-2 text-emerald-400 font-medium"><CheckCircle className="w-5 h-5" /> Saved!</span>}
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}