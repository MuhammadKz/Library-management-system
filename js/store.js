const Store = {
    KEYS: {
        BOOKS: 'lms_books',
        STUDENTS: 'lms_students',
        USERS: 'lms_users',
        BORROWS: 'lms_borrows',
        INITIALIZED: 'lms_initialized'
    },

    init() {
        if (!localStorage.getItem(this.KEYS.INITIALIZED)) {
            this.seed();
            localStorage.setItem(this.KEYS.INITIALIZED, 'true');
        }
    },

    seed() {
        const books = [
            { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', quantity: 5, available: 5 },
            { id: 2, title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Computer Science', quantity: 3, available: 3 },
            { id: 3, title: 'Physics for Scientists', author: 'Raymond A. Serway', category: 'Science', quantity: 4, available: 4 },
            { id: 4, title: 'Calculus: Early Transcendentals', author: 'James Stewart', category: 'Mathematics', quantity: 6, available: 6 },
            { id: 5, title: 'Operating System Concepts', author: 'Abraham Silberschatz', category: 'Computer Science', quantity: 3, available: 3 },
            { id: 6, title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', quantity: 4, available: 4 }
        ];

        const users = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Library Admin' },
            { id: 2, username: 'student1', password: 'student123', role: 'student', name: 'MD Jamir Uddin Jewel', studentId: '666-61-37' },
            { id: 3, username: 'student2', password: 'student123', role: 'student', name: 'Saniul Alam Sanim', studentId: '666-61-51' },
            { id: 4, username: 'student3', password: 'student123', role: 'student', name: 'Kazi Mohammad Ullah', studentId: '666-61-64' }
        ];

        const students = [
            { id: 1, name: 'MD Jamir Uddin Jewel', studentId: '666-61-37', email: 'jewel@southern.ac.bd', phone: '01712345678' },
            { id: 2, name: 'Saniul Alam Sanim', studentId: '666-61-51', email: 'sanim@southern.ac.bd', phone: '01812345678' },
            { id: 3, name: 'Kazi Mohammad Ullah', studentId: '666-61-64', email: 'ullah@southern.ac.bd', phone: '01912345678' }
        ];

        localStorage.setItem(this.KEYS.BOOKS, JSON.stringify(books));
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
        localStorage.setItem(this.KEYS.BORROWS, JSON.stringify([]));
    },

    _get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    _nextId(items) {
        return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    },

    // Books
    getBooks() {
        return this._get(this.KEYS.BOOKS);
    },

    getBookById(id) {
        return this.getBooks().find(b => b.id === id);
    },

    addBook(book) {
        const books = this.getBooks();
        book.id = this._nextId(books);
        book.available = book.quantity;
        books.push(book);
        this._set(this.KEYS.BOOKS, books);
        return book;
    },

    updateBook(id, updates) {
        const books = this.getBooks();
        const index = books.findIndex(b => b.id === id);
        if (index !== -1) {
            books[index] = { ...books[index], ...updates };
            this._set(this.KEYS.BOOKS, books);
            return books[index];
        }
        return null;
    },

    deleteBook(id) {
        const books = this.getBooks().filter(b => b.id !== id);
        this._set(this.KEYS.BOOKS, books);
    },

    // Users
    getUsers() {
        return this._get(this.KEYS.USERS);
    },

    authenticateUser(username, password) {
        return this.getUsers().find(u => u.username === username && u.password === password);
    },

    // Students
    getStudents() {
        return this._get(this.KEYS.STUDENTS);
    },

    addStudent(student) {
        const students = this.getStudents();
        student.id = this._nextId(students);
        students.push(student);
        this._set(this.KEYS.STUDENTS, students);

        // Also create a user account
        const users = this.getUsers();
        users.push({
            id: this._nextId(users),
            username: student.studentId,
            password: 'student123',
            role: 'student',
            name: student.name,
            studentId: student.studentId
        });
        this._set(this.KEYS.USERS, users);
        return student;
    },

    deleteStudent(id) {
        const students = this.getStudents().filter(s => s.id !== id);
        this._set(this.KEYS.STUDENTS, students);
    },

    // Borrows
    getBorrows() {
        return this._get(this.KEYS.BORROWS);
    },

    getBorrowsByStudent(studentId) {
        return this.getBorrows().filter(b => b.studentId === studentId);
    },

    borrowBook(studentId, bookId) {
        const book = this.getBookById(bookId);
        if (!book || book.available <= 0) return null;

        const borrows = this.getBorrows();
        const now = new Date();
        const returnDate = new Date(now);
        returnDate.setDate(returnDate.getDate() + 14);

        const borrow = {
            id: this._nextId(borrows),
            studentId: studentId,
            bookId: bookId,
            bookTitle: book.title,
            borrowDate: now.toISOString(),
            returnDate: returnDate.toISOString(),
            status: 'borrowed'
        };

        borrows.push(borrow);
        this._set(this.KEYS.BORROWS, borrows);

        this.updateBook(bookId, { available: book.available - 1 });
        return borrow;
    },

    returnBook(borrowId) {
        const borrows = this.getBorrows();
        const index = borrows.findIndex(b => b.id === borrowId);
        if (index === -1) return null;

        const borrow = borrows[index];
        borrow.status = 'returned';
        borrow.actualReturnDate = new Date().toISOString();
        borrows[index] = borrow;
        this._set(this.KEYS.BORROWS, borrows);

        const book = this.getBookById(borrow.bookId);
        if (book) {
            this.updateBook(borrow.bookId, { available: book.available + 1 });
        }
        return borrow;
    },

    // Stats
    getStats() {
        const books = this.getBooks();
        const borrows = this.getBorrows();
        const students = this.getStudents();

        const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
        const issuedBooks = borrows.filter(b => b.status === 'borrowed').length;
        const returnedBooks = borrows.filter(b => b.status === 'returned').length;

        return {
            totalBooks,
            issuedBooks,
            returnedBooks,
            totalStudents: students.length,
            totalTitles: books.length
        };
    }
};

Store.init();
