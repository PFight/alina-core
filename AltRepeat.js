var AltRepeat = /** @class */ (function () {
    function AltRepeat() {
        this.itemContexts = [];
    }
    AltRepeat.prototype.initialize = function (context) {
        this.renderer = context;
    };
    AltRepeat.prototype.repeat = function (items, update, options) {
        if (update) {
            this.context = {
                template: this.renderer.elem,
                container: this.renderer.elem.parentElement,
                insertBefore: this.renderer.elem,
                equals: options && options.equals,
                update: update
            };
        }
        this.repeatEx(items, this.context);
    };
    AltRepeat.prototype.repeatEx = function (items, context) {
        if (context) {
            this.context = context;
        }
        var props = this.context;
        // Add new and update existing
        for (var i = 0; i < items.length; i++) {
            var modelItem = items[i];
            // Createcontext
            var itemContext = this.itemContexts[i];
            if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
                itemContext = this.itemContexts[i] = {};
            }
            // Create node
            if (!itemContext.renderer) {
                var node = fromTemplate(props.template);
                itemContext.renderer = this.renderer.create([{ node: node, queryType: QueryType.Node }]);
            }
            // Fill content
            props.update(itemContext.renderer, modelItem);
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].renderer.node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.renderer.node, position);
                }
                else {
                    props.container.appendChild(itemContext.renderer.node);
                }
                itemContext.mounted = true;
            }
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = items.length;
        for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
            var elem = this.itemContexts[i].renderer.node;
            if (elem) {
                props.container.removeChild(elem);
            }
        }
        this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
    };
    AltRepeat.prototype.compare = function (a, b, comparer) {
        return (undefinedOrNull(a) && undefinedOrNull(b)) ||
            (definedNotNull(a) && definedNotNull(b) && !comparer) ||
            (definedNotNull(a) && definedNotNull(b) && comparer && comparer(a, b));
    };
    return AltRepeat;
}());
