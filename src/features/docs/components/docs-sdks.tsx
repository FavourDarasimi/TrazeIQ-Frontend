import { Callout } from "./docs-callout";
import { SubHeading } from "./docs-anchor";
import { Code, DocsSection, DocsTable, StatusBadge } from "./docs-shared";
import { DocsCode } from "./docs-code";

const jsSdkSnippet = `// npm install trazeiq
import { init, captureException, captureMessage, wrap, setUser, addBreadcrumb } from "trazeiq";

// 1. Initialize once at app startup
init({
  apiKey: "YOUR_API_KEY",              // raw key shown once at project creation
  environment: "production",           // default environment
  service: "payment-api",              // service name
  timeoutMs: 2000,                     // max wait time (default 2000ms)
});

// 2. Capture exceptions in try/catch (never throws)
try {
  await processPayment(order);
} catch (error) {
  await captureException(error);       // sends error + formatted stacktrace
  throw error;                         // TrazeIQ observes, doesn't swallow
}

// 3. Send custom messages with metadata
await captureMessage("Cache hit ratio dropped below 80%", {
  level: "warning",
  metadata: { ratio: 0.74 },
});

// 4. Attach user context & breadcrumbs for debugging
setUser("usr_12345");
addBreadcrumb({ message: "Updated order state to PROCESSING", category: "order" });

// 5. Wrap async functions automatically
const safeFetchUser = wrap(fetchUser);`;

const pythonSdkSnippet = `# pip install trazeiq
import trazeiq

# 1. Initialize once at app startup
trazeiq.init(
    api_key="YOUR_API_KEY",             # raw key shown once at project creation
    environment="production",          # default environment
    service="payment-api",             # service name
    timeout_seconds=2.0,               # max wait time (default 2.0s)
)

# 2. Capture exceptions in try/except (never raises)
try:
    process_payment(order)
except Exception:
    trazeiq.capture_exception()         # captures active exception traceback
    raise                              # TrazeIQ observes, doesn't swallow

# 3. Send custom messages with severity & metadata
trazeiq.capture_message(
    "Database pool queue length exceeded threshold",
    level="warning",
    metadata={"queue_depth": 42},
)

# 4. Attach user context & breadcrumbs
trazeiq.set_user("usr_12345")
trazeiq.add_breadcrumb({"message": "Checkout initiated", "category": "cart"})

# 5. Decorate functions to capture & re-raise errors
@trazeiq.wrap()
def process_batch(items):
    ...`;

export function DocsSDKs() {
  return (
    <DocsSection
      id="sdks"
      label="SDKs & Client Libraries"
      title="Official SDKs for JavaScript/TypeScript and Python"
      sub="Zero-dependency, non-blocking libraries that format stack traces, attach runtime context, and ship events to TrazeIQ in milliseconds."
    >
      <div className="flex flex-col gap-6">
        <SubHeading id="sdks-overview">Overview</SubHeading>
        <DocsTable
          head={["SDK", "Package", "Runtime / Environment", "Dependencies", "Guarantees"]}
          rows={[
            [
              <Code key="js">JavaScript / TS</Code>,
              <Code key="npm">trazeiq (npm)</Code>,
              "Node 18+ & Modern Browsers (isomorphic)",
              <StatusBadge key="dep-js" code="zero" tone="ok" />,
              "Never throws · 2s timeout max · non-blocking fetch",
            ],
            [
              <Code key="py">Python</Code>,
              <Code key="pypi">trazeiq (PyPI)</Code>,
              "Python 3.9+",
              <StatusBadge key="dep-py" code="zero (urllib)" tone="ok" />,
              "Never raises · 2s timeout max · stdlib only",
            ],
          ]}
        />

        <Callout variant="info" title="Core Safety Guarantees">
          Both official SDKs strictly uphold two principles:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Never crash host application:</strong> Transport, DNS, timeout, and HTTP errors (e.g. 413, 429) are safely caught and swallowed client-side.</li>
            <li><strong>Never block request pipeline:</strong> Event dispatches use short timeouts (default 2s) with zero retries on the hot path.</li>
          </ul>
        </Callout>

        <SubHeading id="sdks-usage">SDK Quick Examples</SubHeading>
        <DocsCode
          label="Official SDK Examples"
          tabs={[
            { lang: "ts", label: "JavaScript / TypeScript", code: jsSdkSnippet },
            { lang: "python", label: "Python", code: pythonSdkSnippet },
          ]}
        />

        <SubHeading id="sdks-api">API Methods & Symbols</SubHeading>
        <DocsTable
          head={["Method (JS / Python)", "Purpose", "Options / Notes"]}
          rows={[
            [
              <Code key="m1">init() / trazeiq.init()</Code>,
              "Configure global client instance",
              "Requires apiKey. Accepts endpoint, environment, service, defaultMetadata, timeoutMs/timeout_seconds, enabled.",
            ],
            [
              <Code key="m2">captureException() / capture_exception()</Code>,
              "Capture and send an Error / Exception with stack trace",
              "Accepts error object or uses active Python sys.exc_info(). Never throws or raises.",
            ],
            [
              <Code key="m3">captureMessage() / capture_message()</Code>,
              "Send a string event message with level and metadata",
              "Empty messages are no-ops. Accepts level (debug|info|warning|error|fatal).",
            ],
            [
              <Code key="m4">wrap() / @trazeiq.wrap()</Code>,
              "Function decorator / wrapper for error reporting",
              "Works with sync and async functions: sync throws stay synchronous, async rejections stay async. Captures the error, then re-raises immediately.",
            ],
            [
              <Code key="m5">setUser() / set_user()</Code>,
              "Set user_id for subsequent events",
              "Pass user ID string or null to clear context.",
            ],
            [
              <Code key="m6">addBreadcrumb() / add_breadcrumb()</Code>,
              "Append a contextual breadcrumb to local trail",
              "Max 50 breadcrumbs buffered and attached to subsequent error events.",
            ],
            [
              <Code key="m7">close() / trazeiq.close()</Code>,
              "Disable SDK client reporting",
              "Disables captures and turns subsequent calls into no-ops.",
            ],
          ]}
        />

        <Callout variant="tip" title="Direct HTTP Contract Unchanged">
          The SDKs are thin wrappers around <Code>POST /api/v1/events/</Code> with <Code>X-API-Key</Code> authentication. You can still use cURL, Go, Rust, or plain HTTP requests anywhere without using an SDK package.
        </Callout>
      </div>
    </DocsSection>
  );
}
