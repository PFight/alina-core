var DbMonQueryList = /** @class */ (function () {
    function DbMonQueryList(elem, props) {
        this.template = makeTemplate("\n      <template>\n          <td is=\"db-mon-query\"></td>\n      </template>                \n  ");
        // elem is a stub. Replace it with our elements.
        var prev = elem.previousSibling;
        this.container = elem.parentElement;
        this.container.removeChild(elem);
        this.insertBefore = prev ? prev.nextSibling : null;
    }
    DbMonQueryList.prototype.update = function (props) {
        this.root.repeatEx("row", this.template, this.container, this.insertBefore, props, function (query, queryModel) {
            query.mount("td[is='db-mon-query']", DbMonQuery, queryModel);
        });
    };
    return DbMonQueryList;
}());
