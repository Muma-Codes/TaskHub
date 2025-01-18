function TaskCompletionStatus({tasks, selectedCategoryId}){

    // Calculate completion statistics
    const calculateStats=()=>{
        const relevantTasks=selectedCategoryId ? tasks.filter( task => task.category.id === selectedCategoryId) : tasks;
        const totalTasks=relevantTasks.length;
        const completedTasks=relevantTasks.filter(task=>task.is_complete).length;
        const completionPercentage=totalTasks===0 ? 0 : Math.round((completedTasks/totalTasks) * 100);

        return {
            total: totalTasks,
            completed: completedTasks,
            percentage: completionPercentage
        };
    };
    const stats=calculateStats();

    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">Task Completion Status</h4>
                    <span className="text-sm text-gray-500">Completed: {stats.completed} of {stats.total} tasks</span>
                </div>
                <div className="space-y-2">
                    <span className="text-sm text-gray-500">{stats.percentage}% Completed</span>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-black rounded-full transition-all duration-300"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>                
            </div>
        </div>
    );
} 
export default TaskCompletionStatus;
