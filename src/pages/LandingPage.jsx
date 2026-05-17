import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sword, Users, MessageSquare, Shield, Scroll, Search, User } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function LandingPage() {
  const [currentUser, setCurrentUser] = useState(null);

  // Check auth state when the page loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

        <div className="relative">
          <nav className="px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sword className="w-10 h-10 text-amber-500" />
                <h1 className="text-3xl font-bold text-amber-100">Crit Finder</h1>
              </div>
              
              {/* Dynamic Top Nav Button */}
              {currentUser ? (
                <Link to="/profile" className="px-6 py-2 bg-stone-800 border border-amber-700 hover:bg-stone-700 text-amber-100 rounded-md transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
              ) : (
                <Link to="/login" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </nav>

          <section className="px-6 py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-amber-100 mb-6">
                Find Your Next Adventure
              </h2>
              <p className="text-xl text-amber-200/80 mb-10 max-w-2xl mx-auto">
                Connect with fellow adventurers, form legendary parties, and embark on epic D&D campaigns.
                Your quest for the perfect group starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quest-board" className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-lg rounded-md transition-colors flex items-center justify-center gap-2">
                  <Scroll className="w-6 h-6" /> Browse Quest Board
                </Link>
                
                {/* Dynamic CTA Button */}
                {!currentUser && (
                  <Link to="/login" className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-amber-100 text-lg rounded-md border-2 border-amber-700 transition-colors">
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* ... The rest of the How It Works / Join the Adventure sections stay exactly the same */}
          <section className="px-6 py-20 bg-stone-900/50">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-amber-100 text-center mb-12">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-stone-800/50 border-2 border-amber-800/50 rounded-lg p-6 hover:border-amber-700 transition-colors">
                  <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4"><Search className="w-6 h-6 text-white" /></div>
                  <h4 className="text-xl font-bold text-amber-100 mb-3">Browse Quests</h4>
                  <p className="text-amber-200/70">Explore our quest board to find groups looking for players or post your own quest seeking adventurers.</p>
                </div>
                <div className="bg-stone-800/50 border-2 border-amber-800/50 rounded-lg p-6 hover:border-amber-700 transition-colors">
                  <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4"><MessageSquare className="w-6 h-6 text-white" /></div>
                  <h4 className="text-xl font-bold text-amber-100 mb-3">Connect</h4>
                  <p className="text-amber-200/70">Use our messaging system to communicate with potential party members and schedule sessions.</p>
                </div>
                <div className="bg-stone-800/50 border-2 border-amber-800/50 rounded-lg p-6 hover:border-amber-700 transition-colors">
                  <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4"><Users className="w-6 h-6 text-white" /></div>
                  <h4 className="text-xl font-bold text-amber-100 mb-3">Form Your Party</h4>
                  <p className="text-amber-200/70">Build your ideal adventuring party and begin your epic D&D journey together. Roll for initiative!</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <Shield className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-amber-100 mb-4">Join the Adventure</h3>
              <p className="text-lg text-amber-200/80 mb-8">Whether you're a seasoned dungeon master or a first-time player, Crit Finder helps you find the perfect group.</p>
              
              <Link to={currentUser ? "/quest-board" : "/login"} className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-lg rounded-md transition-colors">
                {currentUser ? "Enter the Tavern" : "Get Started Now"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}