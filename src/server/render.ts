import { renderFile } from 'ejs';
import { env } from '../env';
import { ThemesIterator } from '../static/themes';
import { RoutesIterator } from '../static/routes';
import { Props, RenderOptions } from './types/render-options';

export const baseRenderOptions: RenderOptions = {
	themes: ThemesIterator,
	theme: ThemesIterator[0],
	routes: RoutesIterator,
	title: 'Rolando Supreme',
	version: env.VERSION,
};

export async function render(
	component: string,
	props: Props,
	options?: Partial<RenderOptions>
) {
	options = { ...baseRenderOptions, ...options };
	return await renderFile('views/index.ejs', {
		component, // ! Used for <%- include(component, props) -%>
		props,
		...options,
	});
}

export async function hxRender(component: string, props: Props) {
	return await renderFile(`views/hx/${component}.ejs`, props);
}
