class AltSet implements IMultiNodeComponent {
  root: IMultiNodeRenderer;
  lastValue: any;

  initialize(context: IMultiNodeRenderer) {
    this.root = context;
  }

  set(value) {
    if (this.lastValue !== value) {
      let preparedValue = value;
      for (let binding of this.root.bindings) {
        // Initial value is stub text (query)
        let lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
        if (binding.queryType == QueryType.NodeAttribute) {
          // Class names should be separated with space         
          if (binding.attributeName == "class") {
            preparedValue = (!value) ? "" : value + " ";
          }
          // Some attributes has corresponding idl, some doesnt.
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
      };
      this.lastValue = preparedValue;
    }
  }

  reset(value) {
    if (this.lastValue !== value) {
      for (let binding of this.root.bindings) {
        if (binding.queryType == QueryType.NodeAttribute) {
          if (binding.idlName) {
            binding.node[binding.idlName] = value;
          } else {
            let elem = binding.node as HTMLElement;
            elem.setAttribute(binding.attributeName, value);
          }
        } else {
          binding.node.textContent = value;
        }
      }
      this.lastValue = value;
    }
  }
}