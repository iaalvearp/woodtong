declare module "astro:actions" {
	type Actions = typeof import("/home/alpes/Documentos/proyectos/mono-repo/rh-interiors/src/actions/index.ts")["server"];

	export const actions: Actions;
}