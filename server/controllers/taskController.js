const Task = require('../models/Task');
const TaskItem = require('../models/TaskItem');
const User = require('../models/User');
const UserTask = require('../models/UserTask');
const UserTaskItem = require('../models/UserTaskItem');

const getTasks = async (req, res) => {
    const { category } = req.params;
    const { userId } = req.query;

    // try {
        // Filter tasks by category and status
        let tasks = await Task.find({ category, status: 1 });

        // Sort tasks based on category using switch-case
        switch (category) {
            case 'Leagues':
                tasks.sort((a, b) => a.league - b.league);
                break;
            case 'Ref':
                tasks.sort((a, b) => a.ref - b.ref);
                break;
            case 'Special':
            case 'Cinema':
                tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                // Handle unknown category if needed
                break;
        }

        const tasksWithUserTask = await Promise.all(tasks.map(async (task) => {
            const userTask = await UserTask.findOne({ userId, taskId: task._id });
            return {
                ...task.toObject(),
                userTask: userTask ? userTask.toObject() : null,
            };
        }));

        res.json(tasksWithUserTask);
    // } catch (error) {
    //     console.error('Error fetching tasks:', error);
    //     res.status(500).json({ message: 'Server error', error });
    // }
};


const createTask = async (req, res) => {
    const { type, title, coins, description } = req.body;
    try {
        const task = new Task({ type, title, coins, description });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(400).json({ message: 'Error creating task', error });
    }
};

