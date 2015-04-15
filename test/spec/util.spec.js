define(
    function (require) {
        var util = require('util');

        describe('transformPlainObjectToStructured method', function () {
            it('should clone a real-plain object', function () {
                var o = {
                    x: 1,
                    y: 2
                };
                var result = util.transformPlainObjectToStructured(o);
                expect(result).toEqual(o);
            });

            it('should create deep property', function () {
                var o = {
                    'foo.bar': 1,
                    'x.y.z': 2,
                    m: 3
                };
                var result = util.transformPlainObjectToStructured(o);
                expect(result).toEqual({
                    foo: {
                        bar: 1
                    },
                    x: {
                        y: {
                            z: 2
                        }
                    },
                    m: 3
                });
            })
        });
    }
);
