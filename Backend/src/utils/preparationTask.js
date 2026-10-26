function parseTaskKey(taskKey, preparationPlan) {
    if (typeof taskKey !== "string" || !/^\d{1,3}:\d{1,3}$/.test(taskKey) || !Array.isArray(preparationPlan)) return null
    const [dayNumber, taskIndex] = taskKey.split(":").map(Number)
    const day = preparationPlan.find(item => item.day === dayNumber)
    if (!day || taskIndex < 0 || taskIndex >= day.tasks.length) return null
    return { dayNumber, taskIndex }
}

module.exports = { parseTaskKey }
