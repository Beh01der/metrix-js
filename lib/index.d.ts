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
    metrics: MetricItem[];
    callback: MetricCallback;
    regexes: { [name: string]: RegExp };

    constructor(callback?: MetricCallback);
    addMetrics(metrics: MetricItem[], failOnError?: boolean);
    measure(o: any);
    hit(metric: string);
}