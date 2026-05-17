import { useState } from "react";
import { User, Settings, Bell, MapPin, Calendar, Edit2 } from "lucide-react";

export function UserControlPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-stone-800/80 border-4 border-amber-700 rounded-lg p-6 shadow-2xl">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">Control Center</h1>
          <p className="text-amber-200/70">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-4 space-y-2">
            <button 
              onClick={() => setActiveTab("profile")} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "profile" ? "bg-amber-600 text-white" : "text-amber-200 hover:bg-stone-700"}`}
            >
              <User className="w-5 h-5" /><span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("settings")} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "settings" ? "bg-amber-600 text-white" : "text-amber-200 hover:bg-stone-700"}`}
            >
              <Settings className="w-5 h-5" /><span>Settings</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center justify-between">
                Public Profile
                <button className="text-sm font-normal px-4 py-2 bg-stone-700 hover:bg-stone-600 text-amber-200 rounded-md transition-colors flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-stone-900 border-4 border-amber-700 flex items-center justify-center">
                    <User className="w-12 h-12 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100">Adventurer</h3>
                    <p className="text-amber-400/60">Guild Member</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-stone-900/50 p-4 rounded-md border border-amber-800/30">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><MapPin className="w-4 h-4" /> Location</div>
                    <p className="text-amber-100">Online / Available</p>
                  </div>
                  <div className="bg-stone-900/50 p-4 rounded-md border border-amber-800/30">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><Calendar className="w-4 h-4" /> Availability</div>
                    <p className="text-amber-100">Flexible Schedule</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-100 mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">Display Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none" defaultValue="Adventurer" />
                </div>
                <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors mt-4">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}