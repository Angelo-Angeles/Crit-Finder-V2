import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Sword, Scroll, MessageSquare, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { auth, logoutUser } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile state

  const isLanding = location.pathname === "/";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading && !isLanding) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-amber-500 animate-pulse font-medium">Loading Guild Files...</div>
      </div>
    );
  }

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-stone-800 to-stone-900">
      <nav className="bg-stone-950/80 backdrop-blur-sm border-b-4 border-amber-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sword className="w-8 h-8 text-amber-500 shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-amber-100">Crit Finder</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/quest-board" className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${location.pathname === "/quest-board" ? "bg-amber-700 text-white" : "text-amber-200 hover:bg-stone-800"}`}>
                <Scroll className="w-5 h-5" /><span>Quest Board</span>
              </Link>
              {currentUser ? (
                <>
                  <Link to="/messages" className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${location.pathname === "/messages" ? "bg-amber-700 text-white" : "text-amber-200 hover:bg-stone-800"}`}>
                    <MessageSquare className="w-5 h-5" /><span>Messages</span>
                  </Link>
                  <Link to="/profile" className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${location.pathname === "/profile" ? "bg-amber-700 text-white" : "text-amber-200 hover:bg-stone-800"}`}>
                    <User className="w-5 h-5" /><span>Profile</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-amber-400 hover:text-amber-200 hover:bg-stone-800 rounded-md transition-colors cursor-pointer">
                    <LogOut className="w-5 h-5" /><span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors">
                  <LogIn className="w-5 h-5" /><span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-amber-200 hover:text-white focus:outline-none p-2 cursor-pointer">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-stone-900 border-b border-amber-800/50 shadow-xl pb-4 px-4 pt-2 flex flex-col gap-2">
            <Link to="/quest-board" className="flex items-center gap-2 px-4 py-3 rounded-md text-amber-200 hover:bg-stone-800">
              <Scroll className="w-5 h-5" /><span>Quest Board</span>
            </Link>
            {currentUser ? (
              <>
                <Link to="/messages" className="flex items-center gap-2 px-4 py-3 rounded-md text-amber-200 hover:bg-stone-800">
                  <MessageSquare className="w-5 h-5" /><span>Messages</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-3 rounded-md text-amber-200 hover:bg-stone-800">
                  <User className="w-5 h-5" /><span>Profile</span>
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 text-amber-400 hover:bg-stone-800 rounded-md w-full text-left cursor-pointer">
                  <LogOut className="w-5 h-5" /><span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-md justify-center mt-2">
                <LogIn className="w-5 h-5" /><span>Login</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}