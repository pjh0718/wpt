let interceptor = (async function() {
  let load = Promise.resolve();
  [
    '/gen/layout_test_data/mojo/public/js/mojo_bindings_lite.js',
    '/gen/mojo/public/mojom/base/big_buffer.mojom-lite.js',
    '/gen/mojo/public/mojom/base/string16.mojom-lite.js',
    '/gen/mojo/public/mojom/base/time.mojom-lite.js',
    '/gen/third_party/blink/public/mojom/sms/sms_manager.mojom-lite.js',
  ].forEach(path => {
    let script = document.createElement('script');
    script.src = path;
    script.async = false;
    load = load.then(() => new Promise(resolve => {
      script.onload = resolve;
    }));
    document.head.appendChild(script);
  });

  return load.then(intercept);
})();

class SmsProvider {
  constructor() {
    this.mockedReturnValues = {}
  }

  getNextMessage(timeout) {
    let call = this.mockedReturnValues.getNextMessage.shift();
    if (!call) {
      throw new Error("Unexpected call.");
    }
    return call(timeout);
  }

  setReturnValues(callName, returnValues) {
    this.mockedReturnValues[callName] = returnValues;
    return this;
  }
}

class MockCall {
  constructor(call) {
    this.name = call.name;
    this.returnValues = [];
  }

  async andReturnOnce(callback) {
    this.returnValues.push(callback);
    let provider = await interceptor;
    provider.setReturnValues(this.name, this.returnValues);
  }
}

function getNextMessage(timeout, callback) {
  throw new Error("expected to be overriden by tests");
}

const Status = {};

function intercept() {
  let provider = new SmsProvider();

  let interceptor = new MojoInterfaceInterceptor(blink.mojom.SmsManager.$interfaceName);
  interceptor.oninterfacerequest = (e) => {
    let impl = new blink.mojom.SmsManager(provider);
    impl.bindHandle(e.handle);
  }

  interceptor.start();

  Status.kSuccess = blink.mojom.SmsStatus.kSuccess;
  Status.kTimeout = blink.mojom.SmsStatus.kTimeout;

  return provider;
}
