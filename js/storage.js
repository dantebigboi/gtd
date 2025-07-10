// Storage functions for tasks and projects

// Tasks
function getTasks() {
    const tasks = localStorage.getItem('gtd-tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('gtd-tasks', JSON.stringify(tasks));
}

function addTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
}

function updateTask(index, updatedTask) {
    const tasks = getTasks();
    if (index >= 0 && index < tasks.length) {
        tasks[index] = updatedTask;
        saveTasks(tasks);
    }
}

function deleteTask(index) {
    const tasks = getTasks();
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1);
        saveTasks(tasks);
    }
}

// Projects
function getProjects() {
    const projects = localStorage.getItem('gtd-projects');
    return projects ? JSON.parse(projects) : [];
}

function saveProjects(projects) {
    localStorage.setItem('gtd-projects', JSON.stringify(projects));
}

function addProject(name) {
    const projects = getProjects();
    if (!projects.some(p => p.name === name)) {
        projects.push({ name });
        saveProjects(projects);
    }
}

function deleteProject(name) {
    let projects = getProjects();
    projects = projects.filter(p => p.name !== name);
    saveProjects(projects);
    
    // Remove project from tasks
    let tasks = getTasks();
    tasks = tasks.map(task => {
        if (task.project === name) {
            return { ...task, project: 'Inbox' };
        }
        return task;
    });
    saveTasks(tasks);
}
