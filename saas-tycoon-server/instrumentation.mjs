/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
    PeriodicExportingMetricReader,
    ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';


const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'saas-tycoon-server',
        [ATTR_SERVICE_VERSION]: '0.1.0',
    }),
    traceExporter: new ConsoleSpanExporter(),
    // traceExporter: new OTLPTraceExporter({
    // url: '<your-otlp-endpoint>/v1/traces', // optional - default url is http://localhost:4318/v1/traces
    // headers: {}, // optional - collection of custom headers to be sent with each request, empty by default
    metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        // exporter: new OTLPMetricExporter({
        //     url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        //     headers: {}, // an optional object containing custom headers to be sent with each request
        //     concurrencyLimit: 1, // an optional limit on pending requests
        // }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
