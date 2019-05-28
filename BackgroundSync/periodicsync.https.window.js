// META: script=/common/get-host-info.sub.js
// META: script=/service-workers/service-worker/resources/test-helpers.sub.js
// META: script=resources/utils.js

'use strict'

promise_test(async test => {
  const script = 'service_workers/sw.js';
  const scope = 'service_workers/' + location.pathname;

  const serviceWorkerRegistration =
      await service_worker_unregister_and_register(test, script, scope);

  assert_equals(
    serviceWorkerRegistration.active, null,
    'There must not be an activated worker');

  await promise_rejects(
    test, new DOMException('', 'InvalidStateError'),
    serviceWorkerRegistration.periodicSync.register(
        'test_tag', { minInterval: 3600 }),
    'register() must reject on pending and installing workers');
}, 'Periodic Background Sync requires an activated Service Worker');

periodicSyncTest(async(test, periodicSync) => {
await promise_rejects(
  test, new DOMException('', 'NotAllowedError'),
  periodicSync.register('test_tag', {}));
}, 'register rejects when no options are provided');


