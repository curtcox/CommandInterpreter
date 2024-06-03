export function h2(value: string) { return `<h2>${value}</h2>`; }
export function li(value: string) { return `<li>${value}</li>`; }
export function td(value: string) { return `<td>${value}</td>`; }
export function th(value: string) { return `<th>${value}</th>`; }
export function tr(...cells: string[]) { return `<tr>${cells.join('')}</tr>`; }
export function ul(...items: string[]) { return `<ul>${items.join('')}</ul>`; }
export function table(...items: string[]) { return `<table>${items.join('')}</table>`; }
export function bordered(...items: string[]) { return `<table border>${items.join('')}</table>`; }
export function a(href: string,label: string) { return `<a href="${href}">${label}</a>`; }
export function download(label: string,href: string,filename: string) { return `<a href="${href}" download="${filename}">${label}</a>`; }
export function img(src: string) { return `<img src="${src}" alt="photo for ${src}" width="100">`}
export function p(value: string) { return `<p>${value}</p>`; }
export function pre(value: string) { return `<pre>${value}</pre>`; }
export function details(summary: string,details: string) { return `<details><summary>${summary}</summary>${details}</details>`; }
export function html(...items: string[]) { return `<!DOCTYPE html><html>${items.join('')}</html>`; }
export function head(...items: string[]) { return `<head>${items.join('')}</head>`; }
export function body(...items: string[]) { return `<body">${items.join('')}</body>`; }
export function form(...items: string[]) { return `<form">${items.join('')}</form>`; }
export function textarea(name: string,text:string) { return `<textarea id="${name}" name="${name}">${text}</textarea>`; }
export function button(name: string) { return `<input type=button value="${name}" name="${name}">`; }
