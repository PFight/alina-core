class AltSet implements AltComponent {
  root: Renderer;
  lastValue: any;

  initialize(context: Renderer) {
    this.root = context;
  }

  set<T>(value: T) {
    if (this.lastValue !== value) {
      let newLastValue = value;
      this.root.bindings.forEach(binding => {
        let lastValue = this.lastValue !== undefined ? this.lastValue : binding.query; 
        let result = binding.setter && binding.setter(lastValue, value);
        if (result !== undefined) {
          newLastValue = result;
        }
      });
      this.lastValue = newLastValue;
    }
  }
}
