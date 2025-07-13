import { russian_roulette_backend } from '../../declarations/russian_roulette_backend';
import { AuthClient } from "@dfinity/auth-client";

// Configuration untuk koneksi
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

class GameConnection {
    constructor() {
        this.authClient = null;
        this.retryCount = 0;
        this.isConnecting = false;
    }

    async initAuth() {
        try {
            this.authClient = await AuthClient.create();
            return this.authClient;
        } catch (error) {
            console.error("Failed to create auth client:", error);
            throw error;
        }
    }

    async connectWithRetry() {
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        
        while (this.retryCount < MAX_RETRIES) {
            try {
                // Update UI
                this.updateConnectionStatus("Connecting to ICP...");
                
                // Initialize auth client
                if (!this.authClient) {
                    await this.initAuth();
                }
                
                // Test connection dengan memanggil fungsi simple
                await russian_roulette_backend.getGameInfo();
                
                // Jika berhasil
                this.updateConnectionStatus("Connected");
                this.isConnecting = false;
                this.retryCount = 0;
                return true;
                
            } catch (error) {
                console.error(`Connection attempt ${this.retryCount + 1} failed:`, error);
                this.retryCount++;
                
                if (this.retryCount < MAX_RETRIES) {
                    this.updateConnectionStatus(`Retrying... (${this.retryCount}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                    this.updateConnectionStatus("Connection failed. Please refresh the page.");
                    this.isConnecting = false;
                    return false;
                }
            }
        }
    }

    updateConnectionStatus(message) {
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    async callBackend(method, ...args) {
        try {
            if (!this.authClient) {
                await this.connectWithRetry();
            }
            
            return await russian_roulette_backend[method](...args);
        } catch (error) {
            console.error(`Backend call failed: ${method}`, error);
            // Retry connection
            await this.connectWithRetry();
            throw error;
        }
    }
}

// Initialize game connection
const gameConnection = new GameConnection();

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await gameConnection.connectWithRetry();
});

// Export untuk digunakan di tempat lain
export { gameConnection };