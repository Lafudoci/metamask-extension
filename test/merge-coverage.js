const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const jestConfig = require('../jest.config');

function loadData(filePath) {
  const json = fs.readFileSync(filePath);
  return JSON.parse(json);
}

function mergeCoverageMaps(files, alwaysMerge) {
  let initialData = {};
  if (files.length === 1 && alwaysMerge) {
    initialData = loadData(files[0]);
  }

  const coverageMap = libCoverage.createCoverageMap(initialData);

  files.forEach((covergeFinalFile) => {
    coverageMap.merge(loadData(covergeFinalFile));
  });

  return coverageMap;
}

function generateSummaryReport(dir, coverageMap) {
  console.log(dir);
  const context = libReport.createContext({
    dir,
    coverageMap,
  });

  reports.create('json-summary').execute(context);
}

function mergeCoverageAndGenerateSummaryReport() {
  const files = fs.readdirSync('./jest-coverage/main');
  const filePaths = files
    .filter(
      (file) =>
        path.basename(file).startsWith('coverage-final') &&
        path.extname(file) === '.json',
    )
    .map((file) => path.join('./jest-coverage/main', file));
  const coverageMap = mergeCoverageMaps(filePaths, true);
  generateSummaryReport('./jest-coverage/main', coverageMap);
}

async function start() {
  mergeCoverageAndGenerateSummaryReport();
  const coverage = loadData('./jest-coverage/main/coverage-summary.json');
  const { lines, branches, functions, statements } = coverage.total;
  const globalThreshold = jestConfig.coverageThreshold.global;
  const lineCoverageNotMet = lines.pct < globalThreshold.lines;
  const branchCoverageNotMet = branches.pct < globalThreshold.branches;
  const functionCoverageNotMet = functions.pct < globalThreshold.functions;
  const statementCoverageNotMet = statements.pct < globalThreshold.statements;
  const breakdown =
    `Lines: ${lines.covered}/${lines.total} (${lines.pct}%). Target: ${globalThreshold.lines}%\n` +
    `Branches: ${branches.covered}/${branches.total} (${branches.pct}%). Target: ${globalThreshold.branches}%\n` +
    `Statements: ${statements.covered}/${statements.total} (${statements.pct}%). Target: ${globalThreshold.statements}%\n` +
    `Functions: ${functions.covered}/${functions.total} (${functions.pct}%). Target: ${globalThreshold.functions}%`;
  if (
    lineCoverageNotMet ||
    branchCoverageNotMet ||
    functionCoverageNotMet ||
    statementCoverageNotMet
  ) {
    const errorMsg = `Coverage thresholds NOT met\n${breakdown}`;
    throw new Error(errorMsg);
  }
  console.log(`Coverage thresholds met\n${breakdown}`);
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
