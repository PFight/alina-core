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
            if (!itemContext || !compare(modelItem, itemContext.oldModelItem, props.equals)) {
                itemContext = this.itemContexts[i] = {};
            }
            // Create node
            if (!itemContext.node) {
                itemContext.node = instantiateTemplate(props.template);
                itemContext.renderer = new Renderer([{ node: itemContext.node, queryType: QueryType.Node }]);
            }
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.node, position);
                }
                else {
                    props.container.appendChild(itemContext.node);
                }
                itemContext.mounted = true;
            }
            // Fill content
            props.update(itemContext.renderer, modelItem);
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = items.length;
        for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
            var elem = this.itemContexts[i].node;
            if (elem) {
                props.container.removeChild(elem);
            }
        }
        this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
    };
    return AltRepeat;
}());
