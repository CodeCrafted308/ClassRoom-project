function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.add('active');
    event.target.classList.add('active');
    
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
}

// Notes
async function loadNotes() {
    try {
        const response = await fetch('/api/student/notes');
        const notes = await response.json();
        
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            notesList.innerHTML = '<p>No notes available yet.</p>';
            return;
        }
        
        notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <h4>${note.title}</h4>
                <p><strong>Subject:</strong> ${note.subject}</p>
                <p>${note.description || 'No description'}</p>
                <p class="meta">Uploaded: ${new Date(note.uploaded_at).toLocaleString()}</p>
                <div class="note-actions">
                    <a href="/api/student/download/${note.filename}" class="btn btn-primary" download>Download</a>
                </div>
            `;
            notesList.appendChild(noteItem);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

// Records
async function loadRecords() {
    try {
        const response = await fetch('/api/student/records');
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
        const response = await fetch('/api/student/notices');
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
        const response = await fetch('/api/student/zoom-link');
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
        const response = await fetch('/api/student/tests');
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

