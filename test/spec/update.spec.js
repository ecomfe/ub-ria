define(
    function (require) {
        var update = require('update');

        function createSourceObject() {
            return {
                x: {
                    y: {
                        z: [1, 2, 3]
                    }
                },
                foo: [1, 2, 3],
                alice: 1,
                bob: 2,
                tom: {
                    jack: 1
                }
            };
        }

        describe('update method', function () {
            it('should update a single property value', function () {
                var source = createSourceObject();
                var result = update.run(source, {alice: {$set: 2}});
                expect(result.alice).toBe(2);
                expect(source).toEqual(createSourceObject());
                result.alice = 1;
                expect(result).toEqual(source);
            });

            it('shoud update a nested property value', function () {
                var source = createSourceObject();
                var result = update.run(source, {tom: {jack: {$set: 2}}});
                expect(result.tom.jack).toBe(2);
                expect(source).toEqual(createSourceObject());
                result.tom.jack = 1;
                expect(result).toEqual(source);
            });

            it('should create nested property if not exist', function () {
                var source = createSourceObject();
                var result = update.run(source, {a: {b: {$set: 2}}});
                expect(result.a.b).toBe(2);
                expect(source).toEqual(createSourceObject());
                delete result.a;
                expect(result).toEqual(source);
            });

            it('should recognize push command', function () {
                var source = createSourceObject();
                var result = update.run(source, {x: {y: {z: {$push: 4}}}});
                expect(result.x.y.z).toEqual([1, 2, 3, 4]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.pop();
                expect(result).toEqual(source);
            });

            it('should recognize unshift command', function () {
                var source = createSourceObject();
                var result = update.run(source, {x: {y: {z: {$unshift: 0}}}});
                expect(result.x.y.z).toEqual([0, 1, 2, 3]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.shift();
                expect(result).toEqual(source);
            });

            it('should recognize merge command', function () {
                var source = createSourceObject();
                var result = update.run(source, {x: {y: {$merge: {a: 1, b: 2, z: 3}}}});
                expect(result.x.y).toEqual({a: 1, b: 2, z: 3});
                expect(source).toEqual(createSourceObject());
            });

            it('should recognize defaults command', function () {
                var source = createSourceObject();
                var result = update.run(source, {x: {y: {$defaults: {a: 1, b: 2, z: 3}}}});
                expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
                expect(source).toEqual(createSourceObject());
            });

            it('should recognize invoke command', function () {
                var source = createSourceObject();
                var result = update.run(source, {tom: {jack: {$invoke: function(x) { return x * 2; }}}});
                expect(result.tom.jack).toBe(2);
                expect(source).toEqual(createSourceObject());
            });

            it('should expose set function', function () {
                var source = createSourceObject();
                var result = update.set(source, ['tom', 'jack'], 2);
                expect(result.tom.jack).toBe(2);
                expect(source).toEqual(createSourceObject());
                result.tom.jack = 1;
                expect(result).toEqual(source);
            });

            it('should expose push function', function () {
                var source = createSourceObject();
                var result = update.push(source, ['x', 'y', 'z'], 4);
                expect(result.x.y.z).toEqual([1, 2, 3, 4]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.pop();
                expect(result).toEqual(source);
            });

            it('should expose unshift function', function () {
                var source = createSourceObject();
                var result = update.unshift(source, ['x', 'y', 'z'], 0);
                expect(result.x.y.z).toEqual([0, 1, 2, 3]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.shift();
                expect(result).toEqual(source);
            });

            it('should expose merge function', function () {
                var source = createSourceObject();
                var result = update.merge(source, ['x', 'y'], {a: 1, b: 2, z: 3});
                expect(result.x.y).toEqual({a: 1, b: 2, z: 3});
                expect(source).toEqual(createSourceObject());
            });

            it('should expose defaults function', function () {
                var source = createSourceObject();
                var result = update.defaults(source, ['x', 'y'], {a: 1, b: 2, z: 3});
                expect(result.x.y).toEqual({a: 1, b: 2, z: [1, 2, 3]});
                expect(source).toEqual(createSourceObject());
            });

            it('should expose invoke function', function () {
                var source = createSourceObject();
                var result = update.invoke(source, ['tom', 'jack'], function(x) { return x * 2; });
                expect(result.tom.jack).toBe(2);
                expect(source).toEqual(createSourceObject());
            });

            describe('run with first level command', function () {
                it('should work with $set', function () {
                    var source = {};
                    var result = update.run(source, {$set: 1});
                    expect(result).toBe(1);
                    expect(source).toEqual({});
                });

                it('should work with $push', function () {
                    var source = [1, 2, 3];
                    var result = update.run(source, {$push: 4});
                    expect(result).toEqual([1, 2, 3, 4]);
                    expect(source).toEqual([1, 2, 3]);
                });

                it('should work with $unshift', function () {
                    var source = [1, 2, 3];
                    var result = update.run(source, {$unshift: 0});
                    expect(result).toEqual([0, 1, 2, 3]);
                    expect(source).toEqual([1, 2, 3]);
                });

                it('should work with $merge', function () {
                    var source = {foo: 1};
                    var result = update.run(source, {$merge: {bar: 2}});
                    expect(result).toEqual({foo: 1, bar: 2});
                    expect(source).toEqual({foo: 1});
                });

                it('should work with $defaults', function () {
                    var source = {foo: 1};
                    var result = update.run(source, {$defaults: {foo: 2, bar: 2}});
                    expect(result).toEqual({foo: 1, bar: 2});
                    expect(source).toEqual({foo: 1});
                });

                it('should work with $invoke', function () {
                    var source = 1;
                    var result = update.run(source, {$invoke: function (x) { return x * 2; }});
                    expect(result).toEqual(2);
                    expect(source).toEqual(1);
                });
            });

            describe('shortcut function with first level command', function () {
                it('should work with $set', function () {
                    var source = {};
                    var result = update.set(source, null, 1);
                    expect(result).toBe(1);
                    expect(source).toEqual({});
                });

                it('should work with $push', function () {
                    var source = [1, 2, 3];
                    var result = update.push(source, null, 4);
                    expect(result).toEqual([1, 2, 3, 4]);
                    expect(source).toEqual([1, 2, 3]);
                });

                it('should work with $unshift', function () {
                    var source = [1, 2, 3];
                    var result = update.unshift(source, null, 0);
                    expect(result).toEqual([0, 1, 2, 3]);
                    expect(source).toEqual([1, 2, 3]);
                });

                it('should work with $merge', function () {
                    var source = {foo: 1};
                    var result = update.merge(source, null, {bar: 2})
                    expect(result).toEqual({foo: 1, bar: 2});
                    expect(source).toEqual({foo: 1});
                });

                it('should work with $defaults', function () {
                    var source = {foo: 1};
                    var result = update.defaults(source, null, {foo: 2, bar: 2});
                    expect(result).toEqual({foo: 1, bar: 2});
                    expect(source).toEqual({foo: 1});
                });

                it('should work with $invoke', function () {
                    var source = 1;
                    var result = update.invoke(source, null, function (x) { return x * 2; });
                    expect(result).toEqual(2);
                    expect(source).toEqual(1);
                });
            });
        });
    }
);
