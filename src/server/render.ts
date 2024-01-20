import { renderFile } from 'ejs';
import { env } from '../env';
import { ThemesIterator } from '../static/themes';
import { RoutesIterator } from '../static/routes';
import { Props, RenderOptions } from './types/render-options';
import { Response } from 'express';

export const baseRenderOptions: RenderOptions = {
	themes: ThemesIterator,
	theme: ThemesIterator[0],
	routes: RoutesIterator,
	title: 'Rolando Supreme',
	version: env.VERSION,
};

export async function render(
	res: Response,
	component: string,
	props: Props,
	options?: Partial<RenderOptions>
) {
	options = { ...baseRenderOptions, ...options };
	const content = await renderFile('views/index.ejs', {
		component, // ! Used for <%- include(component, props) -%>
		props,
		...options,
	});
	res.send(content);
}

export async function hxRender(res: Response, component: string, props: Props) {
	const content = await renderFile(`views/hx/${component}.ejs`, props);
	res.send(content);
}
