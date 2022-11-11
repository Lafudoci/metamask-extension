const { runCommand, runInShell } = require('../development/lib/run-command');

const { CIRCLE_NODE_INDEX, CIRCLE_NODE_TOTAL } = process.env;

const circleNodeIndex = parseInt(CIRCLE_NODE_INDEX ?? '0', 10);
const circleNodeTotal = parseInt(CIRCLE_NODE_TOTAL ?? '1', 10);

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function start() {
  // We use jest's new 'shard' feature to run tests, overridding
  // the coverageReporters, and coverageThreshold so that each process
  // does not error out due to lacking global coverage.
  await runInShell('yarn', [
    'jest',
    '--config=./jest.config.js',
    '--coverageReporters="json"',
    '--coverage',
    '--maxWorkers=2',
    '--coverageThreshold={}',
    `--shard=${circleNodeIndex + 1}/${circleNodeTotal}`,
  ]);
  // Once done we rename the file so that its indexed by the job number.
  await runCommand('mv', [
    './jest-coverage/main/coverage-final.json',
    `./jest-coverage/main/coverage-final-${circleNodeIndex}.json`,
  ]);
}
