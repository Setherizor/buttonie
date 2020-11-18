import test from 'ava'
import path from 'path'
import { load, setGlobal, render } from 'alpine-test-utils'

test('render-check - load index.html - async', async t => {
  const markup = await load(path.join(__dirname, '../public/index.html'))
  const component = render(markup)

  // Test title renders
  t.is(component.querySelector('div h3 a').innerHTML, 'Buttonie')

  // Check that buttons are disabled
  // let isDisabled = selector => Array.from(component.querySelector(selector).classList).includes('disabled')
  let isDisabled = selector => component.querySelector(selector).disabled

  await component.$nextTick()

  // Join
  t.falsy(isDisabled('#join-game > button.btn-secondary.btn-block'))
  // Host
  t.falsy(
    isDisabled('#join-game > button.btn-success.btn-block.margin-top-small')
  )
})

/*
import test from 'ava'
import path from 'path'
import { load, setGlobal, render } from 'alpine-test-utils'

test('test foo component', t => {
  const componentHtml = `<div x-data="{foo: 'bar'}">
    <span x-text="foo"></span>
  </div>`
  const component = render(componentHtml)
  t.is(component.querySelector('span').innerText, 'bar')
})

test('use-case - load from HTML file - async', async t => {
  const markup = await load(path.join(__dirname, './template.html'))
  const component = render(markup)
  t.is(component.querySelector('span').innerText, 'bar')
})

test('use-case - intercepting fetch calls', async t => {
  setGlobal({
    fetch: () =>
      Promise.resolve({
        json: () => Promise.resolve(['data-1', 'data-2'])
      })
  })
  const component = render(`<div
    x-data="{ data: [] }"
    x-init="fetch().then(r => r.json()).then(d => {
      data = d;
    })"
  >
    <template x-for="d in data" :key="d">
      <span data-testid="text-el" x-text="d"></span>
    </template>
  </div>`)
  // Flushes the Promises
  await component.$nextTick()
  t.deepEqual(component.$data.data, ['data-1', 'data-2'])
  // Lets the re-render run
  await component.$nextTick()
  const textNodes = component.querySelectorAll('[data-testid=text-el]')
  t.is(textNodes.length, 2)
  t.is(textNodes[0].innerText, 'data-1')
  t.is(textNodes[1].innerText, 'data-2')
})

*/
