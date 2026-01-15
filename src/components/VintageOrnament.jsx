const VintageOrnament = ({ type = 'moon', className = '' }) => {
    const ornaments = {
      // Crescent moon with stars
      moon: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <path
            d="M60 20C60 35 50 45 35 45C25 45 17 40 12 32C15 50 30 63 48 63C68 63 85 46 85 26C85 23 84 20 83 17C75 19 67 20 60 20Z"
            fill="currentColor"
          />
          <circle cx="75" cy="15" r="2" fill="currentColor" />
          <circle cx="82" cy="10" r="1.5" fill="currentColor" />
          <circle cx="70" cy="8" r="1.5" fill="currentColor" />
        </svg>
      ),
  
      // Sunburst/starburst
      sunburst: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="8" fill="currentColor" />
          <path d="M50 10L50 30M50 70L50 90M10 50L30 50M70 50L90 50" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L32 32M68 32L80 20M68 68L80 80M32 68L20 80" stroke="currentColor" strokeWidth="2" />
          <path d="M28 15L35 28M72 28L78 15M72 72L78 85M35 72L28 85" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
  
      // Leaf branch
      leafBranch: (
        <svg viewBox="0 0 100 120" fill="none" className={className}>
          <path d="M50 10L50 110" stroke="currentColor" strokeWidth="2" />
          <path d="M50 25Q65 20 70 30Q65 40 50 35" fill="currentColor" />
          <path d="M50 45Q35 40 30 50Q35 60 50 55" fill="currentColor" />
          <path d="M50 65Q65 60 70 70Q65 80 50 75" fill="currentColor" />
          <path d="M50 85Q35 80 30 90Q35 100 50 95" fill="currentColor" />
        </svg>
      ),
  
      // Sun with dots
      sun: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="15" fill="currentColor" />
          <circle cx="50" cy="20" r="3" fill="currentColor" />
          <circle cx="50" cy="80" r="3" fill="currentColor" />
          <circle cx="20" cy="50" r="3" fill="currentColor" />
          <circle cx="80" cy="50" r="3" fill="currentColor" />
          <circle cx="30" cy="30" r="2.5" fill="currentColor" />
          <circle cx="70" cy="30" r="2.5" fill="currentColor" />
          <circle cx="70" cy="70" r="2.5" fill="currentColor" />
          <circle cx="30" cy="70" r="2.5" fill="currentColor" />
        </svg>
      ),
  
      // Rainbow arches
      rainbow: (
        <svg viewBox="0 0 100 80" fill="none" className={className}>
          <path d="M20 70Q20 25 50 20Q80 25 80 70" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M30 70Q30 35 50 32Q70 35 70 70" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M40 70Q40 45 50 44Q60 45 60 70" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
      ),
  
      // Hand/palm
      hand: (
        <svg viewBox="0 0 100 120" fill="none" className={className}>
          <path
            d="M30 100L30 60Q30 50 35 50Q40 50 40 60L40 40Q40 30 45 30Q50 30 50 40L50 35Q50 25 55 25Q60 25 60 35L60 40Q60 30 65 30Q70 30 70 40L70 80Q70 90 65 95L50 110L35 100Q30 95 30 90Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ),
  
      // Vase/perfume bottle
      vase: (
        <svg viewBox="0 0 80 120" fill="none" className={className}>
          <path
            d="M25 30L25 85Q25 95 40 100Q55 95 55 85L55 30Q55 25 40 25Q25 25 25 30Z"
            fill="currentColor"
          />
          <ellipse cx="40" cy="25" rx="15" ry="5" fill="currentColor" opacity="0.7" />
        </svg>
      ),
  
      // Cosmetic jar with dots
      jar: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <rect x="20" y="30" width="60" height="50" rx="8" fill="currentColor" />
          <rect x="30" y="20" width="40" height="15" rx="3" fill="currentColor" opacity="0.8" />
          <circle cx="40" cy="50" r="3" fill="white" opacity="0.3" />
          <circle cx="50" cy="60" r="2.5" fill="white" opacity="0.3" />
          <circle cx="60" cy="55" r="2" fill="white" opacity="0.3" />
          <circle cx="35" cy="65" r="2" fill="white" opacity="0.3" />
        </svg>
      ),
  
      // Stacked stones (balance)
      stones: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <ellipse cx="50" cy="80" rx="25" ry="8" fill="currentColor" />
          <ellipse cx="50" cy="60" rx="20" ry="7" fill="currentColor" opacity="0.8" />
          <ellipse cx="50" cy="42" rx="15" ry="6" fill="currentColor" opacity="0.6" />
          <ellipse cx="50" cy="28" rx="10" ry="5" fill="currentColor" opacity="0.4" />
        </svg>
      ),
  
      // Heart
      heart: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <path
            d="M50 80C50 80 20 60 20 40C20 25 30 15 40 20C45 22 48 26 50 30C52 26 55 22 60 20C70 15 80 25 80 40C80 60 50 80 50 80Z"
            fill="currentColor"
          />
        </svg>
      ),
  
      // Scattered dots (scent particles)
      dots: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="20" cy="30" r="3" fill="currentColor" />
          <circle cx="35" cy="45" r="4" fill="currentColor" />
          <circle cx="50" cy="25" r="2.5" fill="currentColor" />
          <circle cx="60" cy="50" r="3.5" fill="currentColor" />
          <circle cx="75" cy="35" r="3" fill="currentColor" />
          <circle cx="40" cy="70" r="2" fill="currentColor" />
          <circle cx="65" cy="75" r="2.5" fill="currentColor" />
          <circle cx="80" cy="65" r="2" fill="currentColor" />
        </svg>
      ),
  
      // Circular mandala sun
      mandala: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
          {[...Array(16)].map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = 50 + Math.cos(angle) * 20;
            const y1 = 50 + Math.sin(angle) * 20;
            const x2 = 50 + Math.cos(angle) * 35;
            const y2 = 50 + Math.sin(angle) * 35;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />;
          })}
        </svg>
      ),
  
      // Crystal/gem
      crystal: (
        <svg viewBox="0 0 80 100" fill="none" className={className}>
          <path
            d="M40 10L60 40L50 90L30 90L20 40L40 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            opacity="0.8"
          />
          <path d="M40 10L40 90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <path d="M20 40L60 40" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      ),
  
      // Abstract arch
      arch: (
        <svg viewBox="0 0 100 60" fill="none" className={className}>
          <path d="M20 55Q20 20 50 15Q80 20 80 55" fill="currentColor" />
        </svg>
      ),
  
      // Palm leaf
      palmLeaf: (
        <svg viewBox="0 0 100 120" fill="none" className={className}>
          <path d="M50 10L50 110" stroke="currentColor" strokeWidth="2" />
          <path d="M50 20L70 30L50 35" fill="currentColor" />
          <path d="M50 40L30 50L50 55" fill="currentColor" />
          <path d="M50 60L70 70L50 75" fill="currentColor" />
          <path d="M50 80L30 90L50 95" fill="currentColor" />
        </svg>
      ),
  
      // Cloud shape
      cloud: (
        <svg viewBox="0 0 120 60" fill="none" className={className}>
          <path
            d="M30 40Q20 40 20 30Q20 20 30 20Q32 10 45 10Q58 10 60 20Q70 20 70 30Q70 40 60 40Z"
            fill="currentColor"
          />
        </svg>
      ),
  
      // Stars
      stars: (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <path d="M30 25L32 32L39 32L33 37L35 44L30 40L25 44L27 37L21 32L28 32L30 25Z" fill="currentColor" />
          <path d="M65 50L66 54L70 54L67 57L68 61L65 59L62 61L63 57L60 54L64 54L65 50Z" fill="currentColor" />
          <path d="M50 70L51 73L54 73L52 75L53 78L50 76L47 78L48 75L46 73L49 73L50 70Z" fill="currentColor" />
        </svg>
      ),
    };
  
    return ornaments[type] || ornaments.moon;
  };
  
  export default VintageOrnament;