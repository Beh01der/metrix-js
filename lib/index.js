"use strict";
var MetricsCollector = (function () {
    function MetricsCollector(callback) {
        this.metrics = [];
        this.regexes = {};
        this.callback = callback;
    }
    MetricsCollector.prototype.addMetrics = function (metrics, failOnError) {
        var _this = this;
        if (failOnError === void 0) { failOnError = true; }
        metrics.forEach(function (item) {
            if (!item.field || !item.match || !item.metric) {
                if (failOnError) {
                    throw new Error('Failed processing MetricItem: ' + JSON.stringify(item) + '; field, match and metric must be specified');
                }
                else {
                    return;
                }
            }
            if (item.matcher === 'regex') {
                var regex = void 0;
                var err = void 0;
                try {
                    var bits = item.match.split('/');
                    if (bits.length == 1) {
                        // 'abc'
                        regex = new RegExp(bits[0]);
                    }
                    else if (bits.length == 3) {
                        // '/abc/i'
                        regex = new RegExp(bits[1], bits[2]);
                    }
                }
                catch (e) {
                    err = e;
                }
                finally {
                    if (regex) {
                        _this.regexes[item.match] = regex;
                        _this.metrics.push(item);
                    }
                }
                if (!regex && failOnError) {
                    throw new Error('Failed processing MetricItem: ' + JSON.stringify(item) + '; ' + (err && err.message));
                }
            }
            else {
                _this.metrics.push(item);
            }
        });
    };
    MetricsCollector.prototype.measure = function (o) {
        var _this = this;
        this.metrics.forEach(function (item) {
            var s = o[item.field];
            if (!s) {
                return;
            }
            if (item.matcher === 'regex') {
                var regex = _this.regexes[item.match];
                if (regex.test(s)) {
                    _this.hit(s.replace(regex, item.metric));
                }
            }
            else if (item.matcher === 'string') {
                if (s === item.match) {
                    _this.hit(item.metric);
                }
            }
            else {
                if (s.indexOf(item.match) !== -1) {
                    _this.hit(item.metric);
                }
            }
        });
    };
    MetricsCollector.prototype.hit = function (metric) {
        if (this.callback) {
            this.callback(metric);
        }
    };
    return MetricsCollector;
}());
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=index.js.map