// Global state management
class BarcodeManager {
    constructor() {
        this.products = this.loadProducts();
        this.currentView = 'add-product';
        this.cameraStream = null;
        this.codeReader = null;
        this.isScanning = false;
        this.darkMode = this.loadThemePreference();
        
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.setupBarcodeReader();
        this.renderProducts();
    }

    // Event listeners setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Add product form
        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Manual barcode form
        document.getElementById('manual-barcode-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.lookupManualBarcode();
        });

        // Camera controls
        document.getElementById('start-camera-btn').addEventListener('click', () => {
            this.startCamera();
        });

        document.getElementById('stop-camera-btn').addEventListener('click', () => {
            this.stopCamera();
        });

        // Clear all products
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllProducts();
        });

        // Modal controls
        document.getElementById('close-print-modal').addEventListener('click', () => {
            this.closePrintModal();
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closePrintModal();
        });

        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });

        // Close modal on background click
        document.getElementById('print-modal').addEventListener('click', (e) => {
            if (e.target.id === 'print-modal') {
                this.closePrintModal();
            }
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    // Setup barcode reader for scanning
    setupBarcodeReader() {
        if (typeof ZXing !== 'undefined') {
            this.codeReader = new ZXing.BrowserMultiFormatReader();
        }
    }

    // View management
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Add cool view transition effect
        document.querySelectorAll('.view').forEach(view => {
            view.style.transform = 'translateX(-100px)';
            view.style.opacity = '0';
            view.classList.remove('active');
        });

        // Delay showing new view for smooth transition
        setTimeout(() => {
            const newView = document.getElementById(viewName);
            newView.classList.add('active');
            newView.style.transform = 'translateX(0)';
            newView.style.opacity = '1';
            
            // Add sparkle effect when switching views
            this.createSparkleEffect();
        }, 150);

        this.currentView = viewName;

        // Stop camera if switching away from scanner
        if (viewName !== 'scanner' && this.cameraStream) {
            this.stopCamera();
        }
    }

    // Create sparkle effect
    createSparkleEffect() {
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #fff, #667eea);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                animation: sparkle 1s ease-out forwards;
            `;
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
        
        // Add sparkle animation to CSS if not exists
        if (!document.querySelector('#sparkle-style')) {
            const style = document.createElement('style');
            style.id = 'sparkle-style';
            style.textContent = `
                @keyframes sparkle {
                    0% { transform: scale(0) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Create celebration effect for successful product addition
    createCelebrationEffect() {
        // Create confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * window.innerWidth}px;
                top: -10px;
                z-index: 1000;
                pointer-events: none;
                animation: confetti ${2 + Math.random() * 3}s ease-out forwards;
            `;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
        
        // Add confetti animation to CSS if not exists
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(${window.innerHeight + 100}px) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Screen flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%);
            z-index: 999;
            pointer-events: none;
            animation: flash 0.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
        
        // Add flash animation if not exists
        if (!document.querySelector('#flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Product management
    addProduct() {
        const form = document.getElementById('add-product-form');
        const formData = new FormData(form);
        
        const productName = formData.get('productName').trim();
        const productDescription = formData.get('productDescription').trim();

        if (!productName) {
            this.showError('Product name is required');
            return;
        }

        // Generate unique barcode ID
        const barcodeId = this.generateBarcodeId();
        
        const product = {
            id: Date.now().toString(),
            name: productName,
            description: productDescription,
            barcodeId: barcodeId,
            createdAt: new Date().toISOString()
        };

        this.products.push(product);
        this.saveProducts();
        this.renderProducts();
        
        form.reset();
        this.showSuccess('Product added successfully with barcode ID: ' + barcodeId);
        
        // Create celebration effect
        this.createCelebrationEffect();
        
        // Switch to products view to see the new product
        setTimeout(() => {
            this.switchView('product-list');
        }, 1500);
    }

    generateBarcodeId() {
        // Generate a unique 12-digit barcode ID
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return timestamp.slice(-9) + random;
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderProducts();
            this.showSuccess('Product deleted successfully');
        }
    }

    clearAllProducts() {
        if (confirm('Are you sure you want to delete all products? This action cannot be undone.')) {
            this.products = [];
            this.saveProducts();
            this.renderProducts();
            this.showSuccess('All products cleared');
        }
    }

    printBarcode(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showError('Product not found');
            return;
        }

        const printContainer = document.getElementById('print-barcode-container');
        printContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2>${product.name}</h2>
                ${product.description ? `<p>${product.description}</p>` : ''}
                <div style="margin: 20px 0;">
                    <canvas id="print-barcode"></canvas>
                </div>
                <p><strong>Barcode ID:</strong> ${product.barcodeId}</p>
                <p><em>Created: ${new Date(product.createdAt).toLocaleDateString()}</em></p>
            </div>
        `;

        // Generate barcode for printing
        setTimeout(() => {
            JsBarcode("#print-barcode", product.barcodeId, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 16,
                margin: 10
            });
        }, 100);

        document.getElementById('print-modal').style.display = 'flex';
    }

    closePrintModal() {
        document.getElementById('print-modal').style.display = 'none';
    }

    // Camera and scanning
    async startCamera() {
        const video = document.getElementById('camera-video');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const status = document.getElementById('camera-status');

        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access is not supported in this browser');
            }

            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            video.srcObject = this.cameraStream;
            
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            
            status.innerHTML = '<div class="status-message info">Camera started. Point at a barcode to scan.</div>';

            // Start scanning
            this.startScanning();
            
        } catch (error) {
            console.error('Camera error:', error);
            let errorMessage = 'Failed to access camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Camera is not supported in this browser.';
            } else {
                errorMessage += error.message;
            }
            
            status.innerHTML = `<div class="status-message error">${errorMessage}</div>`;
        }
    }

    stopCamera() {
        const video = document.getElementById('camera-video');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const status = document.getElementById('camera-status');

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        if (this.codeReader && this.isScanning) {
            this.codeReader.reset();
            this.isScanning = false;
        }

        video.srcObject = null;
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        status.innerHTML = '';
    }

    startScanning() {
        if (!this.codeReader) {
            console.error('Barcode reader not initialized');
            return;
        }

        this.isScanning = true;
        const video = document.getElementById('camera-video');

        this.codeReader.decodeFromVideoDevice(null, video, (result, err) => {
            if (result) {
                const barcodeText = result.getText();
                this.handleScannedBarcode(barcodeText);
                this.stopCamera();
            }
            
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error('Scanning error:', err);
            }
        });
    }

    lookupManualBarcode() {
        const input = document.getElementById('manual-barcode');
        const barcodeText = input.value.trim();
        
        if (!barcodeText) {
            this.showError('Please enter a barcode number');
            return;
        }
        
        this.handleScannedBarcode(barcodeText);
        input.value = '';
    }

    handleScannedBarcode(barcodeText) {
        const product = this.products.find(p => p.barcodeId === barcodeText);
        const resultsDiv = document.getElementById('scan-results');
        const resultsContent = document.getElementById('scan-results-content');

        if (product) {
            resultsContent.innerHTML = `
                <div class="result-found">
                    <h4>Product Found!</h4>
                    <p><strong>Name:</strong> ${product.name}</p>
                    ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                    <p><strong>Barcode ID:</strong> ${product.barcodeId}</p>
                    <p><strong>Created:</strong> ${new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            resultsContent.innerHTML = `
                <div class="result-not-found">
                    <h4>Product Not Found</h4>
                    <p><strong>Scanned Barcode:</strong> ${barcodeText}</p>
                    <p>This barcode is not associated with any product in your system.</p>
                </div>
            `;
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Product rendering
    renderProducts() {
        const container = document.getElementById('products-container');
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No products added yet. Add your first product to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map(product => `
            <div class="product-item">
                <div class="product-header">
                    <div class="product-info">
                        <h3>${this.escapeHtml(product.name)}</h3>
                        ${product.description ? `<p>${this.escapeHtml(product.description)}</p>` : ''}
                        <p><span class="product-id">ID: ${product.barcodeId}</span></p>
                        <p><small>Created: ${new Date(product.createdAt).toLocaleDateString()}</small></p>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small" onclick="barcodeManager.printBarcode('${product.id}')">
                            Print
                        </button>
                        <button class="btn btn-danger btn-small" onclick="barcodeManager.deleteProduct('${product.id}')">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="barcode-container">
                    <canvas id="barcode-${product.id}"></canvas>
                </div>
            </div>
        `).join('');

        // Generate barcodes for all products
        setTimeout(() => {
            this.products.forEach(product => {
                try {
                    JsBarcode(`#barcode-${product.id}`, product.barcodeId, {
                        format: "CODE128",
                        width: 2,
                        height: 80,
                        displayValue: true,
                        fontSize: 14,
                        margin: 5
                    });
                } catch (error) {
                    console.error(`Failed to generate barcode for product ${product.id}:`, error);
                }
            });
        }, 100);
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.temp-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type} temp-message`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.zIndex = '1001';
        messageDiv.style.minWidth = '300px';
        messageDiv.style.textAlign = 'center';

        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Theme management
    toggleTheme() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        this.saveThemePreference();
        
        // Create theme switch effect
        this.createThemeSwitchEffect();
    }

    applyTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (this.darkMode) {
            body.classList.add('dark-mode');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            themeIcon.textContent = '🌙';
        }
    }

    loadThemePreference() {
        const saved = localStorage.getItem('barcode-theme');
        return saved === 'dark';
    }

    saveThemePreference() {
        localStorage.setItem('barcode-theme', this.darkMode ? 'dark' : 'light');
    }

    createThemeSwitchEffect() {
        // Create expanding circle effect
        const circle = document.createElement('div');
        circle.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 50px;
            height: 50px;
            background: ${this.darkMode ? 'radial-gradient(circle, #1a1a2e 0%, #16213e 100%)' : 'radial-gradient(circle, #667eea 0%, #764ba2 100%)'};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 1001;
            pointer-events: none;
            animation: themeSwitch 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 800);
        
        // Add theme switch animation if not exists
        if (!document.querySelector('#theme-switch-style')) {
            const style = document.createElement('style');
            style.id = 'theme-switch-style';
            style.textContent = `
                @keyframes themeSwitch {
                    0% { 
                        transform: translate(-50%, -50%) scale(0); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(15); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(25); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add sparkles for theme switch
        this.createSparkleEffect();
    }

    // Local storage management
    loadProducts() {
        try {
            const stored = localStorage.getItem('barcode-products');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load products from storage:', error);
            return [];
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('barcode-products', JSON.stringify(this.products));
        } catch (error) {
            console.error('Failed to save products to storage:', error);
            this.showError('Failed to save data. Storage may be full.');
        }
    }
}

// Initialize the application when the page loads
let barcodeManager;

document.addEventListener('DOMContentLoaded', () => {
    // Check for required libraries
    if (typeof JsBarcode === 'undefined') {
        console.error('JsBarcode library not loaded');
        document.body.innerHTML = '<div style="text-align: center; padding: 2rem; color: red;">Error: Barcode generation library failed to load. Please check your internet connection.</div>';
        return;
    }

    if (typeof ZXing === 'undefined') {
        console.warn('ZXing library not loaded - camera scanning will not be available');
    }

    // Initialize the application
    barcodeManager = new BarcodeManager();
});

// Handle page visibility changes to stop camera when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && barcodeManager && barcodeManager.cameraStream) {
        barcodeManager.stopCamera();
    }
});

// Handle beforeunload to clean up camera resources
window.addEventListener('beforeunload', () => {
    if (barcodeManager && barcodeManager.cameraStream) {
        barcodeManager.stopCamera();
    }
});
