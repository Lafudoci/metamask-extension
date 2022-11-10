const { runCommand, runInShell } = require('../development/lib/run-command');

const { CIRCLE_NODE_INDEX, CIRCLE_NODE_TOTAL } = process.env;

const circleNodeIndex = parseInt(CIRCLE_NODE_INDEX ?? '0', 10);
const circleNodeTotal = parseInt(CIRCLE_NODE_TOTAL ?? '1', 10);

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function start() {
  if (circleNodeTotal === 1) {
    // Concurrently
  } else if (circleNodeIndex === 0) {
    // The first process is responsible for running some odd job tasks
    // First, run the development folders tests:
    await runInShell('yarn', [
      'jest',
      '--config=./development/jest.config.js',
      '--coverage',
      '--maxWorkers=2',
    ]);
    // The next two jobs are for running tests and coverage for subfolders,
    // which is difficult to do from an aggregate json file (may be able to
    // implement in a future iteration. Note that the formatting of the json
    // for coverageThreshold is the way it is to work with jest and may be
    // brittle so doing aggregate coverage computation is high priority.
    await runInShell('yarn', [
      'jest',
      '--config=./jest.config.js',
      '--coverage',
      '--maxWorkers=2',
      '--testMatch="<rootDir>/app/scripts/controllers/permissions/**/*.test.js"',
      // eslint-disable-next-line
      `--coverageThreshold="{\"global\":{\"statements\":\"100\",\"lines\":\"100\",\"branches\":\"100\",\"functions\":\"100\"}}"`,
      '--collectCoverageFrom="<rootDir>/app/scripts/controllers/permissions/**/*.js"',
    ]);
    await runInShell('yarn', [
      'jest',
      '--config=./jest.config.js',
      '--coverage',
      '--maxWorkers=2',
      '--testMatch="<rootDir>/app/scripts/lib/createRPCMethodTrackingMiddleware.test.js"',
      // eslint-disable-next-line
      `--coverageThreshold="{\"global\":{\"statements\":\"100\",\"lines\":\"100\",\"branches\":\"95.65\",\"functions\":\"100\"}}"`,
      '--collectCoverageFrom="app/scripts/lib/createRPCMethodTrackingMiddleware.js"',
    ]);
  } else {
    // We use jest's new 'shard' feature to run tests, overridding
    // the coverageReporters.
    await runInShell('yarn', [
      'jest',
      '--config=./jest.config.js',
      '--coverageReporters="json"',
      '--coverage',
      '--maxWorkers=2',
      '--coverageThreshold={}',
      `--shard=${circleNodeIndex}/${circleNodeTotal - 1}`,
    ]);
    // Once done we rename the file so that its indexed by the job number.
    await runCommand('mv', [
      './jest-coverage/main/coverage-final.json',
      `./jest-coverage/main/coverage-final-${circleNodeIndex - 1}.json`,
    ]);
  }
}
