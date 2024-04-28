export function h2(value) { return `<h2>${value}</h2>`; }
export function li(value) { return `<li>${value}</li>`; }
export function td(value) { return `<td>${value}</td>`; }
export function th(value) { return `<th>${value}</th>`; }
export function tr(...cells) { return `<tr>${cells.join('')}</tr>`; }
export function ul(...items) { return `<ul>${items.join('')}</ul>`; }
export function table(...items) { return `<table>${items.join('')}</table>`; }
export function bordered(...items) { return `<table border>${items.join('')}</table>`; }
export function a(href,label) { return `<a href="${href}">${label}</a>`; }
export function download(label,href,filename) { return `<a href="${href}" download="${filename}">${label}</a>`; }
export function img(src) { return `<img src="${src}" alt="photo for ${src}" width="100">`}
export function p(value) { return `<p>${value}</p>`; }
export function pre(value) { return `<pre>${value}</pre>`; }
export function details(summary,details) { return `<details><summary>${summary}</summary>${details}</details>`; }
export function html(...items) { return `<!DOCTYPE html><html>${items.join('')}</html>`; }
export function head(...items) { return `<head>${items.join('')}</head>`; }
export function body(...items) { return `<body">${items.join('')}</body>`; }
