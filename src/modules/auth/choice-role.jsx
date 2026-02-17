import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  IoRocketSharp,
  IoTrendingUp,
  IoBusinessSharp,
  IoGlasses,
  IoArrowForward,
  IoCheckmarkCircle
} from "react-icons/io5";


import logo from "../../assets/logo.avif";

export default function ChoiceRole() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { updateUserMetadata } = useAuth();

  const roles = [
    {
      id: 'startup',
      name: 'Startup',
      icon: IoRocketSharp, // Modern rocket icon
      description: 'Launch your innovative ideas and connect with investors',
      features: ['Pitch your startup', 'Connect with investors', 'Raise funding']
    },
    {
      id: 'investor',
      name: 'Investor',
      icon: IoTrendingUp, // Trending up chart icon
      description: 'Discover and invest in promising startups',
      features: ['Discover startups', 'Make investments', 'Track portfolio']
    },
    {
      id: 'incubator',
      name: 'Incubator',
      icon: IoBusinessSharp, // Business building icon
      description: 'Nurture and support startups in your program',
      features: ['Manage programs', 'Support startups', 'Build network']
    },
    {
      id: 'viewer',
      name: 'Viewer',
      icon: IoGlasses, // Glasses/explore icon
      description: 'Explore and discover opportunities',
      features: ['Explore startups', 'Learn from pitches', 'Stay updated']
    }
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;

    try {
      // Save selected role to user metadata
      const roleUpperCase = selectedRole.toUpperCase();
      await updateUserMetadata({
        role: roleUpperCase,
        profile_complete: false // Will be set to true after registration
      });

      // Save to localStorage as backup
      localStorage.setItem('selectedRole', selectedRole);

      // Navigate to role-specific registration page
      const routes = {
        'startup': '/register/startup',
        'investor': '/register/investor',
        'incubator': '/register/incubator',
        'viewer': '/register/viewer'
      };

      navigate(routes[selectedRole] || '/');
    } catch (error) {
      console.error('Failed to save role:', error);
      alert('Failed to save your role selection. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-start sm:items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-6 md:py-12 overflow-y-auto ${isDark ? 'bg-black' : 'bg-gray-100'
      }`}>
      <div className="w-full max-w-6xl my-auto sm:my-0">
        {/* Header Section */}
        <div className="text-center mb-3 sm:mb-6 md:mb-10 pt-2 sm:pt-0">
          <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-4 md:mb-6 flex-wrap">
            <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm'
              }`}>
              <img src={logo} alt="EVO-A" className="h-5 w-5 sm:h-7 sm:w-7 md:h-9 md:w-9 object-contain" />
            </div>
            <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
              EVO-A
            </span>
          </div>
          <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 tracking-tight px-2 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            Choose Your Role
          </h1>
          <p className={`text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Select the role that best describes you to get started
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-12">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            const isHovered = hoveredRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`relative p-4 sm:p-5 md:p-7 transition-all duration-300 border-2 rounded-2xl sm:rounded-3xl cursor-pointer ${isSelected
                  ? 'bg-[#00B8A9] text-white border-[#00B8A9] shadow-2xl shadow-[#00B8A9]/40 transform scale-[1.02] sm:scale-105'
                  : isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00B8A9]/30 active:scale-95'
                    : 'bg-white/90 border-gray-300 hover:bg-white hover:border-[#00B8A9]/30 hover:shadow-lg active:scale-95'
                  }`}
              >
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5">
                    <IoCheckmarkCircle
                      size={20}
                      className="sm:hidden text-white"
                    />
                    <IoCheckmarkCircle
                      size={24}
                      className="hidden sm:block text-white"
                    />
                  </div>
                )}

                {/* Icon Container */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center transition-all duration-300 rounded-xl ${isSelected
                  ? 'bg-white/20'
                  : isDark
                    ? 'bg-white/10'
                    : 'bg-gray-200'
                  } ${isHovered && !isSelected ? 'transform scale-110' : ''}`}>
                  <IconComponent
                    size={28}
                    className={`sm:hidden ${isSelected
                      ? 'text-white'
                      : isDark ? 'text-white' : 'text-black'
                      }`}
                  />
                  <IconComponent
                    size={32}
                    className={`hidden sm:block md:hidden ${isSelected
                      ? 'text-white'
                      : isDark ? 'text-white' : 'text-black'
                      }`}
                  />
                  <IconComponent
                    size={38}
                    className={`hidden md:block ${isSelected
                      ? 'text-white'
                      : isDark ? 'text-white' : 'text-black'
                      }`}
                  />
                </div>

                {/* Role Title */}
                <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 ${isSelected
                  ? 'text-white'
                  : isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  {role.name}
                </h3>

                {/* Description */}
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5 leading-relaxed ${isSelected
                  ? 'text-white/90'
                  : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  {role.description}
                </p>

                {/* Features List */}
                <div className={`space-y-1.5 sm:space-y-2 md:space-y-2.5 pt-3 sm:pt-4 md:pt-5 border-t ${isSelected
                  ? 'border-white/20'
                  : isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                  {role.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-2.5">
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 ${isSelected
                        ? 'bg-white/80'
                        : isDark ? 'bg-white/50' : 'bg-gray-500'
                        }`}></div>
                      <span className={`text-[10px] sm:text-xs ${isSelected
                        ? 'text-white/80'
                        : isDark ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center px-2 pb-4 sm:pb-0">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto justify-center ${selectedRole
              ? 'bg-[#00B8A9] text-white hover:bg-[#00A89A] hover:scale-105 hover:shadow-2xl hover:shadow-[#00B8A9]/40 active:scale-95 cursor-pointer'
              : isDark
                ? 'bg-white/10 text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span>Continue to Registration</span>
            <IoArrowForward
              size={16}
              className="sm:hidden transition-transform duration-300"
            />
            <IoArrowForward
              size={18}
              className={`hidden sm:block transition-transform duration-300 ${selectedRole ? 'group-hover:translate-x-1' : ''
                }`}
            />
          </button>
          <p className={`mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
            You can change your role anytime in settings
          </p>
        </div>
      </div>
    </div>
  );
}
