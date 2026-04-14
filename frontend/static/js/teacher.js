// Teacher Dashboard JavaScript
class TeacherDashboard {
    constructor() {
        this.currentSection = 'notes';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateSectionVisibility();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.getAttribute('onclick').match(/showSection\('([^']+)'\)/)[1];
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Header navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                window.location.href = href;
            });
        });

        // Form submissions
        const uploadNoteForm = document.getElementById('uploadNoteForm');
        if (uploadNoteForm) {
            uploadNoteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.uploadNote();
            });
        }

        const noticeForm = document.getElementById('noticeForm');
        if (noticeForm) {
            noticeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.postNotice();
            });
        }

        const zoomForm = document.getElementById('zoomForm');
        if (zoomForm) {
            zoomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.setZoomLink();
            });
        }

        const testForm = document.getElementById('testForm');
        if (testForm) {
            testForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTest();
            });
        }
    }

    showSection(section) {
        this.currentSection = section;
        this.updateSectionVisibility();
        this.loadSectionData(section);
    }

    updateSectionVisibility() {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const activeSection = document.getElementById(`${this.currentSection}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="showSection('${this.currentSection}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    loadSectionData(section) {
        switch(section) {
            case 'notes':
                this.loadNotesData();
                break;
            case 'students':
                this.loadStudentsData();
                break;
            case 'notices':
                this.loadNoticesData();
                break;
            case 'zoom':
                this.loadZoomData();
                break;
            case 'tests':
                this.loadTestsData();
                break;
        }
    }

    // API calls
    async uploadNote() {
        const formData = new FormData(document.getElementById('uploadNoteForm'));
        
        try {
            const response = await fetch('/api/teacher/notes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage('Note uploaded successfully!', 'success');
                this.loadNotesData();
            } else {
                this.showMessage('Failed to upload note', 'error');
            }
        } catch (error) {
            this.showMessage('Error uploading note', 'error');
        }
    }

    async postNotice() {
        const formData = new FormData(document.getElementById('noticeForm'));
        const title = document.getElementById('notice-title').value;
        const content = document.getElementById('notice-content').value;
        
        formData.append('title', title);
        formData.append('content', content);

        try {
            const response = await fetch('/api/teacher/notices', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage('Notice posted successfully!', 'success');
                this.loadNoticesData();
            } else {
                this.showMessage('Failed to post notice', 'error');
            }
        } catch (error) {
            this.showMessage('Error posting notice', 'error');
        }
    }

    async setZoomLink() {
        const formData = new FormData(document.getElementById('zoomForm'));
        const url = document.getElementById('zoom-url').value;
        const meetingId = document.getElementById('zoom-meeting-id').value;
        const password = document.getElementById('zoom-password').value;
        const time = document.getElementById('zoom-time').value;
        
        formData.append('url', url);
        formData.append('meeting_id', meetingId);
        formData.append('password', password);
        formData.append('scheduled_time', time);

        try {
            const response = await fetch('/api/teacher/zoom-link', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage('Zoom link set successfully!', 'success');
                this.loadZoomData();
            } else {
                this.showMessage('Failed to set Zoom link', 'error');
            }
        } catch (error) {
            this.showMessage('Error setting Zoom link', 'error');
        }
    }

    async createTest() {
        const formData = new FormData(document.getElementById('testForm'));
        const title = document.getElementById('test-title').value;
        const description = document.getElementById('test-description').value;
        const startTime = document.getElementById('test-start-time').value;
        const endTime = document.getElementById('test-end-time').value;
        
        formData.append('title', title);
        formData.append('description', description);
        formData.append('start_time', startTime);
        formData.append('end_time', endTime);

        try {
            const response = await fetch('/api/teacher/tests', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage('Test created successfully!', 'success');
                this.loadTestsData();
            } else {
                this.showMessage('Failed to create test', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating test', 'error');
        }
    }

    // Data loading methods
    async loadNotesData() {
        try {
            const response = await fetch('/api/teacher/notes');
            if (response.ok) {
                const notes = await response.json();
                this.displayNotes(notes);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    async loadStudentsData() {
        try {
            const response = await fetch('/api/teacher/students');
            if (response.ok) {
                const students = await response.json();
                this.displayStudents(students);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    async loadNoticesData() {
        try {
            const response = await fetch('/api/teacher/notices');
            if (response.ok) {
                const notices = await response.json();
                this.displayNotices(notices);
            }
        } catch (error) {
            console.error('Error loading notices:', error);
        }
    }

    async loadZoomData() {
        try {
            const response = await fetch('/api/teacher/zoom-link');
            if (response.ok) {
                const zoomData = await response.json();
                this.displayZoomLink(zoomData);
            }
        } catch (error) {
            console.error('Error loading Zoom data:', error);
        }
    }

    async loadTestsData() {
        try {
            const response = await fetch('/api/teacher/tests');
            if (response.ok) {
                const tests = await response.json();
                this.displayTests(tests);
            }
        } catch (error) {
            console.error('Error loading tests:', error);
        }
    }

    // Display methods
    displayNotes(notes) {
        const notesList = document.getElementById('notes-list');
        if (notesList && notes.length > 0) {
            notesList.innerHTML = notes.map(note => `
                <div class="note-item">
                    <div class="note-header">
                        <span class="note-title">${note.title}</span>
                        <span class="note-date">${new Date(note.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    <p class="note-desc">${note.description || 'No description'}</p>
                    <button class="btn btn-small btn-outline" onclick="deleteNote('${note._id}')">Delete</button>
                </div>
            `).join('');
        } else {
            notesList.innerHTML = '<p>No notes uploaded yet.</p>';
        }
    }

    displayStudents(students) {
        const studentsList = document.getElementById('students-list');
        if (studentsList && students.length > 0) {
            studentsList.innerHTML = students.map(student => `
                <div class="student-item">
                    <div class="student-info">
                        <span class="student-name">${student.name}</span>
                        <span class="student-email">${student.email}</span>
                    </div>
                    <div class="student-stats">
                        <span class="stat">Attendance: ${student.attendance || '0'}%</span>
                        <span class="stat">Tests: ${student.test_count || '0'}</span>
                    </div>
                </div>
            `).join('');
        } else {
            studentsList.innerHTML = '<p>No students found.</p>';
        }
    }

    displayNotices(notices) {
        const noticesList = document.getElementById('notices-list');
        if (noticesList && notices.length > 0) {
            noticesList.innerHTML = notices.map(notice => `
                <div class="notice-item">
                    <div class="notice-header">
                        <span class="notice-title">${notice.title}</span>
                        <span class="notice-date">${new Date(notice.posted_at).toLocaleDateString()}</span>
                    </div>
                    <p class="notice-content">${notice.content}</p>
                    <button class="btn btn-small btn-outline" onclick="deleteNotice('${notice._id}')">Delete</button>
                </div>
            `).join('');
        } else {
            noticesList.innerHTML = '<p>No notices posted yet.</p>';
        }
    }

    displayZoomLink(zoomData) {
        const zoomDisplay = document.getElementById('current-zoom-link');
        if (zoomData) {
            zoomDisplay.innerHTML = `
                <div class="zoom-info">
                    <h4>Current Zoom Link</h4>
                    <p><strong>URL:</strong> ${zoomData.url}</p>
                    <p><strong>Meeting ID:</strong> ${zoomData.meeting_id || 'Not set'}</p>
                    <p><strong>Password:</strong> ${zoomData.password || 'Not set'}</p>
                    <p><strong>Scheduled:</strong> ${zoomData.scheduled_time ? new Date(zoomData.scheduled_time).toLocaleString() : 'Not set'}</p>
                </div>
            `;
        } else {
            zoomDisplay.innerHTML = '<p>No Zoom link set yet.</p>';
        }
    }

    displayTests(tests) {
        const testsList = document.getElementById('tests-list');
        if (testsList && testsList.length > 0) {
            testsList.innerHTML = tests.map(test => `
                <div class="test-item">
                    <div class="test-header">
                        <span class="test-title">${test.title}</span>
                        <span class="test-date">${new Date(test.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="test-desc">${test.description || 'No description'}</p>
                    <p><strong>Start:</strong> ${new Date(test.start_time).toLocaleString()}</p>
                    <p><strong>End:</strong> ${new Date(test.end_time).toLocaleString()}</p>
                    <button class="btn btn-small btn-outline" onclick="deleteTest('${test._id}')">Delete</button>
                </div>
            `).join('');
        } else {
            testsList.innerHTML = '<p>No tests created yet.</p>';
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    addQuestion() {
        const questionsList = document.getElementById('questions-list');
        const questionCount = questionsList.children.length;
        
        const newQuestion = document.createElement('div');
        newQuestion.className = 'question-item';
        newQuestion.innerHTML = `
            <div class="question-header">
                <span>Question ${questionCount + 1}</span>
                <button class="btn btn-small btn-outline" onclick="removeQuestion(this)">Remove</button>
            </div>
            <div class="question-body">
                <input type="text" placeholder="Enter question" class="question-input">
                <input type="text" placeholder="Enter answer" class="question-input">
            </div>
        `;
        
        questionsList.appendChild(newQuestion);
    }

    removeQuestion(element) {
        element.remove();
        // Update question numbers
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((q, index) => {
            const header = q.querySelector('.question-header span');
            if (header) {
                header.textContent = `Question ${index + 1}`;
            }
        });
    }
}

// Global function for navigation
function showSection(section) {
    if (window.teacherDashboard) {
        window.teacherDashboard.showSection(section);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.teacherDashboard = new TeacherDashboard();
});
