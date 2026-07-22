const Auth = {
    SESSION_KEY: 'lms_session',

    login(username, password) {
        const user = Store.authenticateUser(username, password);
        if (user) {
            const session = {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                studentId: user.studentId || null
            };
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return session;
        }
        return null;
    },

    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = '../index.html';
    },

    getSession() {
        const data = sessionStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    isLoggedIn() {
        return this.getSession() !== null;
    },

    isAdmin() {
        const session = this.getSession();
        return session && session.role === 'admin';
    },

    isStudent() {
        const session = this.getSession();
        return session && session.role === 'student';
    },

    requireAuth(role) {
        if (!this.isLoggedIn()) {
            window.location.href = '../index.html';
            return false;
        }
        if (role === 'admin' && !this.isAdmin()) {
            window.location.href = '../index.html';
            return false;
        }
        if (role === 'student' && !this.isStudent()) {
            window.location.href = '../index.html';
            return false;
        }
        return true;
    },

    getStudentId() {
        const session = this.getSession();
        return session ? session.studentId : null;
    }
};
