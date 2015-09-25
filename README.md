# koa-cheerio-l20n

[L20n](http://l20n.org/) server side localizer for [koa-cheerio-template](https://www.npmjs.com/package/koa-cheerio-template)

# Features
- no code
- via data-l10n-id html attribute

# Installation
```
npm install koa-cheerio-l20n
```

# Example

index.html
```html

<p data-l10n-id="hello"></p>

```

locales/en.l20n
```

<hello "Hi!">

```

main-app.js
```js

let localizer = require('koa-cheerio-l20n');
app.use(localizer({root: 'locales/'}));

```
see [L20n](http://l20n.org/) for more information
```
# License

  MIT
