export function createRouter(routes, onChange = () => {}) {
  let current = '';
  return {
    go(name) {
      if (!routes[name]) return false;
      current = name;
      routes[name]();
      onChange(name);
      return true;
    },
    current() {
      return current;
    }
  };
}
