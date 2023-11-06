export function generateHook() {
  return function HookRender({
    render
  }: {
    render: () => JSX.Element
  }) {
    return render()
  }
}
export const HookRender = generateHook()