const getTaskDetails = async (req, res) => {
    const { taskId } = req.params;
    const { userId } = req.query; // Assuming userId is passed as a query parameter

    try {
        const taskPromise = Task.findById(taskId);
        const taskItemsPromise = TaskItem.find({ taskId });
        const userTaskPromise = UserTask.findOne({ userId, taskId });

        const [task, taskItems, userTask] = await Promise.all([taskPromise, taskItemsPromise, userTaskPromise]);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Fetch the UserTaskItems for the user and the task
        const userTaskItems = await UserTaskItem.find({ userId, taskId });

        // Combine task items with user task items to include watched status and watchedAt timestamp
        const taskItemsWithStatus = taskItems.map(taskItem => {
            const userTaskItem = userTaskItems.find(uti => uti.taskItemId.toString() === taskItem._id.toString());
            return {
                ...taskItem.toObject(),
                itemStatus: userTaskItem ,
                watchedAt: userTaskItem ? userTaskItem.watchedAt : null
            };
        });

        res.json({ task, taskItems: taskItemsWithStatus, userTask });
    } catch (error) {
        console.error('Error fetching task details:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const startTask = async (req, res) => {
    const { userId, taskId } = req.body;

    // Validate request body
    if (!userId || !taskId) {
        return res.status(400).json({ message: 'userId and taskId are required' });
    }

    try {
        // Check if the record already exists
        let userTask = await UserTask.findOne({ userId, taskId });

        if (userTask) {
            // If the record exists, update it
            userTask.status = 'started';
            await userTask.save();
            res.status(200).json({ message: 'Task updated' });
        } else {
            // If the record does not exist, create a new one
            userTask = new UserTask({
                userId,
                taskId,
                status: 'started',
                startedAt: new Date(),
            });
            await userTask.save();
            res.status(200).json({ message: 'Task started' });
        }
    } catch (error) {
        console.error('Error starting task:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const watchTaskItem = async (req, res) => {
    const { userId, taskId, taskItemId } = req.body;

    // Validate request body
    if (!userId || !taskId || !taskItemId) {
        return res.status(400).json({ message: 'userId, taskId, and taskItemId are required' });
    }

    try {
        // Check if the record already exists
        let userTaskItem = await UserTaskItem.findOne({ userId, taskId, taskItemId });

        if (userTaskItem) {
            // If the record exists, update it
            userTaskItem.status = 'watched';
            await userTaskItem.save();
            res.status(200).json({ message: 'Item Task updated' });
        } else {
            // If the record does not exist, create a new one
            userTaskItem = new UserTaskItem({
                userId,
                taskId,
                taskItemId,
                status: 'watched',
                watchedAt: new Date(),
            });
            await userTaskItem.save();
            res.status(200).json({ message: 'Item Task started' });
        }
    } catch (error) {
        console.error('Error watching task item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateUserTaskItemStatus = async (req, res) => {
    const { userId, taskItemId } = req.body;

    // Validate request body
    if (!userId || !taskItemId) {
        return res.status(400).json({ message: 'userId, taskId, and taskItemId are required' });
    }

    try {
        // Check if the record already exists
        let userTaskItem = await UserTaskItem.findOne({ userId, taskItemId });

        if (userTaskItem) {
            // If the record exists, update it
            userTaskItem.status = 'done';
            await userTaskItem.save();
            res.status(200).json(userTaskItem);
        }
        res.status(500).json({ message: 'Server error', error });
    } catch (error) {
        console.error('Error watching task item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const completeTaskItem = async (req, res) => {
    const { userId, taskId } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userTask = await UserTask.findOne({ userId, taskId });
        if (!userTask) {
            return res.status(404).json({ message: 'UserTask not found' });
        }

        if (userTask.status === 'started'){
            user.coins += task.coins;
            await user.save();

            userTask.status = 'completed';
            userTask.completedAt = new Date();
            await userTask.save();
        }

        res.status(200).json({ message: 'Task item completed' });
    } catch (error) {
        console.error('Error completing task item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const checkTaskStatus = async (req, res) => {
    const { userId, taskItemId } = req.body;

    try {
        // Fetch the user task item
        const userTaskItem = await UserTaskItem.findOne({ userId, taskItemId });
        if (!userTaskItem) {
            return res.status(404).json({ message: 'User task item not found' });
        }

        // Fetch the task item
        const taskItem = await TaskItem.findById(userTaskItem.taskItemId);
        if (!taskItem) {
            return res.status(404).json({ message: 'Task item not found' });
        }

        const watchedAt = new Date(userTaskItem.watchedAt);
        const watchedAtTime = watchedAt.getTime();
        const taskTime = taskItem.time * 1000; // Convert seconds to milliseconds
        const targetTime = new Date(watchedAtTime + taskTime);

        const currentTime = new Date();

        if (
            userTaskItem.status === 'watched' &&
            taskItem.isSocial === 1 &&
            taskItem.isTelegram === 0 &&
            currentTime > targetTime
        ) {
            // Update status to completed
            userTaskItem.status = 'done';
            userTaskItem.completedAt = currentTime;
            await userTaskItem.save();


            return res.status(200).json(userTaskItem);
        }

        if (taskItem.isTelegram === 1 &&
            currentTime > targetTime) {

            userTaskItem.status = 'done';
            userTaskItem.completedAt = currentTime;
            await userTaskItem.save();
            return res.status(200).json(userTaskItem );
        }

        return res.status(200).json(userTaskItem);
    } catch (error) {
        console.error('Error checking task status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const claimTaskReward = async (req, res) => {
    const { userId, taskId, tab, referredCount } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let userTask = await UserTask.findOne({ userId, taskId });

        if (!userTask) {
            // If the record does not exist, create a new one
            userTask = new UserTask({
                userId,
                taskId,
                status: 'completed',
                completedAt: new Date(),
            });
            await userTask.save();

            let canClaim = false;
            if (tab === 'Leagues' && user.coins >= task.coins) {
                canClaim = true;
            } else if (tab === 'Ref' && referredCount >= task.ref) {
                canClaim = true;
            }

            if (canClaim) {
                user.coins += task.coins;
                await user.save();
                return res.status(200).json({ message: 'Reward claimed', user });
            }
        }

        return res.status(400).json({ message: 'Cannot claim reward' });
    } catch (error) {
        console.error('Error claiming task reward:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getUserTasks = async (req, res) => {
    const { userId } = req.params;
    try {
        const userTasks = await UserTask.find({ userId })
            .populate('taskId')
            .exec();

        res.json(userTasks);
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getTasks,
    createTask,
    getTaskDetails,
    startTask,
    completeTaskItem,
    checkTaskStatus,
    getUserTasks,
    watchTaskItem,
    updateUserTaskItemStatus,
    claimTaskReward
};
