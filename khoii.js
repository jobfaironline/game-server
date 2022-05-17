// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

import {geckos} from '@geckos.io/client'

const auth =
  `e41bf62a-2215-4ddf-a2d4-9416dc602412/3f6eda7f-4c49-4f6c-83b2-a4c72612510a/{"x":0,"y":1.0002028942108154,"z":0}/{"_x":0,"_y":0,"_z":0,"_w":1}`

const channel = geckos({ url:'http://127.0.0.1', port: 3001, authorization: auth }) // default port is 9208

channel.onConnect(error => {
  debugger
  if (error) {
    console.error(error.message)
    return
  }


  channel.on('move', data => {
    console.log('move', data);
  })

  channel.emit('move', '{x: 1, y:0}')
})
