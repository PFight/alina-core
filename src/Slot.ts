export class Slot<T, ComponentT> {
  value: T;

  constructor(public component: ComponentT) {
  }

  set(val: T) {
    this.value = val;
    return this.component;
  }
}