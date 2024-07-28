function join(items: string[]) { return items.join(''); }
export function h2(value: string) { return `<h2>${value}</h2>`; }
export function li(value: string) { return `<li>${value}</li>`; }
export function td(value: string) { return `<td>${value}</td>`; }
export function th(value: string) { return `<th>${value}</th>`; }
export function tr(...cells: string[]) { return `<tr>${join(cells)}</tr>`; }
export function ul(...items: string[]) { return `<ul>${join(items)}</ul>`; }
export function table(...items: string[]) { return `<table>${join(items)}</table>`; }
export function bordered(...items: string[]) { return `<table border>${join(items)}</table>`; }
export function a(href: string,label: string) { return `<a href="${href}">${label}</a>`; }
export function download(label: string,href: string,filename: string) { return `<a href="${href}" download="${filename}">${label}</a>`; }
export function img(src: string) { return `<img src="${src}" alt="photo for ${src}" width="100">`}
export function p(value: string) { return `<p>${value}</p>`; }
export function pre(value: string) { return `<pre>${value}</pre>`; }
export function details(summary: string,details: string) { return `<details><summary>${summary}</summary>${details}</details>`; }
export function html(...items: string[]) { return `<!DOCTYPE html><html>${join(items)}</html>`; }
export function head(...items: string[]) { return `<head>${join(items)}</head>`; }
export function body(...items: string[]) { return `<body>${join(items)}</body>`; }
export function form(...items: string[]) { return `<form method="post">${join(items)}</form>`; }
export function textarea(name: string,text:string) { return `<textarea id="${name}" name="${name}">${text}</textarea>`; }
export function hidden(name: string,value: string) { return `<input type="hidden" name="${name}" value="${value}">`; }
export function button(name: string) { return `<input type="submit" value="${name}" name="${name}" formaction="${name}">`; }
export function splat(...items: string[]) { return join(items); }
