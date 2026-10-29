/**
 * ==========================================================================
 * PERSONAL PORTFOLIO INTERACTIVITY – MUKKAMALLA MANASA REDDY
 * Pure Vanilla JavaScript (No Frameworks or Bloat)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const header = document.getElementById('header');
  const navMenu = document.getElementById('navMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main > section');
  const themeToggle = document.getElementById('themeToggle');
  const currentYearSpan = document.getElementById('currentYear');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const contactForm = document.getElementById('contactForm');
  const formStatusMsg = document.getElementById('formStatusMsg');

  // Modal Elements
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContent = document.getElementById('modalContent');
  const projectDetailButtons = document.querySelectorAll('.btn-project-details');

  // Filter Buttons & Skill Cards
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  // --- Dynamic Year ---
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // 1. THEME SWITCHER (Dark / Light with LocalStorage & OS Preference)
  // ==========================================================================
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme ? storedTheme : (systemPrefersDark ? 'dark' : 'light');

  setTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // ==========================================================================
  // 2. MOBILE MENU DRAWER
  // ==========================================================================
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      toggleMobileMenu(!isExpanded);
    });

    // Close when clicking nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && navMenu.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });
  }

  function toggleMobileMenu(open) {
    if (open) {
      navMenu.classList.add('open');
      mobileMenuBtn.classList.add('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    } else {
      navMenu.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // ==========================================================================
  // 3. SCROLL SPY & STICKY NAVBAR
  // ==========================================================================
  window.addEventListener('scroll', handleScroll, { passive: true });

  function handleScroll() {
    const scrollY = window.pageYOffset;

    // Header shadow on scroll
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    // ScrollSpy active link update
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }

  // Initial call
  handleScroll();

  // Back to top smooth action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 4. SKILLS CATEGORY FILTERING
  // ==========================================================================
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  // ==========================================================================
  // 5. PROJECT DETAILS DATA & MODAL
  // ==========================================================================
  const projectDetailsMap = {
    loan: {
      badge: "FinTech & Machine Learning",
      title: "Loan Eligibility Checking – Dynamic System",
      description: "A machine learning-driven web evaluation system designed to automate loan verification, assess financial credibility, and predict applicant eligibility based on multi-dimensional criteria.",
      highlights: [
        "Feature engineering and preprocessing on applicant datasets (Income, Credit History, Loan Amount, Dependents, Education).",
        "Applied supervised classification algorithms to evaluate risk probability and predict eligibility status in real-time.",
        "Interactive web dashboard providing transparent reasoning and clear feedback for applicant qualification.",
        "Significant reduction in manual verification bottlenecks through dynamic automated scoring."
      ],
      technologies: ["Python", "Scikit-Learn", "Data Preprocessing", "Pandas & NumPy", "HTML5 & CSS3"],
      note: "Developed as a core academic project in Computer Science & Engineering (Data Science)."
    },
    gesture: {
      badge: "Computer Vision & Automation",
      title: "Hand Gesture Controller using Python and OpenCV",
      description: "An intuitive touchless Human-Computer Interface (HCI) engineered to control media playback and system functions through real-time hand gesture tracking via standard webcam input.",
      highlights: [
        "Real-time video frame processing with OpenCV, converting webcam streams into RGB spatial landmarks.",
        "Detection and spatial tracking of 21 hand joints to distinguish multi-finger poses and gestures.",
        "Calculated Euclidean distance between finger tips (thumb and index) to map continuous volume and brightness control.",
        "Integrated discrete gesture triggers for play/pause, media track skipping, and hands-free desktop interaction."
      ],
      technologies: ["Python", "OpenCV", "Media Automation", "NumPy", "HCI"],
      note: "Presented at Vishesh Project's Expo, highlighting real-time computer vision capabilities."
    },
    stock: {
      badge: "Deep Learning & Time-Series Forecasting",
      title: "Stock Price Prediction using LSTM",
      description: "A recurrent deep learning architecture using Long Short-Term Memory (LSTM) neural networks capable of modeling temporal dependencies and predicting stock market closing price movements.",
      highlights: [
        "Aggregated and cleaned historical equity time-series market datasets with sliding time windows.",
        "Addressed vanishing gradient challenges in recurrent architectures using LSTM memory cells.",
        "Feature normalization with MinMax scalers and hyperparameter tuning (epochs, batch size, dropout layers).",
        "Visualized historical ground-truth vs. model-predicted stock prices with Matplotlib/Seaborn trend plots."
      ],
      technologies: ["Python", "LSTM Recurrent Networks", "TensorFlow / Keras", "Time-Series Analysis", "Matplotlib"],
      note: "Academic deep learning project focusing on time-series predictive modeling."
    }
  };

  projectDetailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      const details = projectDetailsMap[projectKey];
      if (details) {
        renderProjectModal(details);
        openModal();
      }
    });
  });

  function renderProjectModal(data) {
    if (!modalContent) return;

    modalContent.innerHTML = `
      <span class="modal-project-badge">${data.badge}</span>
      <h3 class="modal-project-title" id="modalTitle">${data.title}</h3>
      <p class="modal-text">${data.description}</p>

      <h4 class="modal-section-title">Key Architectural Highlights</h4>
      <ul class="modal-list">
        ${data.highlights.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h4 class="modal-section-title">Technologies & Tools</h4>
      <div class="modal-tags">
        ${data.technologies.map(tech => `<span class="tech-pill">${tech}</span>`).join('')}
      </div>

      <h4 class="modal-section-title">Academic Context</h4>
      <p class="modal-text" style="font-style: italic; color: var(--text-muted);">${data.note}</p>
    `;
  }

  function openModal() {
    if (projectModal) {
      projectModal.classList.add('is-open');
      projectModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (modalCloseBtn) modalCloseBtn.focus();
    }
  }

  function closeModal() {
    if (projectModal) {
      projectModal.classList.remove('is-open');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeModal();
      }
    });
  }

  // Keyboard accessibility for modal (ESC key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // ==========================================================================
  // 6. COPY EMAIL CLIPBOARD HELPER
  // ==========================================================================
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = 'reddymanasa0271@gmail.com';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        showToast('Email copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy email');
      }
    });
  }

  // ==========================================================================
  // 7. CONTACT FORM VALIDATION & CLIENT-SIDE FEEDBACK
  // ==========================================================================
  if (contactForm) {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const subjectInput = document.getElementById('userSubject');
    const messageInput = document.getElementById('userMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');

    // Real-time inline validation triggers
    nameInput.addEventListener('input', () => validateName());
    emailInput.addEventListener('input', () => validateEmail());
    subjectInput.addEventListener('input', () => validateSubject());
    messageInput.addEventListener('input', () => validateMessage());

    const submitBtn = document.getElementById('btnSubmitForm');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Send Message</span>';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isSubjectValid = validateSubject();
      const isMessageValid = validateMessage();

      if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
        formStatusMsg.className = 'form-status-msg error';
        formStatusMsg.textContent = 'Please correct the errors in the highlighted fields before submitting.';
        formStatusMsg.style.display = 'block';
        showToast('Please fix the errors in the form.');
        return;
      }

      // Prevent accidental duplicate submissions while processing
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Sending Message...</span>
          <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        `;
      }

      formStatusMsg.className = 'form-status-msg';
      formStatusMsg.textContent = 'Connecting to server and sending your message...';
      formStatusMsg.style.display = 'block';

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim()
      };

      const API_ENDPOINT = (window.PORTFOLIO_API_URL || 'http://localhost:5000') + '/api/contact';

      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success) {
          // Success: Display response and clear form
          formStatusMsg.className = 'form-status-msg success';
          formStatusMsg.innerHTML = `
            <strong>Thank you, ${escapeHtml(payload.name)}!</strong><br>
            ${escapeHtml(data.message || 'Your message has been received successfully.')}
          `;
          formStatusMsg.style.display = 'block';

          showToast('Message sent successfully!');

          // Reset the form only after a successful submission
          contactForm.reset();
          [nameInput, emailInput, subjectInput, messageInput].forEach(inp => inp.classList.remove('is-invalid'));
        } else {
          // Backend returned an error response
          formStatusMsg.className = 'form-status-msg error';
          let errorText = data && data.message ? data.message : 'Submission failed. Please try again.';
          if (data && data.errors && Array.isArray(data.errors)) {
            errorText += ' ' + data.errors.map(err => err.message).join(' ');
          }
          formStatusMsg.innerHTML = `<strong>Error:</strong> ${escapeHtml(errorText)}`;
          formStatusMsg.style.display = 'block';
          showToast('Failed to submit message.');
        }
      } catch (networkError) {
        // Network connection error / server offline
        console.error('Contact form submission error:', networkError);
        formStatusMsg.className = 'form-status-msg error';
        formStatusMsg.innerHTML = `
          <strong>Connection Error:</strong> Could not connect to backend server at <code>${escapeHtml(API_ENDPOINT)}</code>.<br>
          Please start the backend first by running <code>node server.js</code> inside the <code>backend</code> folder (or double-click <code>start.bat</code> in the project root), then retry.
        `;
        formStatusMsg.style.display = 'block';
        showToast('Server connection failed. Is the backend running?');
      } finally {
        // Re-enable button after request finishes
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });

    function validateName() {
      const val = nameInput.value.trim();
      if (!val) {
        setError(nameInput, nameError, 'Full Name is required.');
        return false;
      }
      if (val.length < 2) {
        setError(nameInput, nameError, 'Name must be at least 2 characters.');
        return false;
      }
      clearError(nameInput, nameError);
      return true;
    }

    function validateEmail() {
      const val = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        setError(emailInput, emailError, 'Email address is required.');
        return false;
      }
      if (!emailPattern.test(val)) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        return false;
      }
      clearError(emailInput, emailError);
      return true;
    }

    function validateSubject() {
      const val = subjectInput.value.trim();
      if (!val) {
        setError(subjectInput, subjectError, 'Subject is required.');
        return false;
      }
      if (val.length < 3) {
        setError(subjectInput, subjectError, 'Subject must be at least 3 characters.');
        return false;
      }
      clearError(subjectInput, subjectError);
      return true;
    }

    function validateMessage() {
      const val = messageInput.value.trim();
      if (!val) {
        setError(messageInput, messageError, 'Message is required.');
        return false;
      }
      if (val.length < 10) {
        setError(messageInput, messageError, 'Message must be at least 10 characters long.');
        return false;
      }
      clearError(messageInput, messageError);
      return true;
    }

    function setError(inputElem, errorElem, message) {
      inputElem.classList.add('is-invalid');
      if (errorElem) errorElem.textContent = message;
    }

    function clearError(inputElem, errorElem) {
      inputElem.classList.remove('is-invalid');
      if (errorElem) errorElem.textContent = '';
    }
  }

  // ==========================================================================
  // 8. RESUME DOWNLOAD HANDLER & VERIFICATION
  // ==========================================================================
  const resumeLinks = document.querySelectorAll('a[download]');
  resumeLinks.forEach(link => {
    link.addEventListener('click', () => {
      showToast('Downloading resume: M_Manasa_Reddy_Resume.pdf');
    });
  });

  // ==========================================================================
  // 9. TOAST NOTIFICATION HELPER
  // ==========================================================================
  let toastTimer = null;
  function showToast(message) {
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Security helper for HTML escaping
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }
});
