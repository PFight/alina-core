var AltSet = /** @class */ (function () {
    function AltSet() {
    }
    AltSet.prototype.initialize = function (context) {
        this.root = context;
    };
    AltSet.prototype.set = function (value) {
        var _this = this;
        if (this.lastValue !== value) {
            var newLastValue_1 = value;
            this.root.bindings.forEach(function (binding) {
                var lastValue = _this.lastValue !== undefined ? _this.lastValue : binding.query;
                var result = binding.setter && binding.setter(lastValue, value);
                if (result !== undefined) {
                    newLastValue_1 = result;
                }
            });
            this.lastValue = newLastValue_1;
        }
    };
    return AltSet;
}());
