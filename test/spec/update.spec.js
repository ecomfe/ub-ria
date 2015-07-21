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
                var result = update(source, {alice: {$set: 2}});
                expect(result.alice).toBe(2);
                expect(source).toEqual(createSourceObject());
                result.alice = 1;
                expect(result).toEqual(source);
            });

            it('shoud update a nested property value', function () {
                var source = createSourceObject();
                var result = update(source, {tom: {jack: {$set: 2}}});
                expect(result.tom.jack).toBe(2);
                expect(source).toEqual(createSourceObject());
                result.tom.jack = 1;
                expect(result).toEqual(source);
            });

            it('should create nested property if not exist', function () {
                var source = createSourceObject();
                var result = update(source, {a: {b: {$set: 2}}});
                expect(result.a.b).toBe(2);
                expect(source).toEqual(createSourceObject());
                delete result.a;
                expect(result).toEqual(source);
            });

            it('should recognize push command', function () {
                var source = createSourceObject();
                var result = update(source, {x: {y: {z: {$push: 4}}}});
                expect(result.x.y.z).toEqual([1, 2, 3, 4]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.pop();
                expect(result).toEqual(source);
            });

            it('should recognize unshift command', function () {
                var source = createSourceObject();
                var result = update(source, {x: {y: {z: {$unshift: 0}}}});
                expect(result.x.y.z).toEqual([0, 1, 2, 3]);
                expect(source).toEqual(createSourceObject());
                result.x.y.z.shift();
                expect(result).toEqual(source);
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
        });
    }
);
