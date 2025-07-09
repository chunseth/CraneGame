// Extend Window interface to include our custom property
declare global {
  interface Window {
    isKeyPressed?: { [key: string]: boolean }
  }
}

class KeyboardHandler {
  private keys: { [key: string]: boolean } = {}

  constructor() {
    this.setupEventListeners()
    window.isKeyPressed = this.keys
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (event) => {
      this.keys[event.code] = true
    })

    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false
    })

    // Handle window blur to reset keys
    window.addEventListener('blur', () => {
      this.keys = {}
    })
  }

  isPressed(keyCode: string): boolean {
    return this.keys[keyCode] || false
  }

  getPressedKeys(): string[] {
    return Object.keys(this.keys).filter(key => this.keys[key])
  }
}

export const keyboardHandler = new KeyboardHandler() 