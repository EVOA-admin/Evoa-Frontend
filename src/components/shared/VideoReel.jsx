import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VideoReel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState({});
  const videoRefs = useRef([]);

  // Startup, Investor, Business Meeting, Pitch Deck Videos
  const videos = [
    // 9. BUSINESS GROWTH (Company Scaling Up)
{
  url: 'https://assets.mixkit.co/videos/preview/mixkit-business-people-celebrating-success-in-office-4581-large.mp4',
  image: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg',
  title: 'Business Growth & Success',
  category: 'growth'
},

// 10. INVESTOR FUNDING (Startup Getting Investment)
{
  url: 'https://assets.mixkit.co/videos/preview/mixkit-business-investors-discussing-funding-4870-large.mp4',
  image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
  title: 'Investor Funding a Startup',
  category: 'investment'
},

// 11. SECURE DEAL SIGNING (Legal / Secure Transaction)
{
  url: 'https://assets.mixkit.co/videos/preview/mixkit-business-people-signing-contract-4599-large.mp4',
  image: 'https://images.pexels.com/photos/3184402/pexels-photo-3184402.jpeg',
  title: 'Secure Business Deal Signing',
  category: 'security'
},

// 12. DIGITAL PAYMENT / FINANCIAL TRANSACTION
{
  url: 'https://assets.mixkit.co/videos/preview/mixkit-businessman-making-digital-payment-4513-large.mp4',
  image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
  title: 'Secure Financial Transaction',
  category: 'finance'
},

// 13. INVESTOR CONFIDENCE (Trust & Transparency)
{
  url: 'https://assets.mixkit.co/videos/preview/mixkit-business-partners-shaking-hands-after-meeting-4559-large.mp4',
  image: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg',
  title: 'Investor Trust & Partnership',
  category: 'trust'
}

  ];
  
  

  

  const playVideo = (index) => {
    // Pause all videos
    videoRefs.current.forEach((video) => {
      if (video) video.pause();
    });
    
    // Play selected video
    setTimeout(() => {
      if (videoRefs.current[index] && !videoErrors[index]) {
        videoRefs.current[index].muted = true;
        videoRefs.current[index].play().catch(err => {
          console.log('Video autoplay prevented:', err);
        });
      }
    }, 300);
  };

  useEffect(() => {
    // Auto-scroll to next video every 8 seconds (more professional timing)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % videos.length;
        playVideo(nextIndex);
        return nextIndex;
      });
    }, 8000);

    // Play first video on mount
    setTimeout(() => {
      playVideo(0);
    }, 500);

    return () => clearInterval(interval);
  }, [videos.length, videoErrors]);

  const handleVideoEnd = (index) => {
    const nextIndex = (index + 1) % videos.length;
    setCurrentIndex(nextIndex);
    playVideo(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentIndex(nextIndex);
    playVideo(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(prevIndex);
    playVideo(prevIndex);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Show only current video with smooth fade transitions */}
      {videos.map((video, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full ${
            index === currentIndex 
              ? 'opacity-100 z-10' 
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          style={{
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Background Image - no zoom, static */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src={video.image}
              alt={video.title}
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center',
              }}
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200';
              }}
            />
            {/* Subtle overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
          </div>

          {/* Video with smooth fade */}
          {video.url && !videoErrors[index] && (
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={video.url}
              className={`absolute inset-0 w-full h-full object-cover ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
                objectPosition: 'center',
              }}
              loop={false}
              muted={true}
              playsInline
              controls={false}
              preload="metadata"
              onEnded={() => handleVideoEnd(index)}
              onError={(e) => {
                console.error(`Error loading video ${index}:`, e);
                setVideoErrors(prev => ({ ...prev, [index]: true }));
              }}
            />
          )}

        </div>
      ))}

      {/* Navigation Buttons - More subtle and professional */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous video"
      >
        <FaChevronLeft size={18} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next video"
      >
        <FaChevronRight size={18} />
      </button>

      {/* Video indicators - More professional styling */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2.5">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              playVideo(i);
            }}
            className={`rounded-full transition-all duration-500 ease-in-out ${
              i === currentIndex 
                ? 'bg-evoa w-10 h-2 shadow-lg shadow-evoa/50' 
                : 'bg-white/30 w-2 h-2 hover:bg-white/50 hover:w-3'
            }`}
            aria-label={`Go to video ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoReel;
