import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gossipService from "../services/gossip.service";
import GossipCard from "../components/GossipCard";
import TopBar from "../../../layout/TopBar";
import LoadingState from "../../../shared/LoadingState";
import { ArrowLeft } from "lucide-react";
import GossipComments from "../components/GossipComments";

export default function SingleGossip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gossip, setGossip] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const gossipRes = await gossipService.getGossipById(id);
      const gossipData = gossipRes.data || gossipRes;
      if (isMounted.current) {
        setGossip({ ...gossipData, id: gossipData._id || gossipData.id });
      }
    } catch (error) {
      console.error("Failed to load gossip:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [id]);

  const handleFire = useCallback(() => {
    setGossip((prev) => ({ ...prev, fire: (prev.fire || 0) + 1 }));
  }, []);

  const handleBookmark = useCallback(() => {
    setGossip((prev) => ({ ...prev, bookmarked: !prev.bookmarked }));
  }, []);

  const handleCommentAdded = useCallback(() => {
    setGossip((prev) => ({
      ...prev,
      comments: (prev.comments || 0) + 1,
    }));
  }, []);

  const handleCommentDeleted = useCallback(() => {
    setGossip((prev) => ({
      ...prev,
      comments: Math.max((prev.comments || 1) - 1, 0),
    }));
  }, []);

  const handleBackToFeed = useCallback(() => {
    navigate("/content/gossip");
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex justify-center items-center">
        <LoadingState type="spinner" />
      </div>
    );
  }

  if (!gossip) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col justify-center items-center text-white">
        <h2 className="text-xl font-bold mb-4 font-[Bebas Neue] tracking-widest text-[32px]">
          GOSSIP NOT FOUND
        </h2>
        <p className="text-[rgba(240,240,248,0.5)] mb-6 font-[Outfit]">
          This tea might have been spilled and wiped already.
        </p>
        <button
          onClick={handleBackToFeed}
          className="bg-[#f5c518] text-[#080810] px-6 py-3 rounded-xl font-bold font-[Outfit] transition-transform hover:scale-105"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] pb-24">
      <TopBar title="Gossip" subtitle="Spill the tea" />

      <div className="max-w-[800px] mx-auto px-4 pt-6">
        <button
          onClick={handleBackToFeed}
          className="flex items-center gap-2 text-[rgba(240,240,248,0.6)] hover:text-white mb-6 transition-colors font-sans text-sm"
        >
          <ArrowLeft size={16} /> Back to Feed
        </button>

        {/* Display Gossip Card (Reusing Component) */}
        <GossipCard gossip={gossip} onFire={handleFire} onBookmark={handleBookmark} />

        {/* Comments Section */}
        <div className="mt-8 bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden shadow-xl">
          <div className="px-5 pt-5 pb-1 border-b border-[rgba(255,255,255,0.04)]">
            <h3 className="font-[Bebas Neue] text-[24px] tracking-[1.5px] text-[#f0f0f8] m-0 flex items-center gap-2">
              COMMENTS
              <span className="text-[14px] font-[Outfit] font-bold text-[#12121e] bg-[#f5c518] px-2.5 py-0.5 rounded-full ml-1">
                {gossip.comments || 0}
              </span>
            </h3>
          </div>
          <GossipComments
            gossipId={gossip.id}
            showHeader={false}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>
    </div>
  );
}
