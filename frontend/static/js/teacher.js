let currentTest = null;
let questionCount = 0;

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data when section is shown
    if (section === 'notes') {
        loadNotes();
    } else if (section === 'students') {
        loadStudents();
    } else if (section === 'notices') {
        loadNotices();
    } else if (section === 'zoom') {
        loadZoomLink();
    } else if (section === 'tests') {
        loadTests();
    }
}

// Notes Management
document.getElementById('uploadNoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', document.getElementById('note-file').files[0]);
    formData.append('title', document.getElementById('note-title').value);
    formData.append('subject', document.getElementById('note-subject').value);
    formData.append('description', document.getElementById('note-description').value);
    
    try {
        const response = await fetch('/api/teacher/notes', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Note uploaded successfully!');
            document.getElementById('uploadNoteForm').reset();
            loadNotes();
        } else {
            alert('Error: ' + (data.error || 'Failed to upload note'));
        }
    } catch (error) {
        alert('An error occurred while uploading the note.');
    }
});

async function loadNotes() {
    try {
        const response = await fetch('/api/teacher/notes');
        const notes = await response.json();
        
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            notesList.innerHTML = '<p>No notes uploaded yet.</p>';
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
                    <button class="btn btn-danger" onclick="deleteNote('${note._id}')">Delete</button>
                </div>
            `;
            notesList.appendChild(noteItem);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`/api/teacher/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
            loadNotes();
        } else {
            alert('Error deleting note');
        }
    } catch (error) {
        alert('An error occurred while deleting the note.');
    }
}

