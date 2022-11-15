
class AuthService {
    setAuth(authToken) {
        localStorage.setItem('authToken', authToken);
    }

    clearAuth() {
        localStorage.clear();
    }

    setCashierToken(cashierToken) {
        localStorage.setItem('cashierToken', cashierToken);
    }

    getCashierToken() {
        return localStorage.getItem('cashierToken');
    }

    clearCashierToken() {
        localStorage.removeItem('cashierToken');
    }

    isLoggedIn() {
        return localStorage.getItem('authToken') != null;
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    setInit() {
        localStorage.setItem('Init', new Date());
    }

    clearInit() {
        localStorage.removeItem('Init');
    }

    hasSeenInit() {
        return localStorage.getItem('Init') != null;
    }
}

const authService = new AuthService();

export default authService;