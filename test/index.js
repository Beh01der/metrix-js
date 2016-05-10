"use strict";
var chai_1 = require('chai');
var index_1 = require("../lib/index");
function testCollector(input) {
    var result = [];
    var collector = new index_1.MetricsCollector(function (metric) { return result.push(metric); });
    collector.addMetrics([
        { field: 'code', matcher: 'regex', match: '(\\d)\\d\\d', metric: 'router.hit.$100' },
        { field: 'code', matcher: 'regex', match: '\\d{3}', metric: 'router.hit' },
        { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.note.hit' },
        { field: 'url', matcher: 'substring', match: 'api/note', metric: 'api.hit' },
        { field: 'url', matcher: 'substring', match: 'api/policy', metric: 'api.hit' }
    ]);
    input.forEach(function (o) { return collector.measure(o); });
    return result;
}
describe('MetricsCollector', function () {
    describe('#addMetrics()', function () {
        it('fails on invalid MetricItem - empty fields', function () {
            var collector = new index_1.MetricsCollector();
            chai_1.expect(function () {
                collector.addMetrics([
                    { field: '', match: '', metric: '' }
                ]);
            }).to.throw(Error);
        });
        it('fails on invalid MetricItem - invalid regex', function () {
            var collector = new index_1.MetricsCollector();
            chai_1.expect(function () {
                collector.addMetrics([
                    { field: 'code', matcher: 'regex', match: '(\\d\\d\\d', metric: 'router.hit.$100' }
                ]);
            }).to.throw(Error);
        });
        it('ignores invalid MetricItem', function () {
            var collector = new index_1.MetricsCollector();
            collector.addMetrics([
                { field: 'code', matcher: 'regex', match: '(\\d\\d\\d', metric: 'router.hit.$100' },
                { field: 'code', matcher: 'regex', match: '\\d{3}', metric: 'router.hit' }
            ], false);
            chai_1.expect(collector.metrics.length).to.equal(1);
        });
    });
    describe('#measure()', function () {
        it('processes input objects correctly', function () {
            chai_1.expect(testCollector([
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
//# sourceMappingURL=index.js.map