// 1. Print TODOs with line number
// For the line numbers, please use the "data-startpos" which is emitted by the djot parser by default.
// 2. The script (called task.js) should expect a single argument, the file to parse e.g. task.js test.dj
// 3. If given no arguments, then it should try to read the file from standard input.

import { parse, applyFilter } from '@djot/djot';
import fs from 'fs'
import util from 'util'

const readFile = util.promisify(fs.readFile);
const className = 'TODO'

if (process.argv.length > 2) {
	const path = process.argv[2]
	readFile(path, 'utf-8')
		.then((result) => printTextWithClass(result, className))
		.catch((err) => process.stderr.write(`ReadFile Err: ${err}`))
} else {
	let data = ''
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', (chunk) => data += chunk)

	process.on('exit', () => printTextWithClass(data, className))
}

function printTextWithClass(data, className) {
	const ast = parse(data, { sourcePositions: true })

	let isPrint = false
	const printRule = {
		enter: (el) => isPrint = el?.attributes?.class === className,
		exit: () => isPrint = false,
	}

	applyFilter(ast, () => ({
		heading: printRule,
		para: printRule,
		str: (el) => isPrint && process.stdout.write(`${el.pos.start.line} ${el.text}\n`)
	}))
}
