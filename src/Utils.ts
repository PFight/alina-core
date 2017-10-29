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