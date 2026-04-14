let selectedTeacher = null;

// Global functions that can be called from HTML
window.showSection = function(section) {
    console.log('Showing section:', section);
    
    // Hide all dashboard sections
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Set active button
    const activeBtn = document.querySelector(`[onclick="showSection('${section}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load data when section is shown
    if (section === 'notes') {
        loadNotes();
    } else if (section === 'records') {
        loadRecords();
    } else if (section === 'notices') {
        loadNotices();
    } else if (section === 'zoom') {
        loadZoomLink();
    } else if (section === 'tests') {
        loadTests();
    }
};

window.selectTeacher = function(teacherId) {
    console.log('Selecting teacher:', teacherId);
    selectedTeacher = teacherId;
    
    // Update UI to show selected teacher
    document.querySelectorAll('.teacher-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-teacher-id="${teacherId}"]`);
    console.log('Selected item:', selectedItem);
    
    if (selectedItem) {
        selectedItem.classList.add('selected');
        
        // Show message with teacher name
        const teacherName = selectedItem.querySelector('.teacher-name');
        if (teacherName) {
            showMessage(`Selected teacher: ${teacherName.textContent}`, 'success');
        }
        
        // Reload all sections with teacher filter
        setTimeout(() => {
            loadNotes();
            loadRecords();
            loadNotices();
            loadZoomLink();
            loadTests();
        }, 100);
    } else {
        showMessage('Error selecting teacher', 'error');
    }
};

