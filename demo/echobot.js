///******************************/
///*   這是一台最基礎的複讀機     */
///******************************/

const mri = require('mri')
const options = mri(process.argv.slice(2), {
  alias: {
    help: 'h'
  },
  boolean: [ 'help' ]
})

if (options.help) {
  console.log('\nUsage: npm run demo-echobot -- [options]\n')
  console.log('Options:')
  console.log('    -h,--help Show usage\n')
  console.log('    --host CQHttp ws server host')
  console.log('    --port CQHttp ws server port')
  console.log('    --url CQHttp ws server base URL')
  console.log('    --token CQHttp ws server access token')
  console.log('    --qq QQ account of the bot, used to determine whether someone "@" the bot or not')
} else {
  const $util = require('util')
  const CQWebsocket = require('../')
  let bot = new CQWebsocket({
    host: options.host,
    port: options.port,
    baseUrl: options.url,
    qq: options.qq,
    access_token: options.token
  })
  
  // 設定訊息監聽
  bot
    // 連線例外處理
    .on('socket.error', console.error)
    .on('socket.connecting', (wsType) => console.log('[%s] 建立連線中, 請稍後...', wsType))
    .on('socket.connect', (wsType, sock, attempts) => console.log('[%s] 連線成功 ヽ(✿ﾟ▽ﾟ)ノ 蛆蛆%d個嘗試', wsType, attempts))
    .on('socket.failed', (wsType, attempts) => console.log('[%s] 連線失敗 。･ﾟ･(つд`ﾟ)･ﾟ･ [丑%d] 對噗起', wsType, attempts))
    .on('ready', () => console.log('今天又是複讀複讀的一天 ｡:.ﾟヽ(*´∀`)ﾉﾟ.:｡'))

    // 聽取私人信息
    .on('message.private', (e, context) => {
      console.log('叮咚 ✿')
      whois(bot, context.user_id)
        .then(function (name) {
          console.log(`您有來自 ${name} 的訊息 (♡˙︶˙♡)\n${$util.inspect(context)}`)
        })
    
      // 以下提供三種方式將原訊息以原路送回
      switch (Date.now() % 3) {
        case 0:
          // 1. 調用 CoolQ HTTP API 之 send_msg 方法
          bot('send_msg', context)
          break
        case 1:
          // 2. 或者透過返回值快速響應
          return context.message
        case 2:
          // 3. 或者透過CQEvent實例，先獲取事件處理權再設置響應訊息
          e.cancel()
          e.setMessage(context.message)
      }
    })
  
  bot.connect()
}

// 查詢暱稱
function whois (bot, uid) {
  return new Promise(function (resolve) {
    function returnNickName (msgObj) {
      resolve(msgObj.nickname)
    }

    bot.once('api.response', returnNickName)

    bot('/get_stranger_info', {
      user_id: uid
    })

    // 30秒後若沒有響應則忽略查詢
    setTimeout(function () {
      bot.off('api.response', returnNickName)
      resolve('匿名好友')
    }, 30000)
  })
}

