import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Users, User, MapPin, MessageCircle, Scroll, Trash2 } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export function QuestBoardPage() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewQuestModal, setShowNewQuestModal] = useState(false);

  // Form State
  const [newQuestType, setNewQuestType] = useState("looking-for-players");
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [newQuestTags, setNewQuestTags] = useState("");

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const questsRef = collection(db, "quests");
      const q = query(questsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedQuests = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      
      setQuests(fetchedQuests);
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handlePostQuest = async (e) => {
    e.preventDefault();
    const currentGuildUser = auth.currentUser;
    const authorName = currentGuildUser ? (currentGuildUser.displayName || "Anonymous Adventurer") : "Guest Member";

    const questData = {
      type: newQuestType,
      title: newQuestTitle,
      author: authorName,
      authorId: currentGuildUser ? currentGuildUser.uid : null,
      authorPhoto: currentGuildUser ? currentGuildUser.photoURL : null,
      location: "Online", 
      createdAt: Date.now(),
      description: newQuestDescription,
      tags: newQuestTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
      replies: 0
    };

    try {
      await addDoc(collection(db, "quests"), questData);
      setShowNewQuestModal(false);
      setNewQuestTitle("");
      setNewQuestDescription("");
      setNewQuestTags("");
      setNewQuestType("looking-for-players");
      await fetchQuests();
    } catch (error) {
      console.error("Failed to post quest:", error);
    }
  };

  // NEW: Delete Quest Function
  const handleDeleteQuest = async (questId) => {
    // Add a simple browser confirmation dialog
    if (window.confirm("Are you sure you want to delete this quest from the board?")) {
      try {
        await deleteDoc(doc(db, "quests", questId));
        // Refresh the board to show it disappeared
        await fetchQuests();
      } catch (error) {
        console.error("Error deleting quest:", error);
        alert("Failed to delete quest. Make sure you are the author.");
      }
    }
  };

  const filteredQuests = quests.filter(quest => {
    const matchesFilter = filter === "all" || quest.type === filter;
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-stone-800/80 border-4 border-amber-700 rounded-lg p-6 shadow-2xl">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">Quest Board</h1>
          <p className="text-amber-200/70">Find your next adventure or recruit fellow adventurers</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
          <input
            type="text"
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${filter === "all" ? "bg-amber-600 text-white" : "bg-stone-800 text-amber-200 border border-amber-800 hover:bg-stone-700"}`}><Filter className="w-4 h-4" /> All</button>
          <button onClick={() => setFilter("looking-for-players")} className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${filter === "looking-for-players" ? "bg-amber-600 text-white" : "bg-stone-800 text-amber-200 border border-emerald-700"}`}><Users className="w-4 h-4" /> LFP</button>
          <button onClick={() => setFilter("looking-for-group")} className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${filter === "looking-for-group" ? "bg-amber-600 text-white" : "bg-stone-800 text-amber-200 border border-blue-700"}`}><User className="w-4 h-4" /> LFG</button>
        </div>

        <button onClick={() => setShowNewQuestModal(true)} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-5 h-5" /> Post Quest
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-amber-500 animate-pulse font-medium">Consulting the tavern logs...</div>
        ) : filteredQuests.length === 0 ? (
          <div className="bg-stone-800/40 border-2 border-dashed border-amber-800/50 rounded-lg p-12 text-center">
            <Scroll className="w-12 h-12 text-amber-700 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-amber-200 mb-2">The board is empty!</h3>
            <button onClick={() => setShowNewQuestModal(true)} className="px-6 py-2 mt-4 bg-stone-700 hover:bg-stone-600 text-amber-100 rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" /> Create the first Quest</button>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <div key={quest.id} className="bg-stone-800/60 border-2 border-amber-800/50 rounded-lg p-6 hover:border-amber-700 hover:bg-stone-800/80 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quest.type === "looking-for-players" ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700" : "bg-blue-900/50 text-blue-300 border border-blue-700"}`}>
                      {quest.type === "looking-for-players" ? "Looking for Players" : "Looking for Group"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">{quest.title}</h3>
                  <p className="text-amber-200/80 mb-4">{quest.description}</p>

                  {quest.tags && quest.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {quest.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-amber-900/30 border border-amber-800/50 rounded text-xs text-amber-300">{tag}</span>)}
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-amber-300/70 mb-4">
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{quest.author}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{quest.location}</span></div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-3">
                    {/* Message Player Button (Only shows if you are logged in, and NOT the author) */}
                    {auth.currentUser && auth.currentUser.uid !== quest.authorId && quest.authorId && (
                      <button 
                        onClick={() => navigate('/messages', { state: { targetUser: { uid: quest.authorId, name: quest.author, photoURL: quest.authorPhoto } } })}
                        className="px-4 py-2 bg-stone-700/50 hover:bg-stone-700 border border-amber-800/50 hover:border-amber-600 text-amber-200 text-sm rounded transition-colors flex items-center gap-2 cursor-pointer w-fit"
                      >
                        <MessageCircle className="w-4 h-4" /> Message {quest.author}
                      </button>
                    )}

                    {/* Delete Quest Button (Only shows if YOU are the author) */}
                    {auth.currentUser && auth.currentUser.uid === quest.authorId && (
                      <button 
                        onClick={() => handleDeleteQuest(quest.id)}
                        className="px-4 py-2 bg-red-900/20 hover:bg-red-900/60 border border-red-800/50 hover:border-red-600 text-red-400 text-sm rounded transition-colors flex items-center gap-2 cursor-pointer w-fit"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Quest
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewQuestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-800 border-2 border-amber-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-amber-100 mb-6">Post New Quest</h2>
            <form onSubmit={handlePostQuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Quest Type</label>
                <select value={newQuestType} onChange={(e) => setNewQuestType(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none">
                  <option value="looking-for-players">Looking for Players (DM looking for group)</option>
                  <option value="looking-for-group">Looking for Group (Player looking for DM/Party)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Title</label>
                <input type="text" required value={newQuestTitle} onChange={(e) => setNewQuestTitle(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none" placeholder="Enter quest title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Description</label>
                <textarea required rows={4} value={newQuestDescription} onChange={(e) => setNewQuestDescription(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 resize-none focus:outline-none" placeholder="Describe your quest..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Tags (comma separated)</label>
                <input type="text" value={newQuestTags} onChange={(e) => setNewQuestTags(e.target.value)} className="w-full px-4 py-2 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none" placeholder="e.g., D&D 5e, Online, Beginner Friendly" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors font-semibold cursor-pointer">Post Quest</button>
                <button type="button" onClick={() => setShowNewQuestModal(false)} className="flex-1 py-2 bg-stone-700 hover:bg-stone-600 text-amber-200 rounded-md transition-colors cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}