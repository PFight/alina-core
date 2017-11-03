export function makeTemplate(str: string): HTMLTemplateElement {
  let elem = document.createElement("template");
  elem.innerHTML = str.trim();
  // document.body.appendChild(elem);
  return elem;
}

export function fromTemplate(templateElem: HTMLTemplateElement): Node {
  return templateElem.content ?
    (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
    :
    (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}

export function definedNotNull(x) {
  return x !== undefined && x !== null;
}

export function undefinedOrNull(x) {
  return x === undefined || x === null;
}

export function getIdlName(attr: Attr, node: Node) {
  let idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
  if (!(idlName in node)) {
    idlName = null;
  }
  return idlName;
}

export var ATTRIBUTE_TO_IDL_MAP: { [attributeName: string]: string } = {
  "class": "className",
  "for": "htmlFor"
};

export interface ComponentCtor<ComponentT, ContextT, DepsT> {
  new(context: ContextT, deps?: DepsT): ComponentT;
}

export function defaultEmptyFunc(target: Object, propertyKey: string | symbol): void {
  if (target[propertyKey] === undefined) {
    target[propertyKey] = null;
  }
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);  
  if (descriptor.get || descriptor.set) {
    let originalGet = descriptor.get;
    let originalSet = descriptor.set;
    descriptor.get = function () {
      return originalGet.call(this) || empty;
    };
    descriptor.set = function (val) {
      originalSet.call(this, val);
    }
  } else {
    delete descriptor.value;
    delete descriptor.writable;
    let value = null;
    descriptor.get = function () {
      return value || empty;
    };
    descriptor.set = function (val) {
      value = val;
    }
  }
  Object.defineProperty(target, propertyKey, descriptor);
}

function empty() {
}