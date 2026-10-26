const test = require("node:test")
const assert = require("node:assert/strict")
const { parseTaskKey } = require("../src/utils/preparationTask")

const plan = [
    { day: 1, tasks: ["Read role requirements", "Practice questions"] },
    { day: 2, tasks: ["Review skill gaps"] }
]

test("parses an existing task key", () => {
    assert.deepEqual(parseTaskKey("2:0", plan), { dayNumber: 2, taskIndex: 0 })
})

test("rejects a task index outside the plan", () => {
    assert.equal(parseTaskKey("1:4", plan), null)
})

test("rejects malformed task keys", () => {
    for (const value of ["x:0", "1:-1", "1:0:2", "", null, 12]) assert.equal(parseTaskKey(value, plan), null)
})
