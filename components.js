
/**
 * @typedef {Object} AlpineComponent
 * @property {() => object} data
 * @property {() => string} html
 * @property {string} name
 * @property {string} tag
 */

/**
 * 
 * @returns {AlpineComponent}
 */
function dropdownAlpine() {
  return {
    name: 'dropdownAlpine',
    tag: 'c-dropdown',
    data: () => ({
      show: false,
      open() { this.show = true },
      close() { this.show = false },
      isOpen() { return this.show === true },
      content: 'Default content'
    }),
    html: ({inner}) => /*html*/`
      <div x-data="{ ...alpineComponents.dropdownAlpineData(), ...$el.parentElement.data() }">
        <button x-on:click="open">Open</button>
        <div x-show="isOpen()" x-on:click.away="close" x-text="content"></div>

        <span>${inner}</span>
      </div>
    `
  }
}

registerComponent(dropdownAlpine());


/**
 * 
 * @param {AlpineComponent} component 
 */
function registerComponent(component) {
  const componentName = component.tag;
  const domParser = new DOMParser();

  if (!window.alpineComponents) {
    window.alpineComponents = {}
  }
  window.alpineComponents[component.name + 'Data'] = component.data;

  class Component extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
      requestAnimationFrame(()=>{
        const inner = this.innerHTML;
        const html = component.html({inner});
        this.innerHTML = html;
      });
    }

    data() {
      const attributes = this.getAttributeNames()
      const data = {}
      attributes.forEach(attribute => {
        data[attribute] = this.getAttribute(attribute)
      })
      return data
    }
  }
  customElements.define(componentName, Component)
}




// // The pure client-side code
// document.querySelectorAll('[x-component]').forEach(component => {
//   const componentName = `x-${component.getAttribute('x-component')}`;
//   const domParser = new DOMParser();
//   class Component extends HTMLElement {
//     connectedCallback() {
//       this.append(domParser.parseFromString('<span>Default content</span>', 'text/html').body.firstChild)
//     }

//     data() {
//       const attributes = this.getAttributeNames()
//       const data = {}
//       attributes.forEach(attribute => {
//         data[attribute] = this.getAttribute(attribute)
//       })
//       return data
//     }
//   }
//   customElements.define(componentName, Component)
// })