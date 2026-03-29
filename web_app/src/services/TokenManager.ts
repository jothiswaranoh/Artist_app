export class TokenManager {
    private static readonly ACCESS_TOKEN_KEY = 'access_token';

    static getAccessToken(): string | null {
        try {
            return localStorage.getItem(this.ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    static setToken(token: string): void {
        try {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    }

    static clearToken(): void {
        try {
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error clearing token:', error);
        }
    }

    static hasValidToken(): boolean {
        try {
            const token = this.getAccessToken();

            if (!token) return false;

            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) return false;

            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > (currentTime + 300); // Valid for at least 5 more minutes

        } catch (error) {
            console.error('TokenManager.hasValidToken error:', error);
            return false;
        }
    }
}
