/**
 * Variantes de animação Framer Motion
 * Biblioteca centralizada de animações reutilizáveis
 */

// ============================================
// EASINGS PERSONALIZADOS
// ============================================

export const easings = {
  // Easing suave e natural (padrão Apple)
  easeInOutCubic: [0.65, 0, 0.35, 1],
  // Easing com bounce suave
  easeOutBack: [0.34, 1.56, 0.64, 1],
  // Easing sharp (Material Design)
  sharp: [0.4, 0, 0.2, 1],
  // Easing dramatic
  dramatic: [0.43, 0.13, 0.23, 0.96],
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition = {
  initial: {
    opacity: 0,
    x: -20,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: easings.dramatic
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: easings.sharp
    }
  }
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeInOutCubic
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const fadeInDown = {
  initial: {
    opacity: 0,
    y: -20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeInOutCubic
    }
  }
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOutBack
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export const scaleSpring = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

// ============================================
// BUTTON INTERACTIONS
// ============================================

export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17
  }
};

export const buttonTap = {
  scale: 0.98,
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
};

// Hover com shadow
export const buttonHoverWithShadow = {
  scale: 1.02,
  y: -2,
  boxShadow: '0 20px 40px -12px rgba(0, 136, 79, 0.35)',
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17
  }
};

// ============================================
// INPUT ANIMATIONS
// ============================================

export const inputFocus = {
  scale: 1.01,
  transition: {
    duration: 0.2,
    ease: easings.easeInOutCubic
  }
};

// Animated underline para inputs
export const inputUnderline = {
  initial: {
    width: 0,
    opacity: 0
  },
  animate: {
    width: '100%',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.sharp
    }
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardHover = {
  y: -4,
  boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.15)',
  transition: {
    duration: 0.2,
    ease: easings.easeInOutCubic
  }
};

export const card3DTilt = {
  rotateX: 0,
  rotateY: 0,
  transition: {
    duration: 0.2,
    ease: easings.easeInOutCubic
  }
};

// ============================================
// STAGGER ANIMATIONS (Lista de itens)
// ============================================

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeInOutCubic
    }
  }
};

// ============================================
// LOGO ANIMATIONS
// ============================================

export const logoEntrance = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.1
    }
  }
};

export const logoPulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: easings.easeInOutCubic
  }
};

// ============================================
// LOADING ANIMATIONS
// ============================================

export const loadingPulse = {
  scale: [1, 1.1, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: easings.easeInOutCubic
  }
};

export const loadingDot = (delay = 0) => ({
  y: [0, -8, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    delay,
    ease: easings.easeInOutCubic
  }
});

// ============================================
// TYPING INDICATOR (Chat)
// ============================================

export const typingDot = (delay = 0) => ({
  scale: [1, 1.3, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 1,
    repeat: Infinity,
    delay,
    ease: easings.easeInOutCubic
  }
});

// ============================================
// MODAL/DIALOG ANIMATIONS
// ============================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOutBack
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// ============================================
// SCROLL REVEAL (Aparecer ao scrollar)
// ============================================

export const scrollReveal = {
  initial: {
    opacity: 0,
    y: 50
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.easeInOutCubic
    }
  }
};

// ============================================
// SIDEBAR ANIMATIONS
// ============================================

export const sidebarSlide = {
  initial: { x: -280 },
  animate: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: -280,
    transition: {
      duration: 0.2,
      ease: easings.sharp
    }
  }
};

// ============================================
// TOAST ANIMATIONS
// ============================================

export const toastSlideIn = {
  initial: {
    x: 400,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================
// UTILITY: Spring configs pré-definidos
// ============================================

export const springs = {
  // Suave e natural
  soft: {
    type: 'spring',
    stiffness: 200,
    damping: 20
  },
  // Rápido e responsivo
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  },
  // Bouncy (com quique)
  bouncy: {
    type: 'spring',
    stiffness: 260,
    damping: 15
  },
  // Muito rápido
  fast: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
};

// ============================================
// UTILITY: Delays comuns
// ============================================

export const delays = {
  short: 0.1,
  medium: 0.2,
  long: 0.4
};
