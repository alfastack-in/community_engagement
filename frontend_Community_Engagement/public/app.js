// Client-side JavaScript for enhanced interactivity

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Add fade-in animation to cards
  const cards = document.querySelectorAll(".card-hover")
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
    card.classList.add("fade-in-up")
  })

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert")
  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = "0"
      setTimeout(() => {
        alert.remove()
      }, 300)
    }, 5000)
  })
})

// Form validation
function validateForm(formId) {
  const form = document.getElementById(formId)
  const inputs = form.querySelectorAll("input[required], textarea[required], select[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("border-red-500")
      isValid = false
    } else {
      input.classList.remove("border-red-500")
    }
  })

  return isValid
}

// Loading state for buttons
function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true
    button.innerHTML = '<span class="loading mr-2"></span>Loading...'
  } else {
    button.disabled = false
    button.innerHTML = button.getAttribute("data-original-text") || "Submit"
  }
}

// Smooth scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

// Image lazy loading
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
}

// Initialize lazy loading if images exist
if (document.querySelectorAll("img[data-src]").length > 0) {
  lazyLoadImages()
}

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu")
  menu.classList.toggle("hidden")
}

// Search functionality (if needed)
function searchContent(query) {
  const items = document.querySelectorAll("[data-searchable]")
  items.forEach((item) => {
    const text = item.textContent.toLowerCase()
    if (text.includes(query.toLowerCase())) {
      item.style.display = "block"
    } else {
      item.style.display = "none"
    }
  })
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K for search (if implemented)
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault()
    const searchInput = document.getElementById("search")
    if (searchInput) {
      searchInput.focus()
    }
  }

  // Escape to close modals
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (!modal.classList.contains("hidden")) {
        modal.classList.add("hidden")
      }
    })
  }
})
