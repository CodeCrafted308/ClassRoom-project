// Theme Switching Functionality
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('scholarRankTheme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme on page load
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
        
        // Add event listener for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.currentTheme === 'system') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                    this.updateThemeIcon();
                }
            });
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        
        this.saveTheme();
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
        
        // Add animation effect
        this.animateThemeToggle();
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.removeAttribute('data-theme');
            root.classList.remove('dark-theme', 'light-theme');
            
            // Apply system preference
            if (prefersDark) {
                root.classList.add('dark-theme');
            } else {
                root.classList.add('light-theme');
            }
        } else {
            root.setAttribute('data-theme', theme);
            root.classList.remove('dark-theme', 'light-theme');
            root.classList.add(`${theme}-theme`);
        }
    }

    updateThemeIcon() {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;

        const icons = {
            'light': '🌙',
            'dark': '🌙',
            'system': '🌓'
        };

        icon.textContent = icons[this.currentTheme] || '🌙';
    }

    saveTheme() {
        localStorage.setItem('scholarRankTheme', this.currentTheme);
    }

    animateThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                toggle.style.transform = 'scale(1) rotate(360deg)';
            }, 150);
        }
    }

    // Public method for external calls
    toggle() {
        this.toggleTheme();
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Global function for onclick handlers
function toggleTheme() {
    themeManager.toggle();
}

// Apply theme immediately on script load
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});
