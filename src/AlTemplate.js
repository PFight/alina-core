var AlTemplate = (function () {
    function AlTemplate() {
    }
    AlTemplate.prototype.initialize = function (context) {
        this.root = context;
    };
    AlTemplate.prototype.appendChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                this.root.elem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.appendChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            var rootElem = this.root.elem;
            rootElem.innerHTML = "";
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                rootElem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.innerHTML = "";
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.instantiateTemplate = function (templateElem) {
        return templateElem.content ?
            [].map.apply(templateElem.content.children, function (node) { return node.cloneNode(true); })
            :
                [].map.apply(templateElem.children, function (node) { return node.cloneNode(true); });
    };
    AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
        return templateElem.content ?
            (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
            :
                (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
    };
    return AlTemplate;
}());
export { AlTemplate };
