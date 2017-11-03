import * as Alina from "./alina";

export class AlSet extends Alina.AlinaComponent {
  lastValue: any;

  setEntry(value) {
    if (this.lastValue !== value) {
      let preparedValue = value;
      let binding = this.root.binding;
      // Initial value is stub text (query)
      let lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
      if (binding.queryType == Alina.QueryType.NodeAttribute) {
        // Class names should be separated with space         
        if (binding.attributeName == "class") {
          preparedValue = (!value) ? "" : value + " ";
        }
        // Some attributes has corresponding idl, some doesn't.
        if (binding.idlName) {
          let currentVal = binding.node[binding.idlName];
          if (typeof (currentVal) == "string") {
            binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
          } else {
            binding.node[binding.idlName] = preparedValue;
          }
        } else {
          let elem = binding.node as HTMLElement;
          let currentVal = elem.getAttribute(binding.attributeName);
          elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
        }
      } else {
        binding.node.textContent = binding.node.textContent.replace(lastValue, value);
      }
      
      this.lastValue = preparedValue;
    }
  }
}