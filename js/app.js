// Main application functions

// Task functions
function toggleTaskCompletion(index) {
    const tasks = getTasks();
    if (index >= 0 && index < tasks.length) {
        const task = tasks[index];
        const updatedTask = { ...task, completed: !task.completed };
        updateTask(index, updatedTask);
    }
}

function renderTask(task, index) {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    taskItem.innerHTML = `
        <div class="task-info">
            <h3>${task.title}</h3>
            ${task.project ? `<span class="project-tag">${task.project}</span>` : ''}
            ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
        </div>
        <div class="task-actions">
            <button class="complete-btn" onclick="toggleTaskCompletion(${index})">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="delete-btn" onclick="deleteTaskAndRefresh(${index})">Delete</button>
        </div>
    `;
    
    return taskItem;
}

function deleteTaskAndRefresh(index) {
    deleteTask(index);
    // Reload the current view
    if (window.location.pathname.includes('tasks.html')) {
        loadTasks();
    } else if (window.location.pathname.includes('today.html')) {
        loadTodayTasks();
    } else if (window.location.pathname.includes('upcoming.html')) {
        loadUpcomingTasks();
    } else if (window.location.pathname.includes('projects.html')) {
        // Projects page doesn't show tasks directly
    } else {
        loadRecentTasks();
    }
}

// Project functions
function renderProject(project) {
    const projectItem = document.createElement('li');
    projectItem.className = 'project-item';
    
    projectItem.innerHTML = `
        <div class="project-info">
            <h3>${project.name}</h3>
        </div>
        <div class="project-actions">
            <button class="delete-btn" onclick="deleteProjectAndRefresh('${project.name}')">Delete</button>
        </div>
    `;
    
    return projectItem;
}

function deleteProjectAndRefresh(name) {
    deleteProject(name);
    loadProjects();
}

// View loading functions
function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const projectFilter = document.getElementById('project-filter')?.value || 'all';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    
    let tasks = getTasks();
    
    // Apply filters
    if (projectFilter !== 'all') {
        tasks = tasks.filter(task => task.project === projectFilter);
    }
    
    if (statusFilter !== 'all') {
        tasks = tasks.filter(task => 
            statusFilter === 'completed' ? task.completed : !task.completed
        );
    }
    
    if (tasks.length === 0) {
        container.innerHTML = '<p>No tasks found.</p>';
        return;
    }
    
    tasks.forEach((task, index) => {
        container.appendChild(renderTask(task, index));
    });
}

function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const projects = getProjects();
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found. Add your first project!</p>';
        return;
    }
    
    projects.forEach(project => {
        container.appendChild(renderProject(project));
    });
}

function loadTodayTasks() {
    const container = document.getElementById('today-tasks-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let tasks = getTasks().filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate.split('T')[0];
        return taskDate === todayString;
    });
    
    if (tasks.length === 0) {
        container.innerHTML = '<p>No tasks for today. Enjoy your day!</p>';
        return;
    }
    
    tasks.forEach((task, index) => {
        container.appendChild(renderTask(task, index));
    });
}

function loadUpcomingTasks() {
    const container = document.getElementById('upcoming-tasks-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let tasks = getTasks()
        .filter(task => task.dueDate && !task.completed)
        .filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= today;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (tasks.length === 0) {
        container.innerHTML = '<p>No upcoming tasks. Good job!</p>';
        return;
    }
    
    // Group by date
    const tasksByDate = {};
    tasks.forEach(task => {
        const dateStr = formatDate(task.dueDate, true);
        if (!tasksByDate[dateStr]) {
            tasksByDate[dateStr] = [];
        }
        tasksByDate[dateStr].push(task);
    });
    
    // Render each date group
    for (const [dateStr, dateTasks] of Object.entries(tasksByDate)) {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        
        const dateHeader = document.createElement('h3');
        dateHeader.className = 'date-header';
        dateHeader.textContent = dateStr;
        
        dateGroup.appendChild(dateHeader);
        
        const tasksList = document.createElement('ul');
        dateTasks.forEach((task, index) => {
            // Find the original index to ensure proper deletion
            const allTasks = getTasks();
            const originalIndex = allTasks.findIndex(t => 
                t.title === task.title && 
                t.dueDate === task.dueDate && 
                t.project === task.project
            );
            tasksList.appendChild(renderTask(task, originalIndex));
        });
        
        dateGroup.appendChild(tasksList);
        container.appendChild(dateGroup);
    }
}

function loadRecentTasks() {
    const container = document.getElementById('recent-tasks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    let tasks = getTasks()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (tasks.length === 0) {
        container.innerHTML = '<p>No recent tasks.</p>';
        return;
    }
    
    tasks.forEach((task, index) => {
        container.appendChild(renderTask(task, index));
    });
}

function updateDashboardStats() {
    const todayCount = document.getElementById('today-count');
    const upcomingCount = document.getElementById('upcoming-count');
    const projectsCount = document.getElementById('projects-count');
    
    if (todayCount) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        const count = getTasks().filter(task => 
            task.dueDate && 
            task.dueDate.split('T')[0] === todayString && 
            !task.completed
        ).length;
        todayCount.textContent = count;
    }
    
    if (upcomingCount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = getTasks()
            .filter(task => task.dueDate && !task.completed)
            .filter(task => new Date(task.dueDate) > today)
            .length;
        upcomingCount.textContent = count;
    }
    
    if (projectsCount) {
        projectsCount.textContent = getProjects().length;
    }
}

// Helper functions
function formatDate(dateString, includeWeekday = false) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        const options = includeWeekday 
            ? { weekday: 'long', month: 'short', day: 'numeric' }
            : { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

// Initialize with sample data if empty
function initializeSampleData() {
    if (getTasks().length === 0 && getProjects().length === 0) {
        // Add sample projects
        addProject('Work');
        addProject('Personal');
        addProject('Learning');
        
        // Add sample tasks
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        addTask({
            title: 'Set up GTD system',
            dueDate: today.toISOString(),
            project: 'Work',
            completed: false,
            createdAt: new Date().toISOString()
        });
        
        addTask({
            title: 'Read a book',
            dueDate: tomorrow.toISOString(),
            project: 'Personal',
            completed: false,
            createdAt: new Date().toISOString()
        });
        
        addTask({
            title: 'Learn JavaScript',
            dueDate: nextWeek.toISOString(),
            project: 'Learning',
            completed: false,
            createdAt: new Date().toISOString()
        });
    }
}

// Initialize when app.js loads
initializeSampleData();
