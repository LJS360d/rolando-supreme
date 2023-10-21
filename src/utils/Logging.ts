import axios, { AxiosRequestConfig } from 'axios';
import { env } from '../main';
import { EmbedBuilder } from 'discord.js';

export function info(msg: string): void {
	log('info', 'green', msg);
}
export function warn(msg: string): void {
	log('warn', 'yellow', msg);
}
export function error(msg: string): void {
	log('error', 'red', msg);
}
export function serv(msg: string, endpointReq: boolean = false): void {
	log('serv', 'cyan', msg, endpointReq);
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
	serv(`Accepted ${CC.green}GET${CC.stop} ${endpoint}`, true);
	const now = new Date().toLocaleString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
	webhookLog(now, 'GET', endpoint, 'green');
}
function log(logMsg: string, color: string, msg: string, endpointReq: boolean = false) {
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
	if (!endpointReq) webhookLog(now, logMsg, msg, color);
}
function webhookLog(now: string, logmsg: string, msg: string, color: string) {
	const embed = new EmbedBuilder()
		.setColor(DC[color] ?? 0)
		//.setThumbnail(client.user.avatarURL())
		.setDescription(now)
		.addFields({
			name: `\`${logmsg.toUpperCase()}\``,
			value: msg,
			inline: true,
		});
	const body = JSON.stringify({ embeds: [embed] });
	const config: AxiosRequestConfig<string> = {
		headers: {
			'Content-Type': 'application/json',
		},
	};
	axios.post(env.LOG_WEBHOOK, body, config).catch((error) => {
		if (error.response && error.response.status === 429) {
			// ignore 429 error response
		}
	});
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
// DiscordColors
enum DC {
	black = 2303786,
	gray = 9807270,
	red = 15548997,
	green = 5763719,
	yellow = 16776960,
	blue = 3447003,
	magenta = 15418782,
	cyan = 1752220,
	white = 16777215,
}
