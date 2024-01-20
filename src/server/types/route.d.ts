interface Route {
	name: string;
	path: string;
	admin?: boolean = false;
	component?: string;
	icon: string;
}
