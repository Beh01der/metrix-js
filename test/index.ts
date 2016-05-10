import { expect } from 'chai';
import { MetricsCollector } from "../lib/index";

function testCollector(input: any[]) {
    let result = [];

    let collector = new MetricsCollector(metric => result.push(metric));

    collector.addMetrics([
        { field: 'code', matcher: 'regex', match: '(\\d)\\d\\d', metric: 'router.hit.$100' },
        { field: 'code', matcher: 'regex', match: '\\d{3}', metric: 'router.hit' },
        { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.note.hit' },
        { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.hit' },
        { field: 'url', matcher: 'substring', match: 'api/policy', metric: 'api.hit' }
    ]);

    input.forEach(o => collector.measure(o));

    return result;
}

describe('MetricsCollector', () => {
    describe('#addMetrics()', () => {
        it('fails on invalid MetricItem - empty fields', () => {
            let collector = new MetricsCollector();
            expect(() => {
                collector.addMetrics([
                    { field: '', match: '', metric: '' }
                ])
            }).to.throw(Error);
        });
        it('fails on invalid MetricItem - invalid regex', () => {
            let collector = new MetricsCollector();
            expect(() => {
                collector.addMetrics([
                    { field: 'code', matcher: 'regex', match: '(\\d\\d\\d', metric: 'router.hit.$100' }
                ])
            }).to.throw(Error);
        });
        it('ignores invalid MetricItem', () => {
            let collector = new MetricsCollector();
            collector.addMetrics([
                { field: 'code', matcher: 'regex', match: '(\\d\\d\\d', metric: 'router.hit.$100' },
                { field: 'code', matcher: 'regex', match: '\\d{3}', metric: 'router.hit' }
            ], false);

            expect(collector.metrics.length).to.equal(1);
        });
    });

    describe('#measure()', () => {
        it('processes input objects correctly', () => {
            expect(testCollector([
                { code: '200', url: '/api/note/something', method: 'GET' },
                { code: '201', url: '/api/policy/', method: 'POST' },
                { method: 'POST' }
            ])).to.eql([
                'router.hit.200',
                'router.hit',
                'api.note.hit',
                'api.hit',
                'router.hit.200',
                'router.hit',
                'api.hit'
            ]);
        });
    });
});
