// Este archivo contiene pruebas básicas para el diseño de las páginas utilizando Vitest y jsdom.
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Diseño de páginas', () => {
  it('La página de inicio contiene el mensaje del hero', () => {
    const html = `<!DOCTYPE html><html><body><h1>Impulsando el progreso a través de la investigación y la educación</h1></body></html>`;
    const dom = new JSDOM(html);
    const heading = dom.window.document.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading.textContent?.toUpperCase()).toContain('IMPULSANDO');
  });
  it('La navegación incluye enlaces principales', () => {
    const navHtml = `<!DOCTYPE html><html><body><nav><a href="/">Inicio</a><a href="/about">Nosotras</a><a href="/que-hacemos">Qué hacemos</a><a href="/eventos">Eventos</a><a href="/contacto">Contacto</a></nav></body></html>`;
    const dom = new JSDOM(navHtml);
    const links = Array.from(dom.window.document.querySelectorAll('nav a')).map(el => el.textContent);
    expect(links).toContain('Inicio');
    expect(links).toContain('Nosotras');
    expect(links).toContain('Qué hacemos');
    expect(links).toContain('Eventos');
    expect(links).toContain('Contacto');
  });
});