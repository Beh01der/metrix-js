export interface MetricItem {
    field: string;
    match: string;
    matcher?: 'substring' |'string' | 'regex';
    metric: string;
}

export interface MetricCallback {
    (metric: string);
}

export class MetricsCollector {
    metrics: MetricItem[] = [];
    callback: MetricCallback;
    regexes: { [name: string]: RegExp } = {};

    constructor(callback?: MetricCallback) {
        this.callback = callback;
    }
    
    addMetrics(metrics: MetricItem[], failOnError: boolean = true) {
        metrics.forEach(item => {
            if (!item.field || !item.match || !item.metric) {
                if (failOnError) {
                    throw new Error('Failed processing MetricItem: ' + JSON.stringify(item) + '; field, match and metric must be specified');
                } else {
                    return;
                }
            }

            if (item.matcher === 'regex') {
                let regex;
                let err;
                try {
                    let bits = item.match.split('/');
                    if (bits.length == 1) {
                        // 'abc'
                        regex = new RegExp(bits[0]);
                    } else if (bits.length == 3) {
                        // '/abc/i'
                        regex = new RegExp(bits[1], bits[2]);
                    }
                } catch (e) {
                    err = e;
                } finally {
                    if (regex) {
                        this.regexes[item.match] = regex;
                        this.metrics.push(item);
                    }
                }

                if (!regex && failOnError) {
                    throw new Error('Failed processing MetricItem: ' + JSON.stringify(item) + '; ' + (err && err.message));
                }
            } else {
                this.metrics.push(item);
            }
        });
    }

    measure(o: any) {
        this.metrics.forEach(item => {
            let s = o[item.field];
            if (!s) {
                return;
            }

            if (item.matcher === 'regex') {
                let regex = this.regexes[item.match];
                if (regex.test(s)) {
                    this.hit(s.replace(regex, item.metric));
                }
            } else if (item.matcher === 'string') {
                if (s === item.match) {
                    this.hit(item.metric);
                }
            } else {
                if (s.indexOf(item.match) !== -1) {
                    this.hit(item.metric);
                }
            }
        });
    }

    hit(metric: string) {
        if (this.callback) {
            this.callback(metric);
        }
    }
}