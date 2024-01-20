type RenderOptions = Readonly<{
	themes: string[];
	theme: string;
	title: string;
	version: string;
	routes: Route[];
	userInfo: object | false;
}>;

interface Props {
	[x: string]: any;
}
