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
