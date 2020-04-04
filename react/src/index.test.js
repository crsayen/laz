import {drawCards, _drawCards, endRedis} from './index'
import deck from "../deck.js";


beforeAll(() => {
})

test("7 white cards are drawn", done => {
  function callback(cards) {
    expect(cards).toEqual(deck.white.slice(0,7))
    done()
  }
  _drawCards("test", 'white', 7, callback)
})