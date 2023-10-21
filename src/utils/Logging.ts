export function info(msg: string): void {
	log('info', 'green', msg);
}
export function warn(msg: string): void {
	log('warn', 'red', msg);
}
export function error(msg: string): void {
	log('error', 'red', msg);
}
export function serv(msg: string): void {
	log('serv', 'cyan', msg);
}
export function command(guild: string, user: string, command: string) {
	log('comm', 'magenta', `Guild[${guild}] User[${user}] Command[${command}]`);
}
export function animatedFetch() {
	const frames = ['|', '/', '-', '\\'];
	let i = 0;
	let isLoading = false;
	let loader: NodeJS.Timeout;
	const now = new Date().toLocaleString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	return function (message: string) {
		if (isLoading) {
			// Stop the loading animation and output a checkmark
			clearInterval(loader);
			process.stdout.write(
				`${CC.gray}[${now}]${CC.stop} ${CC.magenta}FETCH${CC.stop} ✓ ${message}\n`
			);
			isLoading = false;
		} else {
			// Start the loading animation
			isLoading = true;
			loader = setInterval(() => {
				process.stdout.write(
					`${CC.gray}[${now}]${CC.stop} ${CC.magenta}FETCH${CC.stop} ${
						frames[i++]
					} ${message}\r`
				);
				i %= frames.length;
			}, 100);
		}
	};
}
export function getRequestLog(endpoint: string) {
	serv(`Accepted ${CC.green}GET${CC.stop} ${endpoint}`);
}
function log(logMsg: string, color: string, msg: string) {
	const now = new Date().toLocaleString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
	console.log(
		`${CC.gray}[${now}]${CC.stop} ${CC[color]}${logMsg.toUpperCase()}${CC.stop} ${
			CC.white
		}${msg}${CC.stop}`
	);
}

// ConsoleColors
enum CC {
	stop = '\x1b[0m',
	bold = '\x1b[1m',
	italic = '\x1b[3m',
	underline = '\x1b[4m',
	highlight = '\x1b[7m',
	hidden = '\x1b[8m',
	strikethrough = '\x1b[8m',
	doubleUnderline = '\x1b[21m',
	black = '\x1b[30m',
	gray = '\x1b[37m',
	red = '\x1b[31m',
	green = '\x1b[32m',
	yellow = '\x1b[33m',
	blue = '\x1b[34m',
	magenta = '\x1b[35m',
	cyan = '\x1b[36m',
	white = '\x1b[38m',
	blackbg = '\x1b[40m',
	redbg = '\x1b[41m',
	greenbg = '\x1b[42m',
	yellowbg = '\x1b[43m',
	bluebg = '\x1b[44m',
	magentabg = '\x1b[45m',
	cyanbg = '\x1b[46m',
	whitebg = '\x1b[47m',
}