// Student Records
async function loadStudents() {
    try {
        const response = await fetch('/api/teacher/students');
        const students = await response.json();
        
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = '';
        
        if (students.length === 0) {
            studentsList.innerHTML = '<p>No students registered yet.</p>';
            return;
        }
        
        students.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            studentItem.innerHTML = `
                <h4>${student.name}</h4>
                <p>Email: ${student.email}</p>
                <button class="btn btn-primary" onclick="toggleStudentDetails('${student._id}')">View/Edit Records</button>
                <div id="details-${student._id}" class="student-details">
                    <h4>Student Records</h4>
                    <form class="record-form" onsubmit="updateStudentRecord(event, '${student._id}')">
                        <div class="form-group">
                            <label>Test Scores (JSON format: [{"test": "Test 1", "score": 85}])</label>
                            <textarea id="scores-${student._id}">${JSON.stringify(student.records?.test_scores || [], null, 2)}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Attendance (JSON format: [{"date": "2024-01-15", "status": "present"}])</label>
                            <textarea id="attendance-${student._id}">${JSON.stringify(student.records?.attendance || [], null, 2)}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea id="notes-${student._id}">${student.records?.notes || ''}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Records</button>
                    </form>
                </div>
            `;
            studentsList.appendChild(studentItem);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function toggleStudentDetails(studentId) {
    const details = document.getElementById(`details-${studentId}`);
    details.classList.toggle('active');
}

async function updateStudentRecord(e, studentId) {
    e.preventDefault();
    
    try {
        const testScores = JSON.parse(document.getElementById(`scores-${studentId}`).value);
        const attendance = JSON.parse(document.getElementById(`attendance-${studentId}`).value);
        const notes = document.getElementById(`notes-${studentId}`).value;
        
        const response = await fetch(`/api/teacher/student-records/${studentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test_scores: testScores,
                attendance: attendance,
                notes: notes
            })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Records updated successfully!');
            loadStudents();
        } else {
            alert('Error updating records');
        }
    } catch (error) {
        alert('Error: Invalid JSON format or other error occurred.');
    }
}

// Notices
document.getElementById('noticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;
    
    try {
        const response = await fetch('/api/teacher/notices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Notice posted successfully!');
            document.getElementById('noticeForm').reset();
            loadNotices();
        } else {
            alert('Error posting notice');
        }
    } catch (error) {
        alert('An error occurred while posting the notice.');
    }
});

async function loadNotices() {
    try {
        const response = await fetch('/api/teacher/notices');
        const notices = await response.json();
        
        const noticesList = document.getElementById('notices-list');
        noticesList.innerHTML = '';
        
        if (notices.length === 0) {
            noticesList.innerHTML = '<p>No notices posted yet.</p>';
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
document.getElementById('zoomForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('zoom-url').value;
    const meetingId = document.getElementById('zoom-meeting-id').value;
    const password = document.getElementById('zoom-password').value;
    const scheduledTime = document.getElementById('zoom-time').value;
    
    try {
        const response = await fetch('/api/teacher/zoom-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, meeting_id: meetingId, password, scheduled_time: scheduledTime })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Zoom link set successfully!');
            document.getElementById('zoomForm').reset();
            loadZoomLink();
        } else {
            alert('Error setting zoom link');
        }
    } catch (error) {
        alert('An error occurred while setting the zoom link.');
    }
});

async function loadZoomLink() {
    try {
        const response = await fetch('/api/teacher/zoom-link');
        const zoomLink = await response.json();
        
        const zoomDisplay = document.getElementById('current-zoom-link');
        if (zoomLink && zoomLink.url) {
            zoomDisplay.innerHTML = `
                <h4>Current Zoom Link</h4>
                <p><strong>URL:</strong> <a href="${zoomLink.url}" target="_blank" class="zoom-link">Join Meeting</a></p>
                ${zoomLink.meeting_id ? `<p><strong>Meeting ID:</strong> ${zoomLink.meeting_id}</p>` : ''}
                ${zoomLink.password ? `<p><strong>Password:</strong> ${zoomLink.password}</p>` : ''}
                ${zoomLink.scheduled_time ? `<p><strong>Scheduled Time:</strong> ${new Date(zoomLink.scheduled_time).toLocaleString()}</p>` : ''}
                <p class="meta">Created: ${new Date(zoomLink.created_at).toLocaleString()}</p>
            `;
        } else {
            zoomDisplay.innerHTML = '<p>No zoom link set yet.</p>';
        }
    } catch (error) {
        console.error('Error loading zoom link:', error);
    }
}

// Test Management
function addQuestion() {
    questionCount++;
    const questionsList = document.getElementById('questions-list');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.id = `question-${questionCount}`;
    questionDiv.innerHTML = `
        <div class="form-group">
            <label>Question ${questionCount}</label>
            <input type="text" id="q-text-${questionCount}" placeholder="Enter question" required>
        </div>
        <div class="form-group">
            <label>Options</label>
            <div class="option-input">
                <input type="radio" name="correct-${questionCount}" value="0" required>
                <input type="text" id="q-opt0-${questionCount}" placeholder="Option A" required>
            </div>
            <div class="option-input">
                <input type="radio" name="correct-${questionCount}" value="1" required>
                <input type="text" id="q-opt1-${questionCount}" placeholder="Option B" required>
            </div>
            <div class="option-input">
                <input type="radio" name="correct-${questionCount}" value="2" required>
                <input type="text" id="q-opt2-${questionCount}" placeholder="Option C" required>
            </div>
            <div class="option-input">
                <input type="radio" name="correct-${questionCount}" value="3" required>
                <input type="text" id="q-opt3-${questionCount}" placeholder="Option D" required>
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeQuestion(${questionCount})">Remove Question</button>
    `;
    questionsList.appendChild(questionDiv);
}

function removeQuestion(qNum) {
    const questionDiv = document.getElementById(`question-${qNum}`);
    questionDiv.remove();
}

document.getElementById('testForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const questions = [];
    const questionItems = document.querySelectorAll('.question-item');
    
    questionItems.forEach(item => {
        const qNum = item.id.split('-')[1];
        const questionText = document.getElementById(`q-text-${qNum}`).value;
        const options = [
            document.getElementById(`q-opt0-${qNum}`).value,
            document.getElementById(`q-opt1-${qNum}`).value,
            document.getElementById(`q-opt2-${qNum}`).value,
            document.getElementById(`q-opt3-${qNum}`).value
        ];
        const correctAnswer = document.querySelector(`input[name="correct-${qNum}"]:checked`).value;
        
        questions.push({
            question: questionText,
            options: options,
            correct_answer: parseInt(correctAnswer)
        });
    });
    
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    const title = document.getElementById('test-title').value;
    const description = document.getElementById('test-description').value;
    const startTime = document.getElementById('test-start-time').value;
    const endTime = document.getElementById('test-end-time').value;
    
    try {
        const response = await fetch('/api/teacher/tests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                questions,
                start_time: startTime,
                end_time: endTime
            })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Test created successfully!');
            document.getElementById('testForm').reset();
            document.getElementById('questions-list').innerHTML = '';
            questionCount = 0;
            loadTests();
        } else {
            alert('Error creating test');
        }
    } catch (error) {
        alert('An error occurred while creating the test.');
    }
});

async function loadTests() {
    try {
        const response = await fetch('/api/teacher/tests');
        const tests = await response.json();
        
        const testsList = document.getElementById('tests-list');
        testsList.innerHTML = '';
        
        if (tests.length === 0) {
            testsList.innerHTML = '<p>No tests created yet.</p>';
            return;
        }
        
        tests.forEach(test => {
            const testItem = document.createElement('div');
            testItem.className = 'test-item';
            const startTime = new Date(test.start_time);
            const endTime = new Date(test.end_time);
            const now = new Date();
            const isActive = now >= startTime && now <= endTime;
            
            testItem.innerHTML = `
                <h4>${test.title}</h4>
                <p>${test.description || 'No description'}</p>
                <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
                <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
                <p><strong>Questions:</strong> ${test.questions.length}</p>
                <p><strong>Status:</strong> ${isActive ? '<span style="color: green;">Active</span>' : '<span style="color: red;">Inactive</span>'}</p>
                <div class="test-actions">
                    <button class="btn btn-primary" onclick="viewTestResults('${test._id}')">View Results</button>
                </div>
            `;
            testsList.appendChild(testItem);
        });
    } catch (error) {
        console.error('Error loading tests:', error);
    }
}

async function viewTestResults(testId) {
    try {
        const response = await fetch(`/api/teacher/tests/${testId}/results`);
        const results = await response.json();
        
        let resultsHtml = '<h3>Test Results</h3>';
        if (results.length === 0) {
            resultsHtml += '<p>No submissions yet.</p>';
        } else {
            results.forEach(result => {
                resultsHtml += `
                    <div class="test-item">
                        <p><strong>Student ID:</strong> ${result.student_id}</p>
                        <p><strong>Score:</strong> ${result.score}/${result.total}</p>
                        <p><strong>Submitted:</strong> ${new Date(result.submitted_at).toLocaleString()}</p>
                    </div>
                `;
            });
        }
        
        alert('Results:\n' + resultsHtml.replace(/<[^>]*>/g, '\n'));
    } catch (error) {
        alert('Error loading test results');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

