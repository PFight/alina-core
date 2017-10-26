var AltSet = /** @class */ (function () {
    function AltSet() {
    }
    AltSet.prototype.initialize = function (context) {
        this.root = context;
    };
    AltSet.prototype.set = function (value) {
        if (this.lastValue !== value) {
            var preparedValue = value;
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                // Initial value is stub text (query)
                var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
                if (binding.queryType == QueryType.NodeAttribute) {
                    // Class names should be separated with space         
                    if (binding.attributeName == "class") {
                        preparedValue = (!value) ? "" : value + " ";
                    }
                    // Some attributes has corresponding idl, some doesnt.
                    if (binding.idlName) {
                        var currentVal = binding.node[binding.idlName];
                        if (typeof (currentVal) == "string") {
                            binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
                        }
                        else {
                            binding.node[binding.idlName] = preparedValue;
                        }
                    }
                    else {
                        var elem = binding.node;
                        var currentVal = elem.getAttribute(binding.attributeName);
                        elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
                    }
                }
                else {
                    binding.node.textContent = binding.node.textContent.replace(lastValue, value);
                }
            }
            ;
            this.lastValue = preparedValue;
        }
    };
    AltSet.prototype.reset = function (value) {
        if (this.lastValue !== value) {
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                if (binding.queryType == QueryType.NodeAttribute) {
                    if (binding.idlName) {
                        binding.node[binding.idlName] = value;
                    }
                    else {
                        var elem = binding.node;
                        elem.setAttribute(binding.attributeName, value);
                    }
                }
                else {
                    binding.node.textContent = value;
                }
            }
            this.lastValue = value;
        }
    };
    return AltSet;
}());
