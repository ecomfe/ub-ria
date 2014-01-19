define(function (require) {
    var Deferred = require('er/Deferred');
    var RequestManager = require('mvc/RequestManager');
    var ajax = require('er/ajax');
    var util = require('er/util');

    function fakeRequest() {
        var deferred = new Deferred();
        deferred.promise.abort = function () {
            this.aborted = true;
            deferred.reject('abort');
        };
        return deferred.promise;
    }

    function createRequestManagerSubType() {
        function SubRequestManager() {
            RequestManager.apply(this, arguments);
        }

        util.inherits(SubRequestManager, RequestManager);

        return SubRequestManager;
    }

    describe('RequestManager', function () {
        it('should be a constructor', function () {
            expect(RequestManager).toBeOfType('function');
        });

        it('should be instantiable', function () {
            expect(new RequestManager()).toBeOfType('object');
        });

        describe('ajax management', function () {
            beforeEach(function () {
                spyOn(ajax, 'request').and.callFake(fakeRequest);
            });

            var globalConfig = {
                scope: 'global',
                options: {
                    method: 'GET'
                }
            };
            RequestManager.register(null, 'global', globalConfig);

            describe('`register` method', function () {
                it('should be added to `RequestManager` as a static method', function () {
                    expect(RequestManager.register).toBeOfType('function');
                });

                it('should accept a `Data` type, a `name` and a `config` object', function () {
                    function SubRequestManager() {}
                    var config = {};

                    function register() {
                        RequestManager.register(SubRequestManager, 'test', config);
                    }

                    expect(register).not.toThrow();
                });

                it('should reject 2 instance configurations with same name', function () {
                    function SubRequestManager() {}

                    function register() {
                        RequestManager.register(SubRequestManager, 'test', {});
                        RequestManager.register(SubRequestManager, 'test', {});
                    }

                    expect(register).toThrow();
                });

                it('should reject 2 global configurations with same name', function () {
                    function SubRequestManager() {}

                    function register() {
                        RequestManager.register(SubRequestManager, 'test', { scope: 'global' });
                        RequestManager.register(SubRequestManager, 'test', { scope: 'global' });
                    }

                    expect(register).toThrow();
                });
            });

            describe('`request` method', function () {
                it('should be exists', function () {
                    var requestManager = new RequestManager();

                    expect(requestManager.request).toBeOfType('function');
                });

                var SubRequestManager;
                var requestManager;
                var config = {
                    scope: 'instance',
                    options: {
                        method: 'GET'
                    }
                };
                beforeEach(function () {
                    SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'test', config);
                    requestManager = new SubRequestManager();
                });

                it('should successfully lookup an instance request config and use it for ajax', function () {
                    requestManager.request('test');

                    expect(ajax.request).toHaveBeenCalled();
                    var args = ajax.request.calls.mostRecent().args;
                    expect(args.length).toBe(1);
                    expect(args[0]).toEqual({ method: 'GET', dataType: 'json' });
                });

                it('should successfully lookup a global request config and use it for ajax', function () {
                    requestManager.request('global');

                    expect(ajax.request).toHaveBeenCalled();
                    var args = ajax.request.calls.mostRecent().args;
                    expect(args.length).toBe(1);
                    expect(args[0]).toEqual({ method: 'GET', dataType: 'json' });
                });

                it('should override global config with instance config', function () {
                    RequestManager.register(SubRequestManager, 'global', config);
                    requestManager.request('global');

                    var args = ajax.request.calls.mostRecent().args;
                    expect(ajax.request).toHaveBeenCalled();
                    expect(args.length).toBe(1);
                    expect(args[0]).toEqual({ method: 'GET', dataType: 'json' });
                });

                it('should append given `data` and `options` arguments to request options', function () {
                    var data = {
                        x: 1
                    };
                    var options = {
                        x: 1,
                        data: {
                            y: 1
                        }
                    };
                    requestManager.request('test', data, options);

                    var requestOptions = ajax.request.calls.mostRecent().args[0];
                    expect(requestOptions.data.x).toBe(1);
                    expect(requestOptions.data.y).toBe(1);
                    expect(requestOptions.x).toBe(1);
                });

                it('should direct to request if only `options` and `data` is given', function () {
                    var data = {
                        x: 1
                    };
                    var options = {
                        x: 1
                    };
                    requestManager.request(options, data);

                    var requestOptions = ajax.request.calls.mostRecent().args[0];
                    expect(requestOptions.data.x).toBe(1);
                    expect(requestOptions.x).toBe(1);
                });

                it('should direct to request if only `options` is given', function () {
                    var options = {
                        x: 1
                    };
                    requestManager.request(options);

                    var requestOptions = ajax.request.calls.mostRecent().args[0];
                    expect(requestOptions.x).toBe(1);
                });

                it('should direct to request if a non-exist `name` is given', function () {
                    var data = {
                        x: 1
                    };
                    var options = {
                        x: 1
                    };
                    requestManager.request('non-exist', data, options);

                    var requestOptions = ajax.request.calls.mostRecent().args[0];
                    expect(requestOptions.data.x).toBe(1);
                    expect(requestOptions.x).toBe(1);
                });
            });

            describe('conflict policy', function () {
                it('should abort the previous request when configured as **abort**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'abort', { policy: 'abort' });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('abort');
                    requestManager.request('abort');

                    expect(previous.aborted).toBe(true);
                });

                it('should reuse the previous request when configured as **reuse**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'reuse', { policy: 'reuse' });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('reuse');
                    var current = requestManager.request('reuse');

                    expect(current).toBe(previous);
                });

                it('should make parallel request when configured as **parallel**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'parallel', { policy: 'parallel' });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('parallel');
                    var current = requestManager.request('parallel');

                    expect(current).not.toBe(previous);
                });

                it('should reuse the previous identical request when configured as **auto**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'auto', { policy: 'auto', options: { method: 'GET' } });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('auto');
                    var current = requestManager.request('auto');

                    expect(current).toBe(previous);
                });

                it('should abort the previous unidentical **POST** request when configured as **auto**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'auto', { policy: 'auto', options: { method: 'POST' } });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('auto');
                    requestManager.request('auto', { z: 1 });

                    expect(previous.aborted).toBe(true);
                });

                it('should make parallel unidentical **GET** request when configured as **auto**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'auto', { policy: 'auto', options: { method: 'GET' } });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('auto');
                    var current = requestManager.request('auto', { z: 1 });

                    expect(current).not.toBe(previous);
                });

                it('should make parallel unidentical **PUT** request when configured as **auto**', function () {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'auto', { policy: 'auto', options: { method: 'PUT' } });

                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('auto');
                    var current = requestManager.request('auto', { z: 1 });

                    expect(current).not.toBe(previous);
                });

                it('should not reuse completed request', function (done) {
                    var SubRequestManager = createRequestManagerSubType();
                    RequestManager.register(SubRequestManager, 'reuse', { policy: 'reuse', options: { method: 'GET' } });
                    var requestManager = new SubRequestManager();
                    var previous = requestManager.request('reuse');
                    previous.ensure(function () {
                        var current = requestManager.request('reuse');

                        expect(current).not.toBe(previous);
                        done();
                    });
                    previous.abort();
                });
            });
        });
    });
});