// Load Teachers
async function loadTeachers() {
    try {
        console.log('Loading teachers...');
        const response = await fetch('/api/student/teachers');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const teachers = await response.json();
        console.log('Teachers loaded:', teachers);
        
        const teacherList = document.getElementById('teacher-list');
        if (!teacherList) {
            console.error('Teacher list element not found');
            return;
        }
        
        teacherList.innerHTML = '';
        
        if (!teachers || teachers.length === 0) {
            teacherList.innerHTML = '<p>No teachers available.</p>';
            return;
        }
        
        teachers.forEach((teacher, index) => {
            const teacherItem = document.createElement('div');
            teacherItem.className = 'teacher-item';
            teacherItem.setAttribute('data-teacher-id', teacher._id);
            teacherItem.onclick = () => selectTeacher(teacher._id);
            
            teacherItem.innerHTML = `
                <div class="teacher-avatar">👨‍🏫</div>
                <div class="teacher-name">${teacher.name || 'Unknown'}</div>
                <div class="teacher-subject">${teacher.subject || 'General'}</div>
            `;
            
            teacherList.appendChild(teacherItem);
        });
        
        // Select first teacher by default
        if (teachers.length > 0) {
            console.log('Auto-selecting first teacher:', teachers[0]._id);
            setTimeout(() => selectTeacher(teachers[0]._id), 100);
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        const teacherList = document.getElementById('teacher-list');
        if (teacherList) {
            teacherList.innerHTML = '<p>Error loading teachers. Please refresh the page.</p>';
        }
    }
}

// Notes
async function loadNotes() {
    try {
        console.log('Loading notes for teacher:', selectedTeacher);
        const url = selectedTeacher ? `/api/student/notes?teacher=${selectedTeacher}` : '/api/student/notes';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const notes = await response.json();
        console.log('Notes loaded:', notes);
        
        const notesList = document.getElementById('notes-list');
        if (!notesList) {
            console.error('Notes list element not found');
            return;
        }
        
        notesList.innerHTML = '';
        
        if (!notes || notes.length === 0) {
            notesList.innerHTML = `<p>No notes available${selectedTeacher ? ' for selected teacher' : ' yet'}.</p>`;
            return;
        }
        
        notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <h4>${note.title || 'Untitled Note'}</h4>
                <p><strong>Subject:</strong> ${note.subject || 'General'}</p>
                <p>${note.description || 'No description'}</p>
                <p class="meta">Uploaded: ${note.uploaded_at ? new Date(note.uploaded_at).toLocaleString() : 'Unknown'}</p>
                <div class="note-actions">
                    <a href="/api/student/download/${note.filename || note._id}" class="btn btn-primary" download>Download</a>
                </div>
            `;
            notesList.appendChild(noteItem);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
        const notesList = document.getElementById('notes-list');
        if (notesList) {
            notesList.innerHTML = '<p>Error loading notes. Please try again.</p>';
        }
    }
}

// Records
async function loadRecords() {
    try {
        const url = selectedTeacher ? `/api/student/records?teacher=${selectedTeacher}` : '/api/student/records';
        const response = await fetch(url);
        const record = await response.json();
        
        const recordsContent = document.getElementById('records-content');
        
        if (!record || Object.keys(record).length === 0) {
            recordsContent.innerHTML = '<p>No records available yet.</p>';
            return;
        }
        
        let html = '';
        
        if (record.test_scores && record.test_scores.length > 0) {
            html += '<h3>Test Scores</h3><ul>';
            record.test_scores.forEach(score => {
                html += `<li><strong>${score.test}:</strong> ${score.score}</li>`;
            });
            html += '</ul>';
        }
        
        if (record.attendance && record.attendance.length > 0) {
            html += '<h3>Attendance</h3><ul>';
            record.attendance.forEach(att => {
                html += `<li><strong>${att.date}:</strong> ${att.status}</li>`;
            });
            html += '</ul>';
        }
        
        if (record.notes) {
            html += `<h3>Notes</h3><p>${record.notes}</p>`;
        }
        
        if (!html) {
            html = '<p>No records available yet.</p>';
        }
        
        recordsContent.innerHTML = html;
    } catch (error) {
        console.error('Error loading records:', error);
    }
}

// Notices
async function loadNotices() {
    try {
        const url = selectedTeacher ? `/api/student/notices?teacher=${selectedTeacher}` : '/api/student/notices';
        const response = await fetch(url);
        const notices = await response.json();
        
        const noticesList = document.getElementById('notices-list');
        noticesList.innerHTML = '';
        
        if (notices.length === 0) {
            noticesList.innerHTML = '<p>No notices available yet.</p>';
            return;
        }
        
        notices.forEach(notice => {
            const noticeItem = document.createElement('div');
            noticeItem.className = 'notice-item';
            noticeItem.innerHTML = `
                <h4>${notice.title}</h4>
                <p>${notice.content}</p>
                <p class="meta">Posted: ${new Date(notice.posted_at).toLocaleString()}</p>
            `;
            noticesList.appendChild(noticeItem);
        });
    } catch (error) {
        console.error('Error loading notices:', error);
    }
}

// Zoom Link
async function loadZoomLink() {
    try {
        const url = selectedTeacher ? `/api/student/zoom-link?teacher=${selectedTeacher}` : '/api/student/zoom-link';
        const response = await fetch(url);
        const zoomLink = await response.json();
        
        const zoomContent = document.getElementById('zoom-content');
        
        if (zoomLink && zoomLink.url) {
            zoomContent.innerHTML = `
                <h3>Current Zoom Class</h3>
                <p><strong>Meeting URL:</strong></p>
                <a href="${zoomLink.url}" target="_blank" class="zoom-link">Join Zoom Meeting</a>
                ${zoomLink.meeting_id ? `<p><strong>Meeting ID:</strong> ${zoomLink.meeting_id}</p>` : ''}
                ${zoomLink.password ? `<p><strong>Password:</strong> ${zoomLink.password}</p>` : ''}
                ${zoomLink.scheduled_time ? `<p><strong>Scheduled Time:</strong> ${new Date(zoomLink.scheduled_time).toLocaleString()}</p>` : ''}
                <p class="meta">Posted: ${new Date(zoomLink.created_at).toLocaleString()}</p>
            `;
        } else {
            zoomContent.innerHTML = '<p>No zoom class link available yet.</p>';
        }
    } catch (error) {
        console.error('Error loading zoom link:', error);
    }
}

// Tests
let currentTest = null;

async function loadTests() {
    try {
        const url = selectedTeacher ? `/api/student/tests?teacher=${selectedTeacher}` : '/api/student/tests';
        const response = await fetch(url);
        const tests = await response.json();
        
        const testsList = document.getElementById('tests-list');
        testsList.innerHTML = '';
        
        if (tests.length === 0) {
            testsList.innerHTML = '<p>No active tests available.</p>';
            return;
        }
        
        tests.forEach(test => {
            const testItem = document.createElement('div');
            testItem.className = 'test-item';
            const startTime = new Date(test.start_time);
            const endTime = new Date(test.end_time);
            
            testItem.innerHTML = `
                <h4>${test.title}</h4>
                <p>${test.description || 'No description'}</p>
                <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
                <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
                <p><strong>Questions:</strong> ${test.questions.length}</p>
                ${test.submitted ? 
                    `<p style="color: green;"><strong>Status:</strong> Submitted (Score: ${test.score}/${test.questions.length})</p>` :
                    `<button class="btn btn-primary" onclick="startTest('${test._id}')">Take Test</button>`
                }
            `;
            testsList.appendChild(testItem);
        });
    } catch (error) {
        console.error('Error loading tests:', error);
    }
}

async function startTest(testId) {
    try {
        const response = await fetch('/api/student/tests');
        const tests = await response.json();
        currentTest = tests.find(t => t._id === testId);
        
        if (!currentTest) {
            alert('Test not found');
            return;
        }
        
        if (currentTest.submitted) {
            alert('You have already submitted this test');
            return;
        }
        
        // Display test in modal
        const modal = document.getElementById('test-modal');
        const modalTitle = document.getElementById('test-modal-title');
        const modalContent = document.getElementById('test-modal-content');
        
        modalTitle.textContent = currentTest.title;
        
        let testHtml = `<p>${currentTest.description || ''}</p>`;
        testHtml += `<p><strong>Time Remaining:</strong> <span id="time-remaining"></span></p>`;
        
        currentTest.questions.forEach((question, index) => {
            testHtml += `
                <div class="test-question">
                    <h4>Question ${index + 1}: ${question.question}</h4>
                    ${question.options.map((option, optIndex) => `
                        <div class="test-option">
                            <input type="radio" name="answer-${index}" id="q${index}-opt${optIndex}" value="${optIndex}">
                            <label for="q${index}-opt${optIndex}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        modalContent.innerHTML = testHtml;
        modal.style.display = 'block';
        
        // Start countdown
        startCountdown(new Date(currentTest.end_time));
    } catch (error) {
        alert('Error loading test');
    }
}

function startCountdown(endTime) {
    const updateCountdown = () => {
        const now = new Date();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
            document.getElementById('time-remaining').textContent = 'Time expired!';
            setTimeout(() => {
                submitTest();
            }, 1000);
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        document.getElementById('time-remaining').textContent = 
            `${hours}h ${minutes}m ${seconds}s`;
    };
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function closeTestModal() {
    document.getElementById('test-modal').style.display = 'none';
    currentTest = null;
}

async function submitTest() {
    if (!currentTest) return;
    
    const answers = {};
    currentTest.questions.forEach((question, index) => {
        const selected = document.querySelector(`input[name="answer-${index}"]:checked`);
        if (selected) {
            answers[index] = parseInt(selected.value);
        }
    });
    
    if (Object.keys(answers).length !== currentTest.questions.length) {
        if (!confirm('You have not answered all questions. Submit anyway?')) {
            return;
        }
    }
    
    try {
        const response = await fetch(`/api/student/tests/${currentTest._id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers })
        });
        
        const data = await response.json();
        if (data.success) {
            alert(`Test submitted! Your score: ${data.score}/${data.total}`);
            closeTestModal();
            loadTests();
        } else {
            alert('Error: ' + (data.error || 'Failed to submit test'));
        }
    } catch (error) {
        alert('An error occurred while submitting the test.');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('test-modal');
    if (event.target == modal) {
        closeTestModal();
    }
}

// Show message function
function showMessage(message, type) {
    console.log('Showing message:', message, type);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add basic styling
    messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        animation: fadeInUp 0.3s ease-out;
    `;
    
    // Insert at top of container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
    } else {
        document.body.insertBefore(messageDiv, document.body.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Update debug information
function updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    const debugTeacher = document.getElementById('debug-teacher');
    const debugStatus = document.getElementById('debug-status');
    
    if (debugInfo) debugInfo.textContent = 'Functions loaded';
    if (debugTeacher) debugTeacher.textContent = selectedTeacher || 'None';
    if (debugStatus) debugStatus.textContent = 'Ready';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Student dashboard loaded');
    
    // Update debug info
    updateDebugInfo();
    
    // Load teachers first
    loadTeachers().then(() => {
        console.log('Teachers loaded successfully');
        updateDebugInfo();
    }).catch(error => {
        console.error('Failed to load teachers:', error);
        const debugStatus = document.getElementById('debug-status');
        if (debugStatus) debugStatus.textContent = 'Error: ' + error.message;
    });
    
    // Load initial section
    showSection('notes');
});
