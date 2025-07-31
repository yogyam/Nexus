import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  clickable?: boolean;
}

export const Logo = ({ className = "", showText = true, clickable = true }: LogoProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Logo Graphic */}
      <div className="relative w-8 h-8">
        {/* Central node */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-600 to-teal-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
        
        {/* Connecting lines and nodes */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 transform -translate-x-1/2 -translate-y-1/2">
          {/* Top node */}
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1 left-1/2 w-px h-2 bg-gradient-to-b from-blue-500 to-transparent transform -translate-x-1/2"></div>
          
          {/* Right node */}
          <div className="absolute top-1/2 right-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-300 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1 w-2 h-px bg-gradient-to-l from-teal-400 to-transparent transform -translate-y-1/2"></div>
          
          {/* Bottom node */}
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-300 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-1 left-1/2 w-px h-2 bg-gradient-to-t from-teal-400 to-transparent transform -translate-x-1/2"></div>
          
          {/* Left node */}
          <div className="absolute top-1/2 left-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1 w-2 h-px bg-gradient-to-r from-blue-500 to-transparent transform -translate-y-1/2"></div>
          
          {/* Diagonal connections */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-300 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-300 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-300 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className="text-xl font-bold text-blue-700">Nexus</span>
      )}
    </div>
  );
}; 