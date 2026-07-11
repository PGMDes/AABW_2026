import { validateAllDemoScenarios } from "../src/logic/validateDemoScenarios.js"

function formatValue(value) {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  return String(value)
}

function printResult(result) {
  const status = result.passed ? "PASS" : "FAIL"
  const actionText = result.action ? ` | action: ${result.action}` : ""

  console.log(
    `[${status}] ${result.label} (${result.taskId}${actionText})`,
  )

  if (result.passed) {
    return
  }

  result.checkDetails
    .filter((check) => !check.passed)
    .forEach((check) => {
      console.log(
        `  - ${check.field}: expected ${formatValue(check.expected)}, got ${formatValue(check.actual)}`,
      )
    })
}

function printGroup(title, results) {
  console.log("")
  console.log(title)
  console.log("-".repeat(title.length))
  results.forEach(printResult)
}

const summary = validateAllDemoScenarios()

console.log("SymbiontOS scenario validation")
printGroup("Baseline scenarios", summary.baseline)
printGroup("Human review decision scenarios", summary.humanReview)

console.log("")
console.log(
  `Result: ${summary.passedCount}/${summary.totalCount} scenarios passed`,
)

if (!summary.passed) {
  process.exitCode = 1
}
