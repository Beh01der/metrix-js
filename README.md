# metrix-js
Simple metrics collector for JS objects.
It transforms input JS objects into a set of predefined metrics that can be sent to metrics monitor like **StatsD**
It can be used in conjunction with [node-grok](https://www.npmjs.com/package/node-grok) module to generate metrics based on logs i.e. **Nginx access logs** 

## Install
Install locally: `npm install metrix-js --save --save-exact`.

## Quick start
Following simple snippet
```javascript
var MetricsCollector = require('./index').MetricsCollector;

// create collector
var collector = new MetricsCollector(function (metric) {
    console.log(metric);
});

// define metrics
collector.addMetrics([
    { field: 'code', matcher: 'regex', match: '(\\d)\\d\\d', metric: 'router.hit.$100' },
    { field: 'code', matcher: 'regex', match: '\\d{3}', metric: 'router.hit' },
    { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.note.hit' },
    { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.hit' },
    { field: 'url', matcher: 'substring', match: 'api/policy', metric: 'api.hit' }
]);

// input some objects
collector.measure({ code: '200', url: '/api/note/something', method: 'GET' });
collector.measure({ code: '201', url: '/api/policy/', method: 'POST' });
```

will produce output

```
router.hit.200
router.hit
api.note.hit
api.hit
router.hit.200
router.hit
api.hit
```

## API
* **MetricItem** - metric definition object
    * **field** {string} - input object field
    * **match** {string} - matching rule - string or regular expression
    * **matcher** {string} - matching rule type - 'substring' | 'string' | 'regex' - 'substring' is default 
    * **metric** {string} - output metric 
    
* **MetricsCollector** - collector class
    * **MetricsCollector(callback {function(metric {string})})** - MetricsCollector constructor. **Callback** function will be called on every metric match
    * **addMetrics(metrics {MetricItem[]})** - adds array of MetricItem definitions
    * **measure(o {object})** - analyses input object based on predefined MetricItem definitions. For every match, **callback** function will be called. 


## License 
**ISC License (ISC)**

Copyright (c) 2015, Andrey Chausenko <andrey.chausenko@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
