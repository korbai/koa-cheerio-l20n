'use strict';

/*
load all language files
use this.state.locale, if not exist then use first language from browser header
 */

let path = require('path');
let l20n = require('l20n');
let fs = require('fs');
let debug = require('debug')('koa-cheerio-l20n');
//debug = console.log;

module.exports = function koaL20n(settings) {
  settings = settings || {};
  settings.root = path.resolve(settings.root || __dirname);
  settings.ext = settings.ext || '.l20n';

  let langs = [];

  register(settings.root, settings.ext);

  return function *l20n(next) {
    // !TODO fallback is dumb, use only the first language from browser header
    if (!this.state.locale) {
      this.state.locale = 'en';

      let accept = this.acceptsLanguages() || '';
      let reg = /(^|,\s*)([a-z-]+)/gi;
      let match;
      if (match = reg.exec(accept)) {
        this.state.locale = match[2];
      }
    }

    if (this.localize) {
      throw new Error('localize occupied'); // !TODO
    }
    this.localize = function (id, data) {
      if (!id || id.length === 0) {
        return '';
      }
      let req = this.state.locale;
      //console.log('req', req);
      let res = getLocale(req);
      let e = langs[res].getEntitySync(id, data || {});
      if (!e || !e.value) {
        throw new Error('l20 id:' + id + ' not found!');
      }
      return e.value;
    };

    yield next; // if html is ready in the view/render, then go through for find l20n ids
    if (this.$) {
      let $ = this.$;
      let req = this.state.locale;
      let res = getLocale(req);

      // yes l10n, and not l20n!! see http://l20n.org/
      $('[data-l10n-id]').each(function () {
        let element = $(this);
        let data = element.data();
        let id = data.l10nId;
        if (id) {
          let e = langs[res].getEntitySync(id);
          if (e.value) {
            element.text(e.value);
          }
          if (e.attributes) {
            for (let a in e.attributes) {
              element.attr(a, e.attributes[a]);
            }
          }
        }
      });
    }
  };

  function getLocale(locale) {
    if (langs[locale]) return locale;
    locale = locale.substr(0, 2);
    if (langs[locale]) return locale;
    locale = 'en';
    if (langs[locale]) return locale;
    locale = Object.keys(langs)[0];
    if (langs[locale]) return locale;
    throw new Error('Language/locale not found');
  }

  function register(dir, ext) {
    // !TODO sorry for sync but it runs only once after startup
    fs.readdirSync(dir).forEach(function (item) {
      if (item.slice(-ext.length) === ext) {
        let lang = item.substr(0, item.length - ext.length);
        let file = path.join(dir, item);
        //console.log('lang', lang);
        //console.log('file', file);
        let ctx = l20n.getContext();
        ctx.registerLocales(lang);
        ctx.linkResource(file);
        ctx.requestLocales(lang);
        langs[lang] = ctx;
        debug('registering', lang, 'locale');
      }
    });
  }
